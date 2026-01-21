/**
 * Common Bonuses - Available to all classes.
 * These are generic bonuses that don't favor any particular playstyle.
 */

import { BonusDefinition } from "../../core/types";

export const COMMON_BONUSES: BonusDefinition[] = [
    // ==========================================================================
    // Simple Stat Boosts
    // ==========================================================================
    {
        id: "health_boost",
        category: "stat",
        name: "Vitality",
        description: "+2 Max Health",
        icon: "❤️",
        stackable: true,
        tags: ["defensive", "health"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "health", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxHealth", value: 2 },
            },
        ],
    },
    {
        id: "armor_boost",
        category: "stat",
        name: "Toughness",
        description: "+1 Armor",
        icon: "🛡️",
        stackable: true,
        tags: ["defensive"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: 1 },
            },
        ],
    },
    {
        id: "magic_resistance_boost",
        category: "stat",
        name: "Mystic Ward",
        description: "+1 Magic Resistance",
        icon: "✨",
        stackable: true,
        tags: ["defensive", "magic"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "magicResistance", value: 1 },
            },
        ],
    },
    {
        id: "movement_boost",
        category: "stat",
        name: "Swiftness",
        description: "+1 Movement Point",
        icon: "👟",
        stackable: true,
        tags: ["mobility"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "movementPoints", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxMovementPoints", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "moveRange", value: 1 },
            },
        ],
    },
    {
        id: "action_boost",
        category: "stat",
        name: "Energy",
        description: "+1 Action Point",
        icon: "⚡",
        stackable: true,
        tags: ["offensive", "utility"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "actionPoints", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxActionPoints", value: 1 },
            },
        ],
    },

    // ==========================================================================
    // Combined/Trade-off Stat Bonuses
    // ==========================================================================
    {
        id: "balanced_defense",
        category: "stat",
        name: "Balanced Defense",
        description: "+1 Armor, +1 Magic Resistance",
        icon: "⚖️",
        stackable: true,
        tags: ["defensive"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "magicResistance", value: 1 },
            },
        ],
    },
    {
        id: "balanced_warrior",
        category: "stat",
        name: "Balanced Warrior",
        description: "+1 Force, +1 Dexterity, +1 Intelligence",
        icon: "⚖️",
        stackable: false,
        tags: ["offensive"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 1 },
            },
        ],
    },
    {
        id: "tank_build",
        category: "stat",
        name: "Fortress",
        description: "+2 Armor, +2 Health, -2 Movement",
        icon: "🏰",
        stackable: false,
        tags: ["defensive", "health"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "health", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxHealth", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "movementPoints", value: -2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxMovementPoints", value: -2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "moveRange", value: -2 },
            },
        ],
    },
    {
        id: "mobility_master",
        category: "stat",
        name: "Mobility Master",
        description: "+3 Movement, -1 Force, -1 Dexterity",
        icon: "🏃‍♂️",
        stackable: false,
        tags: ["mobility"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "movementPoints", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxMovementPoints", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "moveRange", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: -1 },
            },
        ],
    },
    {
        id: "reckless_charge",
        category: "stat",
        name: "Reckless Charge",
        description: "+2 Movement, -1 Armor",
        icon: "🌪️",
        stackable: false,
        tags: ["mobility", "risky"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "movementPoints", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxMovementPoints", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "moveRange", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: -1 },
            },
        ],
    },
    {
        id: "iron_will",
        category: "stat",
        name: "Iron Will",
        description: "+3 Max Health, -1 Movement Point",
        icon: "🧘",
        stackable: false,
        tags: ["defensive", "health"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "health", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxHealth", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "movementPoints", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxMovementPoints", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "moveRange", value: -1 },
            },
        ],
    },
    {
        id: "arcane_battery",
        category: "stat",
        name: "Arcane Battery",
        description: "+2 Action Points, -1 Movement",
        icon: "🔋",
        stackable: false,
        tags: ["offensive", "utility"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "actionPoints", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxActionPoints", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "movementPoints", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxMovementPoints", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "moveRange", value: -1 },
            },
        ],
    },
    {
        id: "defensive_stance",
        category: "stat",
        name: "Defensive Stance",
        description: "+3 Armor, -1 AP",
        icon: "🛡️",
        stackable: false,
        tags: ["defensive"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "actionPoints", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxActionPoints", value: -1 },
            },
        ],
    },
    {
        id: "anti_magic_shield",
        category: "stat",
        name: "Anti-Magic Shield",
        description: "+3 Magic Resistance, -1 Movement",
        icon: "🔮",
        stackable: false,
        tags: ["defensive", "magic"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "magicResistance", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "movementPoints", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxMovementPoints", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "moveRange", value: -1 },
            },
        ],
    },

    // ==========================================================================
    // Combat Passives
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
                trigger: { effect: "damage", value: 2 },
                condition: { type: "random_chance", value: 10 },
            },
        ],
    },
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
                trigger: { effect: "damage", value: -9999 },
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
                trigger: { effect: "add_mp", value: 1 },
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
                condition: { type: "target_health_above", value: 0 },
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
            {
                type: "conditional",
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
        effects: [],
    },
];
