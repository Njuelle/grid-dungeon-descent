/**
 * GameState - Pure TypeScript representation of the entire game state.
 * No Phaser dependencies, suitable for server-side use.
 * 
 * This module provides functions for creating and manipulating game state
 * in an immutable way (returning new state objects rather than mutating).
 */

import {
    GameStateSnapshot,
    UnitState,
    UnitStats,
    GridPosition,
    Team,
} from "./types";
import {
    copyUnitState,
    resetTurnState,
    isAlive,
    applyDamage,
    applyHealing,
    consumeMovementPoints,
    consumeActionPoints,
    addMovementPoints,
    addActionPoints,
    updateUnitPosition,
    markAsActed,
    modifyStat,
} from "./UnitState";

// =============================================================================
// State Creation
// =============================================================================

/**
 * Creates an initial game state.
 */
export function createGameState(params: {
    units: UnitState[];
    appliedBonuses: string[];
    wins: number;
}): GameStateSnapshot {
    return {
        turn: 1,
        currentTeam: "player",
        units: params.units.map(copyUnitState),
        appliedBonuses: [...params.appliedBonuses],
        wins: params.wins,
        isGameOver: false,
        isVictory: false,
    };
}

/**
 * Creates a copy of the game state.
 */
export function copyGameState(state: GameStateSnapshot): GameStateSnapshot {
    return {
        ...state,
        units: state.units.map(copyUnitState),
        appliedBonuses: [...state.appliedBonuses],
    };
}

// =============================================================================
// Unit Queries
// =============================================================================

/**
 * Gets a unit by ID.
 */
export function getUnitById(
    state: GameStateSnapshot,
    unitId: string
): UnitState | undefined {
    return state.units.find((u) => u.id === unitId);
}

/**
 * Gets the player unit.
 */
export function getPlayer(state: GameStateSnapshot): UnitState | undefined {
    return state.units.find((u) => u.team === "player");
}

/**
 * Gets all units of a team.
 */
export function getUnitsByTeam(
    state: GameStateSnapshot,
    team: Team
): UnitState[] {
    return state.units.filter((u) => u.team === team);
}

/**
 * Gets all alive units.
 */
export function getAliveUnits(state: GameStateSnapshot): UnitState[] {
    return state.units.filter(isAlive);
}

/**
 * Gets all alive units of a team.
 */
export function getAliveUnitsByTeam(
    state: GameStateSnapshot,
    team: Team
): UnitState[] {
    return state.units.filter((u) => u.team === team && isAlive(u));
}

/**
 * Gets a unit at a specific position.
 */
export function getUnitAtPosition(
    state: GameStateSnapshot,
    position: GridPosition
): UnitState | undefined {
    return state.units.find(
        (u) =>
            u.position.x === position.x &&
            u.position.y === position.y &&
            isAlive(u)
    );
}

/**
 * Checks if a position is occupied.
 */
export function isPositionOccupied(
    state: GameStateSnapshot,
    position: GridPosition
): boolean {
    return getUnitAtPosition(state, position) !== undefined;
}

// =============================================================================
// State Mutations (Immutable)
// =============================================================================

/**
 * Updates a unit in the state (immutable).
 */
export function updateUnit(
    state: GameStateSnapshot,
    unitId: string,
    updater: (unit: UnitState) => UnitState
): GameStateSnapshot {
    return {
        ...state,
        units: state.units.map((u) =>
            u.id === unitId ? updater(copyUnitState(u)) : u
        ),
    };
}

/**
 * Removes a unit from the state (when killed).
 */
export function removeUnit(
    state: GameStateSnapshot,
    unitId: string
): GameStateSnapshot {
    return {
        ...state,
        units: state.units.filter((u) => u.id !== unitId),
    };
}

/**
 * Moves a unit to a new position.
 */
export function moveUnit(
    state: GameStateSnapshot,
    unitId: string,
    newPosition: GridPosition,
    movementCost: number
): GameStateSnapshot {
    return updateUnit(state, unitId, (unit) => {
        const movedUnit = updateUnitPosition(unit, newPosition);
        return consumeMovementPoints(movedUnit, movementCost);
    });
}

/**
 * Applies damage to a unit.
 */
export function damageUnit(
    state: GameStateSnapshot,
    unitId: string,
    damage: number,
    damageType: "physical" | "magic" = "physical"
): GameStateSnapshot {
    return updateUnit(state, unitId, (unit) =>
        applyDamage(unit, damage, damageType)
    );
}

/**
 * Heals a unit.
 */
export function healUnit(
    state: GameStateSnapshot,
    unitId: string,
    amount: number
): GameStateSnapshot {
    return updateUnit(state, unitId, (unit) => applyHealing(unit, amount));
}

/**
 * Consumes action points for a unit.
 */
export function useActionPoints(
    state: GameStateSnapshot,
    unitId: string,
    amount: number
): GameStateSnapshot {
    return updateUnit(state, unitId, (unit) =>
        consumeActionPoints(unit, amount)
    );
}

/**
 * Grants movement points to a unit.
 */
export function grantMovementPoints(
    state: GameStateSnapshot,
    unitId: string,
    amount: number
): GameStateSnapshot {
    return updateUnit(state, unitId, (unit) => addMovementPoints(unit, amount));
}

/**
 * Grants action points to a unit.
 */
export function grantActionPoints(
    state: GameStateSnapshot,
    unitId: string,
    amount: number
): GameStateSnapshot {
    return updateUnit(state, unitId, (unit) => addActionPoints(unit, amount));
}

/**
 * Modifies a stat for a unit.
 */
export function modifyUnitStat(
    state: GameStateSnapshot,
    unitId: string,
    stat: keyof UnitStats,
    amount: number
): GameStateSnapshot {
    return updateUnit(state, unitId, (unit) => modifyStat(unit, stat, amount));
}

// =============================================================================
// Turn Management
// =============================================================================

/**
 * Starts a new turn for a team.
 */
export function startTurn(
    state: GameStateSnapshot,
    team: Team
): GameStateSnapshot {
    const newState = {
        ...state,
        currentTeam: team,
        units: state.units.map((u) =>
            u.team === team ? resetTurnState(copyUnitState(u)) : u
        ),
    };

    // Increment turn counter when switching to player
    if (team === "player") {
        return {
            ...newState,
            turn: state.turn + 1,
        };
    }

    return newState;
}

/**
 * Ends the current turn.
 */
export function endTurn(state: GameStateSnapshot): GameStateSnapshot {
    const nextTeam: Team = state.currentTeam === "player" ? "enemy" : "player";
    return startTurn(state, nextTeam);
}

/**
 * Marks a unit as having acted.
 */
export function setUnitActed(
    state: GameStateSnapshot,
    unitId: string
): GameStateSnapshot {
    return updateUnit(state, unitId, markAsActed);
}

// =============================================================================
// Victory/Defeat Checking
// =============================================================================

/**
 * Checks victory conditions and updates game state.
 */
export function checkVictoryConditions(
    state: GameStateSnapshot
): GameStateSnapshot {
    const alivePlayer = getAliveUnitsByTeam(state, "player");
    const aliveEnemies = getAliveUnitsByTeam(state, "enemy");

    // Player defeated
    if (alivePlayer.length === 0) {
        return {
            ...state,
            isGameOver: true,
            isVictory: false,
        };
    }

    // All enemies defeated
    if (aliveEnemies.length === 0) {
        return {
            ...state,
            isGameOver: true,
            isVictory: true,
        };
    }

    return state;
}

/**
 * Checks if the game is over.
 */
export function isGameOver(state: GameStateSnapshot): boolean {
    return state.isGameOver;
}

/**
 * Checks if the player won.
 */
export function isVictory(state: GameStateSnapshot): boolean {
    return state.isGameOver && state.isVictory;
}

/**
 * Checks if the player lost.
 */
export function isDefeat(state: GameStateSnapshot): boolean {
    return state.isGameOver && !state.isVictory;
}

// =============================================================================
// Bonus Management
// =============================================================================

/**
 * Adds a bonus to the applied bonuses list.
 */
export function addBonus(
    state: GameStateSnapshot,
    bonusId: string
): GameStateSnapshot {
    if (state.appliedBonuses.includes(bonusId)) {
        return state; // Already applied (for non-stackable bonuses this is a no-op)
    }

    return {
        ...state,
        appliedBonuses: [...state.appliedBonuses, bonusId],
    };
}

/**
 * Increments the win counter.
 */
export function incrementWins(state: GameStateSnapshot): GameStateSnapshot {
    return {
        ...state,
        wins: state.wins + 1,
    };
}

// =============================================================================
// Serialization
// =============================================================================

/**
 * Serializes game state to JSON.
 */
export function serializeGameState(state: GameStateSnapshot): string {
    return JSON.stringify(state);
}

/**
 * Deserializes game state from JSON.
 */
export function deserializeGameState(json: string): GameStateSnapshot {
    return JSON.parse(json) as GameStateSnapshot;
}

// =============================================================================
// Index Export
// =============================================================================

export * from "./types";
export * from "./UnitState";
