/**
 * SpellService - Business logic for spell operations
 * Provides high-level spell operations using the SpellSystem
 */

import {
    SpellManager,
    SpellDefinition,
    SpellInstance,
    SpellRequirement,
    spellManager,
} from "../core/systems/SpellSystem";
import { EntityId, SpellModifier, UnitStats, Service } from "../data/types";
import { Result } from "../utils/Result";
import { SpellType } from "../data/enums";
import { success, failure, eventBus, GameEvent } from "../core";

export interface SpellServiceConfig {
    maxInstancesPerPlayer?: number;
    enableValidation?: boolean;
    autoCleanup?: boolean;
}

export class SpellService implements Service {
    public readonly name = "SpellService";

    private manager: SpellManager;
    private config: Required<SpellServiceConfig>;
    private playerSpells = new Map<EntityId, EntityId[]>(); // playerId -> spell instance IDs

    constructor(config: SpellServiceConfig = {}) {
        this.manager = spellManager;
        this.config = {
            maxInstancesPerPlayer: 5,
            enableValidation: true,
            autoCleanup: true,
            ...config,
        };
    }

    public async initialize(): Promise<void> {
        // Register default spell definitions
        await this.registerDefaultSpells();

        // Listen to cleanup events
        if (this.config.autoCleanup) {
            this.setupCleanupListeners();
        }

        console.log("[SpellService] Initialized with", this.manager.getStats());
    }

    public async destroy(): Promise<void> {
        this.manager.clear();
        this.playerSpells.clear();
        console.log("[SpellService] Destroyed");
    }

    // Spell Definition Operations
    public createSpellDefinition(
        name: string,
        type: SpellType,
        baseStats: { damage: number; apCost: number; range: number },
        options: Partial<SpellDefinition> = {}
    ): Result<SpellDefinition, string> {
        const id = options.id || `${name.toLowerCase().replace(/\s+/g, "_")}`;
        const definition: SpellDefinition = {
            id,
            name,
            type,
            description: options.description || `${name} spell`,
            icon:
                options.icon ||
                `icon_${name.toLowerCase().replace(/\s+/g, "_")}`,
            baseStats: {
                damage: baseStats.damage,
                apCost: baseStats.apCost,
                range: baseStats.range,
                minRange: options.baseStats?.minRange,
                aoeShape: options.baseStats?.aoeShape,
                aoeRadius: options.baseStats?.aoeRadius,
            },
            requirements: options.requirements,
            tags: options.tags,
        };

        const result = this.manager.registerDefinition(definition);
        if (result.isSuccess()) {
            eventBus.emit(GameEvent.SPELL_CAST, {
                casterId: "system",
                spellId: definition.id,
                targetPosition: { x: 0, y: 0 },
                affectedUnits: [],
            });
        }

        return result.map(() => definition);
    }

    public getSpellDefinition(id: EntityId): SpellDefinition | null {
        return this.manager.getDefinition(id);
    }

    public searchSpells(query: string): SpellDefinition[] {
        return this.manager.searchDefinitions(query);
    }

    public getSpellsByType(type: SpellType): SpellDefinition[] {
        return this.manager.getDefinitionsByType(type);
    }

    public getSpellsByClass(classId: string): SpellDefinition[] {
        return this.manager.getDefinitionsByTag(`class_${classId}`);
    }

    // Spell Instance Operations
    public createSpellInstance(
        definitionId: EntityId,
        modifiers: SpellModifier[] = []
    ): Result<SpellInstance, string> {
        return this.manager.createInstance(definitionId, modifiers);
    }

    public getSpellInstance(id: EntityId): SpellInstance | null {
        return this.manager.getInstance(id);
    }

    public cloneSpellInstance(
        sourceId: EntityId,
        newModifiers?: SpellModifier[]
    ): Result<SpellInstance, string> {
        return this.manager.cloneInstance(sourceId, newModifiers);
    }

    // Player Spell Management
    public equipSpell(
        playerId: EntityId,
        spellInstanceId: EntityId
    ): Result<void, string> {
        const spell = this.manager.getInstance(spellInstanceId);
        if (!spell) {
            return failure(`Spell instance not found: ${spellInstanceId}`);
        }

        const playerSpells = this.playerSpells.get(playerId) || [];

        // Check spell limit
        if (playerSpells.length >= this.config.maxInstancesPerPlayer) {
            return failure(
                `Player has reached maximum spell limit (${this.config.maxInstancesPerPlayer})`
            );
        }

        // Check if already equipped
        if (playerSpells.includes(spellInstanceId)) {
            return failure("Spell is already equipped");
        }

        // Add spell to player
        const updatedSpells = [...playerSpells, spellInstanceId];
        this.playerSpells.set(playerId, updatedSpells);

        // Emit event
        eventBus.emit(GameEvent.ARTIFACT_EQUIPPED, {
            artifactId: spell.definitionId,
            playerId,
            spellId: spellInstanceId,
        });

        return success(undefined);
    }

    public unequipSpell(
        playerId: EntityId,
        spellInstanceId: EntityId
    ): Result<void, string> {
        const playerSpells = this.playerSpells.get(playerId);
        if (!playerSpells) {
            return failure("Player has no equipped spells");
        }

        const spellIndex = playerSpells.indexOf(spellInstanceId);
        if (spellIndex === -1) {
            return failure("Spell is not equipped by this player");
        }

        // Remove spell from player
        const updatedSpells = playerSpells.filter(
            (id) => id !== spellInstanceId
        );
        this.playerSpells.set(playerId, updatedSpells);

        return success(undefined);
    }

    public getPlayerSpells(playerId: EntityId): SpellInstance[] {
        const spellIds = this.playerSpells.get(playerId) || [];
        return spellIds
            .map((id) => this.manager.getInstance(id))
            .filter((spell) => spell !== null) as SpellInstance[];
    }

    public getPlayerSpellIds(playerId: EntityId): EntityId[] {
        return this.playerSpells.get(playerId) || [];
    }

    public setPlayerSpells(
        playerId: EntityId,
        spellInstanceIds: EntityId[]
    ): Result<void, string> {
        // Validate all spells exist
        for (const spellId of spellInstanceIds) {
            if (!this.manager.getInstance(spellId)) {
                return failure(`Spell instance not found: ${spellId}`);
            }
        }

        // Check spell limit
        if (spellInstanceIds.length > this.config.maxInstancesPerPlayer) {
            return failure(
                `Too many spells (max: ${this.config.maxInstancesPerPlayer})`
            );
        }

        this.playerSpells.set(playerId, [...spellInstanceIds]);
        return success(undefined);
    }

    // Spell Modification
    public addModifierToSpell(
        spellInstanceId: EntityId,
        modifier: SpellModifier
    ): Result<void, string> {
        const spell = this.manager.getInstance(spellInstanceId);
        if (!spell) {
            return failure(`Spell instance not found: ${spellInstanceId}`);
        }

        spell.addModifier(modifier);

        if (this.config.enableValidation) {
            const validation = spell.validate();
            if (!validation.isValid) {
                spell.removeModifier(modifier.id);
                return failure(
                    `Invalid spell after modifier: ${validation.errors.join(
                        ", "
                    )}`
                );
            }
        }

        return success(undefined);
    }

    public removeModifierFromSpell(
        spellInstanceId: EntityId,
        modifierId: string
    ): Result<void, string> {
        const spell = this.manager.getInstance(spellInstanceId);
        if (!spell) {
            return failure(`Spell instance not found: ${spellInstanceId}`);
        }

        const removed = spell.removeModifier(modifierId);
        if (!removed) {
            return failure(`Modifier not found: ${modifierId}`);
        }

        return success(undefined);
    }

    // Spell Requirements
    public checkSpellRequirements(
        spellDefinitionId: EntityId,
        playerStats: UnitStats,
        playerClass?: string,
        playerLevel?: number
    ): Result<boolean, string> {
        const definition = this.manager.getDefinition(spellDefinitionId);
        if (!definition) {
            return failure(`Spell definition not found: ${spellDefinitionId}`);
        }

        if (!definition.requirements || definition.requirements.length === 0) {
            return success(true);
        }

        for (const requirement of definition.requirements) {
            const checkResult = this.checkSingleRequirement(
                requirement,
                playerStats,
                playerClass,
                playerLevel
            );

            if (checkResult.isFailure()) {
                return checkResult;
            }
        }

        return success(true);
    }

    private checkSingleRequirement(
        requirement: SpellRequirement,
        playerStats: UnitStats,
        playerClass?: string,
        playerLevel?: number
    ): Result<boolean, string> {
        switch (requirement.type) {
            case "stat":
                const statValue = (playerStats as any)[requirement.property];
                if (statValue === undefined) {
                    return failure(`Unknown stat: ${requirement.property}`);
                }
                return this.checkOperator(
                    statValue,
                    requirement.value as number,
                    requirement.operator
                );

            case "class":
                if (!playerClass) {
                    return failure(
                        "Player class required for class requirement"
                    );
                }
                return requirement.value === playerClass
                    ? success(true)
                    : failure(`Requires class: ${requirement.value}`);

            case "level":
                if (!playerLevel) {
                    return failure(
                        "Player level required for level requirement"
                    );
                }
                return this.checkOperator(
                    playerLevel,
                    requirement.value as number,
                    requirement.operator
                );

            default:
                return failure(`Unknown requirement type: ${requirement.type}`);
        }
    }

    private checkOperator(
        actual: number,
        required: number,
        operator: string
    ): Result<boolean, string> {
        switch (operator) {
            case "gte":
                return actual >= required
                    ? success(true)
                    : failure(`Requires ${actual} >= ${required}`);
            case "lte":
                return actual <= required
                    ? success(true)
                    : failure(`Requires ${actual} <= ${required}`);
            case "eq":
                return actual === required
                    ? success(true)
                    : failure(`Requires ${actual} == ${required}`);
            default:
                return failure(`Unknown operator: ${operator}`);
        }
    }

    // Utility Methods
    public createSpellFromDefinition(
        definitionId: EntityId,
        playerId?: EntityId,
        modifiers: SpellModifier[] = []
    ): Result<SpellInstance, string> {
        const instanceResult = this.manager.createInstance(
            definitionId,
            modifiers
        );
        if (instanceResult.isFailure()) {
            return instanceResult;
        }

        const instance = instanceResult.value;

        // Auto-equip to player if specified
        if (playerId) {
            const equipResult = this.equipSpell(playerId, instance.id);
            if (equipResult.isFailure()) {
                // Clean up instance if equip failed
                this.manager.removeInstance(instance.id);
                return failure(
                    `Created spell but failed to equip: ${equipResult.error}`
                );
            }
        }

        return success(instance);
    }

    public getPlayerSpellByDefinition(
        playerId: EntityId,
        definitionId: EntityId
    ): SpellInstance | null {
        const playerSpells = this.getPlayerSpells(playerId);
        return (
            playerSpells.find((spell) => spell.definitionId === definitionId) ||
            null
        );
    }

    public hasPlayerSpell(playerId: EntityId, definitionId: EntityId): boolean {
        return this.getPlayerSpellByDefinition(playerId, definitionId) !== null;
    }

    private async registerDefaultSpells(): Promise<void> {
        // Spell definitions are now managed by the centralized spell content system
        // See src/game/content/spells/ for all spell definitions
        console.log("[SpellService] Using centralized spell definitions");
    }

    private setupCleanupListeners(): void {
        // Clean up player spells when player is removed
        eventBus.on(GameEvent.UNIT_DIED, (data) => {
            if (this.playerSpells.has(data.unitId)) {
                const spellIds = this.playerSpells.get(data.unitId) || [];
                spellIds.forEach((spellId) =>
                    this.manager.removeInstance(spellId)
                );
                this.playerSpells.delete(data.unitId);
            }
        });
    }

    // Debug/Admin methods
    public getStats(): {
        definitions: number;
        instances: number;
        players: number;
    } {
        const managerStats = this.manager.getStats();
        return {
            ...managerStats,
            players: this.playerSpells.size,
        };
    }

    public clearPlayerSpells(playerId: EntityId): void {
        const spellIds = this.playerSpells.get(playerId) || [];
        spellIds.forEach((spellId) => this.manager.removeInstance(spellId));
        this.playerSpells.delete(playerId);
    }

    public clearAllPlayerSpells(): void {
        for (const playerId of this.playerSpells.keys()) {
            this.clearPlayerSpells(playerId);
        }
    }
}

// Global spell service instance
export const spellService = new SpellService();

