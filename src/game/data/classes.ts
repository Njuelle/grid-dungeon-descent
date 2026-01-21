/**
 * Player Class Definitions - All playable classes in the game.
 * This is a data-only file with no game logic.
 */

import { ClassDefinition, PlayerClass, UnitStats } from "../core/types";

// =============================================================================
// Base Stats by Class
// =============================================================================

const WARRIOR_BASE_STATS: UnitStats = {
    health: 12,
    maxHealth: 12,
    moveRange: 3,
    attackRange: 1,
    movementPoints: 3,
    maxMovementPoints: 3,
    actionPoints: 3,
    maxActionPoints: 3,
    force: 4,
    dexterity: 2,
    intelligence: 1,
    armor: 2,
    magicResistance: 1,
};

const RANGER_BASE_STATS: UnitStats = {
    health: 9,
    maxHealth: 9,
    moveRange: 5,
    attackRange: 3,
    movementPoints: 5,
    maxMovementPoints: 5,
    actionPoints: 3,
    maxActionPoints: 3,
    force: 2,
    dexterity: 4,
    intelligence: 2,
    armor: 1,
    magicResistance: 1,
};

const MAGICIAN_BASE_STATS: UnitStats = {
    health: 8,
    maxHealth: 8,
    moveRange: 4,
    attackRange: 4,
    movementPoints: 4,
    maxMovementPoints: 4,
    actionPoints: 4,
    maxActionPoints: 4,
    force: 1,
    dexterity: 2,
    intelligence: 4,
    armor: 0,
    magicResistance: 3,
};

// =============================================================================
// Class Definitions
// =============================================================================

export const WARRIOR_CLASS: ClassDefinition = {
    id: "warrior",
    name: "Warrior",
    description: "A mighty fighter skilled in close combat. High health and armor make the warrior a durable frontline champion.",
    spriteKey: "hero_warrior",
    baseStats: WARRIOR_BASE_STATS,
    startingSpellIds: ["slash", "shield_bash", "battle_cry"],
};

export const RANGER_CLASS: ClassDefinition = {
    id: "ranger",
    name: "Ranger",
    description: "A swift hunter who strikes from afar. Exceptional mobility and precision make the ranger a deadly marksman.",
    spriteKey: "hero_ranger",
    baseStats: RANGER_BASE_STATS,
    startingSpellIds: ["arrow_shot", "piercing_arrow", "hunters_mark"],
};

export const MAGICIAN_CLASS: ClassDefinition = {
    id: "magician",
    name: "Magician",
    description: "A master of arcane arts. Powerful spells and magical defenses make the magician a formidable spellcaster.",
    spriteKey: "hero_magician",
    baseStats: MAGICIAN_BASE_STATS,
    startingSpellIds: ["arcane_bolt", "magic_missile", "arcane_shield"],
};

// =============================================================================
// Class Registry
// =============================================================================

/**
 * All available player classes.
 */
export const PLAYER_CLASSES: ClassDefinition[] = [
    WARRIOR_CLASS,
    RANGER_CLASS,
    MAGICIAN_CLASS,
];

/**
 * Map of class ID to class definition for O(1) lookup.
 */
export const CLASS_REGISTRY: Map<PlayerClass, ClassDefinition> = new Map(
    PLAYER_CLASSES.map((cls) => [cls.id, cls])
);

// =============================================================================
// Lookup Functions
// =============================================================================

/**
 * Get a class definition by ID.
 */
export function getClassById(id: PlayerClass): ClassDefinition | undefined {
    return CLASS_REGISTRY.get(id);
}

/**
 * Get all class IDs.
 */
export function getAllClassIds(): PlayerClass[] {
    return PLAYER_CLASSES.map((cls) => cls.id);
}

/**
 * Check if a class exists.
 */
export function classExists(id: PlayerClass): boolean {
    return CLASS_REGISTRY.has(id);
}
