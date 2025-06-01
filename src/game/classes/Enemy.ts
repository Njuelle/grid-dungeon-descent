import { Scene } from "phaser";
import { Unit, UnitStats } from "./Unit";
import { DifficultyScaling } from "./DifficultyScaling";
import { GameProgress } from "./GameProgress";

export abstract class Enemy extends Unit {
    protected static unitCount = 0;
    public enemyType: string;

    constructor(
        scene: Scene,
        gridX: number,
        gridY: number,
        baseStats: UnitStats,
        enemyType?: string
    ) {
        // Apply difficulty modifiers to stats
        const stats = Enemy.applyDifficultyModifiers(baseStats);

        super(scene, gridX, gridY, "enemy", stats);
        this.enemyType = enemyType || this.constructor.name;
        this.enableStatsTooltip();
    }

    private static applyDifficultyModifiers(baseStats: UnitStats): UnitStats {
        const modifiers = DifficultyScaling.getDifficultyModifiers();

        return {
            health: Math.round(
                baseStats.health * modifiers.enemyHealthMultiplier
            ),
            maxHealth: Math.round(
                baseStats.maxHealth * modifiers.enemyHealthMultiplier
            ),
            moveRange: baseStats.moveRange + modifiers.enemyMoveRangeBonus,
            attackRange: baseStats.attackRange,
            force: Math.round(
                baseStats.force * modifiers.enemyDamageMultiplier
            ),
            dexterity: Math.round(
                baseStats.dexterity * modifiers.enemyDamageMultiplier
            ),
            intelligence: baseStats.intelligence
                ? Math.round(
                      baseStats.intelligence * modifiers.enemyDamageMultiplier
                  )
                : baseStats.intelligence,
            armor: baseStats.armor + modifiers.enemyArmorBonus,
            magicResistance:
                baseStats.magicResistance !== undefined
                    ? baseStats.magicResistance +
                      Math.floor(modifiers.enemyArmorBonus / 2) // Half of armor bonus for magic resistance
                    : baseStats.magicResistance,
            movementPoints: baseStats.movementPoints,
            maxMovementPoints: baseStats.maxMovementPoints,
            actionPoints: baseStats.actionPoints,
            maxActionPoints: baseStats.maxActionPoints,
        };
    }

    protected abstract getColor(): number;
    protected abstract getOutlineColor(): number;
    protected abstract getLabel(): string;

    protected createSprite(): void {
        const unitGraphics = this.scene.add.graphics();

        // Enemy: Circle shape with type-specific colors
        unitGraphics.fillStyle(this.getColor());
        unitGraphics.lineStyle(3, this.getOutlineColor());
        unitGraphics.fillCircle(0, 0, 20);
        unitGraphics.strokeCircle(0, 0, 20);

        // Add label text on enemy unit
        this.labelText = this.scene.add
            .text(0, 0, this.getLabel(), {
                fontSize: "16px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(3);

        const textureKey = `enemy_${this.enemyType}_${Enemy.unitCount++}`;
        unitGraphics.generateTexture(textureKey, 40, 40);
        unitGraphics.destroy();

        this.sprite = this.scene.add.sprite(0, 0, textureKey);
        this.sprite.setInteractive();
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2);
    }

    private statsTooltip?: Phaser.GameObjects.Container;
    private isTooltipVisible: boolean = false;

    private enableStatsTooltip(): void {
        // Add hover effect to show stats
        this.sprite.on("pointerover", () => this.showStatsTooltip());
        this.sprite.on("pointerout", () => this.hideStatsTooltip());
    }

    private showStatsTooltip(): void {
        if (this.statsTooltip) return;

        this.isTooltipVisible = true;

        // Get the player to check selected spell
        const gameManager = (this.scene as any).gameManager;
        const player = gameManager?.getPlayer();
        const selectedSpell = player?.getCurrentSpell();

        const x = this.sprite.x;
        const y = this.sprite.y - 140;

        // Container for all tooltip elements
        const container = this.scene.add.container(x, y);

        // Background - larger dimensions (increased width for 5 stats)
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a2a2a, 0.95);

        // Adjust height if damage preview is shown
        const bgHeight = selectedSpell ? 170 : 130;
        const bgY = selectedSpell ? -85 : -65;

        bg.fillRoundedRect(-160, bgY, 320, bgHeight, 16);
        bg.lineStyle(4, 0xaa4444);
        bg.strokeRoundedRect(-160, bgY, 320, bgHeight, 16);

        // Title - enemy type with larger font
        const titleText = this.scene.add
            .text(0, selectedSpell ? -70 : -50, this.enemyType.toUpperCase(), {
                fontSize: "20px",
                color: "#ffaaaa",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Health bar background - larger
        const healthBarBg = this.scene.add.graphics();
        healthBarBg.fillStyle(0x000000, 0.8);
        healthBarBg.fillRoundedRect(
            -100,
            selectedSpell ? -45 : -25,
            200,
            24,
            12
        );

        // Health bar
        const healthBar = this.scene.add.graphics();
        const healthPercent = this.health / this.maxHealth;
        const barWidth = 196 * healthPercent;

        // Choose color based on health percentage
        let healthColor = 0x00aa00; // Darker green (was 0x00ff00)
        if (healthPercent <= 0.25) {
            healthColor = 0xff0000; // Red
        } else if (healthPercent <= 0.5) {
            healthColor = 0xffaa00; // Orange
        }

        healthBar.fillStyle(healthColor, 0.9);
        healthBar.fillRoundedRect(
            -98,
            selectedSpell ? -43 : -23,
            barWidth,
            20,
            10
        );

        // Health text - larger font
        const healthText = this.scene.add
            .text(
                0,
                selectedSpell ? -33 : -13,
                `${this.health} / ${this.maxHealth}`,
                {
                    fontSize: "18px",
                    color: "#ffffff",
                    fontStyle: "bold",
                }
            )
            .setOrigin(0.5);

        // Stats icons and values in a row - adjusted spacing for 5 stats
        const statsY = selectedSpell ? 0 : 25;

        // Force icon and value
        const forceIcon = this.scene.add
            .text(-125, statsY, "⚔️", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const forceText = this.scene.add
            .text(-102, statsY, this.force.toString(), {
                fontSize: "18px",
                color: "#ff6666",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Dexterity icon and value
        const dexIcon = this.scene.add
            .text(-65, statsY, "🏹", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const dexText = this.scene.add
            .text(-42, statsY, this.dexterity.toString(), {
                fontSize: "18px",
                color: "#66ff66",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Intelligence icon and value
        const intIcon = this.scene.add
            .text(-5, statsY, "🧠", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const intText = this.scene.add
            .text(18, statsY, this.intelligence.toString(), {
                fontSize: "18px",
                color: "#ff66ff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Armor icon and value
        const armorIcon = this.scene.add
            .text(55, statsY, "🛡️", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const armorText = this.scene.add
            .text(78, statsY, this.armor.toString(), {
                fontSize: "18px",
                color: "#6666ff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Magic Resistance icon and value
        const mrIcon = this.scene.add
            .text(115, statsY, "✨", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const mrText = this.scene.add
            .text(138, statsY, this.magicResistance.toString(), {
                fontSize: "18px",
                color: "#cc99ff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Add all elements to container
        container.add([
            bg,
            titleText,
            healthBarBg,
            healthBar,
            healthText,
            forceIcon,
            forceText,
            dexIcon,
            dexText,
            intIcon,
            intText,
            armorIcon,
            armorText,
            mrIcon,
            mrText,
        ]);

        // Store references to elements that may need updating
        container.setData("healthBar", healthBar);
        container.setData("healthText", healthText);
        container.setData("selectedSpell", selectedSpell);

        // Add damage preview if player has spell selected
        if (player && selectedSpell) {
            // Calculate damage preview
            const baseDamage = selectedSpell.damage;
            let statBonus = 0;

            if (selectedSpell.type === "melee") {
                statBonus = player.force;
            } else if (selectedSpell.type === "ranged") {
                statBonus = player.dexterity;
            } else if (selectedSpell.type === "magic") {
                statBonus = player.intelligence || 0;
            }

            // Apply power through pain bonus if present
            const progress = GameProgress.getInstance();
            const appliedBonuses = progress.getAppliedBonuses();
            if (appliedBonuses.includes("power_through_pain")) {
                const missingHP = player.maxHealth - player.health;
                const powerThroughPainBonus = Math.min(3, missingHP);
                if (powerThroughPainBonus > 0) {
                    statBonus += powerThroughPainBonus;
                }
            }

            // Calculate min and max damage (0.8x to 1.2x)
            const rawDamageMin = Math.round((baseDamage + statBonus) * 0.8);
            const rawDamageMax = Math.round((baseDamage + statBonus) * 1.2);

            // Apply resistance
            const damageType =
                selectedSpell.type === "magic" ? "magic" : "physical";
            const resistance =
                damageType === "magic" ? this.magicResistance : this.armor;

            const actualDamageMin = Math.max(1, rawDamageMin - resistance);
            const actualDamageMax = Math.max(1, rawDamageMax - resistance);

            // Damage preview separator
            const separator = this.scene.add.graphics();
            separator.lineStyle(2, 0x666666);
            separator.moveTo(-140, statsY + 25);
            separator.lineTo(140, statsY + 25);
            separator.strokePath();

            // Spell name and damage preview
            const spellPreviewY = statsY + 40;

            // Spell name on the left
            const spellNameText = this.scene.add
                .text(-140, spellPreviewY, selectedSpell.name, {
                    fontSize: "15px",
                    color: "#ffff00",
                    fontStyle: "bold",
                })
                .setOrigin(0, 0.5);

            // Damage range text on the right
            const damageRangeText = this.scene.add
                .text(
                    80,
                    spellPreviewY,
                    `${actualDamageMin}-${actualDamageMax} dmg`,
                    {
                        fontSize: "18px",
                        color: "#ff4444",
                        fontStyle: "bold",
                    }
                )
                .setOrigin(1, 0.5);

            // If damage is reduced, show the reduction
            if (resistance > 0) {
                const reductionText = this.scene.add
                    .text(130, spellPreviewY, `-${resistance}`, {
                        fontSize: "14px",
                        color: damageType === "magic" ? "#cc99ff" : "#6666ff",
                        fontStyle: "italic",
                    })
                    .setOrigin(0.5);
                container.add(reductionText);
            }

            container.add([separator, spellNameText, damageRangeText]);
        }

        this.statsTooltip = container;
        this.statsTooltip.setDepth(100);
    }

    private hideStatsTooltip(): void {
        if (this.statsTooltip) {
            this.statsTooltip.destroy();
            this.statsTooltip = undefined;
        }
        this.isTooltipVisible = false;
    }

    private refreshTooltip(): void {
        if (this.isTooltipVisible && this.statsTooltip) {
            // Get references to the health elements
            const healthBar = this.statsTooltip.getData(
                "healthBar"
            ) as Phaser.GameObjects.Graphics;
            const healthText = this.statsTooltip.getData(
                "healthText"
            ) as Phaser.GameObjects.Text;
            const selectedSpell = this.statsTooltip.getData("selectedSpell");

            if (healthBar && healthText) {
                // Clear and redraw health bar
                healthBar.clear();
                const healthPercent = this.health / this.maxHealth;
                const barWidth = 196 * healthPercent;

                // Choose color based on health percentage
                let healthColor = 0x00aa00; // Darker green
                if (healthPercent <= 0.25) {
                    healthColor = 0xff0000; // Red
                } else if (healthPercent <= 0.5) {
                    healthColor = 0xffaa00; // Orange
                }

                healthBar.fillStyle(healthColor, 0.9);
                healthBar.fillRoundedRect(
                    -98,
                    selectedSpell ? -43 : -23,
                    barWidth,
                    20,
                    10
                );

                // Update health text
                healthText.setText(`${this.health} / ${this.maxHealth}`);
            }
        }
    }

    // Override takeDamage to refresh tooltip when health changes
    public takeDamage(
        damage: number,
        damageType: "physical" | "magic" = "physical",
        attacker?: Unit
    ): void {
        super.takeDamage(damage, damageType, attacker);

        // Refresh tooltip if it's currently visible
        this.refreshTooltip();
    }

    public getAttackDamage(): number {
        // Determine attack type based on range
        const attackType = this.attackRange > 1 ? "ranged" : "melee";
        return this.calculateDamage(attackType);
    }

    public destroy(): void {
        this.hideStatsTooltip();
        super.destroy();
    }

    public get intelligence(): number {
        return this.stats.intelligence || 0;
    }
}

