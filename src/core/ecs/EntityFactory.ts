/**
 * Entity Factory - Helper functions to create game entities
 *
 * Provides convenient methods to create player and enemy entities
 * with the appropriate component compositions
 */

import { World, EntityBuilder } from "./Entity";
import {
    createPositionComponent,
    createStatsComponent,
    createRenderComponent,
    createMovementComponent,
    createCombatComponent,
    createSpellComponent,
    createAIComponent,
    createUIComponent,
    createSoundComponent,
    createTeamComponent,
    PlayerClassComponent,
    BonusComponent,
} from "./Component";
import { UnitStats, Spell } from "../../data/types";

export interface PlayerEntityOptions {
    gridX: number;
    gridY: number;
    stats: UnitStats;
    playerClass: {
        id: string;
        name: string;
        spells: Spell[];
        icon: string;
    };
    equippedSpells?: Spell[];
    appliedBonuses?: string[];
}

export interface EnemyEntityOptions {
    gridX: number;
    gridY: number;
    stats: UnitStats;
    enemyType: string;
    color?: number;
    outlineColor?: number;
    behavior?: "aggressive" | "defensive" | "support";
}

/**
 * Create a player entity with all necessary components
 */
export function createPlayerEntity(
    world: World,
    options: PlayerEntityOptions
): string {
    // Create position component
    const position = createPositionComponent(options.gridX, options.gridY);

    // Create stats component
    const stats = createStatsComponent(options.stats);

    // Create render component for player
    const render = createRenderComponent({
        spriteName: options.playerClass.icon,
        scale: 1.2,
        depth: 2,
    });

    // Create movement component
    const movement = createMovementComponent(
        options.stats.moveRange,
        options.stats.movementPoints || options.stats.moveRange
    );

    // Create combat component
    const combat = createCombatComponent(
        options.stats.attackRange,
        options.stats.actionPoints || 2,
        "melee" // Default, will be overridden by spells
    );

    // Create spell component
    const spells = createSpellComponent(
        options.playerClass.spells,
        5 // 5 spell slots
    );

    // Set equipped spells if provided
    if (options.equippedSpells) {
        spells.equippedSpells = [...options.equippedSpells];
        if (options.equippedSpells.length > 0) {
            spells.currentSpell = options.equippedSpells[0];
            // Update attack range based on current spell
            combat.attackRange = spells.currentSpell.range;
            combat.attackType = spells.currentSpell.type as
                | "melee"
                | "ranged"
                | "magic";
        }
    }

    // Create player class component
    const playerClass: PlayerClassComponent = {
        type: "playerClass",
        classId: options.playerClass.id,
        className: options.playerClass.name,
        baseSpells: [...options.playerClass.spells],
        classIcon: options.playerClass.icon,
    };

    // Create bonus component
    const bonus: BonusComponent = {
        type: "bonus",
        appliedBonuses: options.appliedBonuses || [],
        bonusEffects: {},
        temporaryEffects: {},
    };

    // Create team component
    const team = createTeamComponent("player", true);

    // Create UI component
    const ui = createUIComponent();

    // Create sound component
    const sound = createSoundComponent(0.3);

    // Build the entity
    const entity = EntityBuilder.create(world)
        .with(position)
        .with(stats)
        .with(render)
        .with(movement)
        .with(combat)
        .with(spells)
        .with(playerClass)
        .with(bonus)
        .with(team)
        .with(ui)
        .with(sound)
        .build();

    return entity.id;
}

/**
 * Create an enemy entity with all necessary components
 */
export function createEnemyEntity(
    world: World,
    options: EnemyEntityOptions
): string {
    // Create position component
    const position = createPositionComponent(options.gridX, options.gridY);

    // Create stats component
    const stats = createStatsComponent(options.stats);

    // Create render component for enemy
    const render = createRenderComponent({
        color: options.color || 0xff6666,
        outlineColor: options.outlineColor || 0xaa4444,
        scale: 1,
        depth: 2,
    });

    // Create movement component
    const movement = createMovementComponent(
        options.stats.moveRange,
        options.stats.movementPoints || options.stats.moveRange
    );

    // Create combat component
    const combat = createCombatComponent(
        options.stats.attackRange,
        options.stats.actionPoints || 1,
        options.stats.attackRange > 1 ? "ranged" : "melee"
    );

    // Create AI component
    const ai = createAIComponent(
        options.enemyType,
        options.behavior || "aggressive"
    );

    // Create team component
    const team = createTeamComponent("enemy", true);

    // Create UI component
    const ui = createUIComponent();

    // Create sound component
    const sound = createSoundComponent(0.3);

    // Build the entity
    const entity = EntityBuilder.create(world)
        .with(position)
        .with(stats)
        .with(render)
        .with(movement)
        .with(combat)
        .with(ai)
        .with(team)
        .with(ui)
        .with(sound)
        .build();

    return entity.id;
}

/**
 * Update player entity with new spell selection
 */
export function updatePlayerSpells(
    world: World,
    entityId: string,
    equippedSpells: Spell[],
    currentSpellIndex: number = 0
): boolean {
    const entity = world.getEntity(entityId);
    if (!entity) return false;

    const spellComponent = entity.getComponent("spell");
    const combatComponent = entity.getComponent("combat");

    if (!spellComponent || !combatComponent) return false;

    // Update spell component
    (spellComponent as any).equippedSpells = [...equippedSpells];

    if (
        equippedSpells.length > 0 &&
        currentSpellIndex < equippedSpells.length
    ) {
        const currentSpell = equippedSpells[currentSpellIndex];
        (spellComponent as any).currentSpell = currentSpell;

        // Update combat component based on current spell
        (combatComponent as any).attackRange = currentSpell.range;
        (combatComponent as any).attackType = currentSpell.type;
    }

    return true;
}

/**
 * Apply bonus effects to an entity
 */
export function applyBonusToEntity(
    world: World,
    entityId: string,
    bonusId: string,
    bonusEffects: any[]
): boolean {
    const entity = world.getEntity(entityId);
    if (!entity) return false;

    const bonusComponent = entity.getComponent("bonus");
    const statsComponent = entity.getComponent("stats");

    if (!bonusComponent || !statsComponent) return false;

    // Add bonus to applied list
    const bonus = bonusComponent as any;
    if (!bonus.appliedBonuses.includes(bonusId)) {
        bonus.appliedBonuses.push(bonusId);
    }

    // Apply stat modifications
    const stats = (statsComponent as any).stats;
    for (const effect of bonusEffects) {
        if (effect.stat && effect.value !== undefined) {
            switch (effect.stat) {
                case "health":
                    stats.health = Math.max(1, stats.health + effect.value);
                    stats.maxHealth = Math.max(
                        1,
                        stats.maxHealth + effect.value
                    );
                    break;
                case "force":
                    stats.force = Math.max(0, stats.force + effect.value);
                    break;
                case "dexterity":
                    stats.dexterity = Math.max(
                        0,
                        stats.dexterity + effect.value
                    );
                    break;
                case "intelligence":
                    stats.intelligence = Math.max(
                        0,
                        (stats.intelligence || 0) + effect.value
                    );
                    break;
                case "armor":
                    stats.armor = Math.max(0, stats.armor + effect.value);
                    break;
                case "magicResistance":
                    stats.magicResistance = Math.max(
                        0,
                        (stats.magicResistance || 0) + effect.value
                    );
                    break;
            }
        }
    }

    return true;
}

/**
 * Get entity stats for display
 */
export function getEntityStats(
    world: World,
    entityId: string
): UnitStats | null {
    const entity = world.getEntity(entityId);
    if (!entity) return null;

    const statsComponent = entity.getComponent("stats");
    if (!statsComponent) return null;

    return (statsComponent as any).stats;
}

/**
 * Check if entity is alive
 */
export function isEntityAlive(world: World, entityId: string): boolean {
    const stats = getEntityStats(world, entityId);
    return stats ? stats.health > 0 : false;
}
