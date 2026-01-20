/**
 * Stat Bonuses - Pure stat modifications that apply permanently.
 * These bonuses directly modify player stats like health, force, dexterity, etc.
 */

import { BonusDefinition } from "../../core/types";

export const STAT_BONUSES: BonusDefinition[] = [
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
        id: "force_boost",
        category: "stat",
        name: "Strength",
        description: "+1 Force",
        icon: "💪",
        stackable: true,
        tags: ["offensive", "melee"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 1 },
            },
        ],
    },
    {
        id: "dexterity_boost",
        category: "stat",
        name: "Precision",
        description: "+1 Dexterity",
        icon: "🎯",
        stackable: true,
        tags: ["offensive", "ranged"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 1 },
            },
        ],
    },
    {
        id: "intelligence_boost",
        category: "stat",
        name: "Arcane Mind",
        description: "+1 Intelligence",
        icon: "🧠",
        stackable: true,
        tags: ["offensive", "magic"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 1 },
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
    // Trade-off Bonuses (Glass Cannon style)
    // ==========================================================================
    {
        id: "glass_cannon_force",
        category: "stat",
        name: "Glass Cannon (Force)",
        description: "+3 Force, -1 Armor",
        icon: "💥",
        stackable: false,
        tags: ["offensive", "melee", "risky"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: -1 },
            },
        ],
    },
    {
        id: "glass_cannon_dex",
        category: "stat",
        name: "Glass Cannon (Dex)",
        description: "+3 Dexterity, -1 Armor",
        icon: "🎯",
        stackable: false,
        tags: ["offensive", "ranged", "risky"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: -1 },
            },
        ],
    },
    {
        id: "glass_cannon_int",
        category: "stat",
        name: "Glass Cannon (Int)",
        description: "+3 Intelligence, -1 Armor",
        icon: "💎",
        stackable: false,
        tags: ["offensive", "magic", "risky"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: -1 },
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
        id: "berserkers_stance",
        category: "stat",
        name: "Berserker's Stance",
        description: "+2 Force, -1 Dexterity",
        icon: "😡",
        stackable: false,
        tags: ["offensive", "melee"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: -1 },
            },
        ],
    },
    {
        id: "evasive_maneuvers",
        category: "stat",
        name: "Evasive Maneuvers",
        description: "+2 Dexterity, -1 Force",
        icon: "🤸",
        stackable: false,
        tags: ["offensive", "ranged"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: -1 },
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
        id: "scholar_build",
        category: "stat",
        name: "Scholar's Focus",
        description: "+2 Intelligence, -1 Force",
        icon: "📚",
        stackable: false,
        tags: ["offensive", "magic"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: -1 },
            },
        ],
    },

    // ==========================================================================
    // Combined Stat Bonuses
    // ==========================================================================
    {
        id: "battle_mage",
        category: "stat",
        name: "Battle Mage",
        description: "+1 Intelligence, +1 Armor",
        icon: "🔮",
        stackable: false,
        tags: ["offensive", "defensive", "magic"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: 1 },
            },
        ],
    },
    {
        id: "mystic_armor",
        category: "stat",
        name: "Mystic Armor",
        description: "+1 Intelligence, +1 Magic Resistance",
        icon: "🌟",
        stackable: false,
        tags: ["offensive", "defensive", "magic"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "magicResistance", value: 1 },
            },
        ],
    },
    {
        id: "mystic_endurance",
        category: "stat",
        name: "Mystic Endurance",
        description: "+2 Intelligence, +1 Movement",
        icon: "✨",
        stackable: false,
        tags: ["offensive", "mobility", "magic"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 2 },
            },
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
        id: "frenzied_warrior",
        category: "stat",
        name: "Frenzied Warrior",
        description: "+2 Force, +1 AP, -2 Armor",
        icon: "💀",
        stackable: false,
        tags: ["offensive", "melee", "risky"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "actionPoints", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxActionPoints", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: -2 },
            },
        ],
    },
    {
        id: "quick_reflexes",
        category: "stat",
        name: "Quick Reflexes",
        description: "+2 Dexterity, +1 Movement",
        icon: "⚡",
        stackable: false,
        tags: ["offensive", "ranged", "mobility"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 2 },
            },
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
        id: "elemental_affinity",
        category: "stat",
        name: "Elemental Affinity",
        description: "+2 Intelligence, +2 Magic Resistance, -2 Force",
        icon: "🌊",
        stackable: false,
        tags: ["offensive", "defensive", "magic"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "magicResistance", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: -2 },
            },
        ],
    },
];
