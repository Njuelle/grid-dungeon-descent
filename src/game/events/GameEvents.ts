/**
 * GameEvents - Typed event definitions for the game.
 * 
 * This provides a centralized list of all game events with their payload types,
 * ensuring type safety when emitting and subscribing to events.
 */

import { GridPosition, SpellDefinition, Team, UnitState, BonusDefinition } from "../core/types";

// =============================================================================
// Event Type Map
// =============================================================================

/**
 * Map of all game events to their payload types.
 */
export interface GameEventMap {
    // Turn Events
    "turn:start": TurnStartEvent;
    "turn:end": TurnEndEvent;
    "turn:team_changed": TeamChangedEvent;

    // Unit Events
    "unit:selected": UnitSelectedEvent;
    "unit:deselected": UnitDeselectedEvent;
    "unit:moved": UnitMovedEvent;
    "unit:damaged": UnitDamagedEvent;
    "unit:healed": UnitHealedEvent;
    "unit:movement_gained": UnitMovementGainedEvent;
    "unit:ap_gained": UnitAPGainedEvent;
    "unit:stat_gained": UnitStatGainedEvent;
    "unit:killed": UnitKilledEvent;

    // Combat Events
    "combat:attack_start": AttackStartEvent;
    "combat:attack_hit": AttackHitEvent;
    "combat:attack_miss": AttackMissEvent;
    "combat:spell_cast": SpellCastEvent;
    "combat:critical_hit": CriticalHitEvent;
    "combat:execute": ExecuteEvent;
    "combat:thorns": ThornsEvent;
    "combat:blocked": BlockedEvent;

    // Game Flow Events
    "game:started": GameStartedEvent;
    "game:victory": GameVictoryEvent;
    "game:defeat": GameDefeatEvent;
    "game:restart": GameRestartEvent;

    // Bonus Events
    "bonus:selected": BonusSelectedEvent;
    "bonus:applied": BonusAppliedEvent;

    // UI Events
    "ui:spell_selected": SpellSelectedEvent;
    "ui:end_turn_clicked": EndTurnClickedEvent;
    "ui:bonus_history_opened": BonusHistoryOpenedEvent;
    "ui:modal_opened": ModalOpenedEvent;
    "ui:modal_closed": ModalClosedEvent;

    // Input Events
    "input:tile_clicked": TileClickedEvent;
    "input:tile_hovered": TileHoveredEvent;
    "input:unit_clicked": UnitClickedEvent;
    "input:unit_hovered": UnitHoveredEvent;
}

// =============================================================================
// Turn Events
// =============================================================================

export interface TurnStartEvent {
    team: Team;
    turnNumber: number;
}

export interface TurnEndEvent {
    team: Team;
    turnNumber: number;
}

export interface TeamChangedEvent {
    previousTeam: Team;
    newTeam: Team;
    turnNumber: number;
}

// =============================================================================
// Unit Events
// =============================================================================

export interface UnitSelectedEvent {
    unitId: string;
    position: GridPosition;
    team: Team;
}

export interface UnitDeselectedEvent {
    previousUnitId?: string;
}

export interface UnitMovedEvent {
    unitId: string;
    from: GridPosition;
    to: GridPosition;
    path: GridPosition[];
    cost: number;
}

export interface UnitDamagedEvent {
    unitId: string;
    damage: number;
    damageType: "physical" | "magic";
    attackerId?: string;
    newHealth: number;
    maxHealth: number;
}

export interface UnitHealedEvent {
    unitId: string;
    amount: number;
    source: string;
    newHealth: number;
    maxHealth: number;
}

export interface UnitMovementGainedEvent {
    unitId: string;
    amount: number;
    source: string;
}

export interface UnitAPGainedEvent {
    unitId: string;
    amount: number;
    source: string;
}

export interface UnitStatGainedEvent {
    unitId: string;
    stat: string;
    amount: number;
    source: string;
}

export interface UnitKilledEvent {
    unitId: string;
    killerId?: string;
    position: GridPosition;
}

// =============================================================================
// Combat Events
// =============================================================================

export interface AttackStartEvent {
    attackerId: string;
    targetId: string;
    spellId?: string;
    position: GridPosition;
}

export interface AttackHitEvent {
    attackerId: string;
    targetId: string;
    damage: number;
    damageType: "physical" | "magic";
    spellId?: string;
}

export interface AttackMissEvent {
    attackerId: string;
    targetId: string;
    reason: string;
}

export interface SpellCastEvent {
    casterId: string;
    spell: SpellDefinition;
    targetPosition: GridPosition;
    targetIds: string[];
    apCost: number;
}

export interface CriticalHitEvent {
    attackerId: string;
    targetId: string;
    originalDamage: number;
    criticalDamage: number;
}

export interface ExecuteEvent {
    attackerId: string;
    targetId: string;
    spellId: string;
}

export interface ThornsEvent {
    defenderId: string;
    attackerId: string;
    damage: number;
}

export interface BlockedEvent {
    defenderId: string;
    attackerId: string;
    blockType: "spell_shield";
}

// =============================================================================
// Game Flow Events
// =============================================================================

export interface GameStartedEvent {
    playerUnits: UnitState[];
    enemyUnits: UnitState[];
    level: number;
    difficulty: string;
}

export interface GameVictoryEvent {
    turnCount: number;
    enemiesDefeated: number;
}

export interface GameDefeatEvent {
    turnCount: number;
    enemiesRemaining: number;
}

export interface GameRestartEvent {
    isNewGame: boolean;
}

// =============================================================================
// Bonus Events
// =============================================================================

export interface BonusSelectedEvent {
    bonus: BonusDefinition;
    totalBonuses: number;
}

export interface BonusAppliedEvent {
    bonusId: string;
    effects: string[];
}

// =============================================================================
// UI Events
// =============================================================================

export interface SpellSelectedEvent {
    spell: SpellDefinition;
    previousSpellId?: string;
}

export interface EndTurnClickedEvent {
    team: Team;
}

export interface BonusHistoryOpenedEvent {
    bonusCount: number;
}

export interface ModalOpenedEvent {
    modalType: string;
}

export interface ModalClosedEvent {
    modalType: string;
}

// =============================================================================
// Input Events
// =============================================================================

export interface TileClickedEvent {
    position: GridPosition;
    isWall: boolean;
    isOccupied: boolean;
}

export interface TileHoveredEvent {
    position: GridPosition;
    isWall: boolean;
    isOccupied: boolean;
}

export interface UnitClickedEvent {
    unitId: string;
    position: GridPosition;
    team: Team;
}

export interface UnitHoveredEvent {
    unitId: string;
    position: GridPosition;
    team: Team;
}
