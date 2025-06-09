/**
 * Spell Bonuses - Combat spell enhancements
 * These bonuses modify existing spells to make them more powerful,
 * change their behavior, or add special effects.
 */

import { Bonus } from "../../classes/Bonus";

export const SPELL_BONUSES: Bonus[] = [
    // ===== MELEE SPELL BONUSES =====

    // Warrior Basic Attack (Sword Strike) Modifications
    {
        id: "warrior_basic_attack_range",
        name: "Sword Lunge",
        description: "Sword Strike: +1 range",
        icon: "icon_slash",
        type: "spell",
        target: "warrior_basic_attack",
        effects: [{ spellProperty: "range", spellValue: 1 }],
    },
    {
        id: "warrior_basic_attack_damage",
        name: "Sharp Blade",
        description: "Sword Strike: +2 damage",
        icon: "icon_slash",
        type: "spell",
        target: "warrior_basic_attack",
        effects: [{ spellProperty: "damage", spellValue: 2 }],
    },
    {
        id: "warrior_basic_attack_aoe",
        name: "Cleaving Strike",
        description: "Sword Strike: Hits all adjacent enemies",
        icon: "icon_slash",
        type: "spell",
        target: "warrior_basic_attack",
        effects: [
            { spellProperty: "aoeShape", spellValue: "circle" },
            { spellProperty: "aoeRadius", spellValue: 1 },
        ],
    },
    {
        id: "warrior_basic_attack_cheap",
        name: "Fluid Combat",
        description: "Sword Strike: -1 AP cost (minimum 1)",
        icon: "icon_slash",
        type: "spell",
        target: "warrior_basic_attack",
        effects: [{ spellProperty: "apCost", spellValue: -1 }],
    },

    // Warrior Power Attack (Heavy Blow) Modifications
    {
        id: "warrior_power_attack_damage",
        name: "Devastating Blow",
        description: "Heavy Blow: +3 damage",
        icon: "icon_power_strike",
        type: "spell",
        target: "warrior_power_attack",
        effects: [{ spellProperty: "damage", spellValue: 3 }],
    },
    {
        id: "warrior_power_attack_risky",
        name: "Risky Heavy Blow",
        description: "Heavy Blow: +4 Damage, +1 AP Cost",
        icon: "icon_power_strike",
        type: "spell",
        target: "warrior_power_attack",
        effects: [
            { spellProperty: "damage", spellValue: 4 },
            { spellProperty: "apCost", spellValue: 1 },
        ],
    },
    {
        id: "warrior_power_attack_cone",
        name: "Sweeping Strike",
        description: "Heavy Blow: Cone AoE (Radius 2), -1 Damage",
        icon: "icon_power_strike",
        type: "spell",
        target: "warrior_power_attack",
        effects: [
            { spellProperty: "aoeShape", spellValue: "cone" },
            { spellProperty: "aoeRadius", spellValue: 2 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "execute",
        name: "Execute",
        description: "Heavy Blow: Instant kill enemies below 20% HP",
        icon: "icon_power_strike",
        type: "spell",
        target: "warrior_power_attack",
        effects: [{ spellProperty: "damage", spellValue: 0 }], // Marker effect
    },

    // ===== RANGED SPELL BONUSES =====

    // Ranger Basic Attack (Arrow Shot) Modifications
    {
        id: "ranger_basic_attack_range",
        name: "Eagle Eye",
        description: "Arrow Shot: +1 range",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "ranger_basic_attack",
        effects: [{ spellProperty: "range", spellValue: 1 }],
    },
    {
        id: "ranger_basic_attack_piercing",
        name: "Piercing Arrow",
        description: "Arrow Shot: Line AoE (Length 2), -1 Damage",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "ranger_basic_attack",
        effects: [
            { spellProperty: "aoeShape", spellValue: "line" },
            { spellProperty: "aoeRadius", spellValue: 2 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "ranger_basic_attack_cheap",
        name: "Swift Shot",
        description: "Arrow Shot: -1 AP cost (minimum 1)",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "ranger_basic_attack",
        effects: [{ spellProperty: "apCost", spellValue: -1 }],
    },
    {
        id: "ranger_basic_attack_multi",
        name: "Double Shot",
        description: "Arrow Shot: Fire 2 arrows, +1 AP cost",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "ranger_basic_attack",
        effects: [
            { spellProperty: "damage", spellValue: 1 },
            { spellProperty: "apCost", spellValue: 1 },
        ],
    },

    // Ranger Power Attack (Piercing Shot) Modifications
    {
        id: "ranger_power_attack_damage",
        name: "Bone Crusher",
        description: "Piercing Shot: +2 damage",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "ranger_power_attack",
        effects: [{ spellProperty: "damage", spellValue: 2 }],
    },
    {
        id: "ranger_power_attack_explosive",
        name: "Explosive Shot",
        description: "Piercing Shot: Circle AoE (Radius 1), -1 Damage",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "ranger_power_attack",
        effects: [
            { spellProperty: "aoeShape", spellValue: "circle" },
            { spellProperty: "aoeRadius", spellValue: 1 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "ranger_power_attack_long",
        name: "Sniper Shot",
        description: "Piercing Shot: +2 range, +1 minimum range",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "ranger_power_attack",
        effects: [
            { spellProperty: "range", spellValue: 2 },
            { spellProperty: "minRange", spellValue: 1 },
        ],
    },
    {
        id: "crippling_shot",
        name: "Crippling Shot",
        description: "Piercing Shot: Reduces enemy movement",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "ranger_power_attack",
        effects: [{ spellProperty: "damage", spellValue: 0 }], // Marker effect
    },

    // ===== MAGIC SPELL BONUSES =====

    // Mage Basic Attack (Magic Missile) Modifications
    {
        id: "mage_basic_attack_damage",
        name: "Empowered Missile",
        description: "Magic Missile: +2 damage",
        icon: "icon_magic_missile",
        type: "spell",
        target: "mage_basic_attack",
        effects: [{ spellProperty: "damage", spellValue: 2 }],
    },
    {
        id: "mage_basic_attack_multi",
        name: "Magic Barrage",
        description: "Magic Missile: Fire 3 missiles, +1 AP cost",
        icon: "icon_magic_missile",
        type: "spell",
        target: "mage_basic_attack",
        effects: [
            { spellProperty: "damage", spellValue: 1 },
            { spellProperty: "apCost", spellValue: 1 },
        ],
    },
    {
        id: "mage_basic_attack_seeking",
        name: "Seeking Missile",
        description: "Magic Missile: +2 range, ignores cover",
        icon: "icon_magic_missile",
        type: "spell",
        target: "mage_basic_attack",
        effects: [{ spellProperty: "range", spellValue: 2 }],
    },
    {
        id: "mage_basic_attack_cheap",
        name: "Efficient Casting",
        description: "Magic Missile: -1 AP cost (minimum 1)",
        icon: "icon_magic_missile",
        type: "spell",
        target: "mage_basic_attack",
        effects: [{ spellProperty: "apCost", spellValue: -1 }],
    },

    // Mage Power Attack (Fireball) Modifications
    {
        id: "mage_power_attack_damage",
        name: "Inferno",
        description: "Fireball: +3 damage",
        icon: "icon_fire_ball",
        type: "spell",
        target: "mage_power_attack",
        effects: [{ spellProperty: "damage", spellValue: 3 }],
    },
    {
        id: "mage_power_attack_big",
        name: "Meteor",
        description: "Fireball: +1 AoE radius, +1 AP cost",
        icon: "icon_fire_ball",
        type: "spell",
        target: "mage_power_attack",
        effects: [
            { spellProperty: "aoeRadius", spellValue: 1 },
            { spellProperty: "apCost", spellValue: 1 },
        ],
    },
    {
        id: "mage_power_attack_chain",
        name: "Chain Fireball",
        description: "Fireball: Line AoE, -1 damage",
        icon: "icon_fire_ball",
        type: "spell",
        target: "mage_power_attack",
        effects: [
            { spellProperty: "aoeShape", spellValue: "line" },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "burning_fireball",
        name: "Burning Fireball",
        description: "Fireball: Applies burning effect",
        icon: "icon_fire_ball",
        type: "spell",
        target: "mage_power_attack",
        effects: [{ spellProperty: "damage", spellValue: 0 }], // Marker effect
    },

    // ===== ADVANCED SPELL BONUSES =====
    // These target artifact spells that might be acquired

    {
        id: "whirlwind_extended",
        name: "Extended Whirlwind",
        description: "Whirlwind: +1 AoE radius",
        icon: "icon_power_strike",
        type: "spell",
        target: "whirlwind",
        effects: [{ spellProperty: "aoeRadius", spellValue: 1 }],
    },
    {
        id: "precise_shot_crit",
        name: "Critical Precision",
        description: "Precise Shot: Always critical hit",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "precise_shot",
        effects: [{ spellProperty: "damage", spellValue: 2 }],
    },
    {
        id: "heal_empowered",
        name: "Greater Heal",
        description: "Heal: +3 healing power",
        icon: "icon_magic_missile",
        type: "spell",
        target: "heal",
        effects: [{ spellProperty: "damage", spellValue: -3 }], // More negative = more healing
    },
];

