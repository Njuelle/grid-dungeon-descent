/**
 * Passive Bonuses - Trigger-based effects that activate under certain conditions.
 * These include on-hit effects, turn-start effects, conditional stat boosts, etc.
 */

import { BonusDefinition } from "../../core/types";

export const PASSIVE_BONUSES: BonusDefinition[] = [
    // ==========================================================================
    // Combat Trigger Bonuses
    // ==========================================================================
    {
        id: "critical_striker",
        category: "passive",
        name: "Critical Striker",
        description: "10% chance for attacks to deal double damage",
        icon: "⚔️",
        stackable: false,
        tags: ["offensive", "chance"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "damage", value: 2 }, // Multiplier
                condition: { type: "random_chance", value: 10 },
            },
        ],
    },
    {
        id: "vampiric_strikes",
        category: "passive",
        name: "Vampiric Strikes",
        description: "Melee attacks heal 1 HP on hit",
        icon: "🩸",
        stackable: false,
        tags: ["melee", "sustain"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "heal", value: 1 },
                condition: { type: "is_melee_attack" },
            },
        ],
    },
    {
        id: "spell_thief",
        category: "passive",
        name: "Spell Thief",
        description: "Gain 1 AP when killing with magic",
        icon: "🎭",
        stackable: false,
        tags: ["magic", "utility"],
        effects: [
            {
                type: "on_kill",
                trigger: { effect: "add_ap", value: 1 },
                condition: { type: "is_magic_spell" },
            },
        ],
    },
    {
        id: "double_tap",
        category: "passive",
        name: "Double Tap",
        description: "Ranged attacks have 20% chance to attack twice",
        icon: "🏹",
        stackable: false,
        tags: ["ranged", "chance"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "damage", value: 1 }, // Extra hit
                condition: { type: "random_chance", value: 20 },
            },
        ],
    },
    {
        id: "guerrilla_tactics",
        category: "passive",
        name: "Guerrilla Tactics",
        description: "+2 damage when attacking from max range",
        icon: "🎯",
        stackable: false,
        tags: ["ranged", "damage", "conditional"],
        effects: [
            {
                type: "conditional",
                trigger: { effect: "damage", value: 2 },
                condition: { type: "at_max_range" },
            },
        ],
    },
    {
        id: "giant_slayer",
        category: "passive",
        name: "Giant Slayer",
        description: "+3 damage vs enemies with more max HP than you",
        icon: "🗡️",
        stackable: false,
        tags: ["offensive", "conditional"],
        effects: [
            {
                type: "conditional",
                trigger: { effect: "damage", value: 3 },
                condition: { type: "target_health_above", value: 0 }, // Target max HP > player max HP
            },
        ],
    },

    // ==========================================================================
    // Defense Trigger Bonuses
    // ==========================================================================
    {
        id: "thorns",
        category: "passive",
        name: "Thorns",
        description: "Melee attackers take 1 damage",
        icon: "🌹",
        stackable: false,
        tags: ["defensive", "melee"],
        effects: [
            {
                type: "on_damage_taken",
                trigger: { effect: "damage", value: 1 },
                condition: { type: "is_melee_attack" },
            },
        ],
    },
    {
        id: "spell_shield",
        category: "passive",
        name: "Spell Shield",
        description: "Block first magic attack each battle",
        icon: "🛡️",
        stackable: false,
        tags: ["defensive", "magic"],
        effects: [
            {
                type: "on_damage_taken",
                trigger: { effect: "damage", value: -9999 }, // Negate damage
                condition: { type: "is_magic_spell" },
            },
        ],
    },
    {
        id: "tactical_retreat",
        category: "passive",
        name: "Tactical Retreat",
        description: "+2 Movement after taking damage",
        icon: "🏃",
        stackable: false,
        tags: ["defensive", "mobility"],
        effects: [
            {
                type: "on_damage_taken",
                trigger: { effect: "add_mp", value: 2 },
            },
        ],
    },
    {
        id: "nimble_fighter",
        category: "passive",
        name: "Nimble Fighter",
        description: "+1 Movement after dodging an attack (25% chance)",
        icon: "🤸",
        stackable: false,
        tags: ["defensive", "mobility", "chance"],
        effects: [
            {
                type: "on_damage_taken",
                trigger: { effect: "add_mp", value: 1 },
                condition: { type: "random_chance", value: 25 },
            },
        ],
    },
    {
        id: "adaptive_armor",
        category: "passive",
        name: "Adaptive Armor",
        description: "+1 Armor/Magic Resistance based on last damage taken",
        icon: "🛡️",
        stackable: false,
        tags: ["defensive"],
        effects: [
            {
                type: "on_damage_taken",
                trigger: { effect: "add_stat", value: 1, stat: "armor" },
            },
        ],
    },

    // ==========================================================================
    // Conditional Stat Bonuses (Low Health, etc.)
    // ==========================================================================
    {
        id: "last_stand",
        category: "passive",
        name: "Last Stand",
        description: "+2 to all combat stats when below 25% HP",
        icon: "🛡️",
        stackable: false,
        tags: ["offensive", "defensive", "conditional"],
        effects: [
            {
                type: "conditional",
                statModifier: { stat: "force", value: 2 },
                condition: { type: "health_below", value: 25 },
            },
            {
                type: "conditional",
                statModifier: { stat: "dexterity", value: 2 },
                condition: { type: "health_below", value: 25 },
            },
            {
                type: "conditional",
                statModifier: { stat: "intelligence", value: 2 },
                condition: { type: "health_below", value: 25 },
            },
            {
                type: "conditional",
                statModifier: { stat: "armor", value: 2 },
                condition: { type: "health_below", value: 25 },
            },
            {
                type: "conditional",
                statModifier: { stat: "magicResistance", value: 2 },
                condition: { type: "health_below", value: 25 },
            },
        ],
    },
    {
        id: "power_through_pain",
        category: "passive",
        name: "Power Through Pain",
        description: "+1 Force for each missing HP (max +3)",
        icon: "💪",
        stackable: false,
        tags: ["offensive", "melee", "conditional"],
        effects: [
            {
                type: "conditional",
                trigger: { effect: "add_stat", value: 1, stat: "force" },
                // The actual calculation (missing HP, max +3) is handled by BonusSystem
            },
        ],
    },
    {
        id: "fortified_position",
        category: "passive",
        name: "Fortified Position",
        description: "+3 Armor when you don't move for a turn",
        icon: "🏰",
        stackable: false,
        tags: ["defensive", "conditional"],
        effects: [
            {
                type: "conditional",
                statModifier: { stat: "armor", value: 3 },
                condition: { type: "has_not_moved" },
            },
        ],
    },
    {
        id: "berserker_rage",
        category: "passive",
        name: "Berserker Rage",
        description: "+1 Force per enemy defeated (max +5)",
        icon: "💀",
        stackable: false,
        tags: ["offensive", "melee"],
        effects: [
            {
                type: "on_kill",
                trigger: { effect: "add_stat", value: 1, stat: "force" },
                // Max +5 is tracked and enforced by BonusSystem
            },
        ],
    },

    // ==========================================================================
    // Turn Start Bonuses
    // ==========================================================================
    {
        id: "combat_medic",
        category: "passive",
        name: "Combat Medic",
        description: "Heal 2 HP at the start of each turn",
        icon: "🏥",
        stackable: false,
        tags: ["sustain"],
        effects: [
            {
                type: "on_turn_start",
                trigger: { effect: "heal", value: 2 },
            },
        ],
    },
    {
        id: "adrenaline_rush",
        category: "passive",
        name: "Adrenaline Rush",
        description: "+2 AP on first turn of battle",
        icon: "💉",
        stackable: false,
        tags: ["offensive", "utility"],
        effects: [
            {
                type: "on_battle_start",
                trigger: { effect: "add_ap", value: 2 },
            },
        ],
    },
    {
        id: "shadow_step",
        category: "passive",
        name: "Shadow Step",
        description: "First movement each turn costs 0 MP",
        icon: "👤",
        stackable: false,
        tags: ["mobility"],
        effects: [
            {
                type: "on_turn_start",
                trigger: { effect: "add_mp", value: 1 }, // Effectively free first move
            },
        ],
    },
    {
        id: "momentum",
        category: "passive",
        name: "Momentum",
        description: "+1 Movement after defeating an enemy",
        icon: "💨",
        stackable: false,
        tags: ["mobility"],
        effects: [
            {
                type: "on_kill",
                trigger: { effect: "add_mp", value: 1 },
            },
        ],
    },

    // ==========================================================================
    // Special Passive Bonuses
    // ==========================================================================
    {
        id: "spell_sniper",
        category: "passive",
        name: "Spell Sniper",
        description: "All ranged/magic spells: +1 Range",
        icon: "🎯",
        stackable: false,
        tags: ["ranged", "magic", "range"],
        effects: [
            {
                type: "spell_modifier",
                // target: all ranged/magic spells (handled by BonusSystem)
                spellModifier: { property: "range", value: 1 },
                condition: { type: "is_ranged_spell" },
            },
            {
                type: "spell_modifier",
                spellModifier: { property: "range", value: 1 },
                condition: { type: "is_magic_spell" },
            },
        ],
    },
    {
        id: "magic_mastery",
        category: "passive",
        name: "Magic Mastery",
        description: "All magic spells: -1 AP Cost (min 1)",
        icon: "🎭",
        stackable: false,
        tags: ["magic", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                // target: all magic spells (handled by BonusSystem)
                spellModifier: { property: "apCost", value: -1 },
                condition: { type: "is_magic_spell" },
            },
        ],
    },
    {
        id: "spell_echo",
        category: "passive",
        name: "Spell Echo",
        description: "25% chance to not consume AP on magic spells",
        icon: "🔄",
        stackable: false,
        tags: ["magic", "efficiency", "chance"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "refund_ap", value: 0 }, // Refund full AP cost
                condition: { type: "random_chance", value: 25 },
            },
        ],
    },
    {
        id: "overload",
        category: "passive",
        name: "Overload",
        description: "+1 to all spell damage, spells cost 1 more AP",
        icon: "⚡",
        stackable: false,
        tags: ["offensive", "risky"],
        effects: [
            {
                type: "spell_modifier",
                // target: all spells (handled by BonusSystem)
                spellModifier: { property: "damage", value: 1 },
            },
            {
                type: "spell_modifier",
                spellModifier: { property: "apCost", value: 1 },
            },
        ],
    },
    {
        id: "glass_aoe",
        category: "passive",
        name: "Explosive Glass",
        description: "All AoE +1 radius, -2 Armor",
        icon: "💥",
        stackable: false,
        tags: ["aoe", "risky"],
        effects: [
            {
                type: "spell_modifier",
                spellModifier: { property: "aoeRadius", value: 1 },
                condition: { type: "has_aoe" },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: -2 },
            },
        ],
    },
    {
        id: "mage_armor",
        category: "passive",
        name: "Mage Armor",
        description: "Intelligence also adds to Armor (50% rate)",
        icon: "🧙",
        stackable: false,
        tags: ["defensive", "magic"],
        effects: [
            {
                type: "conditional",
                // Armor bonus = floor(intelligence * 0.5) - handled by BonusSystem
                statModifier: { stat: "armor", value: 0 }, // Calculated dynamically
            },
        ],
    },
    {
        id: "perfect_balance",
        category: "passive",
        name: "Perfect Balance",
        description: "All stats minimum 3 (raises low stats)",
        icon: "⚖️",
        stackable: false,
        tags: ["utility"],
        effects: [
            // Effects calculated dynamically by BonusSystem to raise any stat below 3
            {
                type: "conditional",
                // Raises force, dexterity, intelligence, armor, magicResistance to minimum 3
            },
        ],
    },
    {
        id: "gamblers_luck",
        category: "passive",
        name: "Gambler's Luck",
        description: "Can reroll bonus choices once per victory",
        icon: "🎲",
        stackable: false,
        tags: ["utility"],
        effects: [
            // This bonus is handled entirely by UI, no combat effects
        ],
    },
];
