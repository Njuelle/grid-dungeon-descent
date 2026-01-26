/**
 * Boss Spells - Spells available to boss enemies.
 * Each boss has unique spells that define their combat style.
 */

import { SpellDefinition } from "../../core/types";
import { BossType } from "../../classes/GameProgress";

// =============================================================================
// Dread Warlord Spells
// =============================================================================

export const DREAD_WARLORD_SPELLS: SpellDefinition[] = [
    {
        id: "boss_brutal_cleave",
        name: "Brutal Cleave",
        icon: "icon_boss_cleave",
        apCost: 2,
        range: 1,
        damage: 3,
        description: "A devastating cleave hitting a 3-tile arc",
        type: "melee",
        aoeShape: "circle",
        aoeRadius: 1,
        animation: "vfx_melee_attack",
    },
    {
        id: "boss_battle_charge",
        name: "Battle Charge",
        icon: "icon_boss_charge",
        apCost: 2,
        range: 4,
        damage: 2,
        description: "Charge in a line, damaging and stunning the first enemy hit",
        type: "melee",
        aoeShape: "line",
        aoeRadius: 4,
        statusEffect: {
            type: "stun",
            duration: 1,
        },
        animation: "vfx_melee_attack",
    },
    {
        id: "boss_enraged_slam",
        name: "Enraged Slam",
        icon: "icon_boss_slam",
        apCost: 3,
        range: 1,
        damage: 5,
        description: "A powerful slam hitting all tiles around the boss (Phase 2 only)",
        type: "melee",
        aoeShape: "circle",
        aoeRadius: 2,
        animation: "vfx_melee_attack",
    },
];

// =============================================================================
// Lich King Spells
// =============================================================================

export const LICH_KING_SPELLS: SpellDefinition[] = [
    {
        id: "boss_soul_bolt",
        name: "Soul Bolt",
        icon: "icon_boss_soul_bolt",
        apCost: 1,
        range: 5,
        minRange: 1,
        damage: 2,
        description: "A bolt of necrotic energy",
        type: "magic",
        animation: "vfx_magic_attack",
    },
    {
        id: "boss_raise_dead",
        name: "Raise Dead",
        icon: "icon_boss_raise_dead",
        apCost: 2,
        range: 0,
        damage: 0,
        description: "Summons 2 Skeleton minions at random empty tiles",
        type: "magic",
        spellCategory: "buff",
        animation: "vfx_magic_attack",
    },
    {
        id: "boss_death_coil",
        name: "Death Coil",
        icon: "icon_boss_death_coil",
        apCost: 2,
        range: 4,
        minRange: 1,
        damage: 3,
        description: "Damages enemy and heals the Lich for half the damage dealt",
        type: "magic",
        buffEffect: {
            type: "instant",
            stat: "health",
            value: 2, // Heals 2 HP on cast
            duration: 0,
            targetSelf: true,
        },
        animation: "vfx_magic_attack",
    },
];

// =============================================================================
// Storm Titan Spells
// =============================================================================

export const STORM_TITAN_SPELLS: SpellDefinition[] = [
    {
        id: "boss_thunder_strike",
        name: "Thunder Strike",
        icon: "icon_boss_thunder",
        apCost: 2,
        range: 1,
        damage: 3,
        description: "A powerful melee attack with 25% chance to stun",
        type: "melee",
        animation: "vfx_melee_attack",
    },
    {
        id: "boss_lightning_field",
        name: "Lightning Field",
        icon: "icon_boss_lightning",
        apCost: 2,
        range: 0,
        damage: 3,
        description: "Marks 4 random tiles with lightning that explode next turn",
        type: "magic",
        spellCategory: "buff",
        animation: "vfx_magic_attack",
    },
    {
        id: "boss_thunderclap",
        name: "Thunderclap",
        icon: "icon_boss_thunderclap",
        apCost: 3,
        range: 1,
        damage: 3,
        description: "All units within 2 tiles take damage and are pushed back (Phase 2)",
        type: "magic",
        aoeShape: "circle",
        aoeRadius: 2,
        animation: "vfx_magic_attack",
    },
];

// =============================================================================
// Void Reaver Spells
// =============================================================================

export const VOID_REAVER_SPELLS: SpellDefinition[] = [
    {
        id: "boss_void_strike",
        name: "Void Strike",
        icon: "icon_boss_void_strike",
        apCost: 1,
        range: 1,
        damage: 2,
        description: "A melee attack that makes the target Vulnerable",
        type: "melee",
        statusEffect: {
            type: "vulnerable",
            duration: 1,
            value: 1.5,
        },
        animation: "vfx_melee_attack",
    },
    {
        id: "boss_blink",
        name: "Blink",
        icon: "icon_boss_blink",
        apCost: 1,
        range: 5,
        damage: 0,
        description: "Teleport to any tile within range",
        type: "magic",
        spellCategory: "buff",
        animation: "vfx_magic_attack",
    },
    {
        id: "boss_void_zone",
        name: "Void Zone",
        icon: "icon_boss_void_zone",
        apCost: 2,
        range: 4,
        damage: 4,
        description: "Places a void zone that explodes after 1 turn for 4 damage",
        type: "magic",
        aoeShape: "circle",
        aoeRadius: 2,
        animation: "vfx_magic_attack",
    },
];

// =============================================================================
// Infernal Dragon Spells
// =============================================================================

export const INFERNAL_DRAGON_SPELLS: SpellDefinition[] = [
    {
        id: "boss_claw_rake",
        name: "Claw Rake",
        icon: "icon_boss_claw",
        apCost: 1,
        range: 1,
        damage: 3,
        description: "A melee attack hitting 2 adjacent tiles",
        type: "melee",
        aoeShape: "circle",
        aoeRadius: 1,
        animation: "vfx_melee_attack",
    },
    {
        id: "boss_dragon_breath",
        name: "Dragon Breath",
        icon: "icon_boss_breath",
        apCost: 3,
        range: 3,
        damage: 3,
        description: "Cone attack dealing fire damage and applying Burning",
        type: "magic",
        aoeShape: "cone",
        aoeRadius: 3,
        statusEffect: {
            type: "poison", // Burning = poison with fire flavor
            duration: 2,
            value: 2,
        },
        animation: "vfx_magic_attack",
    },
    {
        id: "boss_tail_sweep",
        name: "Tail Sweep",
        icon: "icon_boss_tail",
        apCost: 2,
        range: 1,
        damage: 3,
        description: "Hits all tiles behind the boss and pushes units back",
        type: "melee",
        aoeShape: "circle",
        aoeRadius: 1,
        animation: "vfx_melee_attack",
    },
];

// =============================================================================
// Boss Spell Registry
// =============================================================================

/**
 * Map of boss type to their available spells.
 */
export const BOSS_SPELLS_BY_TYPE: Record<BossType, SpellDefinition[]> = {
    DreadWarlord: DREAD_WARLORD_SPELLS,
    LichKing: LICH_KING_SPELLS,
    StormTitan: STORM_TITAN_SPELLS,
    VoidReaver: VOID_REAVER_SPELLS,
    InfernalDragon: INFERNAL_DRAGON_SPELLS,
};

/**
 * All boss spells combined.
 */
export const ALL_BOSS_SPELLS: SpellDefinition[] = [
    ...DREAD_WARLORD_SPELLS,
    ...LICH_KING_SPELLS,
    ...STORM_TITAN_SPELLS,
    ...VOID_REAVER_SPELLS,
    ...INFERNAL_DRAGON_SPELLS,
];

/**
 * Get spells for a specific boss type.
 */
export function getBossSpellsByType(bossType: BossType): SpellDefinition[] {
    return BOSS_SPELLS_BY_TYPE[bossType] || DREAD_WARLORD_SPELLS;
}

/**
 * Get the default/primary spell for a boss type.
 */
export function getDefaultBossSpell(bossType: BossType): SpellDefinition {
    const spells = getBossSpellsByType(bossType);
    return spells[0];
}
