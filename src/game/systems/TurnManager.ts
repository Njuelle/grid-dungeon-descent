/**
 * TurnManager - Handles turn-based game flow.
 * 
 * Responsibilities:
 * - Turn switching between player and enemy
 * - Turn state management
 * - Victory/defeat condition checking
 * - Turn start/end callbacks
 */

import { Team, UnitState, GameStateSnapshot } from "../core/types";
import {
    startTurn,
    endTurn,
    getAliveUnitsByTeam,
    checkVictoryConditions,
    isGameOver,
    isVictory,
    isDefeat,
} from "../core/GameState";
import { isAlive, resetTurnState } from "../core/UnitState";

// =============================================================================
// Turn Event Types
// =============================================================================

export type TurnEventType =
    | "turn_start"
    | "turn_end"
    | "team_changed"
    | "victory"
    | "defeat";

export interface TurnEvent {
    type: TurnEventType;
    team: Team;
    turn: number;
}

export type TurnEventCallback = (event: TurnEvent) => void;

// =============================================================================
// TurnManager Class
// =============================================================================

export class TurnManager {
    private currentTeam: Team = "player";
    private turnNumber: number = 1;
    private isFirstTurn: boolean = true;
    private gameEnded: boolean = false;
    
    // Event callbacks
    private onTurnStart?: TurnEventCallback;
    private onTurnEnd?: TurnEventCallback;
    private onTeamChanged?: TurnEventCallback;
    private onVictory?: TurnEventCallback;
    private onDefeat?: TurnEventCallback;

    // =========================================================================
    // Event Registration
    // =========================================================================

    /**
     * Register callback for turn start.
     */
    public setOnTurnStart(callback: TurnEventCallback): void {
        this.onTurnStart = callback;
    }

    /**
     * Register callback for turn end.
     */
    public setOnTurnEnd(callback: TurnEventCallback): void {
        this.onTurnEnd = callback;
    }

    /**
     * Register callback for team change.
     */
    public setOnTeamChanged(callback: TurnEventCallback): void {
        this.onTeamChanged = callback;
    }

    /**
     * Register callback for victory.
     */
    public setOnVictory(callback: TurnEventCallback): void {
        this.onVictory = callback;
    }

    /**
     * Register callback for defeat.
     */
    public setOnDefeat(callback: TurnEventCallback): void {
        this.onDefeat = callback;
    }

    // =========================================================================
    // Turn Flow
    // =========================================================================

    /**
     * Starts the game (first turn).
     */
    public startGame(): void {
        this.currentTeam = "player";
        this.turnNumber = 1;
        this.isFirstTurn = true;
        this.gameEnded = false;

        this.emitEvent("turn_start", this.currentTeam);
        this.emitEvent("team_changed", this.currentTeam);
    }

    /**
     * Starts a new turn for the current team.
     */
    public startTurn(): void {
        if (this.gameEnded) return;

        this.emitEvent("turn_start", this.currentTeam);
        
        if (this.currentTeam === "player") {
            this.isFirstTurn = false;
        }
    }

    /**
     * Ends the current turn and switches to the next team.
     */
    public endTurn(): void {
        if (this.gameEnded) return;

        this.emitEvent("turn_end", this.currentTeam);

        // Switch teams
        const previousTeam = this.currentTeam;
        this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";

        // Increment turn number when switching back to player
        if (this.currentTeam === "player") {
            this.turnNumber++;
        }

        this.emitEvent("team_changed", this.currentTeam);
        this.emitEvent("turn_start", this.currentTeam);
    }

    /**
     * Forces end of current turn (for AI or auto-end).
     */
    public forceEndTurn(): void {
        this.endTurn();
    }

    // =========================================================================
    // State Queries
    // =========================================================================

    /**
     * Gets the current team.
     */
    public getCurrentTeam(): Team {
        return this.currentTeam;
    }

    /**
     * Gets the current turn number.
     */
    public getTurnNumber(): number {
        return this.turnNumber;
    }

    /**
     * Checks if it's the first turn.
     */
    public isFirstTurnOfGame(): boolean {
        return this.isFirstTurn;
    }

    /**
     * Checks if it's the player's turn.
     */
    public isPlayerTurn(): boolean {
        return this.currentTeam === "player";
    }

    /**
     * Checks if it's the enemy's turn.
     */
    public isEnemyTurn(): boolean {
        return this.currentTeam === "enemy";
    }

    /**
     * Checks if the game has ended.
     */
    public hasGameEnded(): boolean {
        return this.gameEnded;
    }

    // =========================================================================
    // Victory/Defeat Checking
    // =========================================================================

    /**
     * Checks victory conditions based on unit states.
     */
    public checkVictoryConditions(units: UnitState[]): "victory" | "defeat" | null {
        if (this.gameEnded) return null;

        const alivePlayer = units.filter(
            (u) => u.team === "player" && isAlive(u)
        );
        const aliveEnemies = units.filter(
            (u) => u.team === "enemy" && isAlive(u)
        );

        // Player defeated
        if (alivePlayer.length === 0) {
            this.gameEnded = true;
            this.emitEvent("defeat", this.currentTeam);
            return "defeat";
        }

        // All enemies defeated
        if (aliveEnemies.length === 0) {
            this.gameEnded = true;
            this.emitEvent("victory", this.currentTeam);
            return "victory";
        }

        return null;
    }

    /**
     * Checks if all enemies have acted (for auto-ending enemy turn).
     */
    public allEnemiesActed(units: UnitState[]): boolean {
        const aliveEnemies = units.filter(
            (u) => u.team === "enemy" && isAlive(u)
        );
        return aliveEnemies.every((u) => u.hasActed);
    }

    /**
     * Checks if player should auto-end turn (no MP and no AP).
     */
    public shouldAutoEndPlayerTurn(player: UnitState): boolean {
        return (
            (player.stats.movementPoints === 0 || player.stats.movementPoints === undefined) &&
            (player.stats.actionPoints === 0 || player.stats.actionPoints === undefined)
        );
    }

    // =========================================================================
    // Game State Updates
    // =========================================================================

    /**
     * Applies turn start to a game state snapshot.
     */
    public applyTurnStartToState(state: GameStateSnapshot): GameStateSnapshot {
        return startTurn(state, this.currentTeam);
    }

    /**
     * Applies turn end to a game state snapshot.
     */
    public applyTurnEndToState(state: GameStateSnapshot): GameStateSnapshot {
        return endTurn(state);
    }

    /**
     * Checks and applies victory conditions to a game state.
     */
    public applyVictoryCheckToState(state: GameStateSnapshot): GameStateSnapshot {
        const newState = checkVictoryConditions(state);
        
        if (newState.isGameOver && !this.gameEnded) {
            this.gameEnded = true;
            if (newState.isVictory) {
                this.emitEvent("victory", this.currentTeam);
            } else {
                this.emitEvent("defeat", this.currentTeam);
            }
        }

        return newState;
    }

    // =========================================================================
    // Reset
    // =========================================================================

    /**
     * Resets the turn manager for a new game.
     */
    public reset(): void {
        this.currentTeam = "player";
        this.turnNumber = 1;
        this.isFirstTurn = true;
        this.gameEnded = false;
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    private emitEvent(type: TurnEventType, team: Team): void {
        const event: TurnEvent = {
            type,
            team,
            turn: this.turnNumber,
        };

        switch (type) {
            case "turn_start":
                this.onTurnStart?.(event);
                break;
            case "turn_end":
                this.onTurnEnd?.(event);
                break;
            case "team_changed":
                this.onTeamChanged?.(event);
                break;
            case "victory":
                this.onVictory?.(event);
                break;
            case "defeat":
                this.onDefeat?.(event);
                break;
        }
    }
}
