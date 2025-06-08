/**
 * ECS Entity System
 *
 * Entities are unique identifiers that have components attached.
 * The World manages all entities and their components.
 */

import { GameComponent, Component, EntityId } from "./Component";
import { IdGenerator } from "../../utils/IdGenerator";

export class Entity {
    public readonly id: EntityId;
    private components = new Map<string, Component>();

    constructor(id?: EntityId) {
        this.id = id || IdGenerator.generateId("entity");
    }

    public addComponent<T extends Component>(component: T): this {
        this.components.set(component.type, component);
        return this;
    }

    public removeComponent(componentType: string): this {
        this.components.delete(componentType);
        return this;
    }

    public getComponent<T extends Component>(
        componentType: string
    ): T | undefined {
        return this.components.get(componentType) as T | undefined;
    }

    public hasComponent(componentType: string): boolean {
        return this.components.has(componentType);
    }

    public hasComponents(...componentTypes: string[]): boolean {
        return componentTypes.every((type) => this.hasComponent(type));
    }

    public getAllComponents(): Component[] {
        return Array.from(this.components.values());
    }

    public getComponentTypes(): string[] {
        return Array.from(this.components.keys());
    }

    public destroy(): void {
        this.components.clear();
    }
}

/**
 * ECS World - Central manager for all entities and components
 */
export class World {
    private entities = new Map<EntityId, Entity>();
    private componentQueries = new Map<string, Set<EntityId>>();
    private systems: System[] = [];

    public createEntity(): Entity {
        const entity = new Entity();
        this.entities.set(entity.id, entity);
        return entity;
    }

    public addEntity(entity: Entity): void {
        this.entities.set(entity.id, entity);
        this.updateComponentQueries(entity);
    }

    public removeEntity(entityId: EntityId): void {
        const entity = this.entities.get(entityId);
        if (entity) {
            // Remove from component queries
            for (const querySet of this.componentQueries.values()) {
                querySet.delete(entityId);
            }

            entity.destroy();
            this.entities.delete(entityId);
        }
    }

    public getEntity(entityId: EntityId): Entity | undefined {
        return this.entities.get(entityId);
    }

    public getAllEntities(): Entity[] {
        return Array.from(this.entities.values());
    }

    public getEntitiesWithComponent(componentType: string): Entity[] {
        const entityIds = this.componentQueries.get(componentType) || new Set();
        return Array.from(entityIds)
            .map((id) => this.entities.get(id))
            .filter((entity) => entity !== undefined) as Entity[];
    }

    public getEntitiesWithComponents(...componentTypes: string[]): Entity[] {
        if (componentTypes.length === 0) return [];

        // Start with entities that have the first component type
        let result = this.getEntitiesWithComponent(componentTypes[0]);

        // Filter to only entities that have ALL required components
        for (let i = 1; i < componentTypes.length; i++) {
            result = result.filter((entity) =>
                entity.hasComponent(componentTypes[i])
            );
        }

        return result;
    }

    public addComponent<T extends Component>(
        entityId: EntityId,
        component: T
    ): void {
        const entity = this.entities.get(entityId);
        if (entity) {
            entity.addComponent(component);
            this.updateComponentQuery(entityId, component.type);
        }
    }

    public removeComponent(entityId: EntityId, componentType: string): void {
        const entity = this.entities.get(entityId);
        if (entity) {
            entity.removeComponent(componentType);
            const querySet = this.componentQueries.get(componentType);
            if (querySet) {
                querySet.delete(entityId);
            }
        }
    }

    public getComponent<T extends Component>(
        entityId: EntityId,
        componentType: string
    ): T | undefined {
        const entity = this.entities.get(entityId);
        return entity?.getComponent<T>(componentType);
    }

    public addSystem(system: System): void {
        this.systems.push(system);
        system.setWorld(this);
    }

    public removeSystem(system: System): void {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            this.systems.splice(index, 1);
        }
    }

    public updateSystems(deltaTime: number): void {
        for (const system of this.systems) {
            if (system.isActive()) {
                system.update(deltaTime);
            }
        }
    }

    public clear(): void {
        // Destroy all entities
        for (const entity of this.entities.values()) {
            entity.destroy();
        }

        this.entities.clear();
        this.componentQueries.clear();
        this.systems = [];
    }

    private updateComponentQueries(entity: Entity): void {
        for (const componentType of entity.getComponentTypes()) {
            this.updateComponentQuery(entity.id, componentType);
        }
    }

    private updateComponentQuery(
        entityId: EntityId,
        componentType: string
    ): void {
        if (!this.componentQueries.has(componentType)) {
            this.componentQueries.set(componentType, new Set());
        }
        this.componentQueries.get(componentType)!.add(entityId);
    }
}

/**
 * Base System class
 */
export abstract class System {
    protected world!: World;
    protected active: boolean = true;

    public setWorld(world: World): void {
        this.world = world;
    }

    public isActive(): boolean {
        return this.active;
    }

    public setActive(active: boolean): void {
        this.active = active;
    }

    public abstract update(deltaTime: number): void;

    protected getEntitiesWithComponents(...componentTypes: string[]): Entity[] {
        return this.world.getEntitiesWithComponents(...componentTypes);
    }
}

/**
 * Entity Builder - Fluent interface for creating entities
 */
export class EntityBuilder {
    private entity: Entity;
    private world: World;

    constructor(world: World) {
        this.world = world;
        this.entity = new Entity();
    }

    public static create(world: World): EntityBuilder {
        return new EntityBuilder(world);
    }

    public with<T extends Component>(component: T): this {
        this.entity.addComponent(component);
        return this;
    }

    public build(): Entity {
        this.world.addEntity(this.entity);
        return this.entity;
    }
}

// Re-export for convenience
export type { EntityId } from "./Component";
