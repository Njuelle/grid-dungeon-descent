/**
 * Spell Bonuses - Modifications to spell properties and effects
 * These bonuses modify existing spells by changing their damage, range, AP cost, AoE, etc.
 */

import { Bonus } from "../../classes/Bonus";

export const SPELL_BONUSES: Bonus[] = [
    // ===== MELEE SPELL BONUSES =====

    // Slash Modifications
    {
        id: "slash_damage",
        name: "Sharper Blade",
        description: "Slash: +2 damage",
        icon: "icon_slash",
        type: "spell",
        target: "slash",
        effects: [{ spellProperty: "damage", spellValue: 2 }],
    },
    {
        id: "slash_cheapen",
        name: "Swift Slash",
        description: "Slash: -2 Damage, +1 Range",
        icon: "icon_slash",
        type: "spell",
        target: "slash",
        effects: [
            { spellProperty: "damage", spellValue: -2 },
            { spellProperty: "range", spellValue: 1 },
        ],
    },
    {
        id: "slash_whirlwind",
        name: "Whirlwind Slash",
        description: "Slash: Circle AoE (Radius 1), -1 Damage",
        icon: "icon_slash",
        type: "spell",
        target: "slash",
        effects: [
            { spellProperty: "aoeShape", spellValue: "circle" },
            { spellProperty: "aoeRadius", spellValue: 1 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "slash_lifesteal",
        name: "Bloodthirsty Blade",
        description: "Slash: Heal 1 HP per enemy hit",
        icon: "icon_slash",
        type: "spell",
        target: "slash",
        effects: [{ spellProperty: "damage", spellValue: 0 }], // Marker effect
    },

    // Power Strike Modifications
    {
        id: "power_strike_damage",
        name: "Crushing Blow",
        description: "Power Strike: +2 damage",
        icon: "icon_power_strike",
        type: "spell",
        target: "power_strike",
        effects: [{ spellProperty: "damage", spellValue: 2 }],
    },
    {
        id: "power_strike_risky",
        name: "Risky Power Strike",
        description: "Power Strike: +4 Damage, +1 AP Cost",
        icon: "icon_power_strike",
        type: "spell",
        target: "power_strike",
        effects: [
            { spellProperty: "damage", spellValue: 4 },
            { spellProperty: "apCost", spellValue: 1 },
        ],
    },
    {
        id: "power_strike_cone",
        name: "Sweeping Strike",
        description: "Power Strike: Cone AoE (Radius 2), -1 Damage",
        icon: "icon_power_strike",
        type: "spell",
        target: "power_strike",
        effects: [
            { spellProperty: "aoeShape", spellValue: "cone" },
            { spellProperty: "aoeRadius", spellValue: 2 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "execute",
        name: "Execute",
        description: "Power Strike: Instant kill enemies below 20% HP",
        icon: "icon_power_strike",
        type: "spell",
        target: "power_strike",
        effects: [{ spellProperty: "damage", spellValue: 0 }], // Marker effect
    },

    // ===== RANGED SPELL BONUSES =====

    // Arrow Shot Modifications
    {
        id: "arrow_shot_range",
        name: "Eagle Eye",
        description: "Arrow Shot: +1 range",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "arrow_shot",
        effects: [{ spellProperty: "range", spellValue: 1 }],
    },
    {
        id: "arrow_shot_piercing",
        name: "Piercing Arrow",
        description: "Arrow Shot: Line AoE (Length 2), -1 Damage",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "arrow_shot",
        effects: [
            { spellProperty: "aoeShape", spellValue: "line" },
            { spellProperty: "aoeRadius", spellValue: 2 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "arrow_shot_triple",
        name: "Triple Shot",
        description: "Arrow Shot: Add cone AoE",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "arrow_shot",
        effects: [
            { spellProperty: "aoeShape", spellValue: "cone" },
            { spellProperty: "aoeRadius", spellValue: 3 },
        ],
    },
    {
        id: "arrow_storm",
        name: "Arrow Storm",
        description: "Arrow Shot: Fire at all enemies in range, +2 AP cost",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "arrow_shot",
        effects: [
            { spellProperty: "apCost", spellValue: 2 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },

    // Bone Piercer Modifications
    {
        id: "bone_piercer_damage",
        name: "Serrated Bone",
        description: "Bone Piercer: +2 damage",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [{ spellProperty: "damage", spellValue: 2 }],
    },
    {
        id: "bone_piercer_damage_alt",
        name: "Balanced Bone",
        description: "Bone Piercer: +1 Damage, +1 Range",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [
            { spellProperty: "damage", spellValue: 1 },
            { spellProperty: "range", spellValue: 1 },
        ],
    },
    {
        id: "bone_piercer_range",
        name: "Bone Sharpshooter",
        description: "Bone Piercer: +1 range",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [{ spellProperty: "range", spellValue: 1 }],
    },
    {
        id: "bone_piercer_splash",
        name: "Splintering Bone",
        description:
            "Bone Piercer: Gains a small circular AoE (Radius 1), -1 Damage",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [
            { spellProperty: "aoeShape", spellValue: "circle" },
            { spellProperty: "aoeRadius", spellValue: 1 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "bone_piercer_efficient",
        name: "Quick Piercer",
        description: "Bone Piercer: -1 AP Cost",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [{ spellProperty: "apCost", spellValue: -1 }],
    },
    {
        id: "bone_prison",
        name: "Bone Prison",
        description: "Bone Piercer: Roots target for 1 turn, -2 damage",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [{ spellProperty: "damage", spellValue: -2 }],
    },

    // ===== MAGIC SPELL BONUSES =====

    // Magic Missile Modifications
    {
        id: "magic_missile_cost",
        name: "Efficient Casting",
        description: "Magic Missile: -1 AP cost",
        icon: "icon_magic_missile",
        type: "spell",
        target: "magic_missile",
        effects: [{ spellProperty: "apCost", spellValue: -1 }],
    },
    {
        id: "magic_missile_scatter",
        name: "Scatter Missiles",
        description: "Magic Missile: -1 Damage, -1 AP Cost",
        icon: "icon_magic_missile",
        type: "spell",
        target: "magic_missile",
        effects: [
            { spellProperty: "damage", spellValue: -1 },
            { spellProperty: "apCost", spellValue: -1 },
        ],
    },
    {
        id: "magic_missile_range",
        name: "Extended Missiles",
        description: "Magic Missile: +2 Range",
        icon: "icon_magic_missile",
        type: "spell",
        target: "magic_missile",
        effects: [{ spellProperty: "range", spellValue: 2 }],
    },
    {
        id: "magic_missile_aoe",
        name: "Scattering Missiles",
        description: "Magic Missile: Small AoE (Radius 1), -1 Damage",
        icon: "icon_magic_missile",
        type: "spell",
        target: "magic_missile",
        effects: [
            { spellProperty: "aoeShape", spellValue: "circle" },
            { spellProperty: "aoeRadius", spellValue: 1 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "chain_lightning",
        name: "Chain Lightning",
        description: "Magic Missile: Jumps to nearest enemy within 2 tiles",
        icon: "icon_magic_missile",
        type: "spell",
        target: "magic_missile",
        effects: [{ spellProperty: "damage", spellValue: 0 }], // Marker effect
    },

    // Fireball Modifications
    {
        id: "fireball_damage",
        name: "Inferno",
        description: "Fireball: +3 damage",
        icon: "icon_fire_ball",
        type: "spell",
        target: "fireball",
        effects: [{ spellProperty: "damage", spellValue: 3 }],
    },
    {
        id: "fireball_range",
        name: "Far Reach",
        description: "Fireball: +1 range",
        icon: "icon_fire_ball",
        type: "spell",
        target: "fireball",
        effects: [{ spellProperty: "range", spellValue: 1 }],
    },
    {
        id: "fireball_unstable",
        name: "Unstable Fireball",
        description: "Fireball: +4 Damage, -1 Range",
        icon: "icon_fire_ball",
        type: "spell",
        target: "fireball",
        effects: [
            { spellProperty: "damage", spellValue: 4 },
            { spellProperty: "range", spellValue: -1 },
        ],
    },
    {
        id: "fireball_aoe_circle",
        name: "Explosive Fireball",
        description: "Fireball: Gains a circular AoE (Radius 1), -1 Damage",
        icon: "icon_fire_ball",
        type: "spell",
        target: "fireball",
        effects: [
            { spellProperty: "aoeShape", spellValue: "circle" },
            { spellProperty: "aoeRadius", spellValue: 1 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "fireball_line_aoe",
        name: "Fire Line",
        description: "Fireball: Becomes a line AoE (Length 3), -1 Damage",
        icon: "icon_fire_ball",
        type: "spell",
        target: "fireball",
        effects: [
            { spellProperty: "aoeShape", spellValue: "line" },
            { spellProperty: "aoeRadius", spellValue: 3 },
            { spellProperty: "damage", spellValue: -1 },
        ],
    },
    {
        id: "fireball_bigger_aoe",
        name: "Mega Fireball",
        description: "Fireball: +1 AoE Radius",
        icon: "icon_fire_ball",
        type: "spell",
        target: "fireball",
        effects: [
            {
                spellProperty: "aoeRadius",
                spellValue: 1,
                condition: { requiresAoe: true },
            },
        ],
    },
    {
        id: "efficient_aoe_fireball",
        name: "Efficient AoE (Fireball)",
        description: "Fireball: If AoE, -1 AP Cost",
        icon: "icon_fire_ball",
        type: "spell",
        target: "fireball",
        effects: [
            {
                spellProperty: "apCost",
                spellValue: -1,
                condition: { requiresAoe: true },
            },
        ],
    },
    {
        id: "meteor_strike",
        name: "Meteor Strike",
        description: "Fireball: 1 turn delay, +5 damage, visible targeting",
        icon: "icon_fire_ball",
        type: "spell",
        target: "fireball",
        effects: [{ spellProperty: "damage", spellValue: 5 }],
    },

    // ===== UNIVERSAL SPELL BONUSES =====

    // These bonuses that affect multiple spell types or have global effects
    {
        id: "glass_aoe",
        name: "Explosive Glass",
        description: "All AoE +1 radius, -2 Armor",
        icon: "💥",
        type: "stat",
        effects: [
            { stat: "armor", value: -2 },
            { stat: "force", value: 0 }, // Marker for AoE bonus
        ],
    },
    {
        id: "spell_sniper",
        name: "Spell Sniper",
        description: "All ranged/magic spells: +1 Range",
        icon: "🎯",
        type: "stat",
        effects: [{ stat: "dexterity", value: 0 }], // Marker effect
    },
    {
        id: "magic_mastery",
        name: "Magic Mastery",
        description: "All magic spells: -1 AP Cost (min 1)",
        icon: "🎭",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }], // Marker effect
    },
    {
        id: "overload",
        name: "Overload",
        description: "+1 to all spell damage, spells cost 1 more AP",
        icon: "⚡",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }], // Marker effect
    },
];
