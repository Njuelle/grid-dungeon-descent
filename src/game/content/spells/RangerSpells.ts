/**
 * Ranger Spells - Ranged combat and tactical mobility
 * These spells emphasize ranged attacks, mobility, stealth, tactical positioning,
 * and utility abilities that control the battlefield from a distance.
 */

import { Spell } from "../../classes/Spell";

export const RANGER_SPELLS: Spell[] = [
    // ===== BASIC RANGER ABILITIES =====

    {
        id: "ranger_basic_attack",
        name: "Arrow Shot",
        icon: "icon_arrow_shot",
        apCost: 1,
        range: 3,
        minRange: 2,
        damage: 2,
        description: "Basic ranged attack with bow",
        type: "ranged",
    },
    {
        id: "ranger_power_attack",
        name: "Piercing Shot",
        icon: "icon_bone_piercer",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 4,
        description: "Powerful ranged attack that pierces through armor",
        type: "ranged",
    },

    // ===== PRECISION SHOOTING =====

    {
        id: "precise_shot",
        name: "Precise Shot",
        icon: "icon_arrow_shot",
        apCost: 2,
        range: 6,
        minRange: 3,
        damage: 5,
        description: "Long-range shot with increased accuracy and damage",
        type: "ranged",
    },
    {
        id: "explosive_arrow",
        name: "Explosive Arrow",
        icon: "icon_bone_piercer",
        apCost: 3,
        range: 4,
        minRange: 2,
        damage: 3,
        description: "Arrow that explodes on impact, damaging nearby enemies",
        type: "ranged",
        aoeShape: "circle",
        aoeRadius: 1,
    },

    // ===== MOBILITY & STEALTH =====

    {
        id: "shadow_step",
        name: "Shadow Step",
        icon: "icon_arrow_shot",
        apCost: 1,
        range: 4,
        damage: 0,
        description: "Teleport to target location and gain stealth",
        type: "ranged",
        effect: "teleport_stealth",
    },
    {
        id: "wind_dash",
        name: "Wind Dash",
        icon: "icon_bone_piercer",
        apCost: 1,
        range: 3,
        damage: 2,
        description:
            "Dash through enemies, dealing damage and gaining extra movement",
        type: "ranged",
        effect: "dash_movement",
    },

    // ===== TACTICAL ABILITIES =====

    {
        id: "mark_target",
        name: "Mark Target",
        icon: "icon_arrow_shot",
        apCost: 1,
        range: 5,
        damage: 0,
        description:
            "Mark an enemy, making it take 50% more damage from all sources",
        type: "ranged",
        effect: "vulnerability",
        duration: 4,
    },
    {
        id: "summon_wolf",
        name: "Summon Wolf",
        icon: "icon_bone_piercer",
        apCost: 3,
        range: 2,
        damage: 0,
        description: "Summon a wolf ally that fights alongside you for 3 turns",
        type: "ranged",
        effect: "summon_ally",
        duration: 3,
    },

    // ===== ADDITIONAL RANGER SPELLS =====

    {
        id: "piercing_sight",
        name: "Piercing Sight",
        icon: "icon_arrow_shot",
        apCost: 2,
        range: 8,
        damage: 4,
        description:
            "Ignore armor and cover, shot pierces through multiple enemies",
        type: "ranged",
        aoeShape: "line",
        aoeRadius: 8,
        effect: "armor_piercing",
    },
    {
        id: "place_trap",
        name: "Place Trap",
        icon: "icon_bone_piercer",
        apCost: 2,
        range: 2,
        damage: 5,
        description:
            "Place a hidden trap that triggers when an enemy steps on it",
        type: "ranged",
        effect: "trap_delayed",
        duration: 5,
    },
    {
        id: "natures_gift",
        name: "Nature's Gift",
        icon: "icon_arrow_shot",
        apCost: 2,
        range: 0,
        damage: -4, // Negative damage = healing
        description: "Heal yourself and gain temporary nature's protection",
        type: "ranged",
        effect: "heal_nature_armor",
        duration: 3,
    },
    {
        id: "vanish",
        name: "Vanish",
        icon: "icon_bone_piercer",
        apCost: 1,
        range: 0,
        damage: 0,
        description:
            "Become invisible for 2 turns, next attack deals double damage",
        type: "ranged",
        effect: "invisibility_ambush",
        duration: 2,
    },
];
