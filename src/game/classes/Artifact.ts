import { Spell } from "./Spell";

export interface Artifact {
    id: string;
    name: string;
    description: string;
    icon: string;
    classId: string; // Which class this artifact is for
    spell: Spell; // The spell this artifact grants
    rarity: "common" | "rare" | "epic" | "legendary";
}

// Warrior Artifacts
const WARRIOR_ARTIFACTS: Artifact[] = [
    {
        id: "berserker_axe",
        name: "Berserker's Axe",
        description:
            "A bloodthirsty weapon that grants a devastating whirlwind attack",
        icon: "icon_power_strike", // Using existing icon as placeholder
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
        id: "shield_of_valor",
        name: "Shield of Valor",
        description:
            "A protective shield that allows devastating charge attacks",
        icon: "icon_slash", // Using existing icon as placeholder
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
];

// Ranger Artifacts
const RANGER_ARTIFACTS: Artifact[] = [
    {
        id: "hunters_bow",
        name: "Hunter's Longbow",
        description: "An elven bow that never misses its mark",
        icon: "icon_arrow_shot",
        classId: "ranger",
        rarity: "rare",
        spell: {
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
    },
    {
        id: "quiver_of_plenty",
        name: "Quiver of Plenty",
        description: "A magical quiver that creates explosive arrows",
        icon: "icon_bone_piercer",
        classId: "ranger",
        rarity: "rare",
        spell: {
            id: "explosive_arrow",
            name: "Explosive Arrow",
            icon: "icon_bone_piercer",
            apCost: 3,
            range: 4,
            minRange: 2,
            damage: 3,
            description:
                "Arrow that explodes on impact, damaging nearby enemies",
            type: "ranged",
            aoeShape: "circle",
            aoeRadius: 1,
        },
    },
    {
        id: "shadow_cloak",
        name: "Shadow Cloak",
        description: "A cloak that grants the power of shadow teleportation",
        icon: "icon_arrow_shot",
        classId: "ranger",
        rarity: "epic",
        spell: {
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
    },
    {
        id: "boots_of_wind",
        name: "Boots of Swift Wind",
        description: "Enchanted boots that grant incredible speed and agility",
        icon: "icon_bone_piercer",
        classId: "ranger",
        rarity: "rare",
        spell: {
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
    },
    {
        id: "hunters_mark",
        name: "Hunter's Mark Pendant",
        description: "A mystical pendant that marks prey for the hunt",
        icon: "icon_arrow_shot",
        classId: "ranger",
        rarity: "rare",
        spell: {
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
    },
    {
        id: "beast_companion_charm",
        name: "Beast Companion Charm",
        description: "A druidic charm that summons a loyal wolf companion",
        icon: "icon_bone_piercer",
        classId: "ranger",
        rarity: "legendary",
        spell: {
            id: "summon_wolf",
            name: "Summon Wolf",
            icon: "icon_bone_piercer",
            apCost: 3,
            range: 2,
            damage: 0,
            description:
                "Summon a wolf ally that fights alongside you for 3 turns",
            type: "ranged",
            effect: "summon_ally",
            duration: 3,
        },
    },
];

// Mage Artifacts
const MAGE_ARTIFACTS: Artifact[] = [
    {
        id: "staff_of_frost",
        name: "Staff of Eternal Frost",
        description: "A crystalline staff that commands ice and cold",
        icon: "icon_magic_missile",
        classId: "mage",
        rarity: "rare",
        spell: {
            id: "ice_shard",
            name: "Ice Shard",
            icon: "icon_magic_missile",
            apCost: 2,
            range: 4,
            minRange: 1,
            damage: 3,
            description: "Ice projectile that slows enemies",
            type: "magic",
            effect: "slow",
            duration: 2,
        },
    },
    {
        id: "orb_of_lightning",
        name: "Orb of Lightning",
        description: "A crackling orb that channels the power of storms",
        icon: "icon_fire_ball",
        classId: "mage",
        rarity: "rare",
        spell: {
            id: "chain_lightning",
            name: "Chain Lightning",
            icon: "icon_fire_ball",
            apCost: 3,
            range: 3,
            minRange: 1,
            damage: 4,
            description: "Lightning that jumps between enemies",
            type: "magic",
            aoeShape: "line",
            aoeRadius: 2,
        },
    },
    {
        id: "tome_of_healing",
        name: "Tome of Divine Healing",
        description: "An ancient book containing powerful healing magic",
        icon: "icon_magic_missile",
        classId: "mage",
        rarity: "epic",
        spell: {
            id: "heal",
            name: "Heal",
            icon: "icon_magic_missile",
            apCost: 2,
            range: 0,
            damage: -6, // Negative damage = healing
            description: "Restore health to yourself",
            type: "magic",
            effect: "heal_self",
        },
    },
    {
        id: "crystal_of_barriers",
        name: "Crystal of Arcane Barriers",
        description: "A protective crystal that creates magical shields",
        icon: "icon_fire_ball",
        classId: "mage",
        rarity: "rare",
        spell: {
            id: "magic_shield",
            name: "Magic Shield",
            icon: "icon_fire_ball",
            apCost: 2,
            range: 0,
            damage: 0,
            description:
                "Create a barrier that absorbs the next 8 points of damage",
            type: "magic",
            effect: "shield",
            duration: 5,
        },
    },
    {
        id: "wand_of_illusion",
        name: "Wand of Mind Control",
        description: "A twisted wand that bends the will of enemies",
        icon: "icon_magic_missile",
        classId: "mage",
        rarity: "rare",
        spell: {
            id: "mind_control",
            name: "Mind Control",
            icon: "icon_magic_missile",
            apCost: 3,
            range: 3,
            damage: 0,
            description:
                "Control an enemy, making them attack their allies for 2 turns",
            type: "magic",
            effect: "charm",
            duration: 2,
        },
    },
    {
        id: "sphere_of_elements",
        name: "Sphere of Elemental Chaos",
        description: "A swirling orb containing the fury of all elements",
        icon: "icon_fire_ball",
        classId: "mage",
        rarity: "legendary",
        spell: {
            id: "elemental_blast",
            name: "Elemental Blast",
            icon: "icon_fire_ball",
            apCost: 4,
            range: 4,
            minRange: 1,
            damage: 6,
            description:
                "Devastating blast that randomly applies fire, ice, or lightning effects",
            type: "magic",
            aoeShape: "circle",
            aoeRadius: 1,
            effect: "random_elemental",
        },
    },
];

export const ALL_ARTIFACTS: Artifact[] = [
    ...WARRIOR_ARTIFACTS,
    ...RANGER_ARTIFACTS,
    ...MAGE_ARTIFACTS,
];

export function getArtifactsForClass(classId: string): Artifact[] {
    return ALL_ARTIFACTS.filter((artifact) => artifact.classId === classId);
}

export function getRandomArtifacts(classId: string, count: number): Artifact[] {
    const classArtifacts = getArtifactsForClass(classId);
    const shuffled = [...classArtifacts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

