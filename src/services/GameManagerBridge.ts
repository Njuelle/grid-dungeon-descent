/**
 * GameManagerBridge - Integration bridge for legacy GameManager
 *
 * Provides backward compatibility and smooth migration path for existing
 * GameManager code to work with the new service architecture
 */

import { Scene } from "phaser";
import { sceneService } from "../services";
import { EntityService } from "./EntityService";
import { UIService } from "./UIService";
import { eventBus, GameEvent, stateManager } from "../core";
import { UnitStats } from "../data/types";
import { performanceMonitor } from "../utils/PerformanceMonitor";

export interface LegacyGameState {
    player?: any;
    enemies: any[];
    currentLevel: number;
    gamePhase: "setup" | "playing" | "victory" | "defeat";
    turnCount: number;
}

export class GameManagerBridge {
    private scene?: Scene;
    private entityService = new EntityService();
    private uiService = new UIService();
    private legacyState: LegacyGameState = {
        enemies: [],
        currentLevel: 1,
        gamePhase: "setup",
        turnCount: 0,
    };

    // Entity mapping for backward compatibility
    private entityMapping = new Map<string, any>(); // Entity ID -> Legacy object
    private legacyMapping = new Map<any, string>(); // Legacy object -> Entity ID

    private initialized = false;

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Initialize the bridge with a Phaser scene
     */
    public async initialize(scene: Scene): Promise<void> {
        this.scene = scene;

        // Initialize local services
        await this.entityService.initialize();
        await this.uiService.initialize();

        // Set scenes
        this.entityService.setScene(scene);
        this.uiService.setScene(scene);

        // Setup services with the scene
        await sceneService.setCurrentScene(scene);

        // Enable performance monitoring
        performanceMonitor.enable();

        this.initialized = true;
        console.log(
            "[GameManagerBridge] Initialized with scene:",
            scene.scene.key
        );
    }

    /**
     * Create a player entity with legacy interface
     */
    public createPlayer(
        gridX: number,
        gridY: number,
        playerClass: any,
        stats: UnitStats
    ): any {
        if (!this.initialized) {
            throw new Error("GameManagerBridge not initialized");
        }

        // Create entity using new service
        const playerOptions: any = {
            gridX,
            gridY,
            stats,
            playerClass: {
                id: playerClass.id,
                name: playerClass.name,
                spells: playerClass.spells || [],
                icon: playerClass.icon || "hero_warrior",
            },
            equippedSpells: playerClass.spells || [],
            appliedBonuses: [],
        };

        const result = this.entityService.createPlayer(playerOptions);
        if (result.isFailure()) {
            throw new Error(`Failed to create player: ${result.error}`);
        }

        // Create legacy wrapper object
        const legacyPlayer = this.createLegacyPlayerWrapper(
            result.value,
            stats
        );

        // Store mappings
        this.entityMapping.set(result.value, legacyPlayer);
        this.legacyMapping.set(legacyPlayer, result.value);

        // Update legacy state
        this.legacyState.player = legacyPlayer;

        // Update state manager
        stateManager.setState("player", {
            id: result.value,
            classId: playerClass.id,
            equippedSpells: playerClass.spells?.map((s: any) => s.id) || [],
            acquiredArtifacts: [],
            appliedBonuses: [],
        });

        console.log("[GameManagerBridge] Player created:", result.value);
        return legacyPlayer;
    }

    /**
     * Create an enemy entity with legacy interface
     */
    public createEnemy(
        gridX: number,
        gridY: number,
        enemyType: string,
        stats: UnitStats
    ): any {
        if (!this.initialized) {
            throw new Error("GameManagerBridge not initialized");
        }

        // Create entity using new service
        const enemyOptions: any = {
            gridX,
            gridY,
            stats,
            enemyType,
            behavior: "aggressive",
        };

        const result = this.entityService.createEnemy(enemyOptions);
        if (result.isFailure()) {
            throw new Error(`Failed to create enemy: ${result.error}`);
        }

        // Create legacy wrapper object
        const legacyEnemy = this.createLegacyEnemyWrapper(
            result.value,
            stats,
            enemyType
        );

        // Store mappings
        this.entityMapping.set(result.value, legacyEnemy);
        this.legacyMapping.set(legacyEnemy, result.value);

        // Update legacy state
        this.legacyState.enemies.push(legacyEnemy);

        console.log("[GameManagerBridge] Enemy created:", result.value);
        return legacyEnemy;
    }

    /**
     * Move entity with legacy interface
     */
    public moveUnit(
        legacyUnit: any,
        targetX: number,
        targetY: number,
        onComplete?: () => void
    ): boolean {
        const entityId = this.legacyMapping.get(legacyUnit);
        if (!entityId) {
            console.warn("[GameManagerBridge] Unit not found in mapping");
            return false;
        }

        const result = this.entityService.moveEntity(
            entityId,
            targetX,
            targetY,
            undefined,
            onComplete
        );
        if (result.isSuccess()) {
            // Update legacy object position
            legacyUnit.gridX = targetX;
            legacyUnit.gridY = targetY;
            return result.value;
        }

        return false;
    }

    /**
     * Attack with legacy interface
     */
    public attackUnit(attacker: any, target: any, spell?: any): boolean {
        const attackerId = this.legacyMapping.get(attacker);
        const targetId = this.legacyMapping.get(target);

        if (!attackerId || !targetId) {
            console.warn("[GameManagerBridge] Units not found in mapping");
            return false;
        }

        const result = this.entityService.attackEntity(
            attackerId,
            targetId,
            spell
        );
        if (result.isSuccess()) {
            const attackResult = result.value;

            // Update legacy objects
            if (attackResult.damage > 0) {
                target.health = Math.max(
                    0,
                    target.health - attackResult.damage
                );

                // Remove dead enemies from legacy state
                if (target.health <= 0 && target.team === "enemy") {
                    const index = this.legacyState.enemies.indexOf(target);
                    if (index !== -1) {
                        this.legacyState.enemies.splice(index, 1);
                    }
                }
            }

            return true;
        }

        return false;
    }

    /**
     * Get entities in range with legacy interface
     */
    public getUnitsInRange(attacker: any, spell?: any): any[] {
        const attackerId = this.legacyMapping.get(attacker);
        if (!attackerId) return [];

        const entityIds = this.entityService.getEntitiesInRange(
            attackerId,
            spell
        );
        return entityIds
            .map((id) => this.entityMapping.get(id))
            .filter((unit) => unit !== undefined);
    }

    /**
     * Update game loop integration
     */
    public update(deltaTime: number): void {
        if (!this.initialized) return;

        // Update performance monitoring
        performanceMonitor.markUpdateStart();
        performanceMonitor.setEntityCount(
            this.legacyState.enemies.length + (this.legacyState.player ? 1 : 0)
        );

        // Update services through SceneService
        sceneService.updateServices(deltaTime);

        // Update local services too
        this.entityService.update(deltaTime);

        // Update performance monitoring
        performanceMonitor.update();
        performanceMonitor.markUpdateEnd();
    }

    /**
     * Get player with legacy interface
     */
    public getPlayer(): any {
        return this.legacyState.player;
    }

    /**
     * Get enemies with legacy interface
     */
    public getEnemies(): any[] {
        return [...this.legacyState.enemies];
    }

    /**
     * Check victory condition
     */
    public checkVictory(): boolean {
        const victory = this.legacyState.enemies.length === 0;
        if (victory && this.legacyState.gamePhase === "playing") {
            this.legacyState.gamePhase = "victory";
            eventBus.emit(GameEvent.VICTORY, {
                totalLevels: this.legacyState.currentLevel,
                totalTime: 0, // Would need to track this
                finalStats: this.legacyState.player?.stats || {},
            });
        }
        return victory;
    }

    /**
     * Check defeat condition
     */
    public checkDefeat(): boolean {
        const defeat =
            this.legacyState.player && this.legacyState.player.health <= 0;
        if (defeat && this.legacyState.gamePhase === "playing") {
            this.legacyState.gamePhase = "defeat";
            eventBus.emit(GameEvent.DEFEAT, {
                levelReached: this.legacyState.currentLevel,
                cause: "Player defeated",
                finalStats: this.legacyState.player?.stats || {},
            });
        }
        return defeat;
    }

    /**
     * Start game phase
     */
    public startGame(): void {
        this.legacyState.gamePhase = "playing";
        this.legacyState.turnCount = 1;

        // Reset entities for new turn
        this.entityService.resetAllEntitiesForTurn();

        console.log("[GameManagerBridge] Game started");
    }

    /**
     * End turn
     */
    public endTurn(): void {
        this.legacyState.turnCount++;

        // Reset entities for new turn
        this.entityService.resetAllEntitiesForTurn();

        console.log(
            "[GameManagerBridge] Turn",
            this.legacyState.turnCount,
            "started"
        );
    }

    /**
     * Clean up resources
     */
    public async destroy(): Promise<void> {
        // Clear mappings
        this.entityMapping.clear();
        this.legacyMapping.clear();

        // Reset state
        this.legacyState = {
            enemies: [],
            currentLevel: 1,
            gamePhase: "setup",
            turnCount: 0,
        };

        // Cleanup local services
        await this.entityService.destroy();
        await this.uiService.destroy();

        // Disable performance monitoring
        performanceMonitor.disable();

        this.initialized = false;
        console.log("[GameManagerBridge] Destroyed");
    }

    /**
     * Get performance summary
     */
    public getPerformanceSummary() {
        return performanceMonitor.getPerformanceSummary();
    }

    private createLegacyPlayerWrapper(entityId: string, stats: UnitStats): any {
        return {
            id: entityId,
            team: "player",
            gridX: this.entityService.getEntityPosition(entityId)?.x || 0,
            gridY: this.entityService.getEntityPosition(entityId)?.y || 0,
            health: stats.health,
            maxHealth: stats.maxHealth,
            stats: stats,

            // Legacy methods that delegate to services
            moveTo: (x: number, y: number, onComplete?: () => void) => {
                return this.moveUnit(this, x, y, onComplete);
            },

            isAlive: () => {
                return this.entityService.isEntityAlive(entityId);
            },

            getStats: () => {
                return this.entityService.getEntityStats(entityId);
            },
        };
    }

    private createLegacyEnemyWrapper(
        entityId: string,
        stats: UnitStats,
        enemyType: string
    ): any {
        return {
            id: entityId,
            team: "enemy",
            enemyType,
            gridX: this.entityService.getEntityPosition(entityId)?.x || 0,
            gridY: this.entityService.getEntityPosition(entityId)?.y || 0,
            health: stats.health,
            maxHealth: stats.maxHealth,
            stats: stats,

            // Legacy methods that delegate to services
            isAlive: () => {
                return this.entityService.isEntityAlive(entityId);
            },

            getStats: () => {
                return this.entityService.getEntityStats(entityId);
            },
        };
    }

    private setupEventListeners(): void {
        // Listen for entity death to update legacy state
        eventBus.on(GameEvent.COMBAT_ENTITY_KILLED, (data) => {
            const legacyUnit = this.entityMapping.get(data.killedId);
            if (legacyUnit) {
                legacyUnit.health = 0;

                // Remove from legacy arrays
                if (legacyUnit.team === "enemy") {
                    const index = this.legacyState.enemies.indexOf(legacyUnit);
                    if (index !== -1) {
                        this.legacyState.enemies.splice(index, 1);
                    }
                }
            }
        });

        // Listen for damage to update legacy state
        eventBus.on(GameEvent.COMBAT_DAMAGE_TAKEN, (data) => {
            const legacyUnit = this.entityMapping.get(data.targetId);
            if (legacyUnit) {
                const currentStats = this.entityService.getEntityStats(
                    data.targetId
                );
                if (currentStats) {
                    legacyUnit.health = currentStats.health;
                    legacyUnit.stats = currentStats;
                }
            }
        });
    }
}

// Global instance for easy access
export const gameManagerBridge = new GameManagerBridge();

