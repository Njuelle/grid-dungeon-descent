/**
 * Spell Definitions - All player spells in the game.
 * This is a data-only file with no game logic.
 */

import { SpellDefinition } from "../core/types";

/**
 * All player spells available in the game.
 */
export const PLAYER_SPELLS: SpellDefinition[] = [
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
        description: "Fires a sharp bone that pierces foes.",
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
];

/**
 * Get a spell by its ID.
 */
export function getSpellById(id: string): SpellDefinition | undefined {
    return PLAYER_SPELLS.find((spell) => spell.id === id);
}

/**
 * Get all spells of a specific type.
 */
export function getSpellsByType(
    type: "melee" | "ranged" | "magic"
): SpellDefinition[] {
    return PLAYER_SPELLS.filter((spell) => spell.type === type);
}
