/**
 * Basic Spells - Core class foundations
 * These are the fundamental spells that each class starts with and can be learned/upgraded.
 * They represent the basic combat capabilities of each class archetype.
 */

import { Spell } from "../../classes/Spell";

export const BASIC_SPELLS: Spell[] = [
    // ===== MELEE BASICS =====

    {
        id: "slash",
        name: "Slash",
        icon: "icon_slash",
        apCost: 1,
        range: 1,
        damage: 3,
        description: "Basic melee attack",
        type: "melee",
    },
    {
        id: "power_strike",
        name: "Power Strike",
        icon: "icon_power_strike",
        apCost: 2,
        range: 1,
        damage: 5,
        description: "Powerful melee attack",
        type: "melee",
    },

    // ===== RANGED BASICS =====

    {
        id: "arrow_shot",
        name: "Arrow Shot",
        icon: "icon_arrow_shot",
        apCost: 1,
        range: 3,
        minRange: 2,
        damage: 2,
        description: "Basic ranged attack",
        type: "ranged",
    },
    {
        id: "bone_piercer",
        name: "Bone Piercer",
        icon: "icon_bone_piercer",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 3,
        description: "Fires a sharp bone that pierces foes",
        type: "ranged",
    },

    // ===== MAGIC BASICS =====

    {
        id: "magic_missile",
        name: "Magic Missile",
        icon: "icon_magic_missile",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 4,
        description: "Magical ranged attack",
        type: "magic",
    },
    {
        id: "fireball",
        name: "Fireball",
        icon: "icon_fire_ball",
        apCost: 3,
        range: 3,
        minRange: 2,
        damage: 6,
        description: "Powerful fire spell",
        type: "magic",
    },

    // ===== NOTE =====
    // Class-specific spells are now defined in their dedicated files:
    // - WarriorSpells.ts for warrior spells
    // - RangerSpells.ts for ranger spells
    // - MageSpells.ts for mage spells
];

