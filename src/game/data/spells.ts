/**
 * Spell Definitions - All player spells in the game.
 * This is a data-only file with no game logic.
 */

import { SpellDefinition } from "../core/types";

// =============================================================================
// Starting Spells - Warrior
// =============================================================================

const WARRIOR_STARTING_SPELLS: SpellDefinition[] = [
    {
        id: "slash",
        name: "Slash",
        icon: "⚔️",
        apCost: 1,
        range: 1,
        damage: 3,
        description: "Basic melee attack",
        type: "melee",
    },
    {
        id: "shield_bash",
        name: "Shield Bash",
        icon: "🛡️",
        apCost: 1,
        range: 1,
        damage: 2,
        description: "Bash enemy with shield, dealing damage and stunning them (-1 AP next turn)",
        type: "melee",
        spellCategory: "attack",
        buffEffect: {
            type: "stat_boost",
            stat: "actionPoints",
            value: -1,
            duration: 1,
            targetSelf: false,
        },
    },
    {
        id: "battle_cry",
        name: "Battle Cry",
        icon: "📣",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Let out a mighty cry, gaining +2 Force for 2 turns",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "force",
            value: 2,
            duration: 2,
            targetSelf: true,
        },
    },
];

// =============================================================================
// Starting Spells - Ranger
// =============================================================================

const RANGER_STARTING_SPELLS: SpellDefinition[] = [
    {
        id: "arrow_shot",
        name: "Arrow Shot",
        icon: "🏹",
        apCost: 1,
        range: 3,
        minRange: 2,
        damage: 2,
        description: "Basic ranged attack",
        type: "ranged",
    },
    {
        id: "piercing_arrow",
        name: "Piercing Arrow",
        icon: "➳",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 4,
        description: "A powerful shot that pierces armor",
        type: "ranged",
    },
    {
        id: "hunters_mark",
        name: "Hunter's Mark",
        icon: "🎯",
        apCost: 1,
        range: 4,
        minRange: 1,
        damage: 0,
        description: "Mark an enemy, increasing damage they take by 2 for 3 turns",
        type: "ranged",
        spellCategory: "buff",
        buffEffect: {
            type: "mark",
            value: 2,
            duration: 3,
            targetSelf: false,
        },
    },
];

// =============================================================================
// Starting Spells - Magician
// =============================================================================

const MAGICIAN_STARTING_SPELLS: SpellDefinition[] = [
    {
        id: "arcane_bolt",
        name: "Arcane Bolt",
        icon: "✨",
        apCost: 1,
        range: 3,
        minRange: 1,
        damage: 2,
        description: "A quick bolt of arcane energy",
        type: "magic",
    },
    {
        id: "magic_missile",
        name: "Magic Missile",
        icon: "💫",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 4,
        description: "Powerful magical projectile",
        type: "magic",
    },
    {
        id: "arcane_shield",
        name: "Arcane Shield",
        icon: "🔮",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Conjure a magical barrier, gaining +3 Armor for 2 turns",
        type: "magic",
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
// Artifact Spells - Warrior (10)
// =============================================================================

const WARRIOR_ARTIFACT_SPELLS: SpellDefinition[] = [
    {
        id: "power_strike",
        name: "Power Strike",
        icon: "💪",
        apCost: 2,
        range: 1,
        damage: 5,
        description: "Powerful melee attack that deals heavy damage",
        type: "melee",
    },
    {
        id: "whirlwind",
        name: "Whirlwind",
        icon: "🌀",
        apCost: 2,
        range: 1,
        damage: 3,
        description: "Spin attack hitting all adjacent enemies",
        type: "melee",
        aoeShape: "circle",
        aoeRadius: 1,
    },
    {
        id: "intimidating_shout",
        name: "Intimidating Shout",
        icon: "😤",
        apCost: 1,
        range: 2,
        damage: 0,
        description: "Shout at enemy, reducing their Force by 2 for 2 turns",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "force",
            value: -2,
            duration: 2,
            targetSelf: false,
        },
    },
    {
        id: "shield_wall",
        name: "Shield Wall",
        icon: "🏰",
        apCost: 2,
        range: 0,
        damage: 0,
        description: "Raise your shield, gaining +5 Armor for 2 turns",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "armor",
            value: 5,
            duration: 2,
            targetSelf: true,
        },
    },
    {
        id: "berserker_rage",
        name: "Berserker Rage",
        icon: "🔥",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Enter a rage, gaining +3 Force but -2 Armor for 3 turns",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "force",
            value: 3,
            duration: 3,
            targetSelf: true,
        },
    },
    {
        id: "cleave",
        name: "Cleave",
        icon: "🪓",
        apCost: 2,
        range: 1,
        damage: 4,
        description: "Cleaving strike in a line",
        type: "melee",
        aoeShape: "line",
        aoeRadius: 2,
    },
    {
        id: "execute",
        name: "Execute",
        icon: "☠️",
        apCost: 3,
        range: 1,
        damage: 8,
        description: "Devastating blow against a single target",
        type: "melee",
    },
    {
        id: "charge",
        name: "Charge",
        icon: "🐂",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Charge forward, gaining +3 Movement Points this turn",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "instant",
            stat: "movementPoints",
            value: 3,
            duration: 0,
            targetSelf: true,
        },
    },
    {
        id: "taunt",
        name: "Taunt",
        icon: "😠",
        apCost: 1,
        range: 3,
        damage: 0,
        description: "Taunt an enemy, reducing their Dexterity by 2 for 2 turns",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "dexterity",
            value: -2,
            duration: 2,
            targetSelf: false,
        },
    },
    {
        id: "second_wind",
        name: "Second Wind",
        icon: "💨",
        apCost: 2,
        range: 0,
        damage: 0,
        description: "Catch your breath, healing 4 HP instantly",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "instant",
            stat: "health",
            value: 4,
            duration: 0,
            targetSelf: true,
        },
    },
];

// =============================================================================
// Artifact Spells - Ranger (10)
// =============================================================================

const RANGER_ARTIFACT_SPELLS: SpellDefinition[] = [
    {
        id: "bone_piercer",
        name: "Bone Piercer",
        icon: "🦴",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 3,
        description: "Fires a sharp bone that pierces foes",
        type: "ranged",
    },
    {
        id: "multi_shot",
        name: "Multi-Shot",
        icon: "🎯",
        apCost: 2,
        range: 3,
        minRange: 2,
        damage: 2,
        description: "Fire multiple arrows in a cone",
        type: "ranged",
        aoeShape: "cone",
        aoeRadius: 2,
    },
    {
        id: "poison_arrow",
        name: "Poison Arrow",
        icon: "☣️",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 2,
        description: "Poisoned arrow that deals damage and reduces enemy Force by 1 for 3 turns",
        type: "ranged",
        buffEffect: {
            type: "stat_boost",
            stat: "force",
            value: -1,
            duration: 3,
            targetSelf: false,
        },
    },
    {
        id: "trap",
        name: "Bear Trap",
        icon: "🪤",
        apCost: 1,
        range: 2,
        damage: 1,
        description: "Place a trap that reduces enemy Movement by 3 for 2 turns",
        type: "ranged",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "movementPoints",
            value: -3,
            duration: 2,
            targetSelf: false,
        },
    },
    {
        id: "camouflage",
        name: "Camouflage",
        icon: "🌿",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Blend in, gaining +3 Dexterity for 2 turns",
        type: "ranged",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "dexterity",
            value: 3,
            duration: 2,
            targetSelf: true,
        },
    },
    {
        id: "snipe",
        name: "Snipe",
        icon: "🔭",
        apCost: 3,
        range: 6,
        minRange: 3,
        damage: 6,
        description: "Long-range precision shot",
        type: "ranged",
    },
    {
        id: "volley",
        name: "Volley",
        icon: "🌧️",
        apCost: 3,
        range: 4,
        minRange: 2,
        damage: 3,
        description: "Rain arrows on an area",
        type: "ranged",
        aoeShape: "circle",
        aoeRadius: 1,
    },
    {
        id: "marked_for_death",
        name: "Marked for Death",
        icon: "💀",
        apCost: 1,
        range: 5,
        damage: 0,
        description: "Mark target, increasing damage they take by 3 for 2 turns",
        type: "ranged",
        spellCategory: "buff",
        buffEffect: {
            type: "mark",
            value: 3,
            duration: 2,
            targetSelf: false,
        },
    },
    {
        id: "evasive_roll",
        name: "Evasive Roll",
        icon: "🎲",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Roll away, gaining +2 Movement Points instantly",
        type: "ranged",
        spellCategory: "buff",
        buffEffect: {
            type: "instant",
            stat: "movementPoints",
            value: 2,
            duration: 0,
            targetSelf: true,
        },
    },
    {
        id: "net_shot",
        name: "Net Shot",
        icon: "🕸️",
        apCost: 1,
        range: 3,
        minRange: 1,
        damage: 0,
        description: "Entangle enemy, reducing Movement by 4 for 1 turn",
        type: "ranged",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "movementPoints",
            value: -4,
            duration: 1,
            targetSelf: false,
        },
    },
];

// =============================================================================
// Artifact Spells - Magician (10)
// =============================================================================

const MAGICIAN_ARTIFACT_SPELLS: SpellDefinition[] = [
    {
        id: "fireball",
        name: "Fireball",
        icon: "🔥",
        apCost: 3,
        range: 3,
        minRange: 2,
        damage: 6,
        description: "Powerful fire spell with area damage",
        type: "magic",
        aoeShape: "circle",
        aoeRadius: 1,
    },
    {
        id: "ice_shard",
        name: "Ice Shard",
        icon: "❄️",
        apCost: 2,
        range: 3,
        minRange: 1,
        damage: 3,
        description: "Ice projectile that slows enemy (-2 MP for 2 turns)",
        type: "magic",
        buffEffect: {
            type: "stat_boost",
            stat: "movementPoints",
            value: -2,
            duration: 2,
            targetSelf: false,
        },
    },
    {
        id: "lightning_bolt",
        name: "Lightning Bolt",
        icon: "⚡",
        apCost: 2,
        range: 4,
        minRange: 1,
        damage: 4,
        description: "A bolt of lightning that strikes instantly",
        type: "magic",
    },
    {
        id: "teleport",
        name: "Teleport",
        icon: "🌀",
        apCost: 2,
        range: 0,
        damage: 0,
        description: "Teleport to a new location, gaining +4 MP instantly",
        type: "magic",
        spellCategory: "buff",
        buffEffect: {
            type: "instant",
            stat: "movementPoints",
            value: 4,
            duration: 0,
            targetSelf: true,
        },
    },
    {
        id: "mana_shield",
        name: "Mana Shield",
        icon: "🛡️",
        apCost: 2,
        range: 0,
        damage: 0,
        description: "Create a barrier, gaining +4 Magic Resistance for 2 turns",
        type: "magic",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "magicResistance",
            value: 4,
            duration: 2,
            targetSelf: true,
        },
    },
    {
        id: "chain_lightning",
        name: "Chain Lightning",
        icon: "⛓️",
        apCost: 3,
        range: 3,
        minRange: 1,
        damage: 3,
        description: "Lightning that jumps between enemies",
        type: "magic",
        aoeShape: "line",
        aoeRadius: 3,
    },
    {
        id: "meteor",
        name: "Meteor",
        icon: "☄️",
        apCost: 4,
        range: 4,
        minRange: 2,
        damage: 8,
        description: "Call down a devastating meteor",
        type: "magic",
        aoeShape: "circle",
        aoeRadius: 1,
    },
    {
        id: "frost_nova",
        name: "Frost Nova",
        icon: "💠",
        apCost: 2,
        range: 0,
        damage: 2,
        description: "Freeze all adjacent enemies, slowing them (-2 MP for 2 turns)",
        type: "magic",
        aoeShape: "circle",
        aoeRadius: 1,
        buffEffect: {
            type: "stat_boost",
            stat: "movementPoints",
            value: -2,
            duration: 2,
            targetSelf: false,
        },
    },
    {
        id: "blink",
        name: "Blink",
        icon: "💨",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Short-range teleport, gaining +2 MP instantly",
        type: "magic",
        spellCategory: "buff",
        buffEffect: {
            type: "instant",
            stat: "movementPoints",
            value: 2,
            duration: 0,
            targetSelf: true,
        },
    },
    {
        id: "mind_control",
        name: "Weaken Mind",
        icon: "🧠",
        apCost: 2,
        range: 3,
        minRange: 1,
        damage: 0,
        description: "Weaken enemy's mind, reducing Intelligence by 3 for 2 turns",
        type: "magic",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "intelligence",
            value: -3,
            duration: 2,
            targetSelf: false,
        },
    },
];

// =============================================================================
// Artifact Spells - Generic (10)
// =============================================================================

const GENERIC_ARTIFACT_SPELLS: SpellDefinition[] = [
    {
        id: "health_potion",
        name: "Health Potion",
        icon: "🧪",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Drink a potion, healing 5 HP instantly",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "instant",
            stat: "health",
            value: 5,
            duration: 0,
            targetSelf: true,
        },
    },
    {
        id: "speed_boost",
        name: "Speed Boost",
        icon: "⚡",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Surge of speed, gaining +3 MP this turn",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "instant",
            stat: "movementPoints",
            value: 3,
            duration: 0,
            targetSelf: true,
        },
    },
    {
        id: "damage_aura",
        name: "Damage Aura",
        icon: "💥",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Empower yourself, gaining +2 damage on next attack",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "damage_boost",
            value: 2,
            duration: 1,
            targetSelf: true,
        },
    },
    {
        id: "thorns_aura",
        name: "Thorns Aura",
        icon: "🌵",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Reflect damage, gaining +2 Armor for 3 turns",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "armor",
            value: 2,
            duration: 3,
            targetSelf: true,
        },
    },
    {
        id: "life_steal",
        name: "Life Steal",
        icon: "🩸",
        apCost: 2,
        range: 1,
        damage: 3,
        description: "Drain life from enemy, healing 2 HP",
        type: "melee",
        buffEffect: {
            type: "instant",
            stat: "health",
            value: 2,
            duration: 0,
            targetSelf: true,
        },
    },
    {
        id: "barrier",
        name: "Barrier",
        icon: "🔰",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Create a protective barrier, absorbing 3 damage",
        type: "magic",
        spellCategory: "buff",
        buffEffect: {
            type: "shield",
            value: 3,
            duration: 2,
            targetSelf: true,
        },
    },
    {
        id: "haste",
        name: "Haste",
        icon: "🏃",
        apCost: 2,
        range: 0,
        damage: 0,
        description: "Move faster, gaining +2 MP for 2 turns",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "maxMovementPoints",
            value: 2,
            duration: 2,
            targetSelf: true,
        },
    },
    {
        id: "focus",
        name: "Focus",
        icon: "🎯",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Focus your energy, gaining +1 AP this turn",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "instant",
            stat: "actionPoints",
            value: 1,
            duration: 0,
            targetSelf: true,
        },
    },
    {
        id: "regeneration",
        name: "Regeneration",
        icon: "💚",
        apCost: 2,
        range: 0,
        damage: 0,
        description: "Heal over time, recovering 2 HP per turn for 3 turns",
        type: "melee",
        spellCategory: "buff",
        buffEffect: {
            type: "stat_boost",
            stat: "health",
            value: 2,
            duration: 3,
            targetSelf: true,
        },
    },
    {
        id: "lucky_strike",
        name: "Lucky Strike",
        icon: "🍀",
        apCost: 1,
        range: 1,
        damage: 2,
        description: "A lucky hit with bonus damage (+3 damage boost for this attack)",
        type: "melee",
        buffEffect: {
            type: "damage_boost",
            value: 3,
            duration: 0,
            targetSelf: true,
        },
    },
];

// =============================================================================
// Combined Registry
// =============================================================================

/**
 * All player spells available in the game.
 */
export const PLAYER_SPELLS: SpellDefinition[] = [
    ...WARRIOR_STARTING_SPELLS,
    ...RANGER_STARTING_SPELLS,
    ...MAGICIAN_STARTING_SPELLS,
    ...WARRIOR_ARTIFACT_SPELLS,
    ...RANGER_ARTIFACT_SPELLS,
    ...MAGICIAN_ARTIFACT_SPELLS,
    ...GENERIC_ARTIFACT_SPELLS,
];

/**
 * Map of spell ID to spell definition for O(1) lookup.
 */
export const SPELL_REGISTRY: Map<string, SpellDefinition> = new Map(
    PLAYER_SPELLS.map((spell) => [spell.id, spell])
);

// =============================================================================
// Lookup Functions
// =============================================================================

/**
 * Get a spell by its ID.
 */
export function getSpellById(id: string): SpellDefinition | undefined {
    return SPELL_REGISTRY.get(id);
}

/**
 * Get multiple spells by their IDs.
 */
export function getSpellsByIds(ids: string[]): SpellDefinition[] {
    return ids
        .map((id) => SPELL_REGISTRY.get(id))
        .filter((spell): spell is SpellDefinition => spell !== undefined);
}

/**
 * Get all spells of a specific type.
 */
export function getSpellsByType(
    type: "melee" | "ranged" | "magic"
): SpellDefinition[] {
    return PLAYER_SPELLS.filter((spell) => spell.type === type);
}

/**
 * Get all buff spells.
 */
export function getBuffSpells(): SpellDefinition[] {
    return PLAYER_SPELLS.filter((spell) => spell.spellCategory === "buff");
}

/**
 * Get all attack spells.
 */
export function getAttackSpells(): SpellDefinition[] {
    return PLAYER_SPELLS.filter((spell) => spell.spellCategory !== "buff");
}

/**
 * Check if a spell is a buff spell.
 */
export function isBuffSpell(spellId: string): boolean {
    const spell = SPELL_REGISTRY.get(spellId);
    return spell?.spellCategory === "buff";
}

// =============================================================================
// Spell Category Exports (for artifacts)
// =============================================================================

export { WARRIOR_STARTING_SPELLS, RANGER_STARTING_SPELLS, MAGICIAN_STARTING_SPELLS };
export { WARRIOR_ARTIFACT_SPELLS, RANGER_ARTIFACT_SPELLS, MAGICIAN_ARTIFACT_SPELLS, GENERIC_ARTIFACT_SPELLS };
