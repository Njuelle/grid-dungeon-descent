/**
 * EntityService - High-level entity management service
 *
 * Provides a service layer interface for ECS entity operations
 * Integrates with the service architecture from Phase 2
 */

import { Service } from "../data/types";
import { Result } from "../utils/Result";
import { success, failure, eventBus, GameEvent } from "../core";
import {
    World,
    RenderSystem,
    MovementSystem,
    CombatSystem,
    createPlayerEntity,
    createEnemyEntity,
    updatePlayerSpells,
    applyBonusToEntity,
    getEntityStats,
    isEntityAlive,
    PlayerEntityOptions,
    EnemyEntityOptions,
} from "../core/ecs";
import { Scene } from "phaser";
import { UnitStats } from "../data/types";

export interface EntityServiceDependencies {
    // No dependencies for now, but ready for future expansion
}

export class EntityService implements Service {
    public readonly name = "EntityService";
    private world: World;
    private renderSystem: RenderSystem;
    private movementSystem: MovementSystem;
    private combatSystem: CombatSystem;
    private scene?: Scene;
    private initialized = false;

    constructor() {
        this.world = new World();
        this.renderSystem = new RenderSystem(null as any); // Will be set during initialization
        this.movementSystem = new MovementSystem();
        this.combatSystem = new CombatSystem();
    }

    async initialize(): Promise<void> {
        try {
            // Set up system dependencies
            this.movementSystem.setRenderSystem(this.renderSystem);
            this.combatSystem.setRenderSystem(this.renderSystem);

            // Add systems to world
            this.world.addSystem(this.renderSystem);
            this.world.addSystem(this.movementSystem);
            this.world.addSystem(this.combatSystem);

            this.initialized = true;
        } catch (error) {
            throw new Error(`Failed to initialize EntityService: ${error}`);
        }
    }

    async destroy(): Promise<void> {
        await this.cleanup();
    }

    async cleanup(): Promise<void> {
        this.world.clear();
        this.initialized = false;
    }

    /**
     * Set the Phaser scene for rendering
     */
    public setScene(scene: Scene): void {
        this.scene = scene;
        this.renderSystem = new RenderSystem(scene);

        if (this.initialized) {
            // Re-add systems with new render system
            this.world.addSystem(this.renderSystem);
            this.movementSystem.setRenderSystem(this.renderSystem);
            this.combatSystem.setRenderSystem(this.renderSystem);
        }
    }

    /**
     * Update all systems
     */
    public update(deltaTime: number): void {
        if (this.initialized) {
            this.world.updateSystems(deltaTime);
        }
    }

    /**
     * Create a player entity
     */
    public createPlayer(options: PlayerEntityOptions): Result<string, string> {
        try {
            const entityId = createPlayerEntity(this.world, options);

            // Create sprite
            this.renderSystem.createSprite(entityId);

            // Emit creation event
            eventBus.emit(GameEvent.PLAYER_CREATED, {
                entityId,
                position: { x: options.gridX, y: options.gridY },
            });

            return success(entityId);
        } catch (error) {
            return failure(`Failed to create player: ${error}`);
        }
    }

    /**
     * Create an enemy entity
     */
    public createEnemy(options: EnemyEntityOptions): Result<string, string> {
        try {
            const entityId = createEnemyEntity(this.world, options);

            // Create sprite
            this.renderSystem.createSprite(entityId);

            // Emit creation event
            eventBus.emit(GameEvent.COMBAT_ENTITY_CREATED, {
                entityId,
                entityType: "enemy",
                position: { x: options.gridX, y: options.gridY },
            });

            return success(entityId);
        } catch (error) {
            return failure(`Failed to create enemy: ${error}`);
        }
    }

    /**
     * Remove an entity
     */
    public removeEntity(entityId: string): Result<void, string> {
        try {
            // Destroy sprite first
            this.renderSystem.destroySprite(entityId);

            // Remove from world
            this.world.removeEntity(entityId);

            // Emit removal event
            eventBus.emit(GameEvent.COMBAT_ENTITY_KILLED, {
                killedId: entityId,
                killerId: undefined,
            });

            return success(undefined);
        } catch (error) {
            return failure(`Failed to remove entity: ${error}`);
        }
    }

    /**
     * Move entity to position
     */
    public moveEntity(
        entityId: string,
        targetX: number,
        targetY: number,
        gridState?: boolean[][],
        onComplete?: () => void
    ): Result<boolean, string> {
        try {
            const moved = this.movementSystem.moveToPosition(
                entityId,
                targetX,
                targetY,
                gridState,
                onComplete
            );

            return success(moved);
        } catch (error) {
            return failure(`Failed to move entity: ${error}`);
        }
    }

    /**
     * Attack target with entity
     */
    public attackEntity(
        attackerId: string,
        targetId: string,
        spell?: any
    ): Result<any, string> {
        try {
            const result = this.combatSystem.executeAttack(
                attackerId,
                targetId,
                spell
            );
            return success(result);
        } catch (error) {
            return failure(`Failed to execute attack: ${error}`);
        }
    }

    /**
     * Check if entity can attack target
     */
    public canAttack(
        attackerId: string,
        targetId: string,
        spell?: any
    ): boolean {
        return this.combatSystem.canAttack(attackerId, targetId, spell);
    }

    /**
     * Get entities in attack range
     */
    public getEntitiesInRange(attackerId: string, spell?: any): string[] {
        return this.combatSystem.getEntitiesInRange(attackerId, spell);
    }

    /**
     * Get valid movement positions for entity
     */
    public getValidMovePositions(
        entityId: string,
        gridState?: boolean[][]
    ): { x: number; y: number }[] {
        return this.movementSystem.getValidMovePositions(entityId, gridState);
    }

    /**
     * Update player spells
     */
    public updatePlayerSpells(
        entityId: string,
        equippedSpells: any[],
        currentSpellIndex?: number
    ): Result<void, string> {
        try {
            const success = updatePlayerSpells(
                this.world,
                entityId,
                equippedSpells,
                currentSpellIndex
            );
            if (!success) {
                return failure("Failed to update player spells");
            }

            eventBus.emit(GameEvent.PLAYER_SPELL_CHANGED, {
                entityId,
                spells: equippedSpells,
            });

            return success(undefined);
        } catch (error) {
            return failure(`Failed to update spells: ${error}`);
        }
    }

    /**
     * Apply bonus to entity
     */
    public applyBonus(
        entityId: string,
        bonusId: string,
        bonusEffects: any[]
    ): Result<void, string> {
        try {
            const applied = applyBonusToEntity(
                this.world,
                entityId,
                bonusId,
                bonusEffects
            );
            if (!applied) {
                return failure("Failed to apply bonus to entity");
            }
            return success(undefined);
        } catch (error) {
            return failure(`Failed to apply bonus: ${error}`);
        }
    }

    /**
     * Get entity stats
     */
    public getEntityStats(entityId: string): UnitStats | null {
        return getEntityStats(this.world, entityId);
    }

    /**
     * Check if entity is alive
     */
    public isEntityAlive(entityId: string): boolean {
        return isEntityAlive(this.world, entityId);
    }

    /**
     * Get entity position
     */
    public getEntityPosition(
        entityId: string
    ): { x: number; y: number } | null {
        const entity = this.world.getEntity(entityId);
        if (!entity) return null;

        const position = entity.getComponent("position");
        if (!position) return null;

        return {
            x: (position as any).gridX,
            y: (position as any).gridY,
        };
    }

    /**
     * Get all entities by team
     */
    public getEntitiesByTeam(team: "player" | "enemy"): string[] {
        const entities = this.world.getEntitiesWithComponents("team");
        return entities
            .filter((entity) => {
                const teamComponent = entity.getComponent("team");
                return teamComponent && (teamComponent as any).team === team;
            })
            .map((entity) => entity.id);
    }

    /**
     * Reset entity for new turn
     */
    public resetEntityForTurn(entityId: string): Result<void, string> {
        try {
            this.movementSystem.resetMovementForTurn(entityId);
            this.combatSystem.resetCombatForTurn(entityId);
            return success(undefined);
        } catch (error) {
            return failure(`Failed to reset entity for turn: ${error}`);
        }
    }

    /**
     * Reset all entities for new turn
     */
    public resetAllEntitiesForTurn(): Result<void, string> {
        try {
            const allEntities = this.world.getAllEntities();
            for (const entity of allEntities) {
                this.resetEntityForTurn(entity.id);
            }
            return success(undefined);
        } catch (error) {
            return failure(`Failed to reset all entities for turn: ${error}`);
        }
    }

    /**
     * Get the ECS world (for advanced usage)
     */
    public getWorld(): World {
        return this.world;
    }

    /**
     * Get individual systems (for advanced usage)
     */
    public getSystems() {
        return {
            render: this.renderSystem,
            movement: this.movementSystem,
            combat: this.combatSystem,
        };
    }
}

