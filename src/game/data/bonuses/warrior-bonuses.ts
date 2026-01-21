/**
 * Warrior Bonuses - Specific to the Warrior class.
 * Includes Force-based stats, Slash/Power Strike spell upgrades, and melee passives.
 */

import { BonusDefinition } from "../../core/types";

export const WARRIOR_BONUSES: BonusDefinition[] = [
    // ==========================================================================
    // Warrior Stat Bonuses
    // ==========================================================================
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

    // ==========================================================================
    // Slash Spell Upgrades
    // ==========================================================================
    {
        id: "slash_damage",
        category: "spell",
        name: "Sharper Blade",
        description: "Slash: +2 damage",
        icon: "icon_slash",
        stackable: false,
        tags: ["melee", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "damage", value: 2 },
            },
        ],
    },
    {
        id: "slash_cheapen",
        category: "spell",
        name: "Swift Slash",
        description: "Slash: -2 Damage, +1 Range",
        icon: "icon_slash",
        stackable: false,
        tags: ["melee", "utility"],
        effects: [
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "damage", value: -2 },
            },
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "slash_whirlwind",
        category: "spell",
        name: "Whirlwind Slash",
        description: "Slash: Circle AoE (Radius 1), -1 Damage",
        icon: "icon_slash",
        stackable: false,
        tags: ["melee", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "aoeShape", value: "circle" },
            },
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "aoeRadius", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "slash_lifesteal",
        category: "spell",
        name: "Bloodthirsty Blade",
        description: "Slash: Heal 1 HP per enemy hit",
        icon: "icon_slash",
        stackable: false,
        tags: ["melee", "sustain"],
        effects: [
            {
                type: "on_hit",
                target: "slash",
                trigger: { effect: "heal", value: 1 },
            },
        ],
    },

    // ==========================================================================
    // Power Strike Spell Upgrades
    // ==========================================================================
    {
        id: "power_strike_damage",
        category: "spell",
        name: "Crushing Blow",
        description: "Power Strike: +2 damage",
        icon: "icon_power_strike",
        stackable: false,
        tags: ["melee", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "damage", value: 2 },
            },
        ],
    },
    {
        id: "power_strike_risky",
        category: "spell",
        name: "Risky Power Strike",
        description: "Power Strike: +4 Damage, +1 AP Cost",
        icon: "icon_power_strike",
        stackable: false,
        tags: ["melee", "damage", "risky"],
        effects: [
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "damage", value: 4 },
            },
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "apCost", value: 1 },
            },
        ],
    },
    {
        id: "power_strike_cone",
        category: "spell",
        name: "Sweeping Strike",
        description: "Power Strike: Cone AoE (Radius 2), -1 Damage",
        icon: "icon_power_strike",
        stackable: false,
        tags: ["melee", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "aoeShape", value: "cone" },
            },
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "aoeRadius", value: 2 },
            },
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "execute",
        category: "spell",
        name: "Execute",
        description: "Power Strike: Instant kill enemies below 20% HP",
        icon: "icon_power_strike",
        stackable: false,
        tags: ["melee", "execute"],
        effects: [
            {
                type: "on_hit",
                target: "power_strike",
                trigger: { effect: "damage", value: 9999 },
                condition: { type: "target_health_below", value: 20 },
            },
        ],
    },

    // ==========================================================================
    // Warrior Passive Bonuses
    // ==========================================================================
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
            },
        ],
    },
];
