/**
 * Warrior Artifacts - Melee combat and physical prowess focused artifacts
 * These artifacts provide spells and abilities that emphasize close-quarters combat,
 * physical strength, and warrior-style tactics.
 */

import { Artifact } from "../../classes/Artifact";

export const WARRIOR_ARTIFACTS: Artifact[] = [
    // ===== OFFENSIVE MELEE ARTIFACTS =====

    {
        id: "berserker_axe",
        name: "Berserker's Axe",
        description:
            "A bloodthirsty weapon that grants a devastating whirlwind attack",
        icon: "icon_power_strike",
        classId: "warrior",
        rarity: "rare",
        spell: {
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
    },
    {
        id: "bloodlust_blade",
        name: "Bloodlust Blade",
        description: "A cursed sword that grows stronger with each kill",
        icon: "icon_power_strike",
        classId: "warrior",
        rarity: "epic",
        spell: {
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
    },
    {
        id: "gauntlets_of_might",
        name: "Gauntlets of Might",
        description:
            "Iron gauntlets that deliver crushing blows that stun enemies",
        icon: "icon_power_strike",
        classId: "warrior",
        rarity: "rare",
        spell: {
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
    },

    // ===== DEFENSIVE & UTILITY ARTIFACTS =====

    {
        id: "shield_of_valor",
        name: "Shield of Valor",
        description:
            "A protective shield that allows devastating charge attacks",
        icon: "icon_slash",
        classId: "warrior",
        rarity: "rare",
        spell: {
            id: "shield_bash",
            name: "Shield Bash",
            icon: "icon_slash",
            apCost: 2,
            range: 2,
            damage: 3,
            description:
                "Charge forward and bash enemies, can move through them",
            type: "melee",
        },
    },
    {
        id: "helm_of_intimidation",
        name: "Helm of Intimidation",
        description:
            "A fearsome helmet that strikes terror into enemies' hearts",
        icon: "icon_slash",
        classId: "warrior",
        rarity: "rare",
        spell: {
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
    },

    // ===== LEGENDARY ARTIFACTS =====

    {
        id: "belt_of_titan",
        name: "Belt of the Titan",
        description:
            "A legendary belt that grants the power to shake the earth",
        icon: "icon_power_strike",
        classId: "warrior",
        rarity: "legendary",
        spell: {
            id: "earthquake",
            name: "Earthquake",
            icon: "icon_power_strike",
            apCost: 4,
            range: 0,
            damage: 3,
            description:
                "Slam the ground, damaging all enemies on the battlefield",
            type: "melee",
            aoeShape: "circle",
            aoeRadius: 10, // Hits entire battlefield
            effect: "knockdown",
        },
    },

    // ===== ADDITIONAL WARRIOR ARTIFACTS =====

    {
        id: "crown_of_warlord",
        name: "Crown of the Warlord",
        description:
            "A commanding crown that rallies allies and strikes fear into foes",
        icon: "icon_slash",
        classId: "warrior",
        rarity: "epic",
        spell: {
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
    },
    {
        id: "bracers_of_fury",
        name: "Bracers of Unstoppable Fury",
        description: "Ancient bracers that grant berserker rage in battle",
        icon: "icon_power_strike",
        classId: "warrior",
        rarity: "rare",
        spell: {
            id: "berserker_rage",
            name: "Berserker Rage",
            icon: "icon_power_strike",
            apCost: 1,
            range: 0,
            damage: 0,
            description:
                "Enter rage: +2 damage, +1 AP, take +1 damage for 3 turns",
            type: "melee",
            effect: "berserker_mode",
            duration: 3,
        },
    },
    {
        id: "boots_of_charging",
        name: "Boots of the Charging Bull",
        description: "Heavy boots that allow devastating charge attacks",
        icon: "icon_slash",
        classId: "warrior",
        rarity: "rare",
        spell: {
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
    },
];
