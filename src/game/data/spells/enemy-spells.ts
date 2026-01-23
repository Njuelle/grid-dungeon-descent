/**
 * Enemy Spells - Spells available to enemy units.
 * Each enemy type has their own set of basic spells.
 */

import { SpellDefinition } from "../../core/types";

// =============================================================================
// Enemy Type Constants
// =============================================================================

export type EnemyType =
    | "Warrior"
    | "Archer"
    | "Magician"
    | "Necromancer"
    | "Tank"
    | "Gobelin"
    | "Ogre"
    | "Troll";

// =============================================================================
// Warrior Enemy Spells
// =============================================================================

export const WARRIOR_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_slash",
        name: "Slash",
        icon: "icon_enemy_slash",
        apCost: 1,
        range: 1,
        damage: 3,
        description: "Basic melee slash attack",
        type: "melee",
    },
    {
        id: "enemy_heavy_strike",
        name: "Heavy Strike",
        icon: "icon_enemy_heavy_strike",
        apCost: 2,
        range: 1,
        damage: 5,
        description: "A powerful overhead strike",
        type: "melee",
    },
];

// =============================================================================
// Archer Enemy Spells
// =============================================================================

export const ARCHER_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_arrow",
        name: "Arrow Shot",
        icon: "icon_enemy_arrow",
        apCost: 1,
        range: 3,
        minRange: 2,
        damage: 2,
        description: "Basic ranged arrow attack",
        type: "ranged",
    },
    {
        id: "enemy_aimed_shot",
        name: "Aimed Shot",
        icon: "icon_enemy_aimed_shot",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 4,
        description: "A carefully aimed powerful shot",
        type: "ranged",
    },
];

// =============================================================================
// Magician Enemy Spells
// =============================================================================

export const MAGICIAN_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_magic_bolt",
        name: "Magic Bolt",
        icon: "icon_enemy_magic_bolt",
        apCost: 1,
        range: 4,
        minRange: 2,
        damage: 2,
        description: "A bolt of arcane energy",
        type: "magic",
    },
    {
        id: "enemy_arcane_blast",
        name: "Arcane Blast",
        icon: "icon_enemy_arcane_blast",
        apCost: 2,
        range: 3,
        minRange: 1,
        damage: 4,
        description: "A powerful arcane explosion",
        type: "magic",
    },
];

// =============================================================================
// Necromancer Enemy Spells
// =============================================================================

export const NECROMANCER_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_dark_bolt",
        name: "Dark Bolt",
        icon: "icon_enemy_dark_bolt",
        apCost: 1,
        range: 5,
        minRange: 2,
        damage: 3,
        description: "A bolt of dark necrotic energy",
        type: "magic",
    },
    {
        id: "enemy_life_drain",
        name: "Life Drain",
        icon: "icon_enemy_life_drain",
        apCost: 2,
        range: 4,
        minRange: 1,
        damage: 3,
        description: "Drains life from the target, healing the caster",
        type: "magic",
        buffEffect: {
            type: "instant",
            stat: "health",
            value: 2,
            duration: 0,
            targetSelf: true,
        },
    },
];

// =============================================================================
// Tank Enemy Spells
// =============================================================================

export const TANK_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_shield_bash",
        name: "Shield Bash",
        icon: "icon_enemy_shield_bash",
        apCost: 1,
        range: 1,
        damage: 2,
        description: "Bash with a heavy shield",
        type: "melee",
    },
    {
        id: "enemy_fortify",
        name: "Fortify",
        icon: "icon_enemy_fortify",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Brace for impact, gaining armor",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "armor",
            value: 3,
            duration: 2,
            targetSelf: true,
        },
    },
];

// =============================================================================
// Gobelin Enemy Spells
// =============================================================================

export const GOBELIN_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_stab",
        name: "Quick Stab",
        icon: "icon_enemy_stab",
        apCost: 1,
        range: 1,
        damage: 1,
        description: "A quick stabbing attack",
        type: "melee",
    },
    {
        id: "enemy_poison_stab",
        name: "Poison Stab",
        icon: "icon_enemy_poison_stab",
        apCost: 2,
        range: 1,
        damage: 2,
        description: "A poisoned blade that weakens the target",
        type: "melee",
        buffEffect: {
            type: "stat_boost",
            stat: "force",
            value: -1,
            duration: 2,
            targetSelf: false,
        },
    },
];

// =============================================================================
// Ogre Enemy Spells
// =============================================================================

export const OGRE_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_smash",
        name: "Smash",
        icon: "icon_enemy_smash",
        apCost: 2,
        range: 1,
        damage: 5,
        description: "A devastating smashing attack",
        type: "melee",
    },
    {
        id: "enemy_ground_pound",
        name: "Ground Pound",
        icon: "icon_enemy_ground_pound",
        apCost: 2,
        range: 1,
        damage: 3,
        description: "Pound the ground, hitting nearby enemies",
        type: "melee",
        aoeShape: "circle",
        aoeRadius: 1,
    },
];

// =============================================================================
// Troll Enemy Spells
// =============================================================================

export const TROLL_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_claw",
        name: "Claw",
        icon: "icon_enemy_claw",
        apCost: 1,
        range: 1,
        damage: 3,
        description: "A vicious claw attack",
        type: "melee",
    },
    {
        id: "enemy_regenerate",
        name: "Regenerate",
        icon: "icon_enemy_regenerate",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Regenerate health over time",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "instant",
            stat: "health",
            value: 3,
            duration: 0,
            targetSelf: true,
        },
    },
];

// =============================================================================
// Enemy Spell Registry
// =============================================================================

/**
 * Map of enemy type to their available spells.
 */
export const ENEMY_SPELLS_BY_TYPE: Record<EnemyType, SpellDefinition[]> = {
    Warrior: WARRIOR_ENEMY_SPELLS,
    Archer: ARCHER_ENEMY_SPELLS,
    Magician: MAGICIAN_ENEMY_SPELLS,
    Necromancer: NECROMANCER_ENEMY_SPELLS,
    Tank: TANK_ENEMY_SPELLS,
    Gobelin: GOBELIN_ENEMY_SPELLS,
    Ogre: OGRE_ENEMY_SPELLS,
    Troll: TROLL_ENEMY_SPELLS,
};

/**
 * All enemy spells combined.
 */
export const ALL_ENEMY_SPELLS: SpellDefinition[] = [
    ...WARRIOR_ENEMY_SPELLS,
    ...ARCHER_ENEMY_SPELLS,
    ...MAGICIAN_ENEMY_SPELLS,
    ...NECROMANCER_ENEMY_SPELLS,
    ...TANK_ENEMY_SPELLS,
    ...GOBELIN_ENEMY_SPELLS,
    ...OGRE_ENEMY_SPELLS,
    ...TROLL_ENEMY_SPELLS,
];

/**
 * Map of spell ID to spell definition for O(1) lookup.
 */
export const ENEMY_SPELL_REGISTRY: Map<string, SpellDefinition> = new Map(
    ALL_ENEMY_SPELLS.map((spell) => [spell.id, spell])
);

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get spells for a specific enemy type.
 */
export function getEnemySpellsByType(enemyType: string): SpellDefinition[] {
    return ENEMY_SPELLS_BY_TYPE[enemyType as EnemyType] || WARRIOR_ENEMY_SPELLS;
}

/**
 * Get a specific enemy spell by ID.
 */
export function getEnemySpellById(id: string): SpellDefinition | undefined {
    return ENEMY_SPELL_REGISTRY.get(id);
}

/**
 * Get the default/primary spell for an enemy type (usually the basic attack).
 */
export function getDefaultEnemySpell(enemyType: string): SpellDefinition {
    const spells = getEnemySpellsByType(enemyType);
    return spells[0];
}
