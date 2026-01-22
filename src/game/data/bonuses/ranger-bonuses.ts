/**
 * Ranger Bonuses - Specific to the Ranger class.
 * Includes Dexterity-based stats, Arrow Shot/Bone Piercer spell upgrades, and ranged passives.
 */

import { BonusDefinition } from "../../core/types";

export const RANGER_BONUSES: BonusDefinition[] = [
    // ==========================================================================
    // Ranger Stat Bonuses
    // ==========================================================================
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

    // ==========================================================================
    // Arrow Shot Spell Upgrades
    // ==========================================================================
    {
        id: "arrow_shot_range",
        category: "spell",
        name: "Eagle Eye",
        description: "Arrow Shot: +1 range",
        icon: "icon_arrow_shot",
        stackable: false,
        tags: ["ranged", "range"],
        effects: [
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "arrow_shot_piercing",
        category: "spell",
        name: "Piercing Arrow",
        description: "Arrow Shot: Line AoE (Length 2), -1 Damage",
        icon: "icon_arrow_shot",
        stackable: false,
        tags: ["ranged", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "aoeShape", value: "line" },
            },
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "aoeRadius", value: 2 },
            },
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "arrow_shot_triple",
        category: "spell",
        name: "Triple Shot",
        description: "Arrow Shot: Add cone AoE",
        icon: "icon_arrow_shot",
        stackable: false,
        tags: ["ranged", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "aoeShape", value: "cone" },
            },
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "aoeRadius", value: 3 },
            },
        ],
    },

    // ==========================================================================
    // Bone Piercer Spell Upgrades
    // ==========================================================================
    {
        id: "bone_piercer_damage",
        category: "spell",
        name: "Serrated Bone",
        description: "Bone Piercer: +2 damage",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "damage", value: 2 },
            },
        ],
    },
    {
        id: "bone_piercer_splash",
        category: "spell",
        name: "Splintering Bone",
        description: "Bone Piercer: Gains a small circular AoE (Radius 1), -1 Damage",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "aoeShape", value: "circle" },
            },
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "aoeRadius", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "bone_piercer_damage_alt",
        category: "spell",
        name: "Balanced Bone",
        description: "Bone Piercer: +1 Damage, +1 Range",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "utility"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "damage", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "bone_piercer_range",
        category: "spell",
        name: "Bone Sharpshooter",
        description: "Bone Piercer: +1 range",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "range"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "bone_piercer_efficient",
        category: "spell",
        name: "Quick Piercer",
        description: "Bone Piercer: -1 AP Cost",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "apCost", value: -1 },
            },
        ],
    },

    // ==========================================================================
    // Ranger Passive Bonuses
    // ==========================================================================
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
                trigger: { effect: "damage", value: 1 },
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

    // ==========================================================================
    // New Ranger Stat Bonuses
    // ==========================================================================
    {
        id: "sharpshooter",
        category: "stat",
        name: "Sharpshooter",
        description: "+2 Dexterity, +1 Range on ranged spells",
        icon: "🔭",
        stackable: false,
        tags: ["offensive", "ranged", "range"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 2 },
            },
            {
                type: "spell_modifier",
                spellModifier: { property: "range", value: 1 },
                condition: { type: "is_ranged_spell" },
            },
        ],
    },
    {
        id: "scout",
        category: "stat",
        name: "Scout",
        description: "+3 Movement, +1 Dexterity, -1 Armor",
        icon: "🦅",
        stackable: false,
        tags: ["offensive", "ranged", "mobility", "risky"],
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
                statModifier: { stat: "dexterity", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: -1 },
            },
        ],
    },
    {
        id: "survivalist",
        category: "stat",
        name: "Survivalist",
        description: "+2 Dexterity, +2 Health, -1 Force",
        icon: "🏕️",
        stackable: false,
        tags: ["offensive", "ranged", "health"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 2 },
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
                statModifier: { stat: "force", value: -1 },
            },
        ],
    },

    // ==========================================================================
    // New Arrow Shot Spell Upgrades
    // ==========================================================================
    {
        id: "heavy_arrow",
        category: "spell",
        name: "Heavy Arrow",
        description: "Arrow Shot: +2 Damage, -1 Range",
        icon: "icon_arrow_shot",
        stackable: false,
        tags: ["ranged", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "damage", value: 2 },
            },
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "range", value: -1 },
            },
        ],
    },
    {
        id: "swift_arrow",
        category: "spell",
        name: "Swift Arrow",
        description: "Arrow Shot: -1 AP Cost",
        icon: "icon_arrow_shot",
        stackable: false,
        tags: ["ranged", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "apCost", value: -1 },
            },
        ],
    },

    // ==========================================================================
    // New Bone Piercer Spell Upgrades
    // ==========================================================================
    {
        id: "lethal_piercer",
        category: "spell",
        name: "Lethal Piercer",
        description: "Bone Piercer: +3 Damage, +1 AP Cost",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "damage", "risky"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "damage", value: 3 },
            },
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "apCost", value: 1 },
            },
        ],
    },
    {
        id: "long_piercer",
        category: "spell",
        name: "Long Piercer",
        description: "Bone Piercer: +2 Range",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "range"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "range", value: 2 },
            },
        ],
    },

    // ==========================================================================
    // Piercing Arrow / Hunter's Mark Spell Upgrades
    // ==========================================================================
    {
        id: "armor_piercing",
        category: "spell",
        name: "Armor Piercing",
        description: "Piercing Arrow: +2 Damage",
        icon: "➳",
        stackable: false,
        tags: ["ranged", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "piercing_arrow",
                spellModifier: { property: "damage", value: 2 },
            },
        ],
    },
    {
        id: "extended_mark",
        category: "spell",
        name: "Extended Mark",
        description: "Hunter's Mark: +1 Range",
        icon: "🎯",
        stackable: false,
        tags: ["ranged", "utility"],
        effects: [
            {
                type: "spell_modifier",
                target: "hunters_mark",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },

    // ==========================================================================
    // New Ranger Passive Bonuses
    // ==========================================================================
    {
        id: "hit_and_run",
        category: "passive",
        name: "Hit and Run",
        description: "+2 Movement after attacking",
        icon: "🏃",
        stackable: false,
        tags: ["ranged", "mobility"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "add_mp", value: 2 },
            },
        ],
    },
    {
        id: "predator",
        category: "passive",
        name: "Predator",
        description: "+1 Dexterity per enemy defeated (max +3)",
        icon: "🐆",
        stackable: false,
        tags: ["offensive", "ranged"],
        effects: [
            {
                type: "on_kill",
                trigger: { effect: "add_stat", value: 1, stat: "dexterity" },
            },
        ],
    },
];
