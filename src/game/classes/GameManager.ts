import { Scene } from "phaser";
import { Unit } from "./Unit";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Magician } from "./enemies/Magician";
import { Necromancer } from "./enemies/Necromancer";
import { Grid } from "./Grid";
import { UIManager } from "./UIManager";
import { Spell } from "./Spell";
import { GameProgress } from "./GameProgress";

export class GameManager {
    private scene: Scene;
    private grid: Grid;
    private units: Unit[] = [];
    private currentTeam: "player" | "enemy" = "player";
    private selectedUnit: Unit | null = null;
    private moveHighlights: Phaser.GameObjects.Graphics;
    private attackHighlights: Phaser.GameObjects.Graphics;
    private pathPreview: Phaser.GameObjects.Graphics;
    private onTurnChange?: (team: "player" | "enemy") => void;
    private onUnitSelected?: (unit: Unit | null) => void;
    private onGameOver?: (victory: boolean) => void;
    private uiManager?: UIManager;
    private isFirstTurn: boolean = true;
    private gameOver: boolean = false;
    private hoverPreviewEnabled: boolean = true;
    private activeDamageAnimations: number = 0;
    private pendingVictoryCheck: boolean = false;

    constructor(scene: Scene, grid: Grid) {
        this.scene = scene;
        this.grid = grid;
        this.moveHighlights = scene.add.graphics();
        this.attackHighlights = scene.add.graphics();
        this.pathPreview = scene.add.graphics();

        // Set depth to ensure path preview is visible
        this.pathPreview.setDepth(10);

        // Set up hover preview
        this.setupHoverPreview();
    }

    private setupHoverPreview(): void {
        this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            // Return early if hover preview is disabled
            if (!this.hoverPreviewEnabled) {
                return;
            }

            // Clear previous path preview
            this.pathPreview.clear();

            // Check if mouse is over UI area (bottom 100px of screen) - don't change cursor
            const uiAreaHeight = 100;
            const isOverUI =
                pointer.y >= this.scene.scale.height - uiAreaHeight;

            const gridPos = this.grid.worldToGrid(pointer.x, pointer.y);

            // Default cursor when not over grid or no unit selected, but only if not over UI
            if (!gridPos || !this.selectedUnit || this.selectedUnit.hasActed) {
                if (!isOverUI) {
                    this.scene.input.setDefaultCursor("default");
                }
                return;
            }

            // Only show movement preview for player units
            if (!(this.selectedUnit instanceof Player)) {
                if (!isOverUI) {
                    this.scene.input.setDefaultCursor("default");
                }
                return;
            }

            const player = this.selectedUnit as Player;

            // Don't show path to current position
            if (
                gridPos.x === this.selectedUnit.gridX &&
                gridPos.y === this.selectedUnit.gridY
            ) {
                if (!isOverUI) {
                    this.scene.input.setDefaultCursor("default");
                }
                return;
            }

            // Check if hovering over an enemy
            const targetUnit = this.getUnitAt(gridPos.x, gridPos.y);

            // If in attack mode and hovering over enemy, don't show movement path
            if (
                player.isInAttackMode() &&
                targetUnit &&
                targetUnit.team !== player.team
            ) {
                const distance = this.grid.getDistance(
                    player.gridX,
                    player.gridY,
                    targetUnit.gridX,
                    targetUnit.gridY
                );
                const hasLOS = this.hasLineOfSightWithUnits(
                    player.gridX,
                    player.gridY,
                    targetUnit.gridX,
                    targetUnit.gridY,
                    player
                );

                // Check what's blocking if no LOS
                let blockingReason = "";
                if (!hasLOS && distance <= player.attackRange) {
                    // First check if walls block
                    if (
                        !this.grid.hasLineOfSight(
                            player.gridX,
                            player.gridY,
                            targetUnit.gridX,
                            targetUnit.gridY
                        )
                    ) {
                        blockingReason = "Blocked by wall!";
                    } else {
                        blockingReason = "Blocked by unit!";
                    }
                }

                const spell = player.getCurrentSpell();

                if (this.uiManager) {
                    let actionText = `Cast ${spell.name}`;
                    if (spell.aoeShape && spell.aoeRadius) {
                        actionText += ` (AoE)`;
                    }
                    actionText += ` on ${targetUnit.team}`;

                    // First check if player has enough AP
                    if (!player.canAttack()) {
                        this.uiManager.setActionText(
                            `Not enough AP for ${spell.name}! (Need ${spell.apCost}, have ${player.actionPoints})`
                        );
                        if (!isOverUI) {
                            this.scene.input.setDefaultCursor("default");
                        }
                    } else if (distance <= player.attackRange && hasLOS) {
                        this.uiManager.setActionText(actionText);
                        if (!isOverUI) {
                            this.scene.input.setDefaultCursor("pointer"); // Can attack
                        }
                        // Preview AoE area on hover
                        if (spell.aoeShape && spell.aoeRadius) {
                            this.pathPreview.clear(); // Clear previous path/AoE previews
                            this.pathPreview.fillStyle(0xff8800, 0.3); // Orange for AoE preview
                            let aoeTiles: { x: number; y: number }[];

                            if (spell.aoeShape === "circle") {
                                aoeTiles = this.grid.getTilesInArea(
                                    spell.aoeShape,
                                    spell.aoeRadius,
                                    targetUnit.gridX, // Hovered enemy as center
                                    targetUnit.gridY
                                );
                            } else {
                                // Line or Cone
                                aoeTiles = this.grid.getTilesInArea(
                                    spell.aoeShape,
                                    spell.aoeRadius,
                                    player.gridX, // Caster (player)
                                    player.gridY,
                                    targetUnit.gridX, // Hovered enemy (for direction)
                                    targetUnit.gridY
                                );
                            }

                            for (const tile of aoeTiles) {
                                const worldPos = this.grid.gridToWorld(
                                    tile.x,
                                    tile.y
                                );
                                this.pathPreview.fillRect(
                                    worldPos.x - this.grid.tileSize / 2,
                                    worldPos.y - this.grid.tileSize / 2,
                                    this.grid.tileSize,
                                    this.grid.tileSize
                                );
                            }
                        }
                    } else if (distance <= player.attackRange) {
                        this.uiManager.setActionText(blockingReason);
                        if (!isOverUI) {
                            this.scene.input.setDefaultCursor("default"); // Cannot attack
                        }
                    } else {
                        this.uiManager.setActionText(
                            `Out of range for ${spell.name}!`
                        );
                        if (!isOverUI) {
                            this.scene.input.setDefaultCursor("default"); // Cannot attack
                        }
                    }
                }
                return; // Return here to prevent movement path preview
            }

            // If we are here, it means we are not hovering over an attackable enemy in attack mode.
            // Clear any AoE preview from pathPreview if it was drawn in the previous frame.
            // This is important if the player moves the mouse off an enemy but is still in attack mode.
            const spell = player.getCurrentSpell();
            if (player.isInAttackMode() && spell.aoeShape && spell.aoeRadius) {
                // Only clear if it was an AoE spell, to avoid clearing movement paths unnecessarily
                this.pathPreview.clear();
            }

            // If hovering over enemy but not in attack mode (no AP), show that info
            if (
                targetUnit &&
                targetUnit.team !== player.team &&
                !player.isInAttackMode()
            ) {
                if (this.uiManager) {
                    const spell = player.getCurrentSpell();
                    this.uiManager.setActionText(
                        `No AP for attacks! (${spell.name} needs ${spell.apCost} AP)`
                    );
                }
                if (!isOverUI) {
                    this.scene.input.setDefaultCursor("default");
                }
                return;
            }

            // Don't show path if no movement points
            if (!player.movementPoints || player.movementPoints === 0) {
                if (!isOverUI) {
                    this.scene.input.setDefaultCursor("default");
                }
                return;
            }

            // Don't show path to friendly units
            if (targetUnit && targetUnit.team === this.selectedUnit.team) {
                if (!isOverUI) {
                    this.scene.input.setDefaultCursor("default");
                }
                return;
            }

            // Find path to the hovered tile
            const path = this.grid.findPath(
                this.selectedUnit.gridX,
                this.selectedUnit.gridY,
                gridPos.x,
                gridPos.y,
                (x, y) => this.isOccupied(x, y)
            );

            if (path && path.length > 0) {
                const cost = path.length;
                const canMove = player.canMove(cost);

                // Set cursor based on whether movement is possible, but only if not over UI
                if (!isOverUI) {
                    this.scene.input.setDefaultCursor(
                        canMove ? "pointer" : "default"
                    );
                }

                // Draw path preview with better visibility
                this.pathPreview.lineStyle(4, 0xffff00, 0.8);

                // Start from the unit's current position
                let prevPos = this.grid.gridToWorld(
                    this.selectedUnit.gridX,
                    this.selectedUnit.gridY
                );

                // Draw line from start position to first step
                const firstPos = this.grid.gridToWorld(path[0].x, path[0].y);
                this.pathPreview.moveTo(prevPos.x, prevPos.y);
                this.pathPreview.lineTo(firstPos.x, firstPos.y);

                // Draw lines between each step
                for (let i = 0; i < path.length; i++) {
                    const currentPos = this.grid.gridToWorld(
                        path[i].x,
                        path[i].y
                    );

                    if (i > 0) {
                        this.pathPreview.moveTo(prevPos.x, prevPos.y);
                        this.pathPreview.lineTo(currentPos.x, currentPos.y);
                    }

                    prevPos = currentPos;
                }

                // Stroke all the lines
                this.pathPreview.strokePath();

                // Now draw circles at each step
                this.pathPreview.fillStyle(0xffff00, 0.6);
                for (const step of path) {
                    const pos = this.grid.gridToWorld(step.x, step.y);
                    this.pathPreview.fillCircle(pos.x, pos.y, 8);
                }

                // Show movement cost
                if (this.uiManager && !targetUnit) {
                    this.uiManager.setActionText(
                        canMove
                            ? `Movement cost: ${cost} MP`
                            : `Cannot move: Need ${cost} MP, have ${player.movementPoints}`
                    );
                }
            } else {
                // No valid path, but only set cursor if not over UI
                if (!isOverUI) {
                    this.scene.input.setDefaultCursor("default");
                }
            }
        });
    }

    public setUIManager(uiManager: UIManager): void {
        this.uiManager = uiManager;
    }

    public addUnit(unit: Unit): void {
        this.units.push(unit);

        // Set up click handler using the new method
        unit.enableClickHandler(() => this.onUnitClick(unit));
    }

    public getPlayer(): Player | null {
        const player = this.units.find((u) => u instanceof Player);
        return player instanceof Player ? player : null;
    }

    public getUnits(): Unit[] {
        return this.units;
    }

    public getSelectedUnit(): Unit | null {
        return this.selectedUnit;
    }

    private onUnitClick(unit: Unit): void {
        console.log(
            `Unit clicked: ${unit.team} at (${unit.gridX}, ${unit.gridY}), hasActed: ${unit.hasActed}`
        );

        if (unit.team !== this.currentTeam) {
            // If clicking enemy unit while having a selected unit, try to attack
            if (
                this.selectedUnit &&
                !this.selectedUnit.hasActed &&
                this.selectedUnit instanceof Player
            ) {
                const player = this.selectedUnit as Player;
                const distance = this.grid.getDistance(
                    player.gridX,
                    player.gridY,
                    unit.gridX,
                    unit.gridY
                );

                // Check if player can cast the current spell
                if (!player.canAttack()) {
                    if (this.uiManager) {
                        this.uiManager.setActionText(
                            `Not enough AP for ${
                                player.getCurrentSpell().name
                            }! Need ${player.getCurrentSpell().apCost}, have ${
                                player.actionPoints
                            }`
                        );
                    }
                    return;
                }

                const spell = player.getCurrentSpell();

                // Check minimum range for ranged spells
                if (spell.minRange && distance < spell.minRange) {
                    if (this.uiManager) {
                        this.uiManager.setActionText(
                            `${spell.name} requires minimum range of ${spell.minRange}! Current distance: ${distance}`
                        );
                    }
                    return;
                }

                // Check both distance and line of sight for attacks
                const hasLOS = this.hasLineOfSightWithUnits(
                    player.gridX,
                    player.gridY,
                    unit.gridX,
                    unit.gridY,
                    player
                );

                if (distance <= player.attackRange && hasLOS) {
                    this.attackUnit(player, unit);
                } else if (distance <= player.attackRange) {
                    // In range but no line of sight
                    if (this.uiManager) {
                        // Check what's blocking
                        if (
                            !this.grid.hasLineOfSight(
                                player.gridX,
                                player.gridY,
                                unit.gridX,
                                unit.gridY
                            )
                        ) {
                            this.uiManager.setActionText(
                                "Cannot attack: Blocked by wall!"
                            );
                        } else {
                            this.uiManager.setActionText(
                                "Cannot attack: Blocked by unit!"
                            );
                        }
                    }
                } else {
                    if (this.uiManager) {
                        this.uiManager.setActionText(
                            `Target is out of range for ${
                                player.getCurrentSpell().name
                            }!`
                        );
                    }
                }
            }
            return;
        }

        // Allow re-selecting the same unit to refresh highlights
        if (unit === this.selectedUnit) {
            console.log("Re-selecting same unit");
            this.clearHighlights();
            this.highlightMoveRange(unit);
            this.highlightAttackRange(unit);
            return;
        }

        if (unit.hasActed) {
            console.log("Unit has already acted");
            return;
        }

        this.selectUnit(unit);
    }

    public selectUnit(unit: Unit | null): void {
        console.log(
            `Selecting unit: ${
                unit ? `${unit.team} at (${unit.gridX}, ${unit.gridY})` : "null"
            }`
        );
        this.selectedUnit = unit;
        this.clearHighlights();

        if (unit) {
            this.highlightMoveRange(unit);
            this.highlightAttackRange(unit);
        }

        if (this.onUnitSelected) {
            this.onUnitSelected(unit);
        }
    }

    private highlightMoveRange(unit: Unit): void {
        this.moveHighlights.clear();
        this.moveHighlights.fillStyle(0x00ff00, 0.3);

        const maxRange =
            unit instanceof Player ? unit.movementPoints || 0 : unit.moveRange;

        // Use pathfinding to find reachable tiles
        const reachableTiles = this.grid.getReachableTiles(
            unit.gridX,
            unit.gridY,
            maxRange,
            (x, y) => this.isOccupied(x, y)
        );

        // Highlight reachable tiles
        for (const tile of reachableTiles) {
            const worldPos = this.grid.gridToWorld(tile.x, tile.y);
            this.moveHighlights.fillRect(
                worldPos.x - this.grid.tileSize / 2 + 2,
                worldPos.y - this.grid.tileSize / 2 + 2,
                this.grid.tileSize - 4,
                this.grid.tileSize - 4
            );
        }
    }

    private highlightAttackRange(unit: Unit): void {
        this.attackHighlights.clear();
        this.attackHighlights.fillStyle(0xff0000, 0.2); // Primary target highlight
        const secondaryAoEHighlightColor = 0xff8800; // Orange for secondary AoE
        const secondaryAoEHighlightAlpha = 0.15;

        let minRange = 0;
        let spell: Spell | null = null;

        if (unit instanceof Player) {
            spell = unit.getCurrentSpell();
            if (spell.minRange) {
                minRange = spell.minRange;
            }
        }

        for (let x = 0; x < this.grid.size; x++) {
            for (let y = 0; y < this.grid.size; y++) {
                const distance = this.grid.getDistance(
                    x,
                    y,
                    unit.gridX,
                    unit.gridY
                );

                if (
                    distance <= unit.attackRange &&
                    distance >= minRange &&
                    this.hasLineOfSightWithUnits(
                        unit.gridX,
                        unit.gridY,
                        x,
                        y,
                        unit
                    )
                ) {
                    const worldPos = this.grid.gridToWorld(x, y);
                    // Highlight primary target tile
                    this.attackHighlights.fillRect(
                        worldPos.x - this.grid.tileSize / 2 + 4,
                        worldPos.y - this.grid.tileSize / 2 + 4,
                        this.grid.tileSize - 8,
                        this.grid.tileSize - 8
                    );

                    // If spell has AoE, highlight secondary tiles
                    if (spell && spell.aoeShape && spell.aoeRadius) {
                        let aoeTiles: { x: number; y: number }[];
                        if (spell.aoeShape === "circle") {
                            aoeTiles = this.grid.getTilesInArea(
                                spell.aoeShape,
                                spell.aoeRadius,
                                x, // Hovered tile as center of AoE
                                y
                            );
                        } else {
                            // Line or Cone
                            aoeTiles = this.grid.getTilesInArea(
                                spell.aoeShape,
                                spell.aoeRadius,
                                unit.gridX, // Caster (selected unit)
                                unit.gridY,
                                x, // Hovered tile (primary target for direction)
                                y
                            );
                        }

                        this.attackHighlights.fillStyle(
                            secondaryAoEHighlightColor,
                            secondaryAoEHighlightAlpha
                        );
                        for (const tile of aoeTiles) {
                            // Don't re-highlight the primary target tile with secondary color
                            if (tile.x === x && tile.y === y) continue;

                            const afectadoWorldPos = this.grid.gridToWorld(
                                tile.x,
                                tile.y
                            );
                            this.attackHighlights.fillRect(
                                afectadoWorldPos.x - this.grid.tileSize / 2 + 4,
                                afectadoWorldPos.y - this.grid.tileSize / 2 + 4,
                                this.grid.tileSize - 8,
                                this.grid.tileSize - 8
                            );
                        }
                        this.attackHighlights.fillStyle(0xff0000, 0.2); // Reset to primary target color
                    }
                }
            }
        }
    }

    public clearHighlights(): void {
        this.moveHighlights.clear();
        this.attackHighlights.clear();
        this.pathPreview.clear();

        // Check if mouse is over UI area before resetting cursor
        const uiAreaHeight = 100;
        const pointer = this.scene.input.activePointer;
        const isOverUI =
            pointer && pointer.y >= this.scene.scale.height - uiAreaHeight;

        // Reset cursor when clearing highlights, but only if not over UI
        if (!isOverUI) {
            this.scene.input.setDefaultCursor("default");
        }
    }

    public handleTileClick(gridX: number, gridY: number): void {
        console.log(`Tile clicked at (${gridX}, ${gridY})`);

        // First check if clicking on a unit
        const clickedUnit = this.getUnitAt(gridX, gridY);

        // If clicking on a unit, handle it through onUnitClick
        if (clickedUnit) {
            console.log("Clicked on a unit");
            this.onUnitClick(clickedUnit);
            return;
        }

        // Check if clicking on a wall
        if (this.grid.isWall(gridX, gridY)) {
            console.log("Clicked on a wall");
            if (this.uiManager) {
                this.uiManager.setActionText("Cannot move to a wall!");
            }
            return;
        }

        // Otherwise, handle empty tile clicks for movement
        if (!this.selectedUnit) {
            console.log("No unit selected");
            return;
        }

        if (this.selectedUnit.hasActed) {
            console.log("Selected unit has already acted");
            return;
        }

        console.log(
            `Attempting to move from (${this.selectedUnit.gridX}, ${this.selectedUnit.gridY}) to (${gridX}, ${gridY})`
        );

        // First check if there's a valid path
        const path = this.grid.findPath(
            this.selectedUnit.gridX,
            this.selectedUnit.gridY,
            gridX,
            gridY,
            (x, y) => this.isOccupied(x, y)
        );

        if (!path) {
            console.log("No path found (null)");
            if (this.uiManager) {
                this.uiManager.setActionText("No path to that location!");
            }
            return;
        }

        console.log(`Path found with length: ${path.length}`);
        console.log("Path details:", JSON.stringify(path));

        if (path.length === 0) {
            console.log("Empty path (same position)");
            return;
        }

        const movementCost = path.length;

        // Move to empty tile
        if (!this.isOccupied(gridX, gridY)) {
            if (this.selectedUnit instanceof Player) {
                const canMove = this.selectedUnit.canMove(movementCost);
                console.log(
                    `Player can move: ${canMove}, MP: ${this.selectedUnit.movementPoints}, Cost: ${movementCost}`
                );

                if (!canMove) {
                    if (this.uiManager) {
                        this.uiManager.setActionText(
                            `Not enough MP! Need ${movementCost}, have ${this.selectedUnit.movementPoints}`
                        );
                    }
                    return;
                }
                console.log("Moving player unit");
                this.moveUnit(this.selectedUnit, gridX, gridY, movementCost);
            } else if (movementCost <= this.selectedUnit.moveRange) {
                console.log("Moving enemy unit");
                this.moveUnit(this.selectedUnit, gridX, gridY, movementCost);
            }
        } else {
            console.log("Target tile is occupied");
        }
    }

    private moveUnit(
        unit: Unit,
        gridX: number,
        gridY: number,
        distance: number
    ): void {
        console.log(
            `Moving unit from (${unit.gridX}, ${unit.gridY}) to (${gridX}, ${gridY}), distance: ${distance}`
        );

        // Get the path to follow
        const path = this.grid.findPath(
            unit.gridX,
            unit.gridY,
            gridX,
            gridY,
            (x, y) => this.isOccupied(x, y)
        );

        console.log("Path found:", path);
        console.log("Path details:", JSON.stringify(path));

        if (!path || path.length === 0) {
            console.error("No path found for movement! Path is:", path);
            // Try without the occupied check as a debug test
            const debugPath = this.grid.findPath(
                unit.gridX,
                unit.gridY,
                gridX,
                gridY
            );
            console.log("Debug path without occupied check:", debugPath);
            return;
        }

        console.log(`Calling moveAlongPath with ${path.length} steps`);

        // Check for shadow step bonus BEFORE starting movement
        let shadowStepApplied = false;
        if (unit instanceof Player) {
            const progress = GameProgress.getInstance();
            const appliedBonuses = progress.getAppliedBonuses();

            if (
                appliedBonuses.includes("shadow_step") &&
                !unit.hasMovedThisTurn
            ) {
                shadowStepApplied = true;
                console.log(
                    "[GameManager] Shadow Step: First movement is free!"
                );
                if (this.uiManager) {
                    this.uiManager.addCombatLogMessage(
                        "Shadow Step: Free movement!"
                    );
                }
            }
        }

        // Use the new moveAlongPath method
        unit.moveAlongPath(path, () => {
            console.log("Movement completed!");
            if (unit instanceof Player) {
                if (shadowStepApplied) {
                    // Don't consume movement points for shadow step
                    console.log(
                        "[GameManager] Shadow Step: Movement points not consumed"
                    );
                } else {
                    // Normal movement cost
                    unit.consumeMovementPoints(distance);
                }

                unit.updateHasActed(); // Update hasActed based on remaining points
                console.log(
                    `Player moved - Remaining MP: ${unit.movementPoints}, AP: ${unit.actionPoints}, hasActed: ${unit.hasActed}`
                );
            } else {
                unit.hasActed = true;
            }

            if (!unit.hasActed) {
                this.clearHighlights();
                this.highlightMoveRange(unit);
                this.highlightAttackRange(unit);

                // Keep unit selected if it can still act
                this.selectedUnit = unit;
                if (this.onUnitSelected) {
                    this.onUnitSelected(unit);
                }
            } else {
                this.selectUnit(null);
            }
        });
    }

    private playAttackAnimation(
        attacker: Unit,
        target: Unit,
        onComplete: () => void
    ): void {
        console.log(
            `[DEBUG] Starting attack animation for ${attacker.team} attacking ${target.team}`
        );

        // Determine attack type and play appropriate sound
        let attackSound: string;

        if (attacker instanceof Player) {
            // Player attack - use spell type
            const spell = attacker.getCurrentSpell();
            if (spell.type === "melee") {
                attackSound = "melee_attack";
            } else if (spell.type === "magic") {
                attackSound = "magic_attack";
            } else {
                attackSound = "ranged_attack";
            }
        } else if (attacker instanceof Enemy) {
            // Enemy attack - check if it's a magic user or based on range
            if (
                attacker instanceof Magician ||
                attacker instanceof Necromancer
            ) {
                attackSound = "magic_attack";
            } else if (attacker.attackRange > 1) {
                attackSound = "ranged_attack";
            } else {
                attackSound = "melee_attack";
            }
        } else {
            // Default to melee for any other unit type
            attackSound = "melee_attack";
        }

        // Play the attack sound
        this.scene.sound.play(attackSound, { volume: 0.5 });

        // Store original position
        const originalX = attacker.sprite.x;
        const originalY = attacker.sprite.y;

        // Simple vibration animation - no scaling
        const shakeIntensity = 12; // How far the unit shakes
        const shakeDuration = 50; // Duration of each shake movement
        const totalShakes = 6; // Number of shake movements

        let shakeCount = 0;

        // Flash effect at start
        attacker.sprite.setTint(0xffffff);

        const performShake = () => {
            if (shakeCount >= totalShakes) {
                // Return to original position and complete
                this.scene.tweens.add({
                    targets: attacker.sprite,
                    x: originalX,
                    y: originalY,
                    duration: 80,
                    ease: "Power2.easeOut",
                    onComplete: () => {
                        console.log(
                            `[DEBUG] Attack animation completed, calling onComplete callback`
                        );
                        attacker.sprite.clearTint();
                        onComplete();
                    },
                });
                return;
            }

            // Random shake direction - just position
            const shakeX = originalX + (Math.random() - 0.5) * shakeIntensity;
            const shakeY = originalY + (Math.random() - 0.5) * shakeIntensity;

            this.scene.tweens.add({
                targets: attacker.sprite,
                x: shakeX,
                y: shakeY,
                duration: shakeDuration,
                ease: "Power2.easeInOut",
                onComplete: () => {
                    shakeCount++;
                    performShake();
                },
            });
        };

        performShake();
    }

    private attackUnit(attacker: Player, primaryTarget: Unit): void {
        // Prevent double casting - check if already casting
        if ((attacker as any).isCasting) {
            console.log("[GameManager] Spell already being cast, ignoring");
            return;
        }

        // Set casting flag
        (attacker as any).isCasting = true;

        const spell = attacker.getCurrentSpell();

        // Calculate distance for guerrilla tactics
        const distance = this.grid.getDistance(
            attacker.gridX,
            attacker.gridY,
            primaryTarget.gridX,
            primaryTarget.gridY
        );

        // Pass target and distance to getAttackDamage
        const damage = attacker.getAttackDamage(primaryTarget, distance);

        // Add attack animation for player
        this.playAttackAnimation(attacker, primaryTarget, () => {
            // Apply to primary target
            this.applyDamageToTarget(attacker, primaryTarget, spell, damage);

            // Check for double tap bonus (20% chance to attack twice with ranged)
            const progress = GameProgress.getInstance();
            const appliedBonuses = progress.getAppliedBonuses();

            if (
                appliedBonuses.includes("double_tap") &&
                spell.type === "ranged" &&
                Math.random() < 0.2 &&
                primaryTarget.isAlive()
            ) {
                console.log("[GameManager] Double Tap! Attacking again");

                // Play another attack animation and apply damage again
                this.scene.time.delayedCall(300, () => {
                    const secondDamage = attacker.getAttackDamage(
                        primaryTarget,
                        distance
                    );
                    this.playAttackAnimation(attacker, primaryTarget, () => {
                        this.applyDamageToTarget(
                            attacker,
                            primaryTarget,
                            spell,
                            secondDamage
                        );

                        if (this.uiManager) {
                            this.uiManager.addCombatLogMessage(
                                "Double Tap: Second shot!"
                            );
                        }
                    });
                });
            }

            // Handle AoE if present
            if (spell.aoeShape && spell.aoeRadius) {
                let targetsInAoE: Unit[];
                if (spell.aoeShape === "circle") {
                    targetsInAoE = this.grid.getUnitsInArea(
                        spell.aoeShape,
                        spell.aoeRadius,
                        primaryTarget.gridX, // Circle centered on primary target
                        primaryTarget.gridY,
                        this.units.filter(
                            (u) =>
                                u !== primaryTarget && u.team !== attacker.team
                        )
                    );
                } else {
                    // Line or Cone
                    targetsInAoE = this.grid.getUnitsInArea(
                        spell.aoeShape,
                        spell.aoeRadius,
                        attacker.gridX, // Caster position
                        attacker.gridY,
                        this.units.filter(
                            (u) =>
                                u !== primaryTarget && u.team !== attacker.team
                        ),
                        primaryTarget.gridX, // Primary target for direction
                        primaryTarget.gridY
                    );
                }

                for (const aoeTarget of targetsInAoE) {
                    // Potentially reduce damage for secondary targets or apply other effects
                    this.applyDamageToTarget(
                        attacker,
                        aoeTarget,
                        spell,
                        damage
                    );
                }
            }

            attacker.consumeActionPoint();

            // Update the player's hasActed state
            attacker.updateHasActed();

            // Update UI to reflect new AP count
            if (this.uiManager) {
                this.uiManager.updatePointsDisplay(attacker);

                // Update action text if player has no points left
                if (!attacker.canAttack() && attacker.movementPoints === 0) {
                    this.uiManager.setActionText(
                        "No points left! End your turn."
                    );
                } else if (!attacker.canAttack()) {
                    this.uiManager.setActionText(
                        "No action points left! You can still move."
                    );
                }
            }

            // Clear casting flag after attack is complete
            (attacker as any).isCasting = false;

            // Check if the target is defeated (with a small delay)
            this.scene.time.delayedCall(200, () => {
                if (!primaryTarget.isAlive()) {
                    this.removeUnit(primaryTarget);
                    this.checkVictory();
                }

                // Refresh highlights if player is still selected
                if (this.selectedUnit === attacker) {
                    this.clearHighlights();
                    this.highlightMoveRange(attacker);
                    this.highlightAttackRange(attacker);
                }
            });
        });
    }

    private applyDamageToTarget(
        attacker: Player,
        target: Unit,
        spell: Spell,
        damage: number
    ): void {
        // Check for execute bonus on low HP enemies
        const progress = GameProgress.getInstance();
        const appliedBonuses = progress.getAppliedBonuses();

        if (appliedBonuses.includes("execute") && spell.id === "power_strike") {
            const targetHealthPercent = target.health / target.maxHealth;
            if (targetHealthPercent <= 0.2) {
                // Instant kill!
                damage = target.health + 1000; // Ensure death
                console.log(
                    "[GameManager] Execute: Instant kill on low HP enemy!"
                );

                if (this.uiManager) {
                    this.uiManager.addCombatLogMessage(
                        `EXECUTE! ${spell.name} instantly kills low HP enemy!`
                    );
                }
            }
        }

        const damageType = spell.type === "magic" ? "magic" : "physical";
        const resistance =
            damageType === "magic" ? target.magicResistance : target.armor;
        const actualDamage = Math.max(1, damage - resistance);
        const targetName =
            target instanceof Enemy ? (target as Enemy).enemyType : "unit";

        if (this.uiManager) {
            const stat =
                spell.type === "melee"
                    ? attacker.force
                    : spell.type === "magic"
                    ? attacker.intelligence
                    : attacker.dexterity;
            const statName =
                spell.type === "melee"
                    ? "FOR"
                    : spell.type === "magic"
                    ? "INT"
                    : "DEX";

            const resistanceType =
                damageType === "magic" ? "m.resist" : "armor";
            this.uiManager.addCombatLogMessage(
                `Player uses ${spell.name} (${stat} ${statName}): ${damage} dmg - ${resistance} ${resistanceType} = ${actualDamage} dmg to ${targetName}`
            );
        }

        const wasAlive = target.isAlive();
        target.takeDamage(damage, damageType, attacker);
        if (target instanceof Unit) {
            target.updateHealthBar();
        }

        // Apply healing bonuses after successful hit
        this.applyHealingBonuses(attacker, target, spell);

        // Check if target was killed by this attack
        if (wasAlive && !target.isAlive()) {
            // Apply kill bonuses only when the enemy is actually killed
            this.applyKillBonuses(attacker, target, spell);

            this.removeUnit(target);
            this.checkVictory();
        }
    }

    public removeUnit(unit: Unit): void {
        unit.destroy();
        this.units = this.units.filter((u) => u !== unit);
    }

    private getUnitAt(gridX: number, gridY: number): Unit | null {
        return (
            this.units.find(
                (unit) => unit.gridX === gridX && unit.gridY === gridY
            ) || null
        );
    }

    private isOccupied(gridX: number, gridY: number): boolean {
        return this.units.some(
            (unit) => unit.gridX === gridX && unit.gridY === gridY
        );
    }

    public startTurn(): void {
        // Reset unit actions
        this.units
            .filter((unit) => unit.team === this.currentTeam)
            .forEach((unit) => unit.resetTurnStats());

        if (this.onTurnChange) {
            this.onTurnChange(this.currentTeam);
        }

        // If it's the player's turn, automatically select the player unit
        if (this.currentTeam === "player") {
            const player = this.getPlayer();
            if (player) {
                // Apply adrenaline rush on first turn
                if (this.isFirstTurn) {
                    const progress = GameProgress.getInstance();
                    const appliedBonuses = progress.getAppliedBonuses();

                    if (appliedBonuses.includes("adrenaline_rush")) {
                        player.addActionPoints(2);
                        console.log(
                            "[GameManager] Adrenaline Rush: +2 AP on first turn!"
                        );

                        if (this.uiManager) {
                            this.uiManager.addCombatLogMessage(
                                "Adrenaline Rush: +2 AP!"
                            );
                            this.uiManager.updatePointsDisplay(player);
                        }
                    }

                    this.isFirstTurn = false;
                }

                this.selectUnit(player);
            }
        }
        // Simple AI for enemy turn
        else if (this.currentTeam === "enemy") {
            this.scene.time.delayedCall(500, () => this.playEnemyTurn());
        }
    }

    private playEnemyTurn(): void {
        console.log("[GameManager] Starting enemy turn");

        try {
            const enemyUnits = this.units.filter(
                (unit) => unit.team === "enemy" && !unit.hasActed
            );
            const playerUnits = this.units.filter(
                (unit) => unit.team === "player"
            );

            console.log(
                `[GameManager] Enemy units: ${enemyUnits.length}, Player units: ${playerUnits.length}`
            );

            if (enemyUnits.length === 0 || playerUnits.length === 0) {
                this.endTurn();
                return;
            }

            let actionIndex = 0;
            const maxActions = enemyUnits.length;

            const performNextAction = () => {
                try {
                    // Safety check to prevent infinite loops
                    if (actionIndex > maxActions + 5) {
                        console.error(
                            "[GameManager] Too many actions - forcing end turn"
                        );
                        this.scene.time.delayedCall(500, () => this.endTurn());
                        return;
                    }

                    if (actionIndex >= enemyUnits.length) {
                        console.log(
                            "[GameManager] All enemies acted - ending turn"
                        );
                        this.scene.time.delayedCall(500, () => this.endTurn());
                        return;
                    }

                    const enemy = enemyUnits[actionIndex];
                    console.log(
                        `[GameManager] Processing action for enemy ${actionIndex}/${enemyUnits.length}`
                    );

                    const nearestPlayer = this.findNearestUnit(
                        enemy,
                        playerUnits
                    );

                    if (!nearestPlayer) {
                        console.log("[GameManager] No nearest player found");
                        actionIndex++;
                        performNextAction();
                        return;
                    }

                    const distance = this.grid.getDistance(
                        enemy.gridX,
                        enemy.gridY,
                        nearestPlayer.gridX,
                        nearestPlayer.gridY
                    );

                    // Try to attack (with line of sight check)
                    if (
                        distance <= enemy.attackRange &&
                        this.hasLineOfSightWithUnits(
                            enemy.gridX,
                            enemy.gridY,
                            nearestPlayer.gridX,
                            nearestPlayer.gridY,
                            enemy
                        )
                    ) {
                        const damage =
                            enemy instanceof Enemy
                                ? enemy.getAttackDamage()
                                : 1;

                        console.log(
                            `[DEBUG] Enemy ${
                                enemy instanceof Enemy
                                    ? enemy.enemyType
                                    : "unit"
                            } attacking player for ${damage} damage`
                        );

                        // Add attack animation for enemy
                        this.playAttackAnimation(enemy, nearestPlayer, () => {
                            console.log(
                                `[DEBUG] Enemy attack animation completed, applying damage`
                            );

                            if (this.uiManager && enemy instanceof Enemy) {
                                let attackType =
                                    enemy.attackRange > 1 ? "ranged" : "melee";
                                let damageType: "physical" | "magic" =
                                    "physical";
                                let stat = 0; // Initialize stat
                                let statName = "";

                                if (enemy instanceof Magician) {
                                    stat = enemy.intelligence; // Use getter
                                    statName = "INT";
                                    attackType = "magic";
                                    damageType = "magic";
                                } else if (enemy instanceof Necromancer) {
                                    stat = enemy.intelligence; // Use getter
                                    statName = "INT";
                                    attackType = "magic";
                                    damageType = "magic";
                                } else if (attackType === "melee") {
                                    stat = enemy.force;
                                    statName = "FOR";
                                } else {
                                    // Default to dexterity for other ranged enemies
                                    stat = enemy.dexterity;
                                    statName = "DEX";
                                }

                                // We calculate actualDamage here for logging, takeDamage will do its own calculation
                                const resistance =
                                    damageType === "magic"
                                        ? nearestPlayer.magicResistance
                                        : nearestPlayer.armor;
                                const loggedActualDamage = Math.max(
                                    1,
                                    damage - resistance
                                );
                                const resistanceType =
                                    damageType === "magic"
                                        ? "m.resist"
                                        : "armor";
                                this.uiManager.addCombatLogMessage(
                                    `${enemy.enemyType} ${attackType} attack (${stat} ${statName}): ${damage} dmg - ${resistance} ${resistanceType} = ${loggedActualDamage} dmg to Player`
                                );

                                console.log(
                                    `[DEBUG] Player health before damage: ${nearestPlayer.health}`
                                );
                                nearestPlayer.takeDamage(
                                    damage,
                                    damageType,
                                    enemy
                                );
                                console.log(
                                    `[DEBUG] Player health after damage: ${nearestPlayer.health}`
                                );
                            } else {
                                console.log(
                                    `[DEBUG] Player health before damage (no UI): ${nearestPlayer.health}`
                                );
                                nearestPlayer.takeDamage(
                                    damage,
                                    "physical",
                                    enemy
                                );
                                console.log(
                                    `[DEBUG] Player health after damage (no UI): ${nearestPlayer.health}`
                                );
                            }

                            // Emit an event so UIManager can react and update the player's health display
                            if (nearestPlayer instanceof Player) {
                                this.scene.events.emit(
                                    "playerDamaged",
                                    nearestPlayer
                                );
                            }

                            enemy.hasActed = true;

                            this.scene.time.delayedCall(500, () => {
                                if (!nearestPlayer.isAlive()) {
                                    this.removeUnit(nearestPlayer);
                                    this.checkVictory();
                                }
                                actionIndex++;
                                performNextAction();
                            });
                        });
                    }
                    // Move closer
                    else {
                        if (enemy instanceof Enemy) {
                            const moveTarget = this.findBestMovePosition(
                                enemy,
                                nearestPlayer
                            );
                            if (moveTarget) {
                                // Double-check the path is valid before attempting movement
                                console.log(
                                    `[AI] ${enemy.enemyType} attempting to move from (${enemy.gridX}, ${enemy.gridY}) to (${moveTarget.x}, ${moveTarget.y})`
                                );

                                // Get the path for enemy movement
                                const path = this.grid.findPath(
                                    enemy.gridX,
                                    enemy.gridY,
                                    moveTarget.x,
                                    moveTarget.y,
                                    (x, y) => {
                                        const unit = this.getUnitAt(x, y);
                                        return !!unit && unit !== enemy;
                                    }
                                );

                                // Additional validation
                                if (!path) {
                                    console.log(
                                        `[AI] WARNING: findPath returned null for ${enemy.enemyType}`
                                    );
                                    enemy.hasActed = true;
                                    actionIndex++;
                                    performNextAction();
                                    return;
                                }

                                if (path.length === 0) {
                                    console.log(
                                        `[AI] WARNING: Empty path for ${enemy.enemyType} (already at destination?)`
                                    );
                                    enemy.hasActed = true;
                                    actionIndex++;
                                    performNextAction();
                                    return;
                                }

                                // Verify path doesn't go through walls
                                let pathValid = true;
                                for (const step of path) {
                                    if (this.grid.isWall(step.x, step.y)) {
                                        console.log(
                                            `[AI] ERROR: Path goes through wall at (${step.x}, ${step.y})`
                                        );
                                        pathValid = false;
                                        break;
                                    }
                                }

                                if (!pathValid) {
                                    console.log(
                                        `[AI] Invalid path detected for ${enemy.enemyType}, skipping movement`
                                    );
                                    enemy.hasActed = true;
                                    actionIndex++;
                                    performNextAction();
                                    return;
                                }

                                console.log(
                                    `[AI] Path validated: ${path.length} steps for ${enemy.enemyType}`
                                );

                                if (
                                    path &&
                                    path.length > 0 &&
                                    path.length <= enemy.moveRange
                                ) {
                                    enemy.moveAlongPath(path, () => {
                                        console.log(
                                            `[GameManager DEBUG] Enemy move complete for ${
                                                enemy instanceof Enemy
                                                    ? enemy.enemyType
                                                    : "unit"
                                            } at (${enemy.gridX}, ${
                                                enemy.gridY
                                            }). Nearest player: ${
                                                nearestPlayer
                                                    ? nearestPlayer.team
                                                    : "null"
                                            }. Re-evaluating attack.`
                                        );

                                        const newDistance =
                                            this.grid.getDistance(
                                                enemy.gridX,
                                                enemy.gridY,
                                                nearestPlayer.gridX,
                                                nearestPlayer.gridY
                                            );
                                        const canAttackAfterMove =
                                            newDistance <= enemy.attackRange &&
                                            this.hasLineOfSightWithUnits(
                                                enemy.gridX,
                                                enemy.gridY,
                                                nearestPlayer.gridX,
                                                nearestPlayer.gridY,
                                                enemy
                                            );

                                        console.log(
                                            `[GameManager DEBUG] ${
                                                enemy instanceof Enemy
                                                    ? enemy.enemyType
                                                    : "unit"
                                            } at (${enemy.gridX},${
                                                enemy.gridY
                                            }) to player at (${
                                                nearestPlayer.gridX
                                            },${
                                                nearestPlayer.gridY
                                            }). New distance: ${newDistance}, Attack range: ${
                                                enemy.attackRange
                                            }, LOS: ${this.hasLineOfSightWithUnits(
                                                enemy.gridX,
                                                enemy.gridY,
                                                nearestPlayer.gridX,
                                                nearestPlayer.gridY,
                                                enemy
                                            )}. Can attack: ${canAttackAfterMove}`
                                        );

                                        if (canAttackAfterMove) {
                                            console.log(
                                                `[GameManager DEBUG] ${
                                                    enemy instanceof Enemy
                                                        ? enemy.enemyType
                                                        : "unit"
                                                } attempting attack after move.`
                                            );
                                            const damage =
                                                enemy.getAttackDamage();
                                            console.log(
                                                `[GameManager DEBUG] ${
                                                    enemy instanceof Enemy
                                                        ? enemy.enemyType
                                                        : "unit"
                                                } calculated damage: ${damage}`
                                            );

                                            // Add attack animation for enemy after move
                                            this.playAttackAnimation(
                                                enemy,
                                                nearestPlayer,
                                                () => {
                                                    let damageType:
                                                        | "physical"
                                                        | "magic" = "physical";
                                                    if (
                                                        this.uiManager &&
                                                        enemy instanceof Enemy
                                                    ) {
                                                        let attackType =
                                                            enemy.attackRange >
                                                            1
                                                                ? "ranged"
                                                                : "melee";
                                                        let stat = 0;
                                                        let statName = "";

                                                        if (
                                                            enemy instanceof
                                                            Magician
                                                        ) {
                                                            stat =
                                                                enemy.intelligence;
                                                            statName = "INT";
                                                            attackType =
                                                                "magic";
                                                            damageType =
                                                                "magic";
                                                        } else if (
                                                            enemy instanceof
                                                            Necromancer
                                                        ) {
                                                            stat =
                                                                enemy.intelligence;
                                                            statName = "INT";
                                                            attackType =
                                                                "magic";
                                                            damageType =
                                                                "magic";
                                                        } else if (
                                                            attackType ===
                                                            "melee"
                                                        ) {
                                                            stat = enemy.force;
                                                            statName = "FOR";
                                                        } else {
                                                            stat =
                                                                enemy.dexterity;
                                                            statName = "DEX";
                                                        }
                                                        const resistance =
                                                            damageType ===
                                                            "magic"
                                                                ? nearestPlayer.magicResistance
                                                                : nearestPlayer.armor;
                                                        const loggedActualDamage =
                                                            Math.max(
                                                                1,
                                                                damage -
                                                                    resistance
                                                            );
                                                        const resistanceType =
                                                            damageType ===
                                                            "magic"
                                                                ? "m.resist"
                                                                : "armor";
                                                        console.log(
                                                            `[GameManager DEBUG] Logging attack for ${
                                                                enemy instanceof
                                                                Enemy
                                                                    ? enemy.enemyType
                                                                    : "unit"
                                                            }: ${
                                                                enemy instanceof
                                                                Enemy
                                                                    ? enemy.enemyType
                                                                    : "unit"
                                                            } ${attackType} attack (${stat} ${statName}): ${damage} dmg - ${resistance} ${resistanceType} = ${loggedActualDamage} dmg to Player`
                                                        );
                                                        this.uiManager.addCombatLogMessage(
                                                            `${
                                                                enemy instanceof
                                                                Enemy
                                                                    ? enemy.enemyType
                                                                    : "unit"
                                                            } ${attackType} attack (${stat} ${statName}): ${damage} dmg - ${resistance} ${resistanceType} = ${loggedActualDamage} dmg to Player`
                                                        );
                                                    }

                                                    console.log(
                                                        `[DEBUG] Enemy (after move) attacking player for ${damage} damage`
                                                    );
                                                    console.log(
                                                        `[DEBUG] Player health before damage (after move): ${nearestPlayer.health}`
                                                    );
                                                    nearestPlayer.takeDamage(
                                                        damage,
                                                        damageType,
                                                        enemy
                                                    );
                                                    console.log(
                                                        `[DEBUG] Player health after damage (after move): ${nearestPlayer.health}`
                                                    );

                                                    if (
                                                        nearestPlayer instanceof
                                                        Player
                                                    ) {
                                                        this.scene.events.emit(
                                                            "playerDamaged",
                                                            nearestPlayer
                                                        );
                                                    }

                                                    enemy.hasActed = true;

                                                    console.log(
                                                        `[GameManager DEBUG] ${
                                                            enemy instanceof
                                                            Enemy
                                                                ? enemy.enemyType
                                                                : "unit"
                                                        } marked as acted. Setting delayed call for next action.`
                                                    );

                                                    this.scene.time.delayedCall(
                                                        500,
                                                        () => {
                                                            console.log(
                                                                `[GameManager DEBUG] Delayed call executing for ${
                                                                    enemy instanceof
                                                                    Enemy
                                                                        ? enemy.enemyType
                                                                        : "unit"
                                                                } after attack.`
                                                            );
                                                            if (
                                                                !nearestPlayer.isAlive()
                                                            ) {
                                                                console.log(
                                                                    `[GameManager DEBUG] Player ${nearestPlayer.team} defeated.`
                                                                );
                                                                this.removeUnit(
                                                                    nearestPlayer
                                                                );
                                                                this.checkVictory();
                                                            }
                                                            actionIndex++;
                                                            performNextAction();
                                                        }
                                                    );
                                                }
                                            );
                                        } else {
                                            console.log(
                                                `[GameManager DEBUG] ${
                                                    enemy instanceof Enemy
                                                        ? enemy.enemyType
                                                        : "unit"
                                                } cannot attack after move. Ending action.`
                                            );
                                            enemy.hasActed = true;
                                            actionIndex++;
                                            performNextAction();
                                        }
                                    });
                                } else {
                                    console.log(
                                        `[GameManager DEBUG] ${
                                            enemy instanceof Enemy
                                                ? enemy.enemyType
                                                : "unit"
                                        } cannot move (no path or path too long). Path: ${
                                            path ? path.length : "null"
                                        }, Range: ${enemy.moveRange}`
                                    );
                                    enemy.hasActed = true;
                                    actionIndex++;
                                    performNextAction();
                                }
                            } else {
                                console.log(
                                    `[GameManager DEBUG] ${
                                        enemy instanceof Enemy
                                            ? enemy.enemyType
                                            : "unit"
                                    } cannot move (no valid move position). Ending action.`
                                );
                                enemy.hasActed = true;
                                actionIndex++;
                                performNextAction();
                            }
                        } else {
                            console.log(
                                `[GameManager DEBUG] ${
                                    enemy instanceof Enemy
                                        ? enemy.enemyType
                                        : "unit"
                                } cannot move (no valid move position). Ending action.`
                            );
                            enemy.hasActed = true;
                            actionIndex++;
                            performNextAction();
                        }
                    }
                } catch (error) {
                    console.error(
                        "[GameManager] Error in performNextAction:",
                        error
                    );
                    actionIndex++;
                    performNextAction();
                }
            };

            performNextAction();
        } catch (error) {
            console.error("[GameManager] Error in playEnemyTurn:", error);
            this.endTurn();
        }
    }

    private findNearestUnit(from: Unit, units: Unit[]): Unit | null {
        let nearest: Unit | null = null;
        let minPathDistance = Infinity;
        let minGridDistance = Infinity;

        // First, try to find units that are actually reachable
        const reachableUnits: { unit: Unit; pathLength: number }[] = [];

        for (const unit of units) {
            // Try to find a path to this unit
            const path = this.grid.findPath(
                from.gridX,
                from.gridY,
                unit.gridX,
                unit.gridY,
                (x, y) => {
                    const occupyingUnit = this.getUnitAt(x, y);
                    // Allow path to go to the target unit's position
                    return (
                        !!occupyingUnit &&
                        occupyingUnit !== from &&
                        occupyingUnit !== unit
                    );
                }
            );

            if (path && path.length > 0) {
                reachableUnits.push({ unit, pathLength: path.length });
            }
        }

        // If we have reachable units, prioritize them
        if (reachableUnits.length > 0) {
            // Sort by path length and return the nearest reachable unit
            reachableUnits.sort((a, b) => a.pathLength - b.pathLength);
            nearest = reachableUnits[0].unit;
            console.log(
                `[AI] Found ${reachableUnits.length} reachable targets, nearest at path distance ${reachableUnits[0].pathLength}`
            );
        } else {
            // No reachable units - this enemy is isolated or all targets are blocked
            console.log(
                "[AI] No reachable targets found - unit may be isolated"
            );

            // As a fallback, find the closest unit by grid distance
            // But mark that it's not actually reachable
            for (const unit of units) {
                const gridDistance = this.grid.getDistance(
                    from.gridX,
                    from.gridY,
                    unit.gridX,
                    unit.gridY
                );

                if (gridDistance < minGridDistance) {
                    minGridDistance = gridDistance;
                    nearest = unit;
                }
            }

            if (nearest) {
                console.log(
                    `[AI] Fallback: nearest unreachable target at grid distance ${minGridDistance}`
                );
            }
        }

        return nearest;
    }

    private findBestMovePosition(
        unit: Enemy,
        target: Unit
    ): { x: number; y: number } | null {
        // First check if we can actually reach the target
        const pathToTarget = this.grid.findPath(
            unit.gridX,
            unit.gridY,
            target.gridX,
            target.gridY,
            (x, y) => {
                const occupyingUnit = this.getUnitAt(x, y);
                return (
                    !!occupyingUnit &&
                    occupyingUnit !== unit &&
                    occupyingUnit !== target
                );
            }
        );

        const canReachTarget = pathToTarget !== null && pathToTarget.length > 0;

        if (!canReachTarget) {
            console.log(
                `[AI] ${unit.enemyType} cannot reach target at (${target.gridX}, ${target.gridY}) - no valid path exists`
            );

            // If we can't reach the target, don't move at all
            // This prevents enemies from crowding against walls
            console.log(
                `[AI] ${unit.enemyType} will hold position - target is unreachable`
            );
            return null;
        }

        let bestPos: { x: number; y: number } | null = null;

        // Get all tiles the unit can reach using pathfinding
        const reachableTiles = this.grid.getReachableTiles(
            unit.gridX,
            unit.gridY,
            unit.moveRange,
            (x, y) => {
                const occupyingUnit = this.getUnitAt(x, y);
                return !!occupyingUnit && occupyingUnit !== unit;
            }
        );

        console.log(
            `[AI] ${unit.enemyType} evaluating ${reachableTiles.length} reachable tiles`
        );

        const evaluatedPositions: Array<{
            x: number;
            y: number;
            score: number;
            canAttack: boolean;
            distanceToTarget: number;
            pathLength: number;
            pathToTargetLength: number;
        }> = [];

        // Evaluate each reachable position
        for (const tile of reachableTiles) {
            // Verify there's actually a path to this position
            const pathToPosition = this.grid.findPath(
                unit.gridX,
                unit.gridY,
                tile.x,
                tile.y,
                (x, y) => {
                    const occupyingUnit = this.getUnitAt(x, y);
                    return !!occupyingUnit && occupyingUnit !== unit;
                }
            );

            // Skip if no valid path exists
            if (!pathToPosition || pathToPosition.length === 0) {
                continue;
            }

            const pathLength = pathToPosition.length;

            // Skip if path is too long for movement range
            if (pathLength > unit.moveRange) {
                continue;
            }

            // Check if from this position we could reach the target
            const pathFromTileToTarget = this.grid.findPath(
                tile.x,
                tile.y,
                target.gridX,
                target.gridY,
                (x, y) => {
                    // When checking from the new position, we need to consider that
                    // the unit will be at the new position, not the old one
                    if (x === unit.gridX && y === unit.gridY) {
                        return false; // Current position will be empty
                    }
                    if (x === tile.x && y === tile.y) {
                        return true; // New position will be occupied by us
                    }
                    const occupyingUnit = this.getUnitAt(x, y);
                    return !!occupyingUnit && occupyingUnit !== target;
                }
            );

            // Skip positions that don't have a path to the target
            if (!pathFromTileToTarget || pathFromTileToTarget.length === 0) {
                continue;
            }

            const pathToTargetLength = pathFromTileToTarget.length;

            const distanceToTarget = this.grid.getDistance(
                tile.x,
                tile.y,
                target.gridX,
                target.gridY
            );

            const hasLOS = (() => {
                // Simulate line of sight from the new position
                // We need to check if any units would block the shot
                // First check walls
                if (
                    !this.grid.hasLineOfSight(
                        tile.x,
                        tile.y,
                        target.gridX,
                        target.gridY
                    )
                ) {
                    return false;
                }

                // Then check units using Bresenham's algorithm
                const dx = Math.abs(target.gridX - tile.x);
                const dy = Math.abs(target.gridY - tile.y);
                const sx = tile.x < target.gridX ? 1 : -1;
                const sy = tile.y < target.gridY ? 1 : -1;
                let err = dx - dy;
                let x = tile.x;
                let y = tile.y;
                let prevX = tile.x;
                let prevY = tile.y;

                while (true) {
                    // Check if current position has a unit (but not the start or end position)
                    if (
                        (x !== tile.x || y !== tile.y) &&
                        (x !== target.gridX || y !== target.gridY)
                    ) {
                        // When simulating from the new position:
                        // - The unit's current position will be empty
                        // - The tile position will have the unit
                        let hasUnit = false;

                        if (x === unit.gridX && y === unit.gridY) {
                            // Current position will be empty when unit moves
                            hasUnit = false;
                        } else if (x === tile.x && y === tile.y) {
                            // New position will have the unit
                            hasUnit = true;
                        } else {
                            const unitAtPosition = this.getUnitAt(x, y);
                            hasUnit =
                                unitAtPosition !== null &&
                                unitAtPosition !== target;
                        }

                        if (hasUnit) {
                            return false;
                        }
                    }

                    // Check for diagonal movement through unit corners
                    if (
                        x !== prevX &&
                        y !== prevY &&
                        (x !== tile.x || y !== tile.y)
                    ) {
                        // We moved diagonally - check if we're passing through a corner formed by units
                        let hasUnit1 = false;
                        let hasUnit2 = false;

                        // Check first corner
                        if (prevX === unit.gridX && y === unit.gridY) {
                            hasUnit1 = false; // Current position will be empty
                        } else if (prevX === tile.x && y === tile.y) {
                            hasUnit1 = true; // New position will have the unit
                        } else {
                            const unit1 = this.getUnitAt(prevX, y);
                            hasUnit1 = unit1 !== null && unit1 !== target;
                        }

                        // Check second corner
                        if (x === unit.gridX && prevY === unit.gridY) {
                            hasUnit2 = false; // Current position will be empty
                        } else if (x === tile.x && prevY === tile.y) {
                            hasUnit2 = true; // New position will have the unit
                        } else {
                            const unit2 = this.getUnitAt(x, prevY);
                            hasUnit2 = unit2 !== null && unit2 !== target;
                        }

                        // If both corners have units, can't pass through diagonally
                        if (hasUnit1 && hasUnit2) {
                            return false;
                        }
                    }

                    if (x === target.gridX && y === target.gridY) {
                        break;
                    }

                    prevX = x;
                    prevY = y;

                    const e2 = 2 * err;
                    if (e2 > -dy) {
                        err -= dy;
                        x += sx;
                    }
                    if (e2 < dx) {
                        err += dx;
                        y += sy;
                    }
                }

                return true;
            })();

            const canAttack = distanceToTarget <= unit.attackRange && hasLOS;

            // Calculate position score
            let score = 0;

            if (canAttack) {
                // Heavily favor positions where we can attack
                score += 1000;

                // For ranged units, prefer staying at max range
                if (unit.attackRange > 1) {
                    // Prefer positions that are not adjacent to target
                    if (distanceToTarget > 1) {
                        score += 100;
                    }
                    // Extra points for being at optimal range (not too close, not max range)
                    if (distanceToTarget === unit.attackRange - 1) {
                        score += 50;
                    }
                } else {
                    // Melee units want to be as close as possible
                    score += (10 - distanceToTarget) * 10;
                }
            } else {
                // Can't attack from here, but we can still reach the target
                // Prefer positions that get us closer (by path distance, not grid distance)
                score += 500 - pathToTargetLength * 10;

                // Check if this position would allow attack next turn
                if (pathToTargetLength <= unit.moveRange + unit.attackRange) {
                    score += 100;
                }
            }

            // Penalize longer movement paths slightly (prefer efficient movement)
            score -= pathLength * 2;

            // Add position to evaluated list
            evaluatedPositions.push({
                x: tile.x,
                y: tile.y,
                score,
                canAttack,
                distanceToTarget,
                pathLength,
                pathToTargetLength,
            });
        }

        // Sort positions by score (highest first)
        evaluatedPositions.sort((a, b) => b.score - a.score);

        // Log top positions for debugging
        if (evaluatedPositions.length > 0) {
            console.log(`[AI] Top 3 positions for ${unit.enemyType}:`);
            evaluatedPositions.slice(0, 3).forEach((pos, i) => {
                console.log(
                    `  ${i + 1}. (${pos.x}, ${pos.y}) - Score: ${
                        pos.score
                    }, CanAttack: ${pos.canAttack}, Distance: ${
                        pos.distanceToTarget
                    }, PathLen: ${pos.pathLength}, PathToTarget: ${
                        pos.pathToTargetLength
                    }`
                );
            });
        }

        // Select best position
        if (evaluatedPositions.length > 0) {
            bestPos = {
                x: evaluatedPositions[0].x,
                y: evaluatedPositions[0].y,
            };
            console.log(
                `[AI] Selected position (${bestPos.x}, ${bestPos.y}) for ${unit.enemyType}`
            );
        } else {
            console.log(
                `[AI] No valid positions found for ${unit.enemyType} - will hold position`
            );
        }

        return bestPos;
    }

    public endTurn(): void {
        this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
        this.selectedUnit = null;
        this.clearHighlights();
        this.startTurn();
    }

    public checkVictory(): void {
        // Prevent multiple game over triggers
        if (this.gameOver) {
            return;
        }

        // If there are active damage animations, delay the victory check
        if (this.activeDamageAnimations > 0) {
            console.log(
                `[GameManager] Victory check delayed - ${this.activeDamageAnimations} damage animations still playing`
            );
            this.pendingVictoryCheck = true;
            return;
        }

        const playerUnits = this.units.filter((unit) => unit.team === "player");
        const enemyUnits = this.units.filter((unit) => unit.team === "enemy");

        if (playerUnits.length === 0) {
            // Mark game as over to prevent duplicate calls
            this.gameOver = true;
            console.log("[GameManager] Player defeated - game over triggered");

            // Stop all walking sounds immediately
            this.stopAllWalkingSounds();
            if (this.onGameOver) this.onGameOver(false);
        } else if (enemyUnits.length === 0) {
            // Mark game as over to prevent duplicate calls
            this.gameOver = true;
            console.log(
                "[GameManager] Player victorious - game over triggered"
            );

            // Play victory sound
            this.scene.sound.play("victory", { volume: 0.7 });

            // Stop all walking sounds immediately
            this.stopAllWalkingSounds();
            if (this.onGameOver) this.onGameOver(true);
        }
    }

    public startDamageAnimation(): void {
        this.activeDamageAnimations++;
        console.log(
            `[GameManager] Damage animation started - ${this.activeDamageAnimations} active`
        );
    }

    public endDamageAnimation(): void {
        this.activeDamageAnimations = Math.max(
            0,
            this.activeDamageAnimations - 1
        );
        console.log(
            `[GameManager] Damage animation ended - ${this.activeDamageAnimations} remaining`
        );

        // If there are no more animations and we have a pending victory check, trigger it
        if (this.activeDamageAnimations === 0 && this.pendingVictoryCheck) {
            console.log(
                "[GameManager] All damage animations complete - triggering delayed victory check"
            );
            this.pendingVictoryCheck = false;
            this.checkVictory();
        }
    }

    public onTurnChanged(callback: (team: "player" | "enemy") => void): void {
        this.onTurnChange = callback;
    }

    public onUnitSelectionChanged(callback: (unit: Unit | null) => void): void {
        this.onUnitSelected = callback;
    }

    public onGameOverChanged(callback: (victory: boolean) => void): void {
        this.onGameOver = callback;
    }

    private applyHealingBonuses(
        attacker: Player,
        target: Unit,
        spell: Spell
    ): void {
        const progress = GameProgress.getInstance();
        const appliedBonuses = progress.getAppliedBonuses();

        // Vampiric Strikes: Heal 1 HP on melee hits
        if (
            appliedBonuses.includes("vampiric_strikes") &&
            spell.type === "melee"
        ) {
            const healAmount = 1;
            const oldHealth = attacker.health;
            attacker.heal(healAmount);
            console.log(
                `[GameManager] Vampiric Strikes: Player healed ${healAmount} HP (${oldHealth} -> ${attacker.health})`
            );

            // Update UI
            if (this.uiManager) {
                this.uiManager.addCombatLogMessage(
                    `Vampiric Strikes: Player heals ${healAmount} HP`
                );
                this.scene.events.emit("playerDamaged", attacker); // Refresh UI stats
            }
        }

        // Slash Lifesteal: Heal 1 HP per enemy hit with Slash
        if (
            appliedBonuses.includes("slash_lifesteal") &&
            spell.id === "slash"
        ) {
            const healAmount = 1;
            const oldHealth = attacker.health;
            attacker.heal(healAmount);
            console.log(
                `[GameManager] Slash Lifesteal: Player healed ${healAmount} HP (${oldHealth} -> ${attacker.health})`
            );

            // Update UI
            if (this.uiManager) {
                this.uiManager.addCombatLogMessage(
                    `Bloodthirsty Blade: Player heals ${healAmount} HP`
                );
                this.scene.events.emit("playerDamaged", attacker); // Refresh UI stats
            }
        }
    }

    private applyKillBonuses(
        attacker: Player,
        target: Unit,
        spell: Spell
    ): void {
        const progress = GameProgress.getInstance();
        const appliedBonuses = progress.getAppliedBonuses();

        // Momentum: +1 Movement after defeating an enemy
        if (appliedBonuses.includes("momentum")) {
            attacker.addMovementPoints(1);
            console.log("[GameManager] Momentum: +1 movement point for kill");

            if (this.uiManager) {
                this.uiManager.addCombatLogMessage(
                    "Momentum: +1 movement point!"
                );
                this.uiManager.updatePointsDisplay(attacker);
            }
        }

        // Spell Thief: Gain 1 AP when killing with magic
        if (appliedBonuses.includes("spell_thief") && spell.type === "magic") {
            attacker.addActionPoints(1);
            console.log("[GameManager] Spell Thief: +1 AP for magic kill");

            if (this.uiManager) {
                this.uiManager.addCombatLogMessage(
                    "Spell Thief: +1 action point!"
                );
                this.uiManager.updatePointsDisplay(attacker);
            }
        }

        // Berserker Rage: +1 Force per enemy defeated (max +5)
        if (appliedBonuses.includes("berserker_rage")) {
            // Track kills in the player's stats (we'll use a custom property)
            if (!(attacker as any).berserkerKills) {
                (attacker as any).berserkerKills = 0;
            }

            if ((attacker as any).berserkerKills < 5) {
                (attacker as any).berserkerKills++;
                attacker.addForce(1);
                console.log(
                    `[GameManager] Berserker Rage: +1 Force (${
                        (attacker as any).berserkerKills
                    } kills)`
                );

                if (this.uiManager) {
                    this.uiManager.addCombatLogMessage(
                        `Berserker Rage: +1 Force! (${
                            (attacker as any).berserkerKills
                        }/5)`
                    );
                    this.scene.events.emit("playerDamaged", attacker); // Refresh UI stats
                }
            }
        }
    }

    public stopAllWalkingSounds(): void {
        this.units.forEach((unit) => unit.stopWalkingSound());
    }

    private hasLineOfSightWithUnits(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        attacker?: Unit
    ): boolean {
        // First check if walls block the sight
        if (!this.grid.hasLineOfSight(x1, y1, x2, y2)) {
            return false;
        }

        // Now check if any units block the path using Bresenham's line algorithm
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        let x = x1;
        let y = y1;
        let prevX = x1;
        let prevY = y1;

        while (true) {
            // Check if current position has a unit (but not the start or end position)
            if ((x !== x1 || y !== y1) && (x !== x2 || y !== y2)) {
                const unitAtPosition = this.getUnitAt(x, y);
                // If there's a unit that's not the attacker, line of sight is blocked
                if (unitAtPosition && unitAtPosition !== attacker) {
                    return false;
                }
            }

            // Check for diagonal movement through unit corners
            if (x !== prevX && y !== prevY && (x !== x1 || y !== y1)) {
                // We moved diagonally - check if we're passing through a corner formed by units
                const unit1 = this.getUnitAt(prevX, y);
                const unit2 = this.getUnitAt(x, prevY);

                // If both corners have units (that aren't the attacker), can't pass through diagonally
                if (
                    unit1 &&
                    unit1 !== attacker &&
                    unit2 &&
                    unit2 !== attacker
                ) {
                    return false;
                }
            }

            if (x === x2 && y === y2) {
                break;
            }

            prevX = x;
            prevY = y;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }

        return true;
    }

    public disableHoverPreview(): void {
        this.hoverPreviewEnabled = false;
        this.scene.input.setDefaultCursor("default");
    }

    public enableHoverPreview(): void {
        this.hoverPreviewEnabled = true;
    }
}

