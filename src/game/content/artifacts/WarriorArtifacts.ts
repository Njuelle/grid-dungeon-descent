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
        spellId: "whirlwind",
    },
    {
        id: "bloodlust_blade",
        name: "Bloodlust Blade",
        description: "A cursed sword that grows stronger with each kill",
        icon: "icon_power_strike",
        classId: "warrior",
        rarity: "epic",
        spellId: "life_steal",
    },
    {
        id: "gauntlets_of_might",
        name: "Gauntlets of Might",
        description:
            "Iron gauntlets that deliver crushing blows that stun enemies",
        icon: "icon_power_strike",
        classId: "warrior",
        rarity: "rare",
        spellId: "crushing_blow",
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
        spellId: "shield_bash",
    },
    {
        id: "helm_of_intimidation",
        name: "Helm of Intimidation",
        description:
            "A fearsome helmet that strikes terror into enemies' hearts",
        icon: "icon_slash",
        classId: "warrior",
        rarity: "rare",
        spellId: "battle_roar",
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
        spellId: "earthquake",
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
        spellId: "commanding_presence",
    },
    {
        id: "bracers_of_fury",
        name: "Bracers of Unstoppable Fury",
        description: "Ancient bracers that grant berserker rage in battle",
        icon: "icon_power_strike",
        classId: "warrior",
        rarity: "rare",
        spellId: "berserker_rage",
    },
    {
        id: "boots_of_charging",
        name: "Boots of the Charging Bull",
        description: "Heavy boots that allow devastating charge attacks",
        icon: "icon_slash",
        classId: "warrior",
        rarity: "rare",
        spellId: "charge_attack",
    },
];

