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
    | "Troll"
    | "ShadowAssassin"
    | "Shaman"
    | "Berserker"
    | "FrostMage"
    | "DarkKnight";

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
        animation: "vfx_melee_attack",
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
        animation: "vfx_melee_attack",
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
        animation: "vfx_ranged_attack",
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
        animation: "vfx_ranged_attack",
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
        animation: "vfx_magic_attack",
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
        animation: "vfx_magic_attack",
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
        animation: "vfx_magic_attack",
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
        animation: "vfx_magic_attack",
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
        animation: "vfx_melee_attack",
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
        animation: "vfx_buff_attack",
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
        animation: "vfx_melee_attack",
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
        animation: "vfx_melee_attack",
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
        animation: "vfx_melee_attack",
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
        animation: "vfx_melee_attack",
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
        animation: "vfx_melee_attack",
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
        animation: "vfx_buff_attack",
    },
];

// =============================================================================
// Shadow Assassin Enemy Spells
// =============================================================================

export const SHADOW_ASSASSIN_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_shadowstrike",
        name: "Shadowstrike",
        icon: "icon_enemy_shadowstrike",
        apCost: 1,
        range: 1,
        damage: 3,
        description: "A swift strike from the shadows",
        type: "melee",
        animation: "vfx_melee_attack",
    },
    {
        id: "enemy_mark_prey",
        name: "Mark Prey",
        icon: "icon_enemy_mark_prey",
        apCost: 1,
        range: 3,
        damage: 0,
        description: "Marks the target for +3 bonus damage on next hit",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "mark",
            value: 3,
            duration: 2,
            targetSelf: false,
        },
        animation: "vfx_debuff_attack",
    },
];

// =============================================================================
// Shaman Enemy Spells
// =============================================================================

export const SHAMAN_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_spirit_bolt",
        name: "Spirit Bolt",
        icon: "icon_enemy_spirit_bolt",
        apCost: 1,
        range: 3,
        minRange: 1,
        damage: 2,
        description: "A bolt of spiritual energy",
        type: "magic",
        animation: "vfx_magic_attack",
    },
    {
        id: "enemy_war_cry",
        name: "War Cry",
        icon: "icon_enemy_war_cry",
        apCost: 2,
        range: 0,
        damage: 0,
        description: "Lets out a war cry, gaining strength",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "force",
            value: 2,
            duration: 3,
            targetSelf: true,
        },
        animation: "vfx_buff_attack",
    },
];

// =============================================================================
// Berserker Enemy Spells
// =============================================================================

export const BERSERKER_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_reckless_strike",
        name: "Reckless Strike",
        icon: "icon_enemy_reckless_strike",
        apCost: 1,
        range: 1,
        damage: 4,
        description: "A powerful but reckless melee attack",
        type: "melee",
        animation: "vfx_melee_attack",
    },
    {
        id: "enemy_blood_rage",
        name: "Blood Rage",
        icon: "icon_enemy_blood_rage",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Enters a blood rage, gaining +3 Force but losing 1 HP",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "force",
            value: 3,
            duration: 2,
            targetSelf: true,
        },
        animation: "vfx_buff_attack",
    },
];

// =============================================================================
// Frost Mage Enemy Spells
// =============================================================================

export const FROST_MAGE_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_frost_bolt",
        name: "Frost Bolt",
        icon: "icon_enemy_frost_bolt",
        apCost: 1,
        range: 4,
        minRange: 1,
        damage: 2,
        description: "A bolt of freezing ice",
        type: "magic",
        animation: "vfx_magic_attack",
    },
    {
        id: "enemy_freezing_touch",
        name: "Freezing Touch",
        icon: "icon_enemy_freezing_touch",
        apCost: 2,
        range: 3,
        minRange: 1,
        damage: 1,
        description: "Freezes the target, reducing their movement",
        type: "magic",
        buffEffect: {
            type: "stat_boost",
            stat: "movementPoints",
            value: -2,
            duration: 2,
            targetSelf: false,
        },
        animation: "vfx_magic_attack",
    },
];

// =============================================================================
// Dark Knight Enemy Spells
// =============================================================================

export const DARK_KNIGHT_ENEMY_SPELLS: SpellDefinition[] = [
    {
        id: "enemy_dark_slash",
        name: "Dark Slash",
        icon: "icon_enemy_dark_slash",
        apCost: 1,
        range: 1,
        damage: 3,
        description: "A slash infused with dark energy",
        type: "melee",
        animation: "vfx_melee_attack",
    },
    {
        id: "enemy_soul_drain",
        name: "Soul Drain",
        icon: "icon_enemy_soul_drain",
        apCost: 2,
        range: 1,
        damage: 4,
        description: "Drains the target's soul, healing self for 2 HP",
        type: "melee",
        buffEffect: {
            type: "instant",
            stat: "health",
            value: 2,
            duration: 0,
            targetSelf: true,
        },
        animation: "vfx_melee_attack",
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
    ShadowAssassin: SHADOW_ASSASSIN_ENEMY_SPELLS,
    Shaman: SHAMAN_ENEMY_SPELLS,
    Berserker: BERSERKER_ENEMY_SPELLS,
    FrostMage: FROST_MAGE_ENEMY_SPELLS,
    DarkKnight: DARK_KNIGHT_ENEMY_SPELLS,
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
    ...SHADOW_ASSASSIN_ENEMY_SPELLS,
    ...SHAMAN_ENEMY_SPELLS,
    ...BERSERKER_ENEMY_SPELLS,
    ...FROST_MAGE_ENEMY_SPELLS,
    ...DARK_KNIGHT_ENEMY_SPELLS,
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
