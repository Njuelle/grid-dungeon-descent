import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Grid } from "../classes/Grid";
import { GameManager } from "../classes/GameManager";
import { UIManager } from "../classes/UIManager";
import { Player } from "../classes/Player";
import {
    Warrior,
    Archer,
    Tank,
    Gobelin,
    Necromancer,
    Ogre,
    Troll,
} from "../classes/enemies";
import { Magician } from "../classes/Magician";
import { DifficultyScaling } from "../classes/DifficultyScaling";
import { GameProgress } from "../classes/GameProgress";

export class TacticalBattle extends Scene {
    private grid: Grid;
    public gameManager: GameManager;
    private uiManager: UIManager;
    private backgroundMusic?: Phaser.Sound.BaseSound;

    constructor() {
        super("TacticalBattle");
    }

    create() {
        // Create grid (this will generate random walls)
        this.grid = new Grid(this);

        // Create game manager
        this.gameManager = new GameManager(this, this.grid);

        // Create UI manager
        this.uiManager = new UIManager(this);

        // Connect UI manager to game manager
        this.gameManager.setUIManager(this.uiManager);

        // Set up scene event listeners for cleanup
        this.events.on("shutdown", () => {
            // Stop all sounds when scene is shutting down
            this.gameManager.stopAllWalkingSounds();
        });

        this.events.on("destroy", () => {
            // Stop all sounds when scene is destroyed
            this.gameManager.stopAllWalkingSounds();
        });

        // Start background music (only if not already playing)
        const existingMusic = this.sound.get("battle_music");
        if (existingMusic && existingMusic.isPlaying) {
            // Music is already playing, just keep reference
            this.backgroundMusic = existingMusic;
        } else {
            // Create and play new music
            this.backgroundMusic = this.sound.add("battle_music", {
                loop: true,
                volume: 0.2, // Low volume (20%)
            });
            this.backgroundMusic.play();
        }

        // Set up event handlers
        this.setupEventHandlers();

        // Create units (after grid so we can check for walls)
        this.createUnits();

        // Set up input
        this.setupInput();

        // Start game
        this.gameManager.startTurn();

        EventBus.emit("current-scene-ready", this);
    }

    private createUnits() {
        // Find valid spawn positions for player
        const playerSpawnPositions = [
            { x: 1, y: 4 },
            { x: 1, y: 5 },
            { x: 1, y: 3 },
            { x: 0, y: 4 },
            { x: 2, y: 4 },
        ];

        let playerPlaced = false;
        for (const pos of playerSpawnPositions) {
            if (!this.grid.isWall(pos.x, pos.y)) {
                const player = new Player(this, pos.x, pos.y);
                this.gameManager.addUnit(player);
                playerPlaced = true;
                break;
            }
        }

        if (!playerPlaced) {
            // Fallback - place at 0,0 if no valid position found
            const player = new Player(this, 0, 0);
            this.gameManager.addUnit(player);
        }

        // Get difficulty-based enemy configuration
        const modifiers = DifficultyScaling.getDifficultyModifiers();
        const wins = GameProgress.getInstance().getWins();
        const enemyDistribution =
            DifficultyScaling.getEnemyTypeDistribution(wins);

        // Create enemy spawn positions based on difficulty
        const enemySpawnPositions = this.generateEnemySpawnPositions(
            modifiers.enemyCount
        );

        // Create enemies based on distribution
        let enemiesPlaced = 0;
        const enemyTypes: (
            | "warrior"
            | "archer"
            | "tank"
            | "magician"
            | "gobelin"
            | "necromancer"
            | "ogre"
            | "troll"
        )[] = [];

        // Build enemy type array based on distribution
        for (let i = 0; i < enemyDistribution.warrior; i++)
            enemyTypes.push("warrior");
        for (let i = 0; i < enemyDistribution.archer; i++)
            enemyTypes.push("archer");
        for (let i = 0; i < enemyDistribution.tank; i++)
            enemyTypes.push("tank");
        for (let i = 0; i < enemyDistribution.gobelin; i++)
            enemyTypes.push("gobelin");
        for (let i = 0; i < enemyDistribution.necromancer; i++)
            enemyTypes.push("necromancer");
        for (let i = 0; i < enemyDistribution.ogre; i++)
            enemyTypes.push("ogre");
        for (let i = 0; i < enemyDistribution.troll; i++)
            enemyTypes.push("troll");
        if (enemyDistribution.magician) {
            for (let i = 0; i < enemyDistribution.magician; i++)
                enemyTypes.push("magician");
        } else {
            if (modifiers.enemyCount > 2 && Math.random() < 0.3) {
                enemyTypes.push("magician");
            }
        }

        // Shuffle enemy types
        enemyTypes.sort(() => Math.random() - 0.5);

        // Place enemies
        for (
            let i = 0;
            i <
            Math.min(
                modifiers.enemyCount,
                enemyTypes.length,
                enemySpawnPositions.length
            );
            i++
        ) {
            const pos = enemySpawnPositions[i];
            const type = enemyTypes[i];

            // Skip if position is a wall or occupied
            if (
                this.grid.isWall(pos.x, pos.y) ||
                this.isPositionOccupied(pos.x, pos.y)
            ) {
                continue;
            }

            let enemy;
            switch (type) {
                case "warrior":
                    enemy = new Warrior(this, pos.x, pos.y);
                    break;
                case "archer":
                    enemy = new Archer(this, pos.x, pos.y);
                    break;
                case "tank":
                    enemy = new Tank(this, pos.x, pos.y);
                    break;
                case "magician":
                    enemy = new Magician(this, pos.x, pos.y);
                    break;
                case "gobelin":
                    enemy = new Gobelin(this, pos.x, pos.y);
                    break;
                case "necromancer":
                    enemy = new Necromancer(this, pos.x, pos.y);
                    break;
                case "ogre":
                    enemy = new Ogre(this, pos.x, pos.y);
                    break;
                case "troll":
                    enemy = new Troll(this, pos.x, pos.y);
                    break;
            }
            this.gameManager.addUnit(enemy);
            enemiesPlaced++;
        }

        // If we couldn't place enough enemies, try random positions
        let attempts = 0;
        const maxAttempts = 100;

        while (
            enemiesPlaced < modifiers.enemyCount &&
            enemiesPlaced < enemyTypes.length &&
            attempts < maxAttempts
        ) {
            attempts++;
            const x = 5 + Math.floor(Math.random() * 5); // Right half of 10x10 grid
            const y = Math.floor(Math.random() * this.grid.size);

            if (!this.grid.isWall(x, y) && !this.isPositionOccupied(x, y)) {
                const type = enemyTypes[enemiesPlaced] || "warrior";

                let enemy;
                switch (type) {
                    case "warrior":
                        enemy = new Warrior(this, x, y);
                        break;
                    case "archer":
                        enemy = new Archer(this, x, y);
                        break;
                    case "tank":
                        enemy = new Tank(this, x, y);
                        break;
                    case "magician":
                        enemy = new Magician(this, x, y);
                        break;
                    case "gobelin":
                        enemy = new Gobelin(this, x, y);
                        break;
                    case "necromancer":
                        enemy = new Necromancer(this, x, y);
                        break;
                    case "ogre":
                        enemy = new Ogre(this, x, y);
                        break;
                    case "troll":
                        enemy = new Troll(this, x, y);
                        break;
                }
                this.gameManager.addUnit(enemy);
                enemiesPlaced++;
            }
        }

        console.log(
            `Placed ${enemiesPlaced} enemies out of ${modifiers.enemyCount} requested`
        );
    }

    private generateEnemySpawnPositions(
        count: number
    ): { x: number; y: number }[] {
        const positions: { x: number; y: number }[] = [];

        // Primary spawn positions (right side) - adjusted for 10x10 grid
        const primaryPositions = [
            { x: 8, y: 2 },
            { x: 8, y: 4 },
            { x: 8, y: 6 },
            { x: 8, y: 7 },
            { x: 7, y: 3 },
            { x: 7, y: 5 },
            { x: 7, y: 7 },
            { x: 9, y: 3 },
            { x: 9, y: 5 },
            { x: 9, y: 7 },
            { x: 6, y: 4 },
            { x: 6, y: 6 },
        ];

        // Filter out positions that are walls
        const validPrimaryPositions = primaryPositions.filter(
            (pos) => !this.grid.isWall(pos.x, pos.y)
        );

        // Add valid primary positions
        positions.push(...validPrimaryPositions.slice(0, count));

        // If we need more positions, generate random ones
        if (positions.length < count) {
            let attempts = 0;
            const maxAttempts = 50;

            while (positions.length < count && attempts < maxAttempts) {
                attempts++;
                const x = 5 + Math.floor(Math.random() * 5); // Right half of 10x10 grid
                const y = Math.floor(Math.random() * this.grid.size);

                // Check if position is valid and not already in list
                if (
                    !this.grid.isWall(x, y) &&
                    !positions.some((p) => p.x === x && p.y === y)
                ) {
                    positions.push({ x, y });
                }
            }
        }

        return positions;
    }

    private isPositionOccupied(x: number, y: number): boolean {
        const units = this.gameManager.getUnits();
        return units.some((unit) => unit.gridX === x && unit.gridY === y);
    }

    private setupEventHandlers() {
        // Handle turn changes
        this.gameManager.onTurnChanged((team) => {
            this.uiManager.setTurnText(`${team.toUpperCase()} TURN`);
            this.uiManager.setActionText(
                team === "player"
                    ? "Select your unit to move or attack"
                    : "Enemy turn..."
            );

            // Update points display
            if (team === "player") {
                const player = this.gameManager.getPlayer();
                this.uiManager.updatePointsDisplay(player);
            }
        });

        // Handle unit selection
        this.gameManager.onUnitSelectionChanged((unit) => {
            if (unit) {
                if (unit instanceof Player) {
                    this.uiManager.updatePointsDisplay(unit);
                    this.uiManager.setActionText(
                        "Selected unit - Click to move or attack"
                    );
                }
            } else {
                const player = this.gameManager.getPlayer();
                this.uiManager.updatePointsDisplay(player);
            }
        });

        // Handle spell selection
        this.uiManager.onSpellSelectedChanged((spell) => {
            const player = this.gameManager.getPlayer();
            if (player) {
                player.setCurrentSpell(spell);

                // Re-highlight if player is selected
                const selected = this.gameManager.getSelectedUnit();
                if (selected === player) {
                    this.gameManager.selectUnit(player);
                }
            }
        });

        // Handle end turn button
        this.uiManager.onEndTurnClicked(() => {
            this.gameManager.endTurn();
        });

        // Handle game over
        this.gameManager.onGameOverChanged((victory) => {
            // Stop all unit walking sounds immediately when game ends
            this.gameManager.stopAllWalkingSounds();

            this.uiManager.showGameOver(victory, () => {
                // Stop all sounds again before restarting (extra safety)
                this.gameManager.stopAllWalkingSounds();

                // Stop music before restarting
                if (this.backgroundMusic) {
                    this.backgroundMusic.stop();
                }
                // Update level display before restarting
                this.uiManager.updateLevelDisplay();
                this.scene.restart();
            });
        });
    }

    private setupInput() {
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            console.log(
                "Scene pointerdown event fired at:",
                pointer.x,
                pointer.y
            );

            const gridPos = this.grid.worldToGrid(pointer.x, pointer.y);
            console.log("Grid position:", gridPos);

            if (gridPos) {
                this.gameManager.handleTileClick(gridPos.x, gridPos.y);

                // Update UI based on action results
                const player = this.gameManager.getPlayer();
                if (player) {
                    this.uiManager.updatePointsDisplay(player);

                    // Update action text based on player state
                    if (!player.canAttack() && player.movementPoints === 0) {
                        this.uiManager.setActionText(
                            "No points left! End your turn."
                        );
                    } else if (!player.canAttack()) {
                        this.uiManager.setActionText(
                            "No action points left! You can still move."
                        );
                    } else if (player.movementPoints === 0) {
                        this.uiManager.setActionText(
                            "No movement points left! You can still attack."
                        );
                    } else if (this.gameManager.getSelectedUnit() === player) {
                        // Player is still selected with points remaining
                        this.uiManager.setActionText(
                            `Unit selected - MP: ${player.movementPoints}, AP: ${player.actionPoints}`
                        );
                    }
                }
            }
        });
    }

    shutdown() {
        // Stop all unit walking sounds
        if (this.gameManager) {
            this.gameManager.stopAllWalkingSounds();
        }

        // Stop and clean up background music
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic.destroy();
            this.backgroundMusic = undefined;
        }

        // Clean up other resources
        if (this.uiManager) {
            this.uiManager.destroy();
        }
    }
}

