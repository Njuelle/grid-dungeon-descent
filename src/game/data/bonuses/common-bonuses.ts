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
        icon: "icon_health_boost",
        iconDescription: "a glowing red heart symbol",
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
        icon: "icon_armor_boost",
        iconDescription: "a sturdy metal shield",
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
        icon: "icon_magic_resistance_boost",
        iconDescription: "sparkling magical ward energy",
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
        icon: "icon_movement_boost",
        iconDescription: "a running shoe with speed lines",
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
        icon: "icon_action_boost",
        iconDescription: "a crackling lightning bolt of energy",
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
        icon: "icon_balanced_defense",
        iconDescription: "balanced scales of protection",
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
        icon: "icon_balanced_warrior",
        iconDescription: "balanced scales with three orbs",
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
        icon: "icon_tank_build",
        iconDescription: "a fortified stone castle tower",
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
        icon: "icon_mobility_master",
        iconDescription: "a running figure in motion",
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
        icon: "icon_reckless_charge",
        iconDescription: "a spinning tornado whirlwind",
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
        icon: "icon_iron_will",
        iconDescription: "a meditating figure with inner strength aura",
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
        icon: "icon_arcane_battery",
        iconDescription: "a glowing magical battery cell",
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
        icon: "icon_defensive_stance",
        iconDescription: "a shield raised in defensive position",
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
        icon: "icon_anti_magic_shield",
        iconDescription: "a crystal orb deflecting magic",
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
        icon: "icon_critical_striker",
        iconDescription: "crossed swords with critical hit spark",
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
        icon: "icon_thorns",
        iconDescription: "a rose with sharp thorny vines",
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
        icon: "icon_spell_shield",
        iconDescription: "a shield with magical runes glowing",
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
        icon: "icon_tactical_retreat",
        iconDescription: "a figure running with retreat arrow",
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
        icon: "icon_nimble_fighter",
        iconDescription: "an acrobat doing a flip dodge",
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
        icon: "icon_adaptive_armor",
        iconDescription: "a morphing adaptive shield",
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
        icon: "icon_last_stand",
        iconDescription: "a shield with last stand emblem glowing",
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
        icon: "icon_combat_medic",
        iconDescription: "a medical cross with healing glow",
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
        icon: "icon_adrenaline_rush",
        iconDescription: "a syringe with adrenaline fluid",
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
        icon: "icon_shadow_step",
        iconDescription: "a shadowy silhouette figure",
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
        icon: "icon_momentum",
        iconDescription: "a wind gust with forward momentum",
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
        icon: "icon_spell_sniper",
        iconDescription: "a magical target crosshair",
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
        icon: "icon_giant_slayer",
        iconDescription: "a dagger striking a giant silhouette",
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
        icon: "icon_perfect_balance",
        iconDescription: "perfectly balanced golden scales",
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
        icon: "icon_gamblers_luck",
        iconDescription: "lucky dice showing high numbers",
        stackable: false,
        tags: ["utility"],
        effects: [],
    },

    // ==========================================================================
    // New Stat Bonuses
    // ==========================================================================
    {
        id: "resilience",
        category: "stat",
        name: "Resilience",
        description: "+3 Max Health, +1 Magic Resistance",
        icon: "icon_resilience",
        iconDescription: "a green glowing heart of resilience",
        stackable: false,
        tags: ["defensive", "health", "magic"],
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
                statModifier: { stat: "magicResistance", value: 1 },
            },
        ],
    },
    {
        id: "veteran",
        category: "stat",
        name: "Veteran",
        description: "+1 Force, +1 Armor",
        icon: "icon_veteran",
        iconDescription: "a military medal of honor",
        stackable: true,
        tags: ["offensive", "defensive"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: 1 },
            },
        ],
    },
    {
        id: "agile_fighter",
        category: "stat",
        name: "Agile Fighter",
        description: "+2 Movement, +1 Dexterity, -1 Health",
        icon: "icon_agile_fighter",
        iconDescription: "an agile lizard in motion",
        stackable: false,
        tags: ["mobility", "offensive", "risky"],
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
                statModifier: { stat: "dexterity", value: 1 },
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
        id: "prepared",
        category: "passive",
        name: "Prepared",
        description: "+2 AP on battle start",
        icon: "icon_prepared",
        iconDescription: "a clipboard with battle checklist",
        stackable: false,
        tags: ["offensive", "utility"],
        effects: [
            {
                type: "on_battle_start",
                trigger: { effect: "add_ap", value: 2 },
            },
        ],
    },

    // ==========================================================================
    // New Passive Bonuses
    // ==========================================================================
    {
        id: "killing_spree",
        category: "passive",
        name: "Killing Spree",
        description: "+1 AP after defeating an enemy",
        icon: "icon_killing_spree",
        iconDescription: "a skull with fiery eyes",
        stackable: false,
        tags: ["offensive", "utility"],
        effects: [
            {
                type: "on_kill",
                trigger: { effect: "add_ap", value: 1 },
            },
        ],
    },
    {
        id: "second_strike",
        category: "passive",
        name: "Second Strike",
        description: "15% chance to gain +1 AP on hit",
        icon: "icon_second_strike",
        iconDescription: "a slot machine with lucky sevens",
        stackable: false,
        tags: ["offensive", "chance"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "add_ap", value: 1 },
                condition: { type: "random_chance", value: 15 },
            },
        ],
    },
    {
        id: "survivor",
        category: "passive",
        name: "Survivor",
        description: "Heal 3 HP when dropping below 30% health",
        icon: "🩹",
        iconDescription: "a bandage with healing cross",
        stackable: false,
        tags: ["defensive", "sustain", "conditional"],
        effects: [
            {
                type: "on_damage_taken",
                trigger: { effect: "heal", value: 3 },
                condition: { type: "health_below", value: 30 },
            },
        ],
    },
    {
        id: "opportunist",
        category: "passive",
        name: "Opportunist",
        description: "+2 damage vs enemies below 50% HP",
        icon: "icon_opportunist",
        iconDescription: "a target with weak point highlighted",
        stackable: false,
        tags: ["offensive", "conditional"],
        effects: [
            {
                type: "conditional",
                trigger: { effect: "damage", value: 2 },
                condition: { type: "target_health_below", value: 50 },
            },
        ],
    },
];
