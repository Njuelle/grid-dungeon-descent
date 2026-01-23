/**
 * UnitState - Pure TypeScript representation of a unit's state.
 * No Phaser dependencies, suitable for server-side use.
 */

import {
    UnitStats,
    UnitState as UnitStateType,
    GridPosition,
    Team,
    SpellDefinition,
} from "./types";

/**
 * Creates a new unit state object.
 */
export function createUnitState(params: {
    id: string;
    team: Team;
    position: GridPosition;
    stats: UnitStats;
    enemyType?: string;
    currentSpellId?: string;
}): UnitStateType {
    return {
        id: params.id,
        team: params.team,
        position: { ...params.position },
        stats: { ...params.stats },
        hasActed: false,
        hasMovedThisTurn: false,
        enemyType: params.enemyType,
        currentSpellId: params.currentSpellId,
    };
}

/**
 * Creates a copy of a unit state.
 */
export function copyUnitState(state: UnitStateType): UnitStateType {
    return {
        ...state,
        position: { ...state.position },
        stats: { ...state.stats },
    };
}

/**
 * Updates unit position.
 */
export function updateUnitPosition(
    state: UnitStateType,
    newPosition: GridPosition
): UnitStateType {
    return {
        ...state,
        position: { ...newPosition },
        hasMovedThisTurn: true,
    };
}

/**
 * Applies damage to a unit.
 */
export function applyDamage(
    state: UnitStateType,
    damage: number,
    damageType: "physical" | "magic" = "physical"
): UnitStateType {
    const resistance =
        damageType === "magic"
            ? state.stats.magicResistance || 0
            : state.stats.armor;
    
    const actualDamage = Math.max(1, damage - resistance);
    const newHealth = Math.max(0, state.stats.health - actualDamage);

    return {
        ...state,
        stats: {
            ...state.stats,
            health: newHealth,
        },
    };
}

/**
 * Heals a unit.
 */
export function applyHealing(
    state: UnitStateType,
    amount: number
): UnitStateType {
    const newHealth = Math.min(state.stats.maxHealth, state.stats.health + amount);

    return {
        ...state,
        stats: {
            ...state.stats,
            health: newHealth,
        },
    };
}

/**
 * Consumes movement points.
 */
export function consumeMovementPoints(
    state: UnitStateType,
    amount: number
): UnitStateType {
    if (state.stats.movementPoints === undefined) {
        return state;
    }

    return {
        ...state,
        stats: {
            ...state.stats,
            movementPoints: Math.max(0, state.stats.movementPoints - amount),
        },
        hasMovedThisTurn: true,
    };
}

/**
 * Consumes action points.
 */
export function consumeActionPoints(
    state: UnitStateType,
    amount: number
): UnitStateType {
    if (state.stats.actionPoints === undefined) {
        return state;
    }

    return {
        ...state,
        stats: {
            ...state.stats,
            actionPoints: Math.max(0, state.stats.actionPoints - amount),
        },
    };
}

/**
 * Adds movement points (e.g., from bonuses).
 */
export function addMovementPoints(
    state: UnitStateType,
    amount: number
): UnitStateType {
    if (state.stats.movementPoints === undefined || state.stats.maxMovementPoints === undefined) {
        return state;
    }

    return {
        ...state,
        stats: {
            ...state.stats,
            movementPoints: Math.min(
                state.stats.maxMovementPoints,
                state.stats.movementPoints + amount
            ),
        },
    };
}

/**
 * Adds action points (e.g., from bonuses).
 */
export function addActionPoints(
    state: UnitStateType,
    amount: number
): UnitStateType {
    if (state.stats.actionPoints === undefined) {
        return state;
    }

    return {
        ...state,
        stats: {
            ...state.stats,
            actionPoints: state.stats.actionPoints + amount,
        },
    };
}

/**
 * Modifies a stat by a given amount.
 */
export function modifyStat(
    state: UnitStateType,
    stat: keyof UnitStats,
    amount: number
): UnitStateType {
    const currentValue = state.stats[stat];
    if (currentValue === undefined) {
        return state;
    }

    return {
        ...state,
        stats: {
            ...state.stats,
            [stat]: (currentValue as number) + amount,
        },
    };
}

/**
 * Resets turn-based state for a new turn.
 */
export function resetTurnState(state: UnitStateType): UnitStateType {
    return {
        ...state,
        hasActed: false,
        hasMovedThisTurn: false,
        stats: {
            ...state.stats,
            movementPoints: state.stats.maxMovementPoints,
            actionPoints: state.stats.maxActionPoints,
        },
    };
}

/**
 * Marks unit as having acted.
 */
export function markAsActed(state: UnitStateType): UnitStateType {
    return {
        ...state,
        hasActed: true,
    };
}

/**
 * Updates the has acted state based on remaining points (for players).
 */
export function updateHasActed(state: UnitStateType): UnitStateType {
    const hasActed =
        state.stats.movementPoints === 0 && state.stats.actionPoints === 0;

    return {
        ...state,
        hasActed,
    };
}

/**
 * Checks if unit is alive.
 */
export function isAlive(state: UnitStateType): boolean {
    return state.stats.health > 0;
}

/**
 * Checks if unit can move a given distance.
 */
export function canMove(state: UnitStateType, distance: number): boolean {
    return (
        state.stats.movementPoints !== undefined &&
        state.stats.movementPoints >= distance
    );
}

/**
 * Checks if unit can cast a spell.
 */
export function canCastSpell(
    state: UnitStateType,
    spell: SpellDefinition
): boolean {
    return (
        state.stats.actionPoints !== undefined &&
        state.stats.actionPoints >= spell.apCost
    );
}

/**
 * Gets the Manhattan distance between two positions.
 */
export function getDistance(pos1: GridPosition, pos2: GridPosition): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * Checks if a target is in range.
 */
export function isInRange(
    attackerPos: GridPosition,
    targetPos: GridPosition,
    range: number,
    minRange: number = 0
): boolean {
    const distance = getDistance(attackerPos, targetPos);
    return distance >= minRange && distance <= range;
}
