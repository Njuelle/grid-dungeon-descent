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
        icon: "icon_force_boost",
        iconDescription: "a muscular flexing arm",
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
        icon: "icon_glass_cannon_force",
        iconDescription: "an exploding cannon ball",
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
        icon: "icon_berserkers_stance",
        iconDescription: "an angry red face in fury",
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
        icon: "icon_frenzied_warrior",
        iconDescription: "a skull with wild battle energy",
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
        iconDescription: "a sharpened sword blade with gleam",
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
        iconDescription: "a fast sword slash with speed lines",
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
        iconDescription: "a spinning sword creating whirlwind",
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
        iconDescription: "a blood-red sword dripping",
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
        iconDescription: "a massive fist crushing down",
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
        iconDescription: "a glowing fist with danger aura",
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
        iconDescription: "a sweeping arm motion with arc",
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
        iconDescription: "an executioner axe falling",
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
        iconDescription: "blood drops being absorbed",
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
        icon: "icon_power_through_pain",
        iconDescription: "a muscular arm with pain marks",
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
        icon: "icon_fortified_position",
        iconDescription: "a fortified castle with walls",
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
        icon: "icon_berserker_rage",
        iconDescription: "a raging skull with fire eyes",
        stackable: false,
        tags: ["offensive", "melee"],
        effects: [
            {
                type: "on_kill",
                trigger: { effect: "add_stat", value: 1, stat: "force" },
            },
        ],
    },

    // ==========================================================================
    // New Warrior Stat Bonuses
    // ==========================================================================
    {
        id: "brute_force",
        category: "stat",
        name: "Brute Force",
        description: "+2 Force, +1 Health",
        icon: "icon_brute_force",
        iconDescription: "a powerful gorilla silhouette",
        stackable: false,
        tags: ["offensive", "melee", "health"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "health", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxHealth", value: 1 },
            },
        ],
    },
    {
        id: "unstoppable",
        category: "stat",
        name: "Unstoppable",
        description: "+2 Force, +2 Movement, -2 Magic Resistance",
        icon: "icon_unstoppable",
        iconDescription: "a charging train locomotive",
        stackable: false,
        tags: ["offensive", "melee", "mobility", "risky"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 2 },
            },
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
                statModifier: { stat: "magicResistance", value: -2 },
            },
        ],
    },
    {
        id: "iron_skin",
        category: "stat",
        name: "Iron Skin",
        description: "+2 Armor, +1 Force, -1 Movement",
        icon: "🪨",
        iconDescription: "a solid rock surface",
        stackable: false,
        tags: ["defensive", "offensive", "melee"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 1 },
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
    // New Slash Spell Upgrades
    // ==========================================================================
    {
        id: "heavy_slash",
        category: "spell",
        name: "Heavy Slash",
        description: "Slash: +3 Damage, +1 AP Cost",
        icon: "icon_slash",
        iconDescription: "a heavy sword swinging down",
        stackable: false,
        tags: ["melee", "damage", "risky"],
        effects: [
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "damage", value: 3 },
            },
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "apCost", value: 1 },
            },
        ],
    },
    {
        id: "bleeding_slash",
        category: "spell",
        name: "Bleeding Slash",
        description: "Slash: Target loses 1 Force for 2 turns",
        icon: "icon_slash",
        iconDescription: "a sword leaving bloody wound",
        stackable: false,
        tags: ["melee", "debuff"],
        effects: [
            {
                type: "on_hit",
                target: "slash",
                trigger: { effect: "add_stat", value: -1, stat: "force" },
            },
        ],
    },

    // ==========================================================================
    // New Power Strike Spell Upgrades
    // ==========================================================================
    {
        id: "shattering_strike",
        category: "spell",
        name: "Shattering Strike",
        description: "Power Strike: +2 Damage (armor piercing)",
        icon: "icon_power_strike",
        iconDescription: "a fist shattering armor",
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
        id: "quick_strike",
        category: "spell",
        name: "Quick Strike",
        description: "Power Strike: -1 AP Cost, -1 Damage",
        icon: "icon_power_strike",
        iconDescription: "a fast punch with motion blur",
        stackable: false,
        tags: ["melee", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "apCost", value: -1 },
            },
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },

    // ==========================================================================
    // Shield Bash / Battle Cry Spell Upgrades
    // ==========================================================================
    {
        id: "stunning_bash",
        category: "spell",
        name: "Stunning Bash",
        description: "Shield Bash: +1 Damage",
        icon: "icon_stunning_bash",
        iconDescription: "a shield with stun stars",
        stackable: false,
        tags: ["melee", "damage", "control"],
        effects: [
            {
                type: "spell_modifier",
                target: "shield_bash",
                spellModifier: { property: "damage", value: 1 },
            },
        ],
    },
    {
        id: "inspiring_cry",
        category: "spell",
        name: "Inspiring Cry",
        description: "Battle Cry: Also grants +1 Armor",
        icon: "icon_inspiring_cry",
        iconDescription: "a megaphone with inspiring sound waves",
        stackable: false,
        tags: ["melee", "buff", "defensive"],
        effects: [
            {
                type: "on_hit",
                target: "battle_cry",
                trigger: { effect: "add_stat", value: 1, stat: "armor" },
            },
        ],
    },

    // ==========================================================================
    // New Warrior Passive Bonuses
    // ==========================================================================
    {
        id: "juggernaut",
        category: "passive",
        name: "Juggernaut",
        description: "+2 Armor when above 75% HP",
        icon: "icon_juggernaut",
        iconDescription: "a charging rhinoceros",
        stackable: false,
        tags: ["defensive", "conditional"],
        effects: [
            {
                type: "conditional",
                statModifier: { stat: "armor", value: 2 },
                condition: { type: "health_above", value: 75 },
            },
        ],
    },
    {
        id: "revenge",
        category: "passive",
        name: "Revenge",
        description: "+2 Force after taking damage",
        icon: "icon_revenge",
        iconDescription: "an angry face with steam coming out",
        stackable: false,
        tags: ["offensive", "melee", "reactive"],
        effects: [
            {
                type: "on_damage_taken",
                trigger: { effect: "add_stat", value: 2, stat: "force" },
            },
        ],
    },
];
