/**
 * Special Bonuses - Unique mechanics and conditional effects
 * These bonuses implement complex behavior that can't be expressed as simple stat modifications
 */

import { Bonus } from "../../classes/Bonus";

export const SPECIAL_BONUSES: Bonus[] = [
    // ===== COMBAT MECHANICS =====

    {
        id: "critical_striker",
        name: "Critical Striker",
        description: "10% chance for attacks to deal double damage",
        icon: "⚔️",
        type: "stat",
        effects: [{ stat: "force", value: 0 }], // Marker effect
    },
    {
        id: "vampiric_strikes",
        name: "Vampiric Strikes",
        description: "Melee attacks heal 1 HP on hit",
        icon: "🩸",
        type: "stat",
        effects: [{ stat: "health", value: 0 }], // Marker effect
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
        id: "double_tap",
        name: "Double Tap",
        description: "Ranged attacks have 20% chance to attack twice",
        icon: "🏹",
        type: "stat",
        effects: [{ stat: "dexterity", value: 0 }], // Marker effect
    },
    {
        id: "guerrilla_tactics",
        name: "Guerrilla Tactics",
        description: "+2 damage when attacking from max range",
        icon: "🎯",
        type: "stat",
        effects: [{ stat: "dexterity", value: 0 }], // Marker effect
    },

    // ===== MAGIC MECHANICS =====

    {
        id: "mana_burn",
        name: "Mana Burn",
        description: "Magic attacks reduce enemy AP by 1",
        icon: "🔥",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }], // Marker effect
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
        id: "spell_thief",
        name: "Spell Thief",
        description: "Gain 1 AP when killing with magic",
        icon: "🎭",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }], // Marker effect
    },
    {
        id: "mage_armor",
        name: "Mage Armor",
        description: "Intelligence also adds to Armor (50% rate)",
        icon: "🧙",
        type: "stat",
        effects: [{ stat: "intelligence", value: 0 }], // Marker effect
    },

    // ===== DEFENSIVE MECHANICS =====

    {
        id: "adaptive_armor",
        name: "Adaptive Armor",
        description: "+1 Armor/Magic Resistance based on last damage taken",
        icon: "🛡️",
        type: "stat",
        effects: [{ stat: "armor", value: 0 }], // Marker effect
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
        id: "fortified_position",
        name: "Fortified Position",
        description: "+3 Armor when you don't move for a turn",
        icon: "🏰",
        type: "stat",
        effects: [{ stat: "armor", value: 0 }], // Marker effect
    },

    // ===== CONDITIONAL STAT BONUSES =====

    {
        id: "last_stand",
        name: "Last Stand",
        description: "+2 to all combat stats when below 25% HP",
        icon: "🛡️",
        type: "stat",
        effects: [{ stat: "health", value: 0 }], // Marker effect
    },
    {
        id: "power_through_pain",
        name: "Power Through Pain",
        description: "+1 Force for each missing HP (max +3)",
        icon: "💪",
        type: "stat",
        effects: [{ stat: "force", value: 0 }], // Marker effect
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
        id: "giant_slayer",
        name: "Giant Slayer",
        description: "+3 damage vs enemies with more max HP than you",
        icon: "🗡️",
        type: "stat",
        effects: [{ stat: "force", value: 0 }], // Marker effect
    },

    // ===== MOVEMENT MECHANICS =====

    {
        id: "momentum",
        name: "Momentum",
        description: "+1 Movement after defeating an enemy",
        icon: "💨",
        type: "stat",
        effects: [{ stat: "movementPoints", value: 0 }], // Marker effect
    },
    {
        id: "tactical_retreat",
        name: "Tactical Retreat",
        description: "+2 Movement after taking damage",
        icon: "🏃",
        type: "stat",
        effects: [{ stat: "movementPoints", value: 0 }], // Marker effect
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
        id: "shadow_step",
        name: "Shadow Step",
        description: "First movement each turn costs 0 MP",
        icon: "👤",
        type: "stat",
        effects: [{ stat: "movementPoints", value: 0 }], // Marker effect
    },

    // ===== HEALING & REGENERATION =====

    {
        id: "combat_medic",
        name: "Combat Medic",
        description: "Heal 2 HP at the start of each turn",
        icon: "🏥",
        type: "stat",
        effects: [{ stat: "health", value: 0 }], // Marker effect
    },

    // ===== INTIMIDATION & AURA EFFECTS =====

    {
        id: "intimidating_presence",
        name: "Intimidating Presence",
        description: "Adjacent enemies have -1 to all combat stats",
        icon: "😈",
        type: "stat",
        effects: [{ stat: "force", value: 0 }], // Marker effect
    },

    // ===== RESURRECTION & SURVIVAL =====

    {
        id: "phoenix_blessing",
        name: "Phoenix Blessing",
        description: "Revive once per battle with 50% HP",
        icon: "🔥",
        type: "stat",
        effects: [{ stat: "health", value: 0 }], // Marker effect
    },

    // ===== RESOURCE MANAGEMENT =====

    {
        id: "blood_magic",
        name: "Blood Magic",
        description: "Can cast spells using HP when out of AP (2 HP = 1 AP)",
        icon: "🩸",
        type: "stat",
        effects: [{ stat: "health", value: 0 }], // Marker effect
    },
    {
        id: "adrenaline_rush",
        name: "Adrenaline Rush",
        description: "+2 AP on first turn of battle",
        icon: "💉",
        type: "stat",
        effects: [{ stat: "actionPoints", value: 0 }], // Marker effect
    },

    // ===== BALANCE & META MECHANICS =====

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
