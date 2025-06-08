/**
 * Warrior Spells - Melee combat and physical prowess
 * These spells emphasize close-quarters combat, powerful strikes, area control,
 * and physical dominance of the battlefield.
 */

import { Spell } from "../../classes/Spell";

export const WARRIOR_SPELLS: Spell[] = [
    // ===== BASIC WARRIOR ABILITIES =====

    {
        id: "warrior_basic_attack",
        name: "Sword Strike",
        icon: "icon_slash",
        apCost: 1,
        range: 1,
        damage: 3,
        description: "Basic melee attack with sword",
        type: "melee",
    },
    {
        id: "warrior_power_attack",
        name: "Heavy Blow",
        icon: "icon_power_strike",
        apCost: 2,
        range: 1,
        damage: 6,
        description: "Powerful melee strike",
        type: "melee",
    },

    // ===== ADVANCED WARRIOR TECHNIQUES =====

    {
        id: "whirlwind",
        name: "Whirlwind",
        icon: "icon_power_strike",
        apCost: 3,
        range: 1,
        damage: 4,
        description: "Spin attack hitting all adjacent enemies",
        type: "melee",
        aoeShape: "circle",
        aoeRadius: 1,
    },
    {
        id: "shield_bash",
        name: "Shield Bash",
        icon: "icon_slash",
        apCost: 2,
        range: 2,
        damage: 3,
        description: "Charge forward and bash enemies, can move through them",
        type: "melee",
    },
    {
        id: "life_steal",
        name: "Life Steal",
        icon: "icon_power_strike",
        apCost: 2,
        range: 1,
        damage: 4,
        description: "Attack that heals you for half the damage dealt",
        type: "melee",
        effect: "life_steal",
    },
    {
        id: "crushing_blow",
        name: "Crushing Blow",
        icon: "icon_power_strike",
        apCost: 3,
        range: 1,
        damage: 5,
        description: "Powerful attack that stuns the target for 1 turn",
        type: "melee",
        effect: "stun",
        duration: 1,
    },

    // ===== AREA CONTROL & INTIMIDATION =====

    {
        id: "battle_roar",
        name: "Battle Roar",
        icon: "icon_slash",
        apCost: 2,
        range: 2,
        damage: 1,
        description: "Terrifying roar that weakens all nearby enemies",
        type: "melee",
        aoeShape: "circle",
        aoeRadius: 2,
        effect: "weaken",
        duration: 3,
    },
    {
        id: "earthquake",
        name: "Earthquake",
        icon: "icon_power_strike",
        apCost: 4,
        range: 0,
        damage: 3,
        description: "Slam the ground, damaging all enemies on the battlefield",
        type: "melee",
        aoeShape: "circle",
        aoeRadius: 10,
        effect: "knockdown",
    },

    // ===== ADDITIONAL WARRIOR SPELLS =====

    {
        id: "commanding_presence",
        name: "Commanding Presence",
        icon: "icon_slash",
        apCost: 2,
        range: 0,
        damage: 0,
        description:
            "Boost your stats and intimidate nearby enemies for 3 turns",
        type: "melee",
        aoeShape: "circle",
        aoeRadius: 3,
        effect: "rally_intimidate",
        duration: 3,
    },
    {
        id: "berserker_rage",
        name: "Berserker Rage",
        icon: "icon_power_strike",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Enter rage: +2 damage, +1 AP, take +1 damage for 3 turns",
        type: "melee",
        effect: "berserker_mode",
        duration: 3,
    },
    {
        id: "charge_attack",
        name: "Charge Attack",
        icon: "icon_slash",
        apCost: 2,
        range: 3,
        damage: 4,
        description:
            "Rush forward and strike with momentum (+1 damage per tile moved)",
        type: "melee",
        effect: "charge_momentum",
    },
];
