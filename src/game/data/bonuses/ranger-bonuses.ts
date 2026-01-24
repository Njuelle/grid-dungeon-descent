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
        icon: "icon_dexterity_boost",
        iconDescription: "a precise target crosshair",
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
        icon: "icon_glass_cannon_dex",
        iconDescription: "a fragile target with power glow",
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
        icon: "icon_evasive_maneuvers",
        iconDescription: "an acrobat doing evasive flip",
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
        icon: "icon_quick_reflexes",
        iconDescription: "a lightning bolt reflex symbol",
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
        iconDescription: "an eagle eye with far sight",
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
        iconDescription: "a sharp arrow piercing through",
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
        iconDescription: "three arrows spreading outward",
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
        iconDescription: "a serrated bone with jagged edges",
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
        iconDescription: "a bone splintering into fragments",
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
        iconDescription: "a well-balanced bone projectile",
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
        iconDescription: "a long-range bone arrow",
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
        iconDescription: "a quick flying bone dart",
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
        icon: "icon_double_tap",
        iconDescription: "a bow with double arrow notch",
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
        icon: "icon_guerrilla_tactics",
        iconDescription: "a distant target with precision mark",
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
        icon: "icon_sharpshooter",
        iconDescription: "a telescope scope for sniping",
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
        icon: "icon_scout",
        iconDescription: "an eagle soaring as scout",
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
        icon: "icon_survivalist",
        iconDescription: "a camping tent in wilderness",
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
        iconDescription: "a heavy weighted arrow head",
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
        iconDescription: "a swift arrow with speed lines",
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
        iconDescription: "a lethal sharpened bone spike",
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
        iconDescription: "a long extended bone projectile",
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
        icon: "icon_armor_piercing",
        iconDescription: "an arrow piercing through metal",
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
        icon: "icon_extended_mark",
        iconDescription: "a distant target mark symbol",
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
        icon: "icon_hit_and_run",
        iconDescription: "a running figure escaping fast",
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
        icon: "icon_predator",
        iconDescription: "a hunting leopard predator",
        stackable: false,
        tags: ["offensive", "ranged"],
        effects: [
            {
                type: "on_kill",
                trigger: { effect: "add_stat", value: 1, stat: "dexterity" },
            },
        ],
    },

    // ==========================================================================
    // Additional Ranger Stat Bonuses
    // ==========================================================================
    {
        id: "marksman",
        category: "stat",
        name: "Marksman",
        description: "+2 Dexterity, +1 AP, -1 Health",
        icon: "icon_marksman",
        iconDescription: "a sniper scope crosshair",
        stackable: false,
        tags: ["offensive", "ranged", "risky"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 2 },
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
                statModifier: { stat: "health", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxHealth", value: -1 },
            },
        ],
    },
    {
        id: "ambusher",
        category: "stat",
        name: "Ambusher",
        description: "+2 Dexterity, +1 Armor",
        icon: "icon_ambusher",
        iconDescription: "a hidden figure in shadows",
        stackable: false,
        tags: ["offensive", "defensive", "ranged"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: 1 },
            },
        ],
    },
    {
        id: "fleet_footed",
        category: "stat",
        name: "Fleet Footed",
        description: "+1 Dexterity, +2 Movement",
        icon: "icon_fleet_footed",
        iconDescription: "winged boots in motion",
        stackable: false,
        tags: ["offensive", "ranged", "mobility"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 1 },
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
        ],
    },
    {
        id: "nimble_archer",
        category: "stat",
        name: "Nimble Archer",
        description: "+3 Dexterity, -1 Force",
        icon: "icon_nimble_archer",
        iconDescription: "a graceful bow draw stance",
        stackable: false,
        tags: ["offensive", "ranged", "risky"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: -1 },
            },
        ],
    },

    // ==========================================================================
    // Additional Arrow Shot / Bone Piercer / Hunter's Mark Spell Upgrades
    // ==========================================================================
    {
        id: "focused_arrow",
        category: "spell",
        name: "Focused Arrow",
        description: "Arrow Shot: +2 Damage",
        icon: "icon_arrow_shot",
        iconDescription: "a glowing focused arrow tip",
        stackable: false,
        tags: ["ranged", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "damage", value: 2 },
            },
        ],
    },
    {
        id: "quick_shot",
        category: "spell",
        name: "Quick Shot",
        description: "Arrow Shot: -1 Damage, +1 Range",
        icon: "icon_arrow_shot",
        iconDescription: "a fast arrow with motion trail",
        stackable: false,
        tags: ["ranged", "range", "utility"],
        effects: [
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "damage", value: -1 },
            },
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "precise_piercer",
        category: "spell",
        name: "Precise Piercer",
        description: "Bone Piercer: +1 Damage",
        icon: "icon_bone_piercer",
        iconDescription: "a precisely aimed bone spike",
        stackable: false,
        tags: ["ranged", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "damage", value: 1 },
            },
        ],
    },
    {
        id: "wide_mark",
        category: "spell",
        name: "Wide Mark",
        description: "Hunter's Mark: Circle AoE (Radius 1)",
        icon: "icon_extended_mark",
        iconDescription: "an expanding target mark area",
        stackable: false,
        tags: ["ranged", "aoe", "utility"],
        effects: [
            {
                type: "spell_modifier",
                target: "hunters_mark",
                spellModifier: { property: "aoeShape", value: "circle" },
            },
            {
                type: "spell_modifier",
                target: "hunters_mark",
                spellModifier: { property: "aoeRadius", value: 1 },
            },
        ],
    },

    // ==========================================================================
    // Additional Ranger Passive Bonuses
    // ==========================================================================
    {
        id: "eagle_eye",
        category: "passive",
        name: "Eagle Eye",
        description: "+1 Dexterity when attacking from max range",
        icon: "icon_eagle_eye",
        iconDescription: "a sharp eagle eye looking far",
        stackable: false,
        tags: ["offensive", "ranged", "conditional"],
        effects: [
            {
                type: "conditional",
                trigger: { effect: "add_stat", value: 1, stat: "dexterity" },
                condition: { type: "at_max_range" },
            },
        ],
    },
    {
        id: "rapid_fire",
        category: "passive",
        name: "Rapid Fire",
        description: "15% chance to refund AP on ranged attacks",
        icon: "icon_rapid_fire",
        iconDescription: "multiple arrows flying rapidly",
        stackable: false,
        tags: ["ranged", "efficiency", "chance"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "add_ap", value: 1 },
                condition: { type: "random_chance", value: 15 },
            },
        ],
    },

    // ==========================================================================
    // Ranger Status Effect Bonuses
    // ==========================================================================
    {
        id: "venomous_arrows",
        category: "passive",
        name: "Venomous Arrows",
        description: "Ranged attacks have 30% chance to poison (2 dmg/turn, 2 turns)",
        icon: "icon_venomous_arrows",
        iconDescription: "an arrow dripping with green venom",
        stackable: false,
        tags: ["offensive", "ranged", "status", "poison"],
        effects: [
            {
                type: "chance_on_hit",
                trigger: { effect: "apply_status", value: 2, statusType: "poison", statusDuration: 2, chance: 30 },
                condition: { type: "is_ranged_spell" },
            },
        ],
    },
    {
        id: "hunters_mark_bonus",
        category: "passive",
        name: "Hunter's Instinct",
        description: "+3 damage vs poisoned enemies",
        icon: "icon_hunters_instinct",
        iconDescription: "a wolf tracking poisoned prey",
        stackable: false,
        tags: ["offensive", "ranged", "status", "conditional"],
        effects: [
            {
                type: "conditional",
                trigger: { effect: "damage", value: 3 },
                condition: { type: "target_has_status", statusType: "poison" },
            },
        ],
    },
    {
        id: "nimble_escape",
        category: "passive",
        name: "Nimble Escape",
        description: "Immune to root effects, +1 MP when rooted would be applied",
        icon: "icon_nimble_escape",
        iconDescription: "a ranger leaping free from vines",
        stackable: false,
        tags: ["defensive", "mobility", "status", "immunity"],
        effects: [
            {
                type: "status_immunity",
                immuneToStatus: "root",
            },
            {
                type: "on_status_receive",
                trigger: { effect: "add_mp", value: 1 },
                condition: { type: "target_has_status", statusType: "root" },
            },
        ],
    },
];
