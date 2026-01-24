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
        iconDescription: "a swirling blue speed potion in a crystal vial with silver stopper",
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

    // ==========================================================================
    // RISK/REWARD BONUSES - High Risk / High Reward
    // ==========================================================================
    {
        id: "glass_cannon",
        category: "stat",
        name: "Glass Cannon",
        description: "+4 damage to all attacks, -4 Max HP",
        icon: "icon_glass_cannon",
        iconDescription: "a cracked crystal cannon glowing with power",
        stackable: false,
        tags: ["offensive", "risky"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "damage", value: 4 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "health", value: -4 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxHealth", value: -4 },
            },
        ],
    },
    {
        id: "reckless_attacker",
        category: "stat",
        name: "Reckless Attacker",
        description: "+3 Force, +3 Dexterity, -2 Armor, -2 Magic Resistance",
        icon: "icon_reckless_attacker",
        iconDescription: "a warrior charging without a shield",
        stackable: false,
        tags: ["offensive", "risky"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "armor", value: -2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "magicResistance", value: -2 },
            },
        ],
    },
    {
        id: "mana_burn",
        category: "passive",
        name: "Mana Burn",
        description: "Spells cost 1 less AP (min 1), -2 Max HP",
        icon: "icon_mana_burn",
        iconDescription: "a burning blue mana flame consuming health",
        stackable: false,
        tags: ["utility", "risky", "magic"],
        effects: [
            {
                type: "spell_modifier",
                spellModifier: { property: "apCost", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "health", value: -2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxHealth", value: -2 },
            },
        ],
    },
    {
        id: "speed_demon",
        category: "stat",
        name: "Speed Demon",
        description: "+3 Movement, -1 Max AP",
        icon: "icon_speed_demon",
        iconDescription: "a red demon running at high speed",
        stackable: false,
        tags: ["mobility", "risky"],
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
                statModifier: { stat: "actionPoints", value: -1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxActionPoints", value: -1 },
            },
        ],
    },
    {
        id: "bloodlust",
        category: "passive",
        name: "Bloodlust",
        description: "+2 damage per kill this battle (max +10), start at 75% HP",
        icon: "icon_bloodlust",
        iconDescription: "blood-red eyes with rage aura",
        stackable: false,
        tags: ["offensive", "risky", "snowball"],
        effects: [
            {
                type: "scaling_per_kill",
                trigger: { effect: "damage", value: 2, maxValue: 10 },
            },
            {
                type: "on_battle_start",
                trigger: { effect: "damage", value: 3 },
            },
        ],
    },
    {
        id: "pain_converter",
        category: "passive",
        name: "Pain Converter",
        description: "When you take damage, gain +1 AP, -3 Max HP",
        icon: "icon_pain_converter",
        iconDescription: "a heart converting pain to energy",
        stackable: false,
        tags: ["utility", "risky"],
        effects: [
            {
                type: "on_damage_taken",
                trigger: { effect: "add_ap", value: 1 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "health", value: -3 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "maxHealth", value: -3 },
            },
        ],
    },
    {
        id: "all_or_nothing",
        category: "passive",
        name: "All or Nothing",
        description: "First attack each turn: +5 damage, subsequent attacks: -2 damage",
        icon: "icon_all_or_nothing",
        iconDescription: "a single powerful sword strike",
        stackable: false,
        tags: ["offensive", "burst", "risky"],
        effects: [
            {
                type: "on_first_attack",
                trigger: { effect: "damage", value: 5 },
            },
            {
                type: "on_hit",
                trigger: { effect: "damage", value: -2 },
                condition: { type: "consecutive_attacks", value: 2 },
            },
        ],
    },
    {
        id: "desperate_power",
        category: "passive",
        name: "Desperate Power",
        description: "Below 30% HP: +5 all stats. Above 70% HP: -2 all stats",
        icon: "icon_desperate_power",
        iconDescription: "a fighter glowing with desperate energy",
        stackable: false,
        tags: ["conditional", "risky"],
        effects: [
            {
                type: "conditional",
                statModifier: { stat: "force", value: 5 },
                condition: { type: "health_below", value: 30 },
            },
            {
                type: "conditional",
                statModifier: { stat: "dexterity", value: 5 },
                condition: { type: "health_below", value: 30 },
            },
            {
                type: "conditional",
                statModifier: { stat: "intelligence", value: 5 },
                condition: { type: "health_below", value: 30 },
            },
            {
                type: "conditional",
                statModifier: { stat: "armor", value: 5 },
                condition: { type: "health_below", value: 30 },
            },
            {
                type: "conditional",
                statModifier: { stat: "force", value: -2 },
                condition: { type: "health_above", value: 70 },
            },
            {
                type: "conditional",
                statModifier: { stat: "dexterity", value: -2 },
                condition: { type: "health_above", value: 70 },
            },
        ],
    },

    // ==========================================================================
    // RISK/REWARD BONUSES - Gambling / Chance-Based
    // ==========================================================================
    {
        id: "chaos_blessing",
        category: "passive",
        name: "Chaos Blessing",
        description: "Each attack: 20% double damage, 20% half damage",
        icon: "icon_chaos_blessing",
        iconDescription: "a swirling chaos symbol with dice",
        stackable: false,
        tags: ["chance", "chaotic"],
        effects: [
            {
                type: "chance_on_hit",
                trigger: { effect: "damage_multiplier", value: 2, chance: 20 },
            },
            {
                type: "chance_on_hit",
                trigger: { effect: "damage_multiplier", value: 0.5, chance: 20 },
            },
        ],
    },
    {
        id: "fortunes_favor",
        category: "passive",
        name: "Fortune's Favor",
        description: "30% chance to refund AP cost of spells",
        icon: "icon_fortunes_favor",
        iconDescription: "a golden horseshoe with sparkles",
        stackable: false,
        tags: ["chance", "utility"],
        effects: [
            {
                type: "chance_on_cast",
                trigger: { effect: "refund_ap", value: 1, chance: 30 },
            },
        ],
    },
    {
        id: "unstable_magic",
        category: "passive",
        name: "Unstable Magic",
        description: "Magic spells: 25% +50% damage, 25% -50% damage",
        icon: "icon_unstable_magic",
        iconDescription: "a crackling unstable magic orb",
        stackable: false,
        tags: ["chance", "magic"],
        effects: [
            {
                type: "chance_on_hit",
                trigger: { effect: "damage_multiplier", value: 1.5, chance: 25 },
                condition: { type: "is_magic_spell" },
            },
            {
                type: "chance_on_hit",
                trigger: { effect: "damage_multiplier", value: 0.5, chance: 25 },
                condition: { type: "is_magic_spell" },
            },
        ],
    },
    {
        id: "lucky_dodge",
        category: "passive",
        name: "Lucky Dodge",
        description: "15% chance to completely negate incoming damage",
        icon: "icon_lucky_dodge",
        iconDescription: "a figure dodging with luck sparkles",
        stackable: false,
        tags: ["chance", "defensive"],
        effects: [
            {
                type: "chance_on_damage",
                trigger: { effect: "negate_damage", value: 1, chance: 15 },
            },
        ],
    },
    {
        id: "critical_gamble",
        category: "passive",
        name: "Critical Gamble",
        description: "25% critical chance (+100% damage), but -1 base damage",
        icon: "icon_critical_gamble",
        iconDescription: "a glowing dice with critical hit symbol",
        stackable: false,
        tags: ["chance", "offensive"],
        effects: [
            {
                type: "chance_on_hit",
                trigger: { effect: "damage_multiplier", value: 2, chance: 25 },
            },
            {
                type: "on_hit",
                trigger: { effect: "damage", value: -1 },
            },
        ],
    },
    {
        id: "coin_flip",
        category: "passive",
        name: "Coin Flip",
        description: "Battle start: 50% gain +3 AP, 50% lose 2 HP",
        icon: "icon_coin_flip",
        iconDescription: "a golden coin flipping in the air",
        stackable: false,
        tags: ["chance", "chaotic"],
        effects: [
            {
                type: "chance_on_battle_start",
                trigger: { effect: "add_ap", value: 3, chance: 50 },
            },
            {
                type: "chance_on_battle_start",
                trigger: { effect: "damage", value: 2, chance: 50 },
            },
        ],
    },

    // ==========================================================================
    // RISK/REWARD BONUSES - Conditional / Situational
    // ==========================================================================
    {
        id: "snipers_patience",
        category: "passive",
        name: "Sniper's Patience",
        description: "If you don't move this turn: +4 damage to ranged attacks",
        icon: "icon_snipers_patience",
        iconDescription: "a sniper scope with patience timer",
        stackable: false,
        tags: ["conditional", "ranged"],
        effects: [
            {
                type: "conditional",
                trigger: { effect: "damage", value: 4 },
                condition: { type: "has_not_moved" },
            },
        ],
    },
    {
        id: "cornered_beast",
        category: "passive",
        name: "Cornered Beast",
        description: "Adjacent to 2+ enemies: +3 Force, +2 Armor",
        icon: "icon_cornered_beast",
        iconDescription: "a cornered wolf baring fangs",
        stackable: false,
        tags: ["conditional", "defensive", "offensive"],
        effects: [
            {
                type: "conditional",
                statModifier: { stat: "force", value: 3 },
                condition: { type: "adjacent_enemies", value: 2 },
            },
            {
                type: "conditional",
                statModifier: { stat: "armor", value: 2 },
                condition: { type: "adjacent_enemies", value: 2 },
            },
        ],
    },
    {
        id: "lone_wolf",
        category: "stat",
        name: "Lone Wolf",
        description: "+2 Force, +2 Dexterity, +2 Intelligence (solo bonus)",
        icon: "icon_lone_wolf",
        iconDescription: "a solitary wolf howling at the moon",
        stackable: false,
        tags: ["offensive"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "force", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "dexterity", value: 2 },
            },
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 2 },
            },
        ],
    },
    {
        id: "first_blood",
        category: "passive",
        name: "First Blood",
        description: "First attack of battle deals +6 damage",
        icon: "icon_first_blood",
        iconDescription: "a blood drop with number one",
        stackable: false,
        tags: ["offensive", "burst"],
        effects: [
            {
                type: "on_first_attack",
                trigger: { effect: "damage", value: 6 },
                condition: { type: "is_first_attack_battle" },
            },
        ],
    },
    {
        id: "executioner",
        category: "passive",
        name: "Executioner",
        description: "Target below 25% HP: +50% damage",
        icon: "icon_executioner",
        iconDescription: "an executioner axe over a chopping block",
        stackable: false,
        tags: ["offensive", "conditional"],
        effects: [
            {
                type: "conditional",
                trigger: { effect: "damage_multiplier", value: 1.5 },
                condition: { type: "target_health_below", value: 25 },
            },
        ],
    },
    {
        id: "overextended",
        category: "passive",
        name: "Overextended",
        description: "4+ tiles from start: +2 damage, +2 Move, -1 Armor",
        icon: "icon_overextended",
        iconDescription: "a figure far from a safe zone",
        stackable: false,
        tags: ["mobility", "risky", "conditional"],
        effects: [
            {
                type: "conditional",
                trigger: { effect: "damage", value: 2 },
                condition: { type: "distance_from_start", value: 4 },
            },
            {
                type: "conditional",
                statModifier: { stat: "movementPoints", value: 2 },
                condition: { type: "distance_from_start", value: 4 },
            },
            {
                type: "conditional",
                statModifier: { stat: "armor", value: -1 },
                condition: { type: "distance_from_start", value: 4 },
            },
        ],
    },

    // ==========================================================================
    // RISK/REWARD BONUSES - Stacking / Scaling
    // ==========================================================================
    {
        id: "momentum_builder",
        category: "passive",
        name: "Momentum Builder",
        description: "Consecutive attacks (no move): +1 damage each (max +4)",
        icon: "icon_momentum_builder",
        iconDescription: "stacking arrows showing momentum",
        stackable: false,
        tags: ["scaling", "offensive"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "damage", value: 1, maxValue: 4 },
                condition: { type: "consecutive_attacks" },
            },
        ],
    },
    {
        id: "battle_scars",
        category: "passive",
        name: "Battle Scars",
        description: "Each time damaged: +1 Armor (max +5 per battle)",
        icon: "icon_battle_scars",
        iconDescription: "a scarred shield growing stronger",
        stackable: false,
        tags: ["scaling", "defensive"],
        effects: [
            {
                type: "scaling_per_damage",
                trigger: { effect: "add_stat", value: 1, stat: "armor", maxValue: 5 },
            },
        ],
    },
    {
        id: "spell_echo",
        category: "passive",
        name: "Spell Echo",
        description: "After casting 3 spells, next spell casts twice",
        icon: "icon_spell_echo",
        iconDescription: "a spell with echo ripples",
        stackable: false,
        tags: ["scaling", "magic"],
        effects: [
            {
                type: "scaling_per_spell",
                trigger: { effect: "damage_multiplier", value: 2, maxValue: 3 },
            },
        ],
    },
    {
        id: "rage_accumulator",
        category: "passive",
        name: "Rage Accumulator",
        description: "Each turn without attacking: +2 damage next attack (max +8)",
        icon: "icon_rage_accumulator",
        iconDescription: "a rage meter filling up",
        stackable: false,
        tags: ["scaling", "offensive"],
        effects: [
            {
                type: "scaling_no_attack",
                trigger: { effect: "damage", value: 2, maxValue: 8 },
            },
        ],
    },
    {
        id: "kill_streak",
        category: "passive",
        name: "Kill Streak",
        description: "1 kill: +1 AP, 2 kills: +1 MP, 3+ kills: +2 damage",
        icon: "icon_kill_streak",
        iconDescription: "skull icons showing kill count",
        stackable: false,
        tags: ["scaling", "snowball"],
        effects: [
            {
                type: "on_kill",
                trigger: { effect: "add_ap", value: 1 },
            },
            {
                type: "scaling_per_kill",
                trigger: { effect: "add_mp", value: 1, maxValue: 1 },
            },
            {
                type: "scaling_per_kill",
                trigger: { effect: "damage", value: 2, maxValue: 2 },
            },
        ],
    },
];
