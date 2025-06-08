/**
 * Spell System - Core spell management with definitions, instances, and modifiers
 * Replaces the old spell system with a more maintainable and extensible architecture
 */

import {
    EntityId,
    SpellStats,
    SpellModifier,
    ValidationResult,
} from "../../data/types";
import { Result } from "../../utils/Result";
import { SpellType } from "../../data/enums";
import { success, failure, IdGenerator } from "../../utils";

// Spell Definition (immutable template)
export interface SpellDefinition {
    readonly id: EntityId;
    readonly name: string;
    readonly description: string;
    readonly icon: string;
    readonly type: SpellType;
    readonly baseStats: SpellStats;
    readonly requirements?: SpellRequirement[];
    readonly tags?: string[];
}

export interface SpellRequirement {
    readonly type: "stat" | "level" | "artifact" | "class";
    readonly property: string;
    readonly value: number | string;
    readonly operator: "gte" | "lte" | "eq" | "has";
}

// Spell Instance (mutable, with modifiers applied)
export class SpellInstance {
    public readonly id: EntityId;
    public readonly definitionId: EntityId;
    private modifiers: SpellModifier[] = [];
    private cachedStats?: SpellStats;

    constructor(
        public readonly definition: SpellDefinition,
        modifiers: SpellModifier[] = []
    ) {
        this.id = IdGenerator.generateTypedId("spell_instance");
        this.definitionId = definition.id;
        this.modifiers = [...modifiers];
    }

    // Computed properties with modifiers applied
    public get name(): string {
        return this.definition.name;
    }

    public get description(): string {
        return this.definition.description;
    }

    public get icon(): string {
        return this.definition.icon;
    }

    public get type(): SpellType {
        return this.definition.type;
    }

    public get stats(): SpellStats {
        if (!this.cachedStats) {
            this.cachedStats = this.calculateStats();
        }
        return this.cachedStats;
    }

    // Individual stat getters for convenience
    public get damage(): number {
        return this.stats.damage;
    }

    public get apCost(): number {
        return this.stats.apCost;
    }

    public get range(): number {
        return this.stats.range;
    }

    public get minRange(): number | undefined {
        return this.stats.minRange;
    }

    public get aoeShape(): string | undefined {
        return this.stats.aoeShape;
    }

    public get aoeRadius(): number | undefined {
        return this.stats.aoeRadius;
    }

    public get modifierCount(): number {
        return this.modifiers.length;
    }

    public getModifiers(): SpellModifier[] {
        return [...this.modifiers];
    }

    public addModifier(modifier: SpellModifier): void {
        this.modifiers.push(modifier);
        this.invalidateCache();
    }

    public removeModifier(modifierId: string): boolean {
        const initialLength = this.modifiers.length;
        this.modifiers = this.modifiers.filter((m) => m.id !== modifierId);
        if (this.modifiers.length !== initialLength) {
            this.invalidateCache();
            return true;
        }
        return false;
    }

    public hasModifier(modifierId: string): boolean {
        return this.modifiers.some((m) => m.id === modifierId);
    }

    public clearModifiers(): void {
        this.modifiers = [];
        this.invalidateCache();
    }

    private calculateStats(): SpellStats {
        let stats = { ...this.definition.baseStats };

        // Apply modifiers in order
        for (const modifier of this.modifiers) {
            stats = this.applyModifier(stats, modifier);
        }

        // Ensure minimums
        stats.damage = Math.max(0, stats.damage);
        stats.apCost = Math.max(0, stats.apCost);
        stats.range = Math.max(1, stats.range);
        if (stats.minRange !== undefined) {
            stats.minRange = Math.max(0, Math.min(stats.minRange, stats.range));
        }
        if (stats.aoeRadius !== undefined) {
            stats.aoeRadius = Math.max(1, stats.aoeRadius);
        }

        return stats;
    }

    private applyModifier(
        stats: SpellStats,
        modifier: SpellModifier
    ): SpellStats {
        const result = { ...stats };
        const property = modifier.property as keyof SpellStats;
        const currentValue = result[property] as number;

        if (typeof currentValue !== "number") {
            return result;
        }

        switch (modifier.type) {
            case "add":
                (result as any)[property] =
                    currentValue + (modifier.value as number);
                break;
            case "multiply":
                (result as any)[property] = Math.round(
                    currentValue * (modifier.value as number)
                );
                break;
            case "set":
                (result as any)[property] = modifier.value as number;
                break;
        }

        return result;
    }

    private invalidateCache(): void {
        this.cachedStats = undefined;
    }

    // Create a copy with additional modifiers
    public withModifiers(additionalModifiers: SpellModifier[]): SpellInstance {
        return new SpellInstance(this.definition, [
            ...this.modifiers,
            ...additionalModifiers,
        ]);
    }

    // Validation
    public validate(): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check stats are reasonable
        if (this.stats.damage < 0) {
            errors.push("Damage cannot be negative");
        }
        if (this.stats.apCost < 0) {
            errors.push("AP cost cannot be negative");
        }
        if (this.stats.range < 1) {
            errors.push("Range must be at least 1");
        }
        if (
            this.stats.minRange !== undefined &&
            this.stats.minRange > this.stats.range
        ) {
            errors.push("Minimum range cannot exceed maximum range");
        }

        // Warnings for unusual values
        if (this.stats.damage > 20) {
            warnings.push("Very high damage value");
        }
        if (this.stats.apCost > 10) {
            warnings.push("Very high AP cost");
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
}

// Spell Manager - Central registry and factory
export class SpellManager {
    private definitions = new Map<EntityId, SpellDefinition>();
    private instances = new Map<EntityId, SpellInstance>();

    // Definition management
    public registerDefinition(
        definition: SpellDefinition
    ): Result<void, string> {
        if (this.definitions.has(definition.id)) {
            return failure(`Spell definition already exists: ${definition.id}`);
        }

        const validation = this.validateDefinition(definition);
        if (!validation.isValid) {
            return failure(
                `Invalid spell definition: ${validation.errors.join(", ")}`
            );
        }

        this.definitions.set(definition.id, definition);
        return success(undefined);
    }

    public getDefinition(id: EntityId): SpellDefinition | null {
        return this.definitions.get(id) || null;
    }

    public getAllDefinitions(): SpellDefinition[] {
        return Array.from(this.definitions.values());
    }

    public getDefinitionsByType(type: SpellType): SpellDefinition[] {
        return this.getAllDefinitions().filter((def) => def.type === type);
    }

    public getDefinitionsByTag(tag: string): SpellDefinition[] {
        return this.getAllDefinitions().filter((def) =>
            def.tags?.includes(tag)
        );
    }

    // Instance management
    public createInstance(
        definitionId: EntityId,
        modifiers: SpellModifier[] = []
    ): Result<SpellInstance, string> {
        const definition = this.definitions.get(definitionId);
        if (!definition) {
            return failure(`Spell definition not found: ${definitionId}`);
        }

        const instance = new SpellInstance(definition, modifiers);
        const validation = instance.validate();

        if (!validation.isValid) {
            return failure(
                `Invalid spell instance: ${validation.errors.join(", ")}`
            );
        }

        this.instances.set(instance.id, instance);
        return success(instance);
    }

    public getInstance(id: EntityId): SpellInstance | null {
        return this.instances.get(id) || null;
    }

    public removeInstance(id: EntityId): boolean {
        return this.instances.delete(id);
    }

    public getAllInstances(): SpellInstance[] {
        return Array.from(this.instances.values());
    }

    // Utility methods
    public searchDefinitions(query: string): SpellDefinition[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllDefinitions().filter(
            (def) =>
                def.name.toLowerCase().includes(lowerQuery) ||
                def.description.toLowerCase().includes(lowerQuery) ||
                def.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
    }

    public cloneInstance(
        sourceId: EntityId,
        newModifiers?: SpellModifier[]
    ): Result<SpellInstance, string> {
        const source = this.instances.get(sourceId);
        if (!source) {
            return failure(`Source spell instance not found: ${sourceId}`);
        }

        const modifiers = newModifiers || source.getModifiers();
        return this.createInstance(source.definitionId, modifiers);
    }

    private validateDefinition(definition: SpellDefinition): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields
        if (!definition.id) errors.push("ID is required");
        if (!definition.name) errors.push("Name is required");
        if (!definition.description) errors.push("Description is required");
        if (!definition.icon) errors.push("Icon is required");

        // Stats validation
        const stats = definition.baseStats;
        if (stats.damage < 0) errors.push("Base damage cannot be negative");
        if (stats.apCost < 0) errors.push("Base AP cost cannot be negative");
        if (stats.range < 1) errors.push("Base range must be at least 1");

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    // Cleanup
    public clear(): void {
        this.definitions.clear();
        this.instances.clear();
    }

    public getStats(): { definitions: number; instances: number } {
        return {
            definitions: this.definitions.size,
            instances: this.instances.size,
        };
    }
}

// Global spell manager instance
export const spellManager = new SpellManager();

