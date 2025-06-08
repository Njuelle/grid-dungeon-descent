/**
 * Ranger Artifacts - Ranged combat and agility focused artifacts
 * These artifacts provide spells and abilities that emphasize ranged attacks,
 * mobility, stealth, and tactical positioning.
 */

import { Artifact } from "../../classes/Artifact";

export const RANGER_ARTIFACTS: Artifact[] = [
    // ===== PRECISION RANGED ARTIFACTS =====

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

    // ===== MOBILITY & STEALTH ARTIFACTS =====

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

    // ===== LEGENDARY ARTIFACTS =====

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

    // ===== ADDITIONAL RANGER ARTIFACTS =====

    {
        id: "eagle_eye_circlet",
        name: "Circlet of Eagle's Eye",
        description:
            "A mystical circlet that enhances vision and grants perfect aim",
        icon: "icon_arrow_shot",
        classId: "ranger",
        rarity: "epic",
        spell: {
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
    },
    {
        id: "trap_kit_pouch",
        name: "Ranger's Trap Kit",
        description: "A leather pouch containing magical traps and snares",
        icon: "icon_bone_piercer",
        classId: "ranger",
        rarity: "rare",
        spell: {
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
    },
    {
        id: "forest_blessing",
        name: "Forest Spirit's Blessing",
        description: "A wooden amulet that channels nature's healing power",
        icon: "icon_arrow_shot",
        classId: "ranger",
        rarity: "rare",
        spell: {
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
    },
    {
        id: "camouflage_cloak",
        name: "Cloak of Perfect Camouflage",
        description: "A special cloak that bends light for perfect concealment",
        icon: "icon_bone_piercer",
        classId: "ranger",
        rarity: "epic",
        spell: {
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
    },
];
