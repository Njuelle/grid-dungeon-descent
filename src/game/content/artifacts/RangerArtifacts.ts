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
        spellId: "precise_shot",
    },
    {
        id: "quiver_of_plenty",
        name: "Quiver of Plenty",
        description: "A magical quiver that creates explosive arrows",
        icon: "icon_bone_piercer",
        classId: "ranger",
        rarity: "rare",
        spellId: "explosive_arrow",
    },
    {
        id: "hunters_mark",
        name: "Hunter's Mark Pendant",
        description: "A mystical pendant that marks prey for the hunt",
        icon: "icon_arrow_shot",
        classId: "ranger",
        rarity: "rare",
        spellId: "mark_target",
    },

    // ===== MOBILITY & STEALTH ARTIFACTS =====

    {
        id: "shadow_cloak",
        name: "Shadow Cloak",
        description: "A cloak that grants the power of shadow teleportation",
        icon: "icon_arrow_shot",
        classId: "ranger",
        rarity: "epic",
        spellId: "shadow_step",
    },
    {
        id: "boots_of_wind",
        name: "Boots of Swift Wind",
        description: "Enchanted boots that grant incredible speed and agility",
        icon: "icon_bone_piercer",
        classId: "ranger",
        rarity: "rare",
        spellId: "wind_dash",
    },

    // ===== LEGENDARY ARTIFACTS =====

    {
        id: "beast_companion_charm",
        name: "Beast Companion Charm",
        description: "A druidic charm that summons a loyal wolf companion",
        icon: "icon_bone_piercer",
        classId: "ranger",
        rarity: "legendary",
        spellId: "summon_wolf",
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
        spellId: "piercing_sight",
    },
    {
        id: "trap_kit_pouch",
        name: "Ranger's Trap Kit",
        description: "A leather pouch containing magical traps and snares",
        icon: "icon_bone_piercer",
        classId: "ranger",
        rarity: "rare",
        spellId: "place_trap",
    },
    {
        id: "forest_blessing",
        name: "Forest Spirit's Blessing",
        description: "A wooden amulet that channels nature's healing power",
        icon: "icon_arrow_shot",
        classId: "ranger",
        rarity: "rare",
        spellId: "natures_gift",
    },
    {
        id: "camouflage_cloak",
        name: "Cloak of Perfect Camouflage",
        description: "A special cloak that bends light for perfect concealment",
        icon: "icon_bone_piercer",
        classId: "ranger",
        rarity: "epic",
        spellId: "vanish",
    },
];

