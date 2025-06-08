/**
 * Mage Spells - Magic and elemental mastery
 * These spells emphasize magical power, elemental control, arcane knowledge,
 * healing, protection, and mystical manipulation of the battlefield.
 */

import { Spell } from "../../classes/Spell";

export const MAGE_SPELLS: Spell[] = [
    // ===== BASIC MAGE ABILITIES =====

    {
        id: "mage_basic_attack",
        name: "Magic Missile",
        icon: "icon_magic_missile",
        apCost: 1,
        range: 3,
        minRange: 1,
        damage: 2,
        description: "Basic magical projectile",
        type: "magic",
    },
    {
        id: "mage_power_attack",
        name: "Fireball",
        icon: "icon_fire_ball",
        apCost: 3,
        range: 3,
        minRange: 2,
        damage: 5,
        description: "Explosive magical attack",
        type: "magic",
        aoeShape: "circle",
        aoeRadius: 1,
    },

    // ===== ELEMENTAL MAGIC =====

    {
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
    {
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
    {
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

    // ===== HEALING & PROTECTION =====

    {
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
    {
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

    // ===== MIND MAGIC & CONTROL =====

    {
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

    // ===== ADDITIONAL MAGE SPELLS =====

    {
        id: "mana_surge",
        name: "Mana Surge",
        icon: "icon_magic_missile",
        apCost: 1,
        range: 0,
        damage: 0,
        description:
            "Gain +3 AP for this turn, all spells cost +1 AP next turn",
        type: "magic",
        effect: "mana_boost_penalty",
        duration: 2,
    },
    {
        id: "starfall",
        name: "Starfall",
        icon: "icon_fire_ball",
        apCost: 3,
        range: 5,
        damage: 2,
        description: "Rain stars from the sky in a large area",
        type: "magic",
        aoeShape: "circle",
        aoeRadius: 2,
        effect: "celestial_damage",
    },
    {
        id: "reveal_weakness",
        name: "Reveal Weakness",
        icon: "icon_magic_missile",
        apCost: 2,
        range: 6,
        damage: 0,
        description:
            "Reveal enemy stats and reduce their armor by 2 for 4 turns",
        type: "magic",
        effect: "analyze_weaken",
        duration: 4,
    },
    {
        id: "void_bolt",
        name: "Void Bolt",
        icon: "icon_fire_ball",
        apCost: 3,
        range: 4,
        damage: 5,
        description: "Dark magic that ignores all resistances and armor",
        type: "magic",
        effect: "true_damage",
    },
    {
        id: "time_stop",
        name: "Time Stop",
        icon: "icon_magic_missile",
        apCost: 4,
        range: 0,
        damage: 0,
        description: "Freeze time for 1 turn, gain an extra turn immediately",
        type: "magic",
        effect: "extra_turn",
    },
    {
        id: "life_drain",
        name: "Life Drain",
        icon: "icon_fire_ball",
        apCost: 3,
        range: 3,
        damage: 4,
        description: "Drain life from target, healing you for damage dealt",
        type: "magic",
        effect: "vampiric_magic",
    },
];
