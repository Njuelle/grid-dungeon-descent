/**
 * Mage Artifacts - Magic and spellcasting focused artifacts
 * These artifacts provide spells and abilities that emphasize magical power,
 * elemental control, arcane knowledge, and mystical effects.
 */

import { Artifact } from "../../classes/Artifact";

export const MAGE_ARTIFACTS: Artifact[] = [
    // ===== ELEMENTAL ARTIFACTS =====

    {
        id: "staff_of_frost",
        name: "Staff of Eternal Frost",
        description: "A crystalline staff that commands ice and cold",
        icon: "icon_magic_missile",
        classId: "mage",
        rarity: "rare",
        spellId: "ice_shard",
    },
    {
        id: "orb_of_lightning",
        name: "Orb of Lightning",
        description: "A crackling orb that channels the power of storms",
        icon: "icon_fire_ball",
        classId: "mage",
        rarity: "rare",
        spellId: "chain_lightning",
    },
    {
        id: "sphere_of_elements",
        name: "Sphere of Elemental Chaos",
        description: "A swirling orb containing the fury of all elements",
        icon: "icon_fire_ball",
        classId: "mage",
        rarity: "legendary",
        spellId: "elemental_blast",
    },

    // ===== UTILITY & SUPPORT ARTIFACTS =====

    {
        id: "tome_of_healing",
        name: "Tome of Divine Healing",
        description: "An ancient book containing powerful healing magic",
        icon: "icon_magic_missile",
        classId: "mage",
        rarity: "epic",
        spellId: "heal",
    },
    {
        id: "crystal_of_barriers",
        name: "Crystal of Arcane Barriers",
        description: "A protective crystal that creates magical shields",
        icon: "icon_fire_ball",
        classId: "mage",
        rarity: "rare",
        spellId: "magic_shield",
    },
    {
        id: "wand_of_illusion",
        name: "Wand of Mind Control",
        description: "A twisted wand that bends the will of enemies",
        icon: "icon_magic_missile",
        classId: "mage",
        rarity: "rare",
        spellId: "mind_control",
    },

    // ===== ADDITIONAL MAGE ARTIFACTS =====

    {
        id: "arcane_focus_crown",
        name: "Crown of Arcane Focus",
        description: "A crystalline crown that amplifies magical energies",
        icon: "icon_magic_missile",
        classId: "mage",
        rarity: "epic",
        spellId: "mana_surge",
    },
    {
        id: "robe_of_stars",
        name: "Starweave Robe",
        description: "A mystical robe woven from starlight and dreams",
        icon: "icon_fire_ball",
        classId: "mage",
        rarity: "rare",
        spellId: "starfall",
    },
    {
        id: "scrying_orb",
        name: "Orb of True Sight",
        description: "A mystical orb that reveals hidden truths and weaknesses",
        icon: "icon_magic_missile",
        classId: "mage",
        rarity: "rare",
        spellId: "reveal_weakness",
    },
    {
        id: "void_gauntlets",
        name: "Gauntlets of the Void",
        description: "Dark gauntlets that channel the power of nothingness",
        icon: "icon_fire_ball",
        classId: "mage",
        rarity: "epic",
        spellId: "void_bolt",
    },
    {
        id: "time_warping_amulet",
        name: "Amulet of Temporal Flux",
        description:
            "An ancient amulet that allows manipulation of time itself",
        icon: "icon_magic_missile",
        classId: "mage",
        rarity: "legendary",
        spellId: "time_stop",
    },
    {
        id: "book_of_shadows",
        name: "Grimoire of Dark Knowledge",
        description: "A forbidden tome containing ancient and terrible spells",
        icon: "icon_fire_ball",
        classId: "mage",
        rarity: "epic",
        spellId: "life_drain",
    },
];

