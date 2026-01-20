/**
 * Spell Bonuses - Modifications to specific spells.
 * These bonuses modify spell properties like damage, range, AP cost, and AoE.
 */

import { BonusDefinition } from "../../core/types";

export const SPELL_BONUSES: BonusDefinition[] = [
    // ==========================================================================
    // Slash (Melee) Upgrades
    // ==========================================================================
    {
        id: "slash_damage",
        category: "spell",
        name: "Sharper Blade",
        description: "Slash: +2 damage",
        icon: "icon_slash",
        stackable: false,
        tags: ["melee", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "damage", value: 2 },
            },
        ],
    },
    {
        id: "slash_cheapen",
        category: "spell",
        name: "Swift Slash",
        description: "Slash: -2 Damage, +1 Range",
        icon: "icon_slash",
        stackable: false,
        tags: ["melee", "utility"],
        effects: [
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "damage", value: -2 },
            },
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "slash_whirlwind",
        category: "spell",
        name: "Whirlwind Slash",
        description: "Slash: Circle AoE (Radius 1), -1 Damage",
        icon: "icon_slash",
        stackable: false,
        tags: ["melee", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "aoeShape", value: "circle" },
            },
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "aoeRadius", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "slash",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "slash_lifesteal",
        category: "spell",
        name: "Bloodthirsty Blade",
        description: "Slash: Heal 1 HP per enemy hit",
        icon: "icon_slash",
        stackable: false,
        tags: ["melee", "sustain"],
        effects: [
            {
                type: "on_hit",
                target: "slash",
                trigger: { effect: "heal", value: 1 },
            },
        ],
    },

    // ==========================================================================
    // Power Strike (Melee) Upgrades
    // ==========================================================================
    {
        id: "power_strike_damage",
        category: "spell",
        name: "Crushing Blow",
        description: "Power Strike: +2 damage",
        icon: "icon_power_strike",
        stackable: false,
        tags: ["melee", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "damage", value: 2 },
            },
        ],
    },
    {
        id: "power_strike_risky",
        category: "spell",
        name: "Risky Power Strike",
        description: "Power Strike: +4 Damage, +1 AP Cost",
        icon: "icon_power_strike",
        stackable: false,
        tags: ["melee", "damage", "risky"],
        effects: [
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "damage", value: 4 },
            },
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "apCost", value: 1 },
            },
        ],
    },
    {
        id: "power_strike_cone",
        category: "spell",
        name: "Sweeping Strike",
        description: "Power Strike: Cone AoE (Radius 2), -1 Damage",
        icon: "icon_power_strike",
        stackable: false,
        tags: ["melee", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "aoeShape", value: "cone" },
            },
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "aoeRadius", value: 2 },
            },
            {
                type: "spell_modifier",
                target: "power_strike",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "execute",
        category: "spell",
        name: "Execute",
        description: "Power Strike: Instant kill enemies below 20% HP",
        icon: "icon_power_strike",
        stackable: false,
        tags: ["melee", "execute"],
        effects: [
            {
                type: "on_hit",
                target: "power_strike",
                trigger: { effect: "damage", value: 9999 },
                condition: { type: "target_health_below", value: 20 },
            },
        ],
    },

    // ==========================================================================
    // Arrow Shot (Ranged) Upgrades
    // ==========================================================================
    {
        id: "arrow_shot_range",
        category: "spell",
        name: "Eagle Eye",
        description: "Arrow Shot: +1 range",
        icon: "icon_arrow_shot",
        stackable: false,
        tags: ["ranged", "range"],
        effects: [
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "arrow_shot_piercing",
        category: "spell",
        name: "Piercing Arrow",
        description: "Arrow Shot: Line AoE (Length 2), -1 Damage",
        icon: "icon_arrow_shot",
        stackable: false,
        tags: ["ranged", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "aoeShape", value: "line" },
            },
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "aoeRadius", value: 2 },
            },
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "arrow_shot_triple",
        category: "spell",
        name: "Triple Shot",
        description: "Arrow Shot: Add cone AoE",
        icon: "icon_arrow_shot",
        stackable: false,
        tags: ["ranged", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "aoeShape", value: "cone" },
            },
            {
                type: "spell_modifier",
                target: "arrow_shot",
                spellModifier: { property: "aoeRadius", value: 3 },
            },
        ],
    },

    // ==========================================================================
    // Bone Piercer (Ranged) Upgrades
    // ==========================================================================
    {
        id: "bone_piercer_damage",
        category: "spell",
        name: "Serrated Bone",
        description: "Bone Piercer: +2 damage",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "damage", value: 2 },
            },
        ],
    },
    {
        id: "bone_piercer_splash",
        category: "spell",
        name: "Splintering Bone",
        description: "Bone Piercer: Gains a small circular AoE (Radius 1), -1 Damage",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "aoeShape", value: "circle" },
            },
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "aoeRadius", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "bone_piercer_damage_alt",
        category: "spell",
        name: "Balanced Bone",
        description: "Bone Piercer: +1 Damage, +1 Range",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "utility"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "damage", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "bone_piercer_range",
        category: "spell",
        name: "Bone Sharpshooter",
        description: "Bone Piercer: +1 range",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "range"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "bone_piercer_efficient",
        category: "spell",
        name: "Quick Piercer",
        description: "Bone Piercer: -1 AP Cost",
        icon: "icon_bone_piercer",
        stackable: false,
        tags: ["ranged", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                target: "bone_piercer",
                spellModifier: { property: "apCost", value: -1 },
            },
        ],
    },

    // ==========================================================================
    // Magic Missile (Magic) Upgrades
    // ==========================================================================
    {
        id: "magic_missile_cost",
        category: "spell",
        name: "Efficient Casting",
        description: "Magic Missile: -1 AP cost",
        icon: "icon_magic_missile",
        stackable: false,
        tags: ["magic", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "apCost", value: -1 },
            },
        ],
    },
    {
        id: "magic_missile_scatter",
        category: "spell",
        name: "Scatter Missiles",
        description: "Magic Missile: -1 Damage, -1 AP Cost",
        icon: "icon_magic_missile",
        stackable: false,
        tags: ["magic", "efficiency"],
        effects: [
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "damage", value: -1 },
            },
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "apCost", value: -1 },
            },
        ],
    },
    {
        id: "magic_missile_aoe",
        category: "spell",
        name: "Scattering Missiles",
        description: "Magic Missile: Small AoE (Radius 1), -1 Damage",
        icon: "icon_magic_missile",
        stackable: false,
        tags: ["magic", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "aoeShape", value: "circle" },
            },
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "aoeRadius", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "magic_missile_range",
        category: "spell",
        name: "Extended Missiles",
        description: "Magic Missile: +2 Range",
        icon: "icon_magic_missile",
        stackable: false,
        tags: ["magic", "range"],
        effects: [
            {
                type: "spell_modifier",
                target: "magic_missile",
                spellModifier: { property: "range", value: 2 },
            },
        ],
    },

    // ==========================================================================
    // Fireball (Magic) Upgrades
    // ==========================================================================
    {
        id: "fireball_damage",
        category: "spell",
        name: "Inferno",
        description: "Fireball: +3 damage",
        icon: "icon_fire_ball",
        stackable: false,
        tags: ["magic", "damage"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "damage", value: 3 },
            },
        ],
    },
    {
        id: "fireball_range",
        category: "spell",
        name: "Far Reach",
        description: "Fireball: +1 range",
        icon: "icon_fire_ball",
        stackable: false,
        tags: ["magic", "range"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "range", value: 1 },
            },
        ],
    },
    {
        id: "fireball_aoe_circle",
        category: "spell",
        name: "Explosive Fireball",
        description: "Fireball: Gains a circular AoE (Radius 1), -1 Damage",
        icon: "icon_fire_ball",
        stackable: false,
        tags: ["magic", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "aoeShape", value: "circle" },
            },
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "aoeRadius", value: 1 },
            },
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "fireball_line_aoe",
        category: "spell",
        name: "Fire Line",
        description: "Fireball: Becomes a line AoE (Length 3), -1 Damage",
        icon: "icon_fire_ball",
        stackable: false,
        tags: ["magic", "aoe"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "aoeShape", value: "line" },
            },
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "aoeRadius", value: 3 },
            },
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "damage", value: -1 },
            },
        ],
    },
    {
        id: "efficient_aoe_fireball",
        category: "spell",
        name: "Efficient AoE (Fireball)",
        description: "Fireball: If AoE, -1 AP Cost",
        icon: "icon_fire_ball",
        stackable: false,
        tags: ["magic", "efficiency", "conditional"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "apCost", value: -1 },
                condition: { type: "has_aoe", targetSpell: "fireball" },
            },
        ],
    },
    {
        id: "fireball_unstable",
        category: "spell",
        name: "Unstable Fireball",
        description: "Fireball: +4 Damage, -1 Range",
        icon: "icon_fire_ball",
        stackable: false,
        tags: ["magic", "damage", "risky"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "damage", value: 4 },
            },
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "range", value: -1 },
            },
        ],
    },
    {
        id: "fireball_bigger_aoe",
        category: "spell",
        name: "Mega Fireball",
        description: "Fireball: +1 AoE Radius",
        icon: "icon_fire_ball",
        stackable: false,
        tags: ["magic", "aoe", "conditional"],
        effects: [
            {
                type: "spell_modifier",
                target: "fireball",
                spellModifier: { property: "aoeRadius", value: 1 },
                condition: { type: "has_aoe", targetSpell: "fireball" },
            },
        ],
    },
];
