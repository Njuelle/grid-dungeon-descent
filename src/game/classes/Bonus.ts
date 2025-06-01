export interface Bonus {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: "stat" | "spell";
    target?: string; // For spell upgrades, the spell id
    effects: Array<{
        stat?:
            | "health"
            | "force"
            | "dexterity"
            | "intelligence"
            | "armor"
            | "magicResistance"
            | "movementPoints"
            | "actionPoints";
        value?: number;
        spellProperty?:
            | "damage"
            | "range"
            | "apCost"
            | "aoeShape"
            | "aoeRadius";
        spellValue?: number | string; // string for aoeShape, number for others
        condition?: { requiresAoe?: boolean };
    }>;
}

export const AVAILABLE_BONUSES: Bonus[] = [
    // Stat bonuses
    {
        id: "health_boost",
        name: "Vitality",
        description: "+2 Max Health",
        icon: "❤️",
        type: "stat",
        effects: [
            {
                stat: "health",
                value: 2,
            },
        ],
    },
    {
        id: "force_boost",
        name: "Strength",
        description: "+1 Force",
        icon: "💪",
        type: "stat",
        effects: [
            {
                stat: "force",
                value: 1,
            },
        ],
    },
    {
        id: "dexterity_boost",
        name: "Precision",
        description: "+1 Dexterity",
        icon: "🎯",
        type: "stat",
        effects: [
            {
                stat: "dexterity",
                value: 1,
            },
        ],
    },
    {
        id: "armor_boost",
        name: "Toughness",
        description: "+1 Armor",
        icon: "🛡️",
        type: "stat",
        effects: [
            {
                stat: "armor",
                value: 1,
            },
        ],
    },
    {
        id: "magic_resistance_boost",
        name: "Mystic Ward",
        description: "+1 Magic Resistance",
        icon: "✨",
        type: "stat",
        effects: [
            {
                stat: "magicResistance",
                value: 1,
            },
        ],
    },
    {
        id: "movement_boost",
        name: "Swiftness",
        description: "+1 Movement Point",
        icon: "👟",
        type: "stat",
        effects: [
            {
                stat: "movementPoints",
                value: 1,
            },
        ],
    },
    {
        id: "action_boost",
        name: "Energy",
        description: "+1 Action Point",
        icon: "⚡",
        type: "stat",
        effects: [
            {
                stat: "actionPoints",
                value: 1,
            },
        ],
    },
    // Spell upgrades
    {
        id: "slash_damage",
        name: "Sharper Blade",
        description: "Slash: +2 damage",
        icon: "icon_slash",
        type: "spell",
        target: "slash",
        effects: [
            {
                spellProperty: "damage",
                spellValue: 2,
            },
        ],
    },
    {
        id: "power_strike_damage",
        name: "Crushing Blow",
        description: "Power Strike: +2 damage",
        icon: "icon_power_strike",
        type: "spell",
        target: "power_strike",
        effects: [
            {
                spellProperty: "damage",
                spellValue: 2,
            },
        ],
    },
    {
        id: "arrow_shot_range",
        name: "Eagle Eye",
        description: "Arrow Shot: +1 range",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "arrow_shot",
        effects: [
            {
                spellProperty: "range",
                spellValue: 1,
            },
        ],
    },
    {
        id: "magic_missile_cost",
        name: "Efficient Casting",
        description: "Magic Missile: -1 AP cost",
        icon: "icon_magic_missile",
        type: "spell",
        target: "magic_missile",
        effects: [
            {
                spellProperty: "apCost",
                spellValue: -1,
            },
        ],
    },
    {
        id: "fireball_damage",
        name: "Inferno",
        description: "Fireball: +3 damage",
        icon: "icon_fire_ball",
        type: "spell",
        target: "fireball",
        effects: [
            {
                spellProperty: "damage",
                spellValue: 3,
            },
        ],
    },
    {
        id: "fireball_range",
        name: "Far Reach",
        description: "Fireball: +1 range",
        icon: "icon_fire_ball",
        type: "spell",
        target: "fireball",
        effects: [
            {
                spellProperty: "range",
                spellValue: 1,
            },
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
            {
                spellProperty: "aoeShape",
                spellValue: "circle",
            },
            {
                spellProperty: "aoeRadius",
                spellValue: 1,
            },
            {
                spellProperty: "damage",
                spellValue: -1,
            },
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
            {
                spellProperty: "aoeShape",
                spellValue: "line",
            },
            {
                spellProperty: "aoeRadius",
                spellValue: 3,
            },
            {
                spellProperty: "damage",
                spellValue: -1,
            },
        ],
    },
    {
        id: "bone_piercer_damage",
        name: "Serrated Bone",
        description: "Bone Piercer: +2 damage",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [
            {
                spellProperty: "damage",
                spellValue: 2,
            },
        ],
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
            {
                spellProperty: "aoeShape",
                spellValue: "circle",
            },
            {
                spellProperty: "aoeRadius",
                spellValue: 1,
            },
            {
                spellProperty: "damage",
                spellValue: -1,
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
        id: "glass_cannon_force",
        name: "Glass Cannon (Force)",
        description: "+3 Force, -1 Armor",
        icon: "💥",
        type: "stat",
        effects: [
            { stat: "force", value: 3 },
            { stat: "armor", value: -1 },
        ],
    },
    {
        id: "glass_cannon_dex",
        name: "Glass Cannon (Dex)",
        description: "+3 Dexterity, -1 Armor",
        icon: "🎯",
        type: "stat",
        effects: [
            { stat: "dexterity", value: 3 },
            { stat: "armor", value: -1 },
        ],
    },
    {
        id: "reckless_charge",
        name: "Reckless Charge",
        description: "+2 Movement, -1 Armor",
        icon: "🌪️",
        type: "stat",
        effects: [
            { stat: "movementPoints", value: 2 },
            { stat: "armor", value: -1 },
        ],
    },
    {
        id: "berserkers_stance",
        name: "Berserker's Stance",
        description: "+2 Force, -1 Dexterity",
        icon: "😡",
        type: "stat",
        effects: [
            { stat: "force", value: 2 },
            { stat: "dexterity", value: -1 },
        ],
    },
    {
        id: "evasive_maneuvers",
        name: "Evasive Maneuvers",
        description: "+2 Dexterity, -1 Force",
        icon: "🤸",
        type: "stat",
        effects: [
            { stat: "dexterity", value: 2 },
            { stat: "force", value: -1 },
        ],
    },
    {
        id: "iron_will",
        name: "Iron Will",
        description: "+3 Max Health, -1 Movement Point",
        icon: "🧘",
        type: "stat",
        effects: [
            { stat: "health", value: 3 },
            { stat: "movementPoints", value: -1 },
        ],
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
        id: "bone_piercer_damage_alt",
        name: "Balanced Bone",
        description: "Bone Piercer: +1 Damage, +1 Range",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [
            {
                spellProperty: "damage",
                spellValue: 1,
            },
            {
                spellProperty: "range",
                spellValue: 1,
            },
        ],
    },
    {
        id: "bone_piercer_range",
        name: "Bone Sharpshooter",
        description: "Bone Piercer: +1 range",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [
            {
                spellProperty: "range",
                spellValue: 1,
            },
        ],
    },
    {
        id: "intelligence_boost",
        name: "Arcane Mind",
        description: "+1 Intelligence",
        icon: "🧠",
        type: "stat",
        effects: [
            {
                stat: "intelligence",
                value: 1,
            },
        ],
    },
    {
        id: "scholar_build",
        name: "Scholar's Focus",
        description: "+2 Intelligence, -1 Force",
        icon: "📚",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 2 },
            { stat: "force", value: -1 },
        ],
    },
    {
        id: "battle_mage",
        name: "Battle Mage",
        description: "+1 Intelligence, +1 Armor",
        icon: "🔮",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 1 },
            { stat: "armor", value: 1 },
        ],
    },
    {
        id: "mystic_armor",
        name: "Mystic Armor",
        description: "+1 Intelligence, +1 Magic Resistance",
        icon: "🌟",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 1 },
            { stat: "magicResistance", value: 1 },
        ],
    },
    {
        id: "glass_cannon_int",
        name: "Glass Cannon (Int)",
        description: "+3 Intelligence, -1 Armor",
        icon: "💎",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 3 },
            { stat: "armor", value: -1 },
        ],
    },
    {
        id: "magic_missile_aoe",
        name: "Scattering Missiles",
        description: "Magic Missile: Small AoE (Radius 1), -1 Damage",
        icon: "icon_magic_missile",
        type: "spell",
        target: "magic_missile",
        effects: [
            {
                spellProperty: "aoeShape",
                spellValue: "circle",
            },
            {
                spellProperty: "aoeRadius",
                spellValue: 1,
            },
            {
                spellProperty: "damage",
                spellValue: -1,
            },
        ],
    },
    {
        id: "arrow_shot_piercing",
        name: "Piercing Arrow",
        description: "Arrow Shot: Line AoE (Length 2), -1 Damage",
        icon: "icon_arrow_shot",
        type: "spell",
        target: "arrow_shot",
        effects: [
            {
                spellProperty: "aoeShape",
                spellValue: "line",
            },
            {
                spellProperty: "aoeRadius",
                spellValue: 2,
            },
            {
                spellProperty: "damage",
                spellValue: -1,
            },
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
            {
                spellProperty: "aoeShape",
                spellValue: "circle",
            },
            {
                spellProperty: "aoeRadius",
                spellValue: 1,
            },
            {
                spellProperty: "damage",
                spellValue: -1,
            },
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
        id: "bone_piercer_efficient",
        name: "Quick Piercer",
        description: "Bone Piercer: -1 AP Cost",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [
            {
                spellProperty: "apCost",
                spellValue: -1,
            },
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
            {
                spellProperty: "aoeShape",
                spellValue: "cone",
            },
            {
                spellProperty: "aoeRadius",
                spellValue: 2,
            },
            {
                spellProperty: "damage",
                spellValue: -1,
            },
        ],
    },
    {
        id: "mystic_endurance",
        name: "Mystic Endurance",
        description: "+2 Intelligence, +1 Movement",
        icon: "✨",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 2 },
            { stat: "movementPoints", value: 1 },
        ],
    },
    {
        id: "arcane_battery",
        name: "Arcane Battery",
        description: "+2 Action Points, -1 Movement",
        icon: "🔋",
        type: "stat",
        effects: [
            { stat: "actionPoints", value: 2 },
            { stat: "movementPoints", value: -1 },
        ],
    },
    {
        id: "balanced_warrior",
        name: "Balanced Warrior",
        description: "+1 Force, +1 Dexterity, +1 Intelligence",
        icon: "⚖️",
        type: "stat",
        effects: [
            { stat: "force", value: 1 },
            { stat: "dexterity", value: 1 },
            { stat: "intelligence", value: 1 },
        ],
    },
    {
        id: "tank_build",
        name: "Fortress",
        description: "+2 Armor, +2 Health, -2 Movement",
        icon: "🏰",
        type: "stat",
        effects: [
            { stat: "armor", value: 2 },
            { stat: "health", value: 2 },
            { stat: "movementPoints", value: -2 },
        ],
    },
    {
        id: "magic_missile_range",
        name: "Extended Missiles",
        description: "Magic Missile: +2 Range",
        icon: "icon_magic_missile",
        type: "spell",
        target: "magic_missile",
        effects: [
            {
                spellProperty: "range",
                spellValue: 2,
            },
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
            {
                spellProperty: "aoeShape",
                spellValue: "cone",
            },
            {
                spellProperty: "aoeRadius",
                spellValue: 3,
            },
        ],
    },
    {
        id: "frenzied_warrior",
        name: "Frenzied Warrior",
        description: "+2 Force, +1 AP, -2 Armor",
        icon: "💀",
        type: "stat",
        effects: [
            { stat: "force", value: 2 },
            { stat: "actionPoints", value: 1 },
            { stat: "armor", value: -2 },
        ],
    },
    {
        id: "quick_reflexes",
        name: "Quick Reflexes",
        description: "+2 Dexterity, +1 Movement",
        icon: "⚡",
        type: "stat",
        effects: [
            { stat: "dexterity", value: 2 },
            { stat: "movementPoints", value: 1 },
        ],
    },
    {
        id: "defensive_stance",
        name: "Defensive Stance",
        description: "+3 Armor, -1 AP",
        icon: "🛡️",
        type: "stat",
        effects: [
            { stat: "armor", value: 3 },
            { stat: "actionPoints", value: -1 },
        ],
    },
    {
        id: "anti_magic_shield",
        name: "Anti-Magic Shield",
        description: "+3 Magic Resistance, -1 Movement",
        icon: "🔮",
        type: "stat",
        effects: [
            { stat: "magicResistance", value: 3 },
            { stat: "movementPoints", value: -1 },
        ],
    },
    {
        id: "balanced_defense",
        name: "Balanced Defense",
        description: "+1 Armor, +1 Magic Resistance",
        icon: "⚖️",
        type: "stat",
        effects: [
            { stat: "armor", value: 1 },
            { stat: "magicResistance", value: 1 },
        ],
    },
    {
        id: "mobility_master",
        name: "Mobility Master",
        description: "+3 Movement, -1 Force, -1 Dexterity",
        icon: "🏃‍♂️",
        type: "stat",
        effects: [
            { stat: "movementPoints", value: 3 },
            { stat: "force", value: -1 },
            { stat: "dexterity", value: -1 },
        ],
    },
    {
        id: "spell_sniper",
        name: "Spell Sniper",
        description: "All ranged/magic spells: +1 Range",
        icon: "🎯",
        type: "stat",
        effects: [{ stat: "dexterity", value: 0 }],
    },
    {
        id: "magic_mastery",
        name: "Magic Mastery",
        description: "All magic spells: -1 AP Cost (min 1)",
        icon: "🎭",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }],
    },
    {
        id: "tactical_retreat",
        name: "Tactical Retreat",
        description: "+2 Movement after taking damage",
        icon: "🏃",
        type: "stat",
        effects: [{ stat: "movementPoints", value: 0 }],
    },
    {
        id: "vampiric_strikes",
        name: "Vampiric Strikes",
        description: "Melee attacks heal 1 HP on hit",
        icon: "🩸",
        type: "stat",
        effects: [{ stat: "health", value: 0 }],
    },
    {
        id: "power_through_pain",
        name: "Power Through Pain",
        description: "+1 Force for each missing HP (max +3)",
        icon: "💪",
        type: "stat",
        effects: [{ stat: "force", value: 0 }],
    },
    {
        id: "glass_aoe",
        name: "Explosive Glass",
        description: "All AoE +1 radius, -2 Armor",
        icon: "💥",
        type: "stat",
        effects: [
            { stat: "armor", value: -2 },
            { stat: "force", value: 0 },
        ],
    },
    {
        id: "slash_lifesteal",
        name: "Bloodthirsty Blade",
        description: "Slash: Heal 1 HP per enemy hit",
        icon: "icon_slash",
        type: "spell",
        target: "slash",
        effects: [{ spellProperty: "damage", spellValue: 0 }],
    },
    // New bonuses added
    {
        id: "critical_striker",
        name: "Critical Striker",
        description: "10% chance for attacks to deal double damage",
        icon: "⚔️",
        type: "stat",
        effects: [{ stat: "force", value: 0 }], // Marker effect
    },
    {
        id: "last_stand",
        name: "Last Stand",
        description: "+2 to all combat stats when below 25% HP",
        icon: "🛡️",
        type: "stat",
        effects: [{ stat: "health", value: 0 }], // Marker effect
    },
    {
        id: "momentum",
        name: "Momentum",
        description: "+1 Movement after defeating an enemy",
        icon: "💨",
        type: "stat",
        effects: [{ stat: "movementPoints", value: 0 }], // Marker effect
    },
    {
        id: "mana_burn",
        name: "Mana Burn",
        description: "Magic attacks reduce enemy AP by 1",
        icon: "🔥",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }], // Marker effect
    },
    {
        id: "thorns",
        name: "Thorns",
        description: "Melee attackers take 1 damage",
        icon: "🌹",
        type: "stat",
        effects: [{ stat: "armor", value: 0 }], // Marker effect
    },
    {
        id: "spell_echo",
        name: "Spell Echo",
        description: "25% chance to not consume AP on magic spells",
        icon: "🔄",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }], // Marker effect
    },
    {
        id: "adaptive_armor",
        name: "Adaptive Armor",
        description: "+1 Armor/Magic Resistance based on last damage taken",
        icon: "🛡️",
        type: "stat",
        effects: [{ stat: "armor", value: 0 }], // Marker effect
    },
    {
        id: "blood_magic",
        name: "Blood Magic",
        description: "Can cast spells using HP when out of AP (2 HP = 1 AP)",
        icon: "🩸",
        type: "stat",
        effects: [{ stat: "health", value: 0 }], // Marker effect
    },
    {
        id: "guerrilla_tactics",
        name: "Guerrilla Tactics",
        description: "+2 damage when attacking from max range",
        icon: "🎯",
        type: "stat",
        effects: [{ stat: "dexterity", value: 0 }], // Marker effect
    },
    {
        id: "intimidating_presence",
        name: "Intimidating Presence",
        description: "Adjacent enemies have -1 to all combat stats",
        icon: "😈",
        type: "stat",
        effects: [{ stat: "force", value: 0 }], // Marker effect
    },
    {
        id: "phoenix_blessing",
        name: "Phoenix Blessing",
        description: "Revive once per battle with 50% HP",
        icon: "🔥",
        type: "stat",
        effects: [{ stat: "health", value: 0 }], // Marker effect
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
    {
        id: "chain_lightning",
        name: "Chain Lightning",
        description: "Magic Missile: Jumps to nearest enemy within 2 tiles",
        icon: "icon_magic_missile",
        type: "spell",
        target: "magic_missile",
        effects: [{ spellProperty: "damage", spellValue: 0 }], // Marker effect
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
    {
        id: "bone_prison",
        name: "Bone Prison",
        description: "Bone Piercer: Roots target for 1 turn, -2 damage",
        icon: "icon_bone_piercer",
        type: "spell",
        target: "bone_piercer",
        effects: [{ spellProperty: "damage", spellValue: -2 }],
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
    {
        id: "spell_thief",
        name: "Spell Thief",
        description: "Gain 1 AP when killing with magic",
        icon: "🎭",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }], // Marker effect
    },
    {
        id: "combat_medic",
        name: "Combat Medic",
        description: "Heal 2 HP at the start of each turn",
        icon: "🏥",
        type: "stat",
        effects: [{ stat: "health", value: 0 }], // Marker effect
    },
    {
        id: "overload",
        name: "Overload",
        description: "+1 to all spell damage, spells cost 1 more AP",
        icon: "⚡",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }], // Marker effect for now
    },
    {
        id: "shadow_step",
        name: "Shadow Step",
        description: "First movement each turn costs 0 MP",
        icon: "👤",
        type: "stat",
        effects: [{ stat: "movementPoints", value: 0 }], // Marker effect
    },
    {
        id: "elemental_affinity",
        name: "Elemental Affinity",
        description: "+2 Intelligence, +2 Magic Resistance, -2 Force",
        icon: "🌊",
        type: "stat",
        effects: [
            { stat: "intelligence", value: 2 },
            { stat: "magicResistance", value: 2 },
            { stat: "force", value: -2 },
        ],
    },
    {
        id: "giant_slayer",
        name: "Giant Slayer",
        description: "+3 damage vs enemies with more max HP than you",
        icon: "🗡️",
        type: "stat",
        effects: [{ stat: "force", value: 0 }], // Marker effect
    },
    {
        id: "nimble_fighter",
        name: "Nimble Fighter",
        description: "+1 Movement after dodging an attack (25% chance)",
        icon: "🤸",
        type: "stat",
        effects: [{ stat: "dexterity", value: 0 }], // Marker effect
    },
    {
        id: "spell_shield",
        name: "Spell Shield",
        description: "Block first magic attack each battle",
        icon: "🛡️",
        type: "stat",
        effects: [{ stat: "magicResistance", value: 0 }], // Marker effect
    },
    {
        id: "berserker_rage",
        name: "Berserker Rage",
        description: "+1 Force per enemy defeated (max +5)",
        icon: "💀",
        type: "stat",
        effects: [{ stat: "force", value: 0 }], // Marker effect
    },
    {
        id: "mage_armor",
        name: "Mage Armor",
        description: "Intelligence also adds to Armor (50% rate)",
        icon: "🧙",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }], // Marker effect
    },
    {
        id: "double_tap",
        name: "Double Tap",
        description: "Ranged attacks have 20% chance to attack twice",
        icon: "🏹",
        type: "stat",
        effects: [{ stat: "dexterity", value: 0 }], // Marker effect
    },
    {
        id: "fortified_position",
        name: "Fortified Position",
        description: "+3 Armor when you don't move for a turn",
        icon: "🏰",
        type: "stat",
        effects: [{ stat: "armor", value: 0 }], // Marker effect
    },
    {
        id: "adrenaline_rush",
        name: "Adrenaline Rush",
        description: "+2 AP on first turn of battle",
        icon: "💉",
        type: "stat",
        effects: [{ stat: "actionPoints", value: 0 }], // Marker effect
    },
    {
        id: "perfect_balance",
        name: "Perfect Balance",
        description: "All stats minimum 3 (raises low stats)",
        icon: "⚖️",
        type: "stat",
        effects: [{ stat: "force", value: 0 }], // Marker effect
    },
    {
        id: "gamblers_luck",
        name: "Gambler's Luck",
        description: "Can reroll bonus choices once per victory",
        icon: "🎲",
        type: "stat",
        effects: [{ stat: "force", value: 0 }], // Marker effect
    },
];

// Helper function to check if a bonus would reduce a spell's AP cost below the minimum
function wouldReduceAPBelowMinimum(
    bonus: Bonus,
    excludedBonusIds: string[] = []
): boolean {
    // Base AP costs for all spells
    const SPELL_BASE_COSTS: Record<string, number> = {
        slash: 1,
        arrow_shot: 1,
        power_strike: 2,
        bone_piercer: 2,
        magic_missile: 2,
        fireball: 3,
    };

    // Check if this bonus reduces AP cost
    const hasAPReduction = bonus.effects.some(
        (effect) =>
            effect.spellProperty === "apCost" &&
            typeof effect.spellValue === "number" &&
            effect.spellValue < 0
    );

    if (!hasAPReduction || !bonus.target) {
        return false;
    }

    // Check if the target spell would go below 1 AP
    const baseAPCost = SPELL_BASE_COSTS[bonus.target];
    if (baseAPCost === undefined) {
        return false; // Unknown spell, allow the bonus
    }

    // Calculate current AP cost by considering already applied bonuses
    let currentAPCost = baseAPCost;

    // Find all previously applied AP reduction bonuses for this spell
    const appliedAPReductions = AVAILABLE_BONUSES.filter(
        (b) =>
            excludedBonusIds.includes(b.id) &&
            b.target === bonus.target &&
            b.effects.some(
                (effect) =>
                    effect.spellProperty === "apCost" &&
                    typeof effect.spellValue === "number" &&
                    effect.spellValue < 0
            )
    );

    // Apply all previous AP reductions
    for (const appliedBonus of appliedAPReductions) {
        for (const effect of appliedBonus.effects) {
            if (
                effect.spellProperty === "apCost" &&
                typeof effect.spellValue === "number"
            ) {
                currentAPCost = Math.max(1, currentAPCost + effect.spellValue);
            }
        }
    }

    // Check if applying this new bonus would reduce below 1 AP
    const apReduction = bonus.effects
        .filter(
            (effect) =>
                effect.spellProperty === "apCost" &&
                typeof effect.spellValue === "number"
        )
        .reduce((total, effect) => total + (effect.spellValue as number), 0);

    const newAPCost = Math.max(1, currentAPCost + apReduction);

    // If the new cost would be 1 and we're trying to reduce further, it's problematic
    // (The Math.max(1, ...) prevents it from going to 0, but we should exclude the bonus entirely)
    return currentAPCost === 1 && apReduction < 0;
}

// Helper function to check if a bonus requires AoE but the target spell doesn't have it
function requiresAoeButMissing(
    bonus: Bonus,
    excludedBonusIds: string[] = []
): boolean {
    // Check if this bonus has any effects with requiresAoe condition
    const hasAoeRequirement = bonus.effects.some(
        (effect) => effect.condition?.requiresAoe === true
    );

    if (!hasAoeRequirement || !bonus.target) {
        return false; // No AoE requirement or no target spell
    }

    // Check if the target spell currently has AoE based on previously applied bonuses
    // Look for any applied bonuses that add AoE to this spell
    const appliedAoeBonuses = AVAILABLE_BONUSES.filter(
        (b) =>
            excludedBonusIds.includes(b.id) &&
            b.target === bonus.target &&
            b.effects.some(
                (effect) =>
                    effect.spellProperty === "aoeShape" ||
                    effect.spellProperty === "aoeRadius"
            )
    );

    // If no AoE bonuses have been applied to this spell, then it doesn't have AoE
    // and bonuses requiring AoE should be excluded
    return appliedAoeBonuses.length === 0;
}

// Helper function to check if a player has any AoE spells
function playerHasAoeSpells(appliedBonusIds: string[] = []): boolean {
    // Check if any applied bonuses add AoE to spells
    const aoeAddingBonuses = AVAILABLE_BONUSES.filter(
        (b) =>
            appliedBonusIds.includes(b.id) &&
            b.effects.some(
                (effect) =>
                    effect.spellProperty === "aoeShape" &&
                    effect.spellValue !== undefined
            )
    );

    return aoeAddingBonuses.length > 0;
}

// Helper function to check if a specific spell has AoE
function spellHasAoe(spellId: string, appliedBonusIds: string[] = []): boolean {
    // Check if any applied bonuses add AoE to this specific spell
    const aoeAddingBonuses = AVAILABLE_BONUSES.filter(
        (b) =>
            appliedBonusIds.includes(b.id) &&
            b.target === spellId &&
            b.effects.some(
                (effect) =>
                    effect.spellProperty === "aoeShape" &&
                    effect.spellValue !== undefined
            )
    );

    return aoeAddingBonuses.length > 0;
}

// Helper function to check if a bonus should be excluded based on AoE relevance
function isAoeBonusIrrelevant(
    bonus: Bonus,
    appliedBonusIds: string[] = []
): boolean {
    // Check if this bonus increases AoE radius
    const increasesAoeRadius = bonus.effects.some(
        (effect) =>
            effect.spellProperty === "aoeRadius" &&
            typeof effect.spellValue === "number" &&
            effect.spellValue > 0 &&
            !effect.condition?.requiresAoe // We already handle requiresAoe separately
    );

    if (increasesAoeRadius && bonus.target) {
        // Check if the target spell has AoE
        return !spellHasAoe(bonus.target, appliedBonusIds);
    }

    // Check if this is the glass_aoe bonus
    if (bonus.id === "glass_aoe") {
        // Only include glass_aoe if player has at least one AoE spell
        return !playerHasAoeSpells(appliedBonusIds);
    }

    return false;
}

export function getRandomBonuses(
    count: number,
    exclude: string[] = []
): Bonus[] {
    // Filter out bonuses with incomplete implementations (empty effects or only placeholder comments)
    const incompleteBonus: string[] = [
        // Bonuses requiring complex systems not yet implemented
        "chain_lightning", // Requires multi-target spell system
        "arrow_storm", // Requires multi-target spell system
        "meteor_strike", // Requires delayed damage system
        "bone_prison", // Requires status effect/root system
        "blood_magic", // Requires alternative resource system
        "intimidating_presence", // Requires aura/proximity effect system
        "mana_burn", // Requires enemy resource manipulation
        "phoenix_blessing", // Requires death/revival system
    ];

    // First, get all bonuses that pass the various filters
    const allValidBonuses = AVAILABLE_BONUSES.filter(
        (b) =>
            !incompleteBonus.includes(b.id) &&
            b.effects.length > 0 && // Ensure it has actual effects
            !wouldReduceAPBelowMinimum(b, exclude) && // Exclude AP reduction bonuses that would break spells
            !requiresAoeButMissing(b, exclude) && // Exclude AoE requirement bonuses for spells without AoE
            !isAoeBonusIrrelevant(b, exclude) // Exclude AoE bonuses that aren't relevant
    );

    // Separate bonuses into those already picked and those not
    const alreadyPicked = allValidBonuses.filter((b) => exclude.includes(b.id));
    const notPicked = allValidBonuses.filter((b) => !exclude.includes(b.id));

    // For already picked bonuses, only include stat bonuses (not spell bonuses)
    // and reduce their probability of appearing
    const reducedProbabilityBonuses = alreadyPicked
        .filter((b) => b.type === "stat") // Only allow stat bonuses to be picked multiple times
        .filter(() => Math.random() < 0.4); // 40% chance to include each already-picked stat bonus

    // Combine available bonuses: all not-picked bonuses + reduced probability already-picked stat bonuses
    const available = [...notPicked, ...reducedProbabilityBonuses];

    // Shuffle and return
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, available.length));
}

