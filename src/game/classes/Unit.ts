import { Scene } from "phaser";
import { GameProgress } from "./GameProgress";

export interface UnitStats {
    health: number;
    maxHealth: number;
    moveRange: number;
    attackRange: number;
    movementPoints?: number;
    maxMovementPoints?: number;
    actionPoints?: number;
    maxActionPoints?: number;
    // Combat stats
    force: number; // Strength for melee attacks
    dexterity: number; // Skill for ranged attacks
    intelligence?: number; // Skill for magic attacks
    armor: number; // Damage reduction
    magicResistance?: number; // Magic damage reduction
}

export abstract class Unit {
    protected scene: Scene;
    public sprite: Phaser.GameObjects.Sprite;
    public gridX: number;
    public gridY: number;
    public team: "player" | "enemy";
    public hasActed: boolean = false;
    protected healthBar: Phaser.GameObjects.Graphics;
    protected labelText: Phaser.GameObjects.Text;
    protected stats: UnitStats;
    private walkSound?: Phaser.Sound.BaseSound;

    // New properties for bonuses
    private lastDamageType?: "physical" | "magic";
    public hasMovedThisTurn: boolean = false;
    private spellShieldUsed: boolean = false;

    constructor(
        scene: Scene,
        gridX: number,
        gridY: number,
        team: "player" | "enemy",
        stats: UnitStats
    ) {
        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.team = team;
        this.stats = { ...stats };

        this.healthBar = scene.add.graphics();
        this.healthBar.setDepth(3); // Above units
        this.createSprite();
        this.updatePosition();
        this.updateHealthBar();
    }

    protected abstract createSprite(): void;

    protected updatePosition(): void {
        const worldPos = this.gridToWorld(this.gridX, this.gridY);
        this.sprite.x = worldPos.x;
        this.sprite.y = worldPos.y;
        if (this.labelText) {
            this.labelText.x = worldPos.x;
            this.labelText.y = worldPos.y;
        }
    }

    public updateHealthBar(): void {
        // Skip health bar for player units (shown in UI instead)
        if (this.team === "player") {
            this.healthBar.clear();
            return;
        }

        // Use sprite's actual position if available, otherwise use grid position
        let x, y;
        if (this.sprite) {
            x = this.sprite.x;
            y = this.sprite.y;
        } else {
            const worldPos = this.gridToWorld(this.gridX, this.gridY);
            x = worldPos.x;
            y = worldPos.y;
        }

        this.healthBar.clear();

        // Background
        this.healthBar.fillStyle(0x000000);
        this.healthBar.fillRect(x - 20, y - 35, 40, 6);

        // Health
        const healthPercent = this.stats.health / this.stats.maxHealth;
        const color =
            healthPercent > 0.5
                ? 0x00ff00
                : healthPercent > 0.25
                ? 0xffff00
                : 0xff0000;
        this.healthBar.fillStyle(color);
        this.healthBar.fillRect(x - 19, y - 34, 38 * healthPercent, 4);
    }

    protected gridToWorld(
        gridX: number,
        gridY: number
    ): { x: number; y: number } {
        const gridSize = 10;
        const tileSize = 64;
        const startX = (this.scene.scale.width - gridSize * tileSize) / 2;
        const startY = (this.scene.scale.height - gridSize * tileSize) / 2 - 50;

        return {
            x: startX + gridX * tileSize + tileSize / 2,
            y: startY + gridY * tileSize + tileSize / 2,
        };
    }

    public moveTo(gridX: number, gridY: number, onComplete?: () => void): void {
        // Mark that unit has moved this turn
        this.hasMovedThisTurn = true;

        this.gridX = gridX;
        this.gridY = gridY;

        const { x, y } = this.gridToWorld(gridX, gridY);

        this.scene.tweens.add({
            targets: this.sprite,
            x: x,
            y: y,
            duration: 300,
            ease: "Power2",
            onUpdate: () => {
                if (this.labelText) {
                    this.labelText.x = this.sprite.x;
                    this.labelText.y = this.sprite.y;
                }
            },
            onComplete: () => {
                this.updateHealthBar();
                if (onComplete) onComplete();
            },
        });
    }

    public moveAlongPath(
        path: { x: number; y: number }[],
        onComplete?: () => void
    ): void {
        try {
            console.log(`moveAlongPath called with path:`, path);

            if (!path || path.length === 0) {
                console.log(
                    "Empty or null path, calling onComplete immediately"
                );
                if (onComplete) onComplete();
                return;
            }

            console.log(`Moving along path with ${path.length} steps`);

            // Mark that unit has moved this turn
            this.hasMovedThisTurn = true;

            // Stop any existing walking sound
            this.stopWalkingSound();

            // Start playing walking sound with loop
            this.walkSound = this.scene.sound.add("walk", {
                volume: 0.3,
                loop: true,
            });
            this.walkSound.play();

            // Function to move to the next step
            let stepIndex = 0;
            let movementStartTime = Date.now();
            const MAX_MOVEMENT_TIME = 10000; // 10 seconds max for entire movement

            const moveToNextStep = () => {
                // Safety check - prevent infinite movement
                if (Date.now() - movementStartTime > MAX_MOVEMENT_TIME) {
                    console.error("Movement timeout - forcing completion");
                    this.stopWalkingSound();
                    if (onComplete) onComplete();
                    return;
                }

                if (stepIndex >= path.length) {
                    // Movement complete - stop walking sound
                    console.log("Movement complete, calling onComplete");
                    this.stopWalkingSound();
                    if (onComplete) onComplete();
                    return;
                }

                const step = path[stepIndex];
                const worldPos = this.gridToWorld(step.x, step.y);

                console.log(
                    `Moving to step ${stepIndex}: (${step.x},${step.y}) world: (${worldPos.x},${worldPos.y})`
                );

                this.scene.tweens.add({
                    targets: this.sprite,
                    x: worldPos.x,
                    y: worldPos.y,
                    duration: 200,
                    ease: "Linear",
                    onUpdate: () => {
                        if (this.labelText) {
                            this.labelText.x = this.sprite.x;
                            this.labelText.y = this.sprite.y;
                        }
                        this.updateHealthBar();
                    },
                    onComplete: () => {
                        console.log(`Completed move to (${step.x},${step.y})`);

                        // Update grid position
                        this.gridX = step.x;
                        this.gridY = step.y;

                        // Move to next step
                        stepIndex++;

                        // Use a small delay to ensure the tween system is ready
                        this.scene.time.delayedCall(10, () => {
                            moveToNextStep();
                        });
                    },
                });
            };

            // Start the movement
            moveToNextStep();
        } catch (error) {
            console.error("Error in moveAlongPath:", error);
            console.error("Stack trace:", error.stack);
            // If there's an error, still call onComplete to prevent the game from getting stuck
            if (onComplete) onComplete();
        }
    }

    public takeDamage(
        damage: number,
        damageType: "physical" | "magic" = "physical",
        attacker?: Unit
    ): void {
        // Apply spell shield bonus if present (Player only)
        if (this.team === "player" && damageType === "magic") {
            const progress = GameProgress.getInstance();
            const appliedBonuses = progress.getAppliedBonuses();
            if (
                appliedBonuses.includes("spell_shield") &&
                !this.spellShieldUsed
            ) {
                this.spellShieldUsed = true;
                console.log("[Unit] Spell Shield: Blocked magic attack!");

                // Visual feedback - show shield effect
                const shieldText = this.scene.add
                    .text(this.sprite.x, this.sprite.y - 40, "BLOCKED!", {
                        fontSize: "20px",
                        color: "#00ffff",
                        stroke: "#000000",
                        strokeThickness: 3,
                    })
                    .setOrigin(0.5);

                // Notify GameManager about animation start
                const gameManager = (this.scene as any).gameManager;
                if (gameManager && gameManager.startDamageAnimation) {
                    gameManager.startDamageAnimation();
                }

                this.scene.tweens.add({
                    targets: shieldText,
                    y: shieldText.y - 30,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        shieldText.destroy();
                        // Notify GameManager about animation end
                        if (gameManager && gameManager.endDamageAnimation) {
                            gameManager.endDamageAnimation();
                        }
                    },
                });

                return; // No damage taken
            }
        }

        // Apply adaptive armor bonus if present (Player only)
        if (this.team === "player") {
            const progress = GameProgress.getInstance();
            const appliedBonuses = progress.getAppliedBonuses();
            if (
                appliedBonuses.includes("adaptive_armor") &&
                this.lastDamageType === damageType
            ) {
                if (damageType === "physical") {
                    this.stats.armor = Math.min(10, this.stats.armor + 1); // Cap at 10
                    console.log(
                        "[Unit] Adaptive Armor: +1 armor vs repeated physical damage"
                    );
                } else {
                    this.stats.magicResistance = Math.min(
                        10,
                        (this.stats.magicResistance || 0) + 1
                    );
                    console.log(
                        "[Unit] Adaptive Armor: +1 magic resistance vs repeated magic damage"
                    );
                }
            }
        }

        // Apply fortified position bonus if present (Player only)
        let fortifiedBonus = 0;
        if (this.team === "player" && !this.hasMovedThisTurn) {
            const progress = GameProgress.getInstance();
            const appliedBonuses = progress.getAppliedBonuses();
            if (appliedBonuses.includes("fortified_position")) {
                fortifiedBonus = 3;
                console.log(
                    "[Unit] Fortified Position: +3 armor for not moving"
                );
            }
        }

        // Apply armor reduction for physical damage or magic resistance for magic damage
        const baseResistance =
            damageType === "magic"
                ? this.stats.magicResistance || 0
                : this.stats.armor;
        const resistance = baseResistance + fortifiedBonus;
        const actualDamage = Math.max(1, damage - resistance);
        this.stats.health = Math.max(0, this.stats.health - actualDamage);

        // Track last damage type for adaptive armor
        this.lastDamageType = damageType;

        // Apply tactical retreat bonus if present (Player only)
        if (this.team === "player") {
            const progress = GameProgress.getInstance();
            const appliedBonuses = progress.getAppliedBonuses();
            if (appliedBonuses.includes("tactical_retreat")) {
                const movementBonus = 2;
                if (this.stats.movementPoints !== undefined) {
                    this.stats.movementPoints = Math.min(
                        this.stats.maxMovementPoints || 0,
                        this.stats.movementPoints + movementBonus
                    );
                    console.log(
                        `[Unit] Tactical Retreat: +${movementBonus} movement points (now ${this.stats.movementPoints})`
                    );
                }
            }

            // Apply nimble fighter bonus if present (25% chance)
            if (
                appliedBonuses.includes("nimble_fighter") &&
                Math.random() < 0.25
            ) {
                const movementBonus = 1;
                if (this.stats.movementPoints !== undefined) {
                    this.stats.movementPoints = Math.min(
                        this.stats.maxMovementPoints || 0,
                        this.stats.movementPoints + movementBonus
                    );
                    console.log(
                        `[Unit] Nimble Fighter: Dodged! +${movementBonus} movement point`
                    );
                }
            }
        }

        // Apply thorns damage to melee attacker
        if (this.team === "player" && attacker && damageType === "physical") {
            const progress = GameProgress.getInstance();
            const appliedBonuses = progress.getAppliedBonuses();

            // Check if it's a melee attack (distance = 1)
            const distance =
                Math.abs(this.gridX - attacker.gridX) +
                Math.abs(this.gridY - attacker.gridY);
            if (appliedBonuses.includes("thorns") && distance <= 1) {
                console.log(
                    "[Unit] Thorns: Dealing 1 damage to melee attacker"
                );

                // Store if attacker was alive before thorns damage
                const attackerWasAlive = attacker.isAlive();

                // Deal 1 damage back to attacker
                attacker.takeDamage(1, "physical");

                // Get GameManager reference
                const gameManager = (this.scene as any).gameManager;
                if (gameManager && gameManager.startDamageAnimation) {
                    gameManager.startDamageAnimation();
                }

                // Visual feedback on attacker
                const thornsText = this.scene.add
                    .text(
                        attacker.sprite.x,
                        attacker.sprite.y - 40,
                        "Thorns: -1",
                        {
                            fontSize: "16px",
                            color: "#ff6666",
                            stroke: "#000000",
                            strokeThickness: 2,
                        }
                    )
                    .setOrigin(0.5);

                this.scene.tweens.add({
                    targets: thornsText,
                    y: thornsText.y - 20,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => {
                        thornsText.destroy();
                        // Notify GameManager about animation end
                        if (gameManager && gameManager.endDamageAnimation) {
                            gameManager.endDamageAnimation();
                        }

                        // Check if thorns damage killed the attacker
                        if (attackerWasAlive && !attacker.isAlive()) {
                            console.log(
                                "[Unit] Thorns damage killed the attacker!"
                            );

                            // Notify GameManager to remove the dead attacker and check victory
                            if (
                                gameManager &&
                                gameManager.removeUnit &&
                                gameManager.checkVictory
                            ) {
                                // Use a small delay to ensure the animation completes
                                this.scene.time.delayedCall(100, () => {
                                    console.log(
                                        "[Unit] Removing attacker killed by thorns"
                                    );
                                    gameManager.removeUnit(attacker);
                                    gameManager.checkVictory();
                                });
                            }
                        }
                    },
                });
            }
        }

        // Get GameManager reference for main damage animation
        const gameManager = (this.scene as any).gameManager;
        if (gameManager && gameManager.startDamageAnimation) {
            gameManager.startDamageAnimation();
        }

        // Visual feedback - show damage number
        const damageText = this.scene.add
            .text(this.sprite.x, this.sprite.y - 40, `-${actualDamage}`, {
                fontSize: "20px",
                color: damageType === "magic" ? "#ff00ff" : "#ff0000", // Purple for magic, red for physical
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                damageText.destroy();
                // Notify GameManager about animation end
                if (gameManager && gameManager.endDamageAnimation) {
                    gameManager.endDamageAnimation();
                }
            },
        });

        // Store current interactive state
        const wasInteractive = this.sprite.input?.enabled;

        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.updateHealthBar();
                // Ensure sprite remains interactive if it was before
                if (wasInteractive && this.sprite.input) {
                    this.sprite.setInteractive();
                }
            },
        });
    }

    public heal(amount: number): void {
        const oldHealth = this.stats.health;
        this.stats.health = Math.min(
            this.stats.maxHealth,
            this.stats.health + amount
        );
        const actualHeal = this.stats.health - oldHealth;

        if (actualHeal > 0) {
            // Get GameManager reference for healing animation
            const gameManager = (this.scene as any).gameManager;
            if (gameManager && gameManager.startDamageAnimation) {
                gameManager.startDamageAnimation();
            }

            // Visual feedback - show healing number
            const healText = this.scene.add
                .text(this.sprite.x, this.sprite.y - 40, `+${actualHeal}`, {
                    fontSize: "20px",
                    color: "#00ff00", // Green for healing
                    stroke: "#000000",
                    strokeThickness: 3,
                })
                .setOrigin(0.5);

            this.scene.tweens.add({
                targets: healText,
                y: healText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    healText.destroy();
                    // Notify GameManager about animation end
                    if (gameManager && gameManager.endDamageAnimation) {
                        gameManager.endDamageAnimation();
                    }
                },
            });

            this.updateHealthBar();
        }
    }

    public refreshInteractivity(): void {
        // Ensure the sprite is interactive
        if (!this.sprite.input || !this.sprite.input.enabled) {
            this.sprite.setInteractive();
        }
    }

    public destroy(): void {
        // Stop any playing walking sounds
        this.stopWalkingSound();

        this.sprite.destroy();
        this.healthBar.destroy();
        if (this.labelText) {
            this.labelText.destroy();
        }
    }

    // Getters
    public get health(): number {
        return this.stats.health;
    }
    public get maxHealth(): number {
        return this.stats.maxHealth;
    }
    public get moveRange(): number {
        return this.stats.moveRange;
    }
    public get attackRange(): number {
        return this.stats.attackRange;
    }
    public get movementPoints(): number | undefined {
        return this.stats.movementPoints;
    }
    public get maxMovementPoints(): number | undefined {
        return this.stats.maxMovementPoints;
    }
    public get actionPoints(): number | undefined {
        return this.stats.actionPoints;
    }
    public get maxActionPoints(): number | undefined {
        return this.stats.maxActionPoints;
    }
    public get force(): number {
        return this.stats.force;
    }
    public get dexterity(): number {
        return this.stats.dexterity;
    }
    public get armor(): number {
        return this.stats.armor;
    }
    public get magicResistance(): number {
        return this.stats.magicResistance || 0;
    }

    // Setters
    public set health(value: number) {
        this.stats.health = value;
    }
    public set attackRange(value: number) {
        this.stats.attackRange = value;
    }
    public set movementPoints(value: number | undefined) {
        this.stats.movementPoints = value;
    }
    public set actionPoints(value: number | undefined) {
        this.stats.actionPoints = value;
    }

    public resetTurnStats(): void {
        this.hasActed = false;
        this.hasMovedThisTurn = false; // Reset movement tracking
        if (this.stats.maxMovementPoints !== undefined) {
            this.stats.movementPoints = this.stats.maxMovementPoints;
        }
        if (this.stats.maxActionPoints !== undefined) {
            this.stats.actionPoints = this.stats.maxActionPoints;
        }

        // Apply turn start bonuses (Player only)
        if (this.team === "player") {
            this.applyTurnStartBonuses();
        }

        // Reset spell shield at the start of each battle (not turn)
        // This is handled elsewhere
    }

    private applyTurnStartBonuses(): void {
        const progress = GameProgress.getInstance();
        const appliedBonuses = progress.getAppliedBonuses();

        // Combat Medic: Heal 2 HP at turn start
        if (appliedBonuses.includes("combat_medic")) {
            this.heal(2);
            console.log("[Unit] Combat Medic: Healed 2 HP at turn start");
        }

        // Adrenaline Rush: +2 AP on first turn only
        // This needs to be handled in the battle start, not turn start
    }

    public isAlive(): boolean {
        return this.stats.health > 0;
    }

    // Calculate damage based on attack type and stats
    public calculateDamage(attackType: "melee" | "ranged"): number {
        const baseDamage = attackType === "melee" ? 2 : 1;
        const statBonus =
            attackType === "melee" ? this.stats.force : this.stats.dexterity;

        // Add some randomness
        const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%

        return Math.round((baseDamage + statBonus) * randomFactor);
    }

    public enableClickHandler(onClick: () => void): void {
        // Remove all existing listeners first
        this.sprite.removeAllListeners();

        // Make sure sprite is interactive
        this.sprite.setInteractive();

        // Add the click handler
        this.sprite.on("pointerdown", () => {
            onClick();
        });

        // Store base scale
        const baseScaleX = this.sprite.scaleX;
        const baseScaleY = this.sprite.scaleY;

        // Add hover effects for better feedback
        this.sprite.on("pointerover", () => {
            this.sprite.setScale(baseScaleX * 1.1, baseScaleY * 1.1);
            this.scene.input.setDefaultCursor("pointer");
            // Show stats tooltip if available (but not for player units)
            if ("showStatsTooltip" in this && this.team !== "player") {
                (this as any).showStatsTooltip();
            }
        });

        this.sprite.on("pointerout", () => {
            this.sprite.setScale(baseScaleX, baseScaleY);
            this.scene.input.setDefaultCursor("default");
            // Hide stats tooltip if available (but not for player units)
            if ("hideStatsTooltip" in this && this.team !== "player") {
                (this as any).hideStatsTooltip();
            }
        });

        console.log(
            `Click handler enabled for ${this.team} unit at (${this.gridX}, ${this.gridY})`
        );
    }

    public stopWalkingSound(): void {
        if (this.walkSound) {
            this.walkSound.stop();
            this.walkSound.destroy();
            this.walkSound = undefined;
        }
    }
}

