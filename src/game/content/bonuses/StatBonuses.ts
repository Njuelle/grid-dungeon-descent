/**
 * Stat Bonuses - Direct attribute improvements and modifications
 * These bonuses directly affect player stats like health, force, dexterity, etc.
 */

import { Bonus } from "../../classes/Bonus";

export const STAT_BONUSES: Bonus[] = [
    // Basic Single Stat Bonuses
    {
        id: "health_boost",
        name: "Vitality",
        description: "+2 Max Health",
        icon: "❤️",
        type: "stat",
        effects: [{ stat: "health", value: 2 }],
    },
    {
        id: "force_boost",
        name: "Strength",
        description: "+1 Force",
        icon: "💪",
        type: "stat",
        effects: [{ stat: "force", value: 1 }],
    },
    {
        id: "dexterity_boost",
        name: "Precision",
        description: "+1 Dexterity",
        icon: "🎯",
        type: "stat",
        effects: [{ stat: "dexterity", value: 1 }],
    },
    {
        id: "intelligence_boost",
        name: "Arcane Mind",
        description: "+1 Intelligence",
        icon: "🧠",
        type: "stat",
        effects: [{ stat: "intelligence", value: 1 }],
    },
    {
        id: "armor_boost",
        name: "Toughness",
        description: "+1 Armor",
        icon: "🛡️",
        type: "stat",
        effects: [{ stat: "armor", value: 1 }],
    },
    {
        id: "magic_resistance_boost",
        name: "Mystic Ward",
        description: "+1 Magic Resistance",
        icon: "✨",
        type: "stat",
        effects: [{ stat: "magicResistance", value: 1 }],
    },
    {
        id: "movement_boost",
        name: "Swiftness",
        description: "+1 Movement Point",
        icon: "👟",
        type: "stat",
        effects: [{ stat: "movementPoints", value: 1 }],
    },
    {
        id: "action_boost",
        name: "Energy",
        description: "+1 Action Point",
        icon: "⚡",
        type: "stat",
        effects: [{ stat: "actionPoints", value: 1 }],
    },

    // Balanced Multi-Stat Bonuses
    {
        id: "balanced_warrior",
        name: "Balanced Warrior",
        description: "+1 Force, +1 Dexterity, +1 Intelligence",
        icon: "⚖️",
        type: "stat",
        effects: [
            { stat: "force", value: 1 },
            { stat: "dexterity", value: 1 },
            { stat: "intelligence", value: 1 },
        ],
    },
    {
        id: "battle_mage",
        name: "Battle Mage",
        description: "+1 Intelligence, +1 Armor",
        icon: "🔮",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 1 },
            { stat: "armor", value: 1 },
        ],
    },
    {
        id: "mystic_armor",
        name: "Mystic Armor",
        description: "+1 Intelligence, +1 Magic Resistance",
        icon: "🌟",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 1 },
            { stat: "magicResistance", value: 1 },
        ],
    },
    {
        id: "balanced_defense",
        name: "Balanced Defense",
        description: "+1 Armor, +1 Magic Resistance",
        icon: "⚖️",
        type: "stat",
        effects: [
            { stat: "armor", value: 1 },
            { stat: "magicResistance", value: 1 },
        ],
    },
    {
        id: "quick_reflexes",
        name: "Quick Reflexes",
        description: "+2 Dexterity, +1 Movement",
        icon: "⚡",
        type: "stat",
        effects: [
            { stat: "dexterity", value: 2 },
            { stat: "movementPoints", value: 1 },
        ],
    },
    {
        id: "mystic_endurance",
        name: "Mystic Endurance",
        description: "+2 Intelligence, +1 Movement",
        icon: "✨",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 2 },
            { stat: "movementPoints", value: 1 },
        ],
    },
    {
        id: "elemental_affinity",
        name: "Elemental Affinity",
        description: "+2 Intelligence, +2 Magic Resistance, -2 Force",
        icon: "🌊",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 2 },
            { stat: "magicResistance", value: 2 },
            { stat: "force", value: -2 },
        ],
    },

    // High-Risk High-Reward Glass Cannon Builds
    {
        id: "glass_cannon_force",
        name: "Glass Cannon (Force)",
        description: "+3 Force, -1 Armor",
        icon: "💥",
        type: "stat",
        effects: [
            { stat: "force", value: 3 },
            { stat: "armor", value: -1 },
        ],
    },
    {
        id: "glass_cannon_dex",
        name: "Glass Cannon (Dex)",
        description: "+3 Dexterity, -1 Armor",
        icon: "🎯",
        type: "stat",
        effects: [
            { stat: "dexterity", value: 3 },
            { stat: "armor", value: -1 },
        ],
    },
    {
        id: "glass_cannon_int",
        name: "Glass Cannon (Int)",
        description: "+3 Intelligence, -1 Armor",
        icon: "💎",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 3 },
            { stat: "armor", value: -1 },
        ],
    },

    // Specialized Builds with Trade-offs
    {
        id: "berserkers_stance",
        name: "Berserker's Stance",
        description: "+2 Force, -1 Dexterity",
        icon: "😡",
        type: "stat",
        effects: [
            { stat: "force", value: 2 },
            { stat: "dexterity", value: -1 },
        ],
    },
    {
        id: "evasive_maneuvers",
        name: "Evasive Maneuvers",
        description: "+2 Dexterity, -1 Force",
        icon: "🤸",
        type: "stat",
        effects: [
            { stat: "dexterity", value: 2 },
            { stat: "force", value: -1 },
        ],
    },
    {
        id: "scholar_build",
        name: "Scholar's Focus",
        description: "+2 Intelligence, -1 Force",
        icon: "📚",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 2 },
            { stat: "force", value: -1 },
        ],
    },
    {
        id: "iron_will",
        name: "Iron Will",
        description: "+3 Max Health, -1 Movement Point",
        icon: "🧘",
        type: "stat",
        effects: [
            { stat: "health", value: 3 },
            { stat: "movementPoints", value: -1 },
        ],
    },
    {
        id: "reckless_charge",
        name: "Reckless Charge",
        description: "+2 Movement, -1 Armor",
        icon: "🌪️",
        type: "stat",
        effects: [
            { stat: "movementPoints", value: 2 },
            { stat: "armor", value: -1 },
        ],
    },
    {
        id: "arcane_battery",
        name: "Arcane Battery",
        description: "+2 Action Points, -1 Movement",
        icon: "🔋",
        type: "stat",
        effects: [
            { stat: "actionPoints", value: 2 },
            { stat: "movementPoints", value: -1 },
        ],
    },

    // Extreme Builds
    {
        id: "tank_build",
        name: "Fortress",
        description: "+2 Armor, +2 Health, -2 Movement",
        icon: "🏰",
        type: "stat",
        effects: [
            { stat: "armor", value: 2 },
            { stat: "health", value: 2 },
            { stat: "movementPoints", value: -2 },
        ],
    },
    {
        id: "frenzied_warrior",
        name: "Frenzied Warrior",
        description: "+2 Force, +1 AP, -2 Armor",
        icon: "💀",
        type: "stat",
        effects: [
            { stat: "force", value: 2 },
            { stat: "actionPoints", value: 1 },
            { stat: "armor", value: -2 },
        ],
    },
    {
        id: "defensive_stance",
        name: "Defensive Stance",
        description: "+3 Armor, -1 AP",
        icon: "🛡️",
        type: "stat",
        effects: [
            { stat: "armor", value: 3 },
            { stat: "actionPoints", value: -1 },
        ],
    },
    {
        id: "anti_magic_shield",
        name: "Anti-Magic Shield",
        description: "+3 Magic Resistance, -1 Movement",
        icon: "🔮",
        type: "stat",
        effects: [
            { stat: "magicResistance", value: 3 },
            { stat: "movementPoints", value: -1 },
        ],
    },
    {
        id: "mobility_master",
        name: "Mobility Master",
        description: "+3 Movement, -1 Force, -1 Dexterity",
        icon: "🏃‍♂️",
        type: "stat",
        effects: [
            { stat: "movementPoints", value: 3 },
            { stat: "force", value: -1 },
            { stat: "dexterity", value: -1 },
        ],
    },
];
