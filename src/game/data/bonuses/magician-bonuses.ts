/**
 * Magician Bonuses - Specific to the Magician class.
 * Includes Intelligence-based stats, Magic Missile/Fireball spell upgrades, and magic passives.
 */

import { BonusDefinition } from "../../core/types";

export const MAGICIAN_BONUSES: BonusDefinition[] = [
    // ==========================================================================
    // Magician Stat Bonuses
    // ==========================================================================
    {
        id: "intelligence_boost",
        category: "stat",
        name: "Arcane Mind",
        description: "+1 Intelligence",
        icon: "icon_intelligence_boost",
        iconDescription: "a glowing magical brain",
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
        id: "glass_cannon_int",
        category: "stat",
        name: "Glass Cannon (Int)",
        description: "+3 Intelligence, -1 Armor",
        icon: "icon_glass_cannon_int",
        iconDescription: "a fragile glowing gemstone",
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
        id: "scholar_build",
        category: "stat",
        name: "Scholar's Focus",
        description: "+2 Intelligence, -1 Force",
        icon: "icon_scholar_build",
        iconDescription: "a stack of magical spell books",
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
    {
        id: "battle_mage",
        category: "stat",
        name: "Battle Mage",
        description: "+1 Intelligence, +1 Armor",
        icon: "icon_battle_mage",
        iconDescription: "a crystal ball with battle energy",
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
        icon: "icon_mystic_armor",
        iconDescription: "a shining star with protective aura",
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
        icon: "icon_mystic_endurance",
        iconDescription: "sparkling magical endurance energy",
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
        id: "elemental_affinity",
        category: "stat",
        name: "Elemental Affinity",
        description: "+2 Intelligence, +2 Magic Resistance, -2 Force",
        icon: "icon_elemental_affinity",
        iconDescription: "a wave of elemental water energy",
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

    // ==========================================================================
    // Magic Missile Spell Upgrades
    // ==========================================================================
    {
        id: "magic_missile_cost",
        category: "spell",
        name: "Efficient Casting",
        description: "Magic Missile: -1 AP cost",
        icon: "icon_magic_missile",
        iconDescription: "a glowing magic missile with efficiency glow",
        stackable: false,
        tags: ["magic", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "apCost", value: -1 },
            },
        ],
    },
    {
        id: "magic_missile_scatter",
        category: "spell",
        name: "Scatter Missiles",
        description: "Magic Missile: -1 Damage, -1 AP Cost",
        icon: "icon_magic_missile",
        iconDescription: "multiple magic missiles scattering",
        stackable: false,
        tags: ["magic", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "damage", value: -1 },
            },
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "apCost", value: -1 },
            },
        ],
    },
    {
        id: "magic_missile_aoe",
        category: "spell",
        name: "Scattering Missiles",
        description: "Magic Missile: Small AoE (Radius 1), -1 Damage",
        icon: "icon_magic_missile",
        iconDescription: "magic missiles exploding in area",
        stackable: false,
        tags: ["magic", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "aoeShape", value: "circle" },
            },
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "aoeRadius", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "magic_missile_range",
        category: "spell",
        name: "Extended Missiles",
        description: "Magic Missile: +2 Range",
        icon: "icon_magic_missile",
        iconDescription: "a long-range magic missile with trail",
        stackable: false,
        tags: ["magic", "range"],
        effects: [
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "range", value: 2 },
            },
        ],
    },

    // ==========================================================================
    // Fireball Spell Upgrades
    // ==========================================================================
    {
        id: "fireball_damage",
        category: "spell",
        name: "Inferno",
        description: "Fireball: +3 damage",
        icon: "icon_fire_ball",
        iconDescription: "a massive inferno fire explosion",
        stackable: false,
        tags: ["magic", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "damage", value: 3 },
            },
        ],
    },
    {
        id: "fireball_range",
        category: "spell",
        name: "Far Reach",
        description: "Fireball: +1 range",
        icon: "icon_fire_ball",
        iconDescription: "a fireball with extended range trail",
        stackable: false,
        tags: ["magic", "range"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "fireball_aoe_circle",
        category: "spell",
        name: "Explosive Fireball",
        description: "Fireball: Gains a circular AoE (Radius 1), -1 Damage",
        icon: "icon_fire_ball",
        iconDescription: "an exploding fireball with circular blast",
        stackable: false,
        tags: ["magic", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "aoeShape", value: "circle" },
            },
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "aoeRadius", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "fireball_line_aoe",
        category: "spell",
        name: "Fire Line",
        description: "Fireball: Becomes a line AoE (Length 3), -1 Damage",
        icon: "icon_fire_ball",
        iconDescription: "a line of fire spreading forward",
        stackable: false,
        tags: ["magic", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "aoeShape", value: "line" },
            },
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "aoeRadius", value: 3 },
            },
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "efficient_aoe_fireball",
        category: "spell",
        name: "Efficient AoE (Fireball)",
        description: "Fireball: If AoE, -1 AP Cost",
        icon: "icon_fire_ball",
        iconDescription: "an efficient glowing fireball",
        stackable: false,
        tags: ["magic", "efficiency", "conditional"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "apCost", value: -1 },
                condition: { type: "has_aoe", targetSpell: "fireball" },
            },
        ],
    },
    {
        id: "fireball_unstable",
        category: "spell",
        name: "Unstable Fireball",
        description: "Fireball: +4 Damage, -1 Range",
        icon: "icon_fire_ball",
        iconDescription: "an unstable crackling fireball",
        stackable: false,
        tags: ["magic", "damage", "risky"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "damage", value: 4 },
            },
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "range", value: -1 },
            },
        ],
    },
    {
        id: "fireball_bigger_aoe",
        category: "spell",
        name: "Mega Fireball",
        description: "Fireball: +1 AoE Radius",
        icon: "icon_fire_ball",
        iconDescription: "a massive mega fireball",
        stackable: false,
        tags: ["magic", "aoe", "conditional"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "aoeRadius", value: 1 },
                condition: { type: "has_aoe", targetSpell: "fireball" },
            },
        ],
    },

    // ==========================================================================
    // Magician Passive Bonuses
    // ==========================================================================
    {
        id: "spell_thief",
        category: "passive",
        name: "Spell Thief",
        description: "Gain 1 AP when killing with magic",
        icon: "icon_spell_thief",
        iconDescription: "a theater mask with magical aura",
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
        id: "spell_echo",
        category: "passive",
        name: "Spell Echo",
        description: "25% chance to not consume AP on magic spells",
        icon: "icon_spell_echo",
        iconDescription: "a circular repeating echo symbol",
        stackable: false,
        tags: ["magic", "efficiency", "chance"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "refund_ap", value: 0 },
                condition: { type: "random_chance", value: 25 },
            },
        ],
    },
    {
        id: "magic_mastery",
        category: "passive",
        name: "Magic Mastery",
        description: "All magic spells: -1 AP Cost (min 1)",
        icon: "icon_magic_mastery",
        iconDescription: "a mastery crown with magic energy",
        stackable: false,
        tags: ["magic", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                spellModifier: { property: "apCost", value: -1 },
                condition: { type: "is_magic_spell" },
            },
        ],
    },
    {
        id: "overload",
        category: "passive",
        name: "Overload",
        description: "+1 to all spell damage, spells cost 1 more AP",
        icon: "icon_overload",
        iconDescription: "an overloaded lightning bolt crackling",
        stackable: false,
        tags: ["offensive", "risky"],
        effects: [
            {
                type: "spell_modifier",
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
        icon: "icon_glass_aoe",
        iconDescription: "shattering glass explosion",
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
        icon: "icon_mage_armor",
        iconDescription: "a wizard with protective magical shield",
        stackable: false,
        tags: ["defensive", "magic"],
        effects: [
            {
                type: "conditional",
                statModifier: { stat: "armor", value: 0 },
            },
        ],
    },

    // ==========================================================================
    // New Magician Stat Bonuses
    // ==========================================================================
    {
        id: "arcane_power",
        category: "stat",
        name: "Arcane Power",
        description: "+2 Intelligence, +1 AP",
        icon: "icon_arcane_power",
        iconDescription: "a bolt of arcane power energy",
        stackable: false,
        tags: ["offensive", "magic", "utility"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 2 },
            },
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
    {
        id: "spell_weaver",
        category: "stat",
        name: "Spell Weaver",
        description: "+2 Intelligence, +1 Range on magic spells, -1 Health",
        icon: "icon_spell_weaver",
        iconDescription: "a magical web of woven spells",
        stackable: false,
        tags: ["offensive", "magic", "range", "risky"],
        effects: [
            {
                type: "stat_modifier",
                statModifier: { stat: "intelligence", value: 2 },
            },
            {
                type: "spell_modifier",
                spellModifier: { property: "range", value: 1 },
                condition: { type: "is_magic_spell" },
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
        id: "fortified_mind",
        category: "stat",
        name: "Fortified Mind",
        description: "+2 Intelligence, +2 Magic Resistance, -1 Movement",
        icon: "icon_fortified_mind",
        iconDescription: "a fortified brain with shield",
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
    // New Magic Missile Spell Upgrades
    // ==========================================================================
    {
        id: "homing_missiles",
        category: "spell",
        name: "Homing Missiles",
        description: "Magic Missile: +1 Damage, +1 Range",
        icon: "icon_magic_missile",
        iconDescription: "a homing magic missile seeking target",
        stackable: false,
        tags: ["magic", "damage", "range"],
        effects: [
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "damage", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "rapid_missiles",
        category: "spell",
        name: "Rapid Missiles",
        description: "Magic Missile: -1 AP Cost",
        icon: "icon_magic_missile",
        iconDescription: "rapid fire magic missiles",
        stackable: false,
        tags: ["magic", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "apCost", value: -1 },
            },
        ],
    },

    // ==========================================================================
    // New Fireball Spell Upgrades
    // ==========================================================================
    {
        id: "scorching_flames",
        category: "spell",
        name: "Scorching Flames",
        description: "Fireball: +2 Damage, burns target (-1 Force)",
        icon: "icon_fire_ball",
        iconDescription: "scorching hot flames burning",
        stackable: false,
        tags: ["magic", "damage", "debuff"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "damage", value: 2 },
            },
            {
                type: "on_hit",
                target: "fireball",
                trigger: { effect: "add_stat", value: -1, stat: "force" },
            },
        ],
    },
    {
        id: "concentrated_flame",
        category: "spell",
        name: "Concentrated Flame",
        description: "Fireball: +4 Damage (single target focus)",
        icon: "icon_fire_ball",
        iconDescription: "a concentrated beam of fire",
        stackable: false,
        tags: ["magic", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "damage", value: 4 },
            },
        ],
    },

    // ==========================================================================
    // Arcane Bolt / Arcane Shield Spell Upgrades
    // ==========================================================================
    {
        id: "empowered_bolt",
        category: "spell",
        name: "Empowered Bolt",
        description: "Arcane Bolt: +2 Damage",
        icon: "icon_empowered_bolt",
        iconDescription: "an empowered glowing arcane bolt",
        stackable: false,
        tags: ["magic", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "arcane_bolt",
                spellModifier: { property: "damage", value: 2 },
            },
        ],
    },
    {
        id: "reinforced_shield",
        category: "spell",
        name: "Reinforced Shield",
        description: "Arcane Shield: +1 Range (can cast on allies)",
        icon: "icon_reinforced_shield",
        iconDescription: "a reinforced magical shield barrier",
        stackable: false,
        tags: ["magic", "defensive", "utility"],
        effects: [
            {
                type: "spell_modifier",
                target: "arcane_shield",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },

    // ==========================================================================
    // New Magician Passive Bonuses
    // ==========================================================================
    {
        id: "mana_surge",
        category: "passive",
        name: "Mana Surge",
        description: "+1 Intelligence when casting magic (stacking)",
        icon: "icon_mana_surge",
        iconDescription: "a surging wave of mana energy",
        stackable: false,
        tags: ["offensive", "magic"],
        effects: [
            {
                type: "on_hit",
                trigger: { effect: "add_stat", value: 1, stat: "intelligence" },
                condition: { type: "is_magic_spell" },
            },
        ],
    },
    {
        id: "arcane_reflexes",
        category: "passive",
        name: "Arcane Reflexes",
        description: "20% chance to gain +2 MP when taking damage",
        icon: "icon_arcane_reflexes",
        iconDescription: "quick magical reflex sparkles",
        stackable: false,
        tags: ["defensive", "mobility", "chance"],
        effects: [
            {
                type: "on_damage_taken",
                trigger: { effect: "add_mp", value: 2 },
                condition: { type: "random_chance", value: 20 },
            },
        ],
    },
];
