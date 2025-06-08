/**
 * Utility Spells - Cross-class and special purpose abilities
 * These spells provide universal utility, special mechanics, and abilities
 * that can be used by any class or serve special purposes in the game.
 */

import { Spell } from "../../classes/Spell";

export const UTILITY_SPELLS: Spell[] = [
    // ===== UNIVERSAL BASIC SPELLS =====

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

    // ===== SPECIAL UTILITY SPELLS =====

    {
        id: "meditation",
        name: "Meditation",
        icon: "icon_magic_missile",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Recover 1 AP and gain mental clarity",
        type: "magic",
        effect: "restore_ap",
    },
    {
        id: "emergency_heal",
        name: "Emergency Heal",
        icon: "icon_magic_missile",
        apCost: 3,
        range: 0,
        damage: -8,
        description: "Powerful emergency healing that can be used by any class",
        type: "magic",
        effect: "emergency_heal",
    },
    {
        id: "tactical_retreat",
        name: "Tactical Retreat",
        icon: "icon_arrow_shot",
        apCost: 1,
        range: 0,
        damage: 0,
        description: "Gain +2 movement points for this turn",
        type: "ranged",
        effect: "extra_movement",
    },
    {
        id: "second_wind",
        name: "Second Wind",
        icon: "icon_power_strike",
        apCost: 2,
        range: 0,
        damage: 0,
        description: "Remove all negative effects and gain temporary boost",
        type: "melee",
        effect: "cleanse_buff",
        duration: 2,
    },

    // ===== DEBUG & TESTING SPELLS =====

    {
        id: "debug_teleport",
        name: "Debug Teleport",
        icon: "icon_magic_missile",
        apCost: 0,
        range: 10,
        damage: 0,
        description: "Development spell for testing movement",
        type: "magic",
        effect: "debug_teleport",
    },
    {
        id: "debug_damage",
        name: "Debug Damage",
        icon: "icon_fire_ball",
        apCost: 0,
        range: 10,
        damage: 999,
        description: "Development spell for testing damage",
        type: "magic",
        effect: "debug_damage",
    },
];
