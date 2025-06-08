/**
 * StateManager - Centralized game state management with event-driven updates
 * Provides immutable state management with type-safe event handling
 */

import {
    GameState,
    PlayerState,
    BattleState,
    ProgressState,
    UIState,
    EntityId,
    Entity,
    Service,
} from "../../data/types";
import { Result } from "../../utils/Result";
import { GameEvent, eventBus, success, failure, ObjectUtils } from "../../core";

export type StateListener<K extends keyof GameState> = (
    newState: GameState[K],
    previousState: GameState[K]
) => void;

export type StateUpdateFunction<K extends keyof GameState> = (
    currentState: GameState[K]
) => GameState[K];

export interface StateManagerConfig {
    enableHistory?: boolean;
    maxHistorySize?: number;
    enableDeepFreeze?: boolean;
    enableLogging?: boolean;
}

export class StateManager implements Service {
    public readonly name = "StateManager";

    private state: GameState;
    private listeners = new Map<keyof GameState, Set<StateListener<any>>>();
    private config: Required<StateManagerConfig>;
    private history: GameState[] = [];
    private historyIndex = -1;

    constructor(
        initialState?: Partial<GameState>,
        config: StateManagerConfig = {}
    ) {
        this.config = {
            enableHistory: false,
            maxHistorySize: 50,
            enableDeepFreeze: process.env.NODE_ENV === "development",
            enableLogging: process.env.NODE_ENV === "development",
            ...config,
        };

        this.state = this.createInitialState(initialState);

        if (this.config.enableHistory) {
            this.saveToHistory();
        }

        if (this.config.enableDeepFreeze) {
            this.state = this.deepFreeze(this.state);
        }
    }

    public async initialize(): Promise<void> {
        // Set up event listeners for state updates
        this.setupEventListeners();

        if (this.config.enableLogging) {
            console.log("[StateManager] Initialized with state:", this.state);
        }
    }

    public async destroy(): Promise<void> {
        this.listeners.clear();
        this.history = [];
        console.log("[StateManager] Destroyed");
    }

    // State Access
    public getState(): GameState {
        return this.state;
    }

    public getSubState<K extends keyof GameState>(key: K): GameState[K] {
        return this.state[key];
    }

    public getEntity(entityId: EntityId): Entity | null {
        return this.state.entities.get(entityId) || null;
    }

    public getAllEntities(): Entity[] {
        return Array.from(this.state.entities.values());
    }

    // State Updates
    public setState<K extends keyof GameState>(
        key: K,
        newState: GameState[K]
    ): Result<void, string> {
        try {
            const previousState = this.state[key];

            // Create new immutable state
            const updatedState = {
                ...this.state,
                [key]: newState,
            };

            if (this.config.enableDeepFreeze) {
                updatedState[key] = this.deepFreeze(updatedState[key]);
            }

            this.updateState(updatedState);
            this.notifyListeners(key, newState, previousState);

            if (this.config.enableLogging) {
                console.log(`[StateManager] Updated ${key}:`, {
                    previous: previousState,
                    new: newState,
                });
            }

            return success(undefined);
        } catch (error) {
            return failure(`Failed to update state ${key}: ${error}`);
        }
    }

    public updateSubState<K extends keyof GameState>(
        key: K,
        updateFunction: StateUpdateFunction<K>
    ): Result<void, string> {
        try {
            const currentState = this.state[key];
            const newState = updateFunction(currentState);
            return this.setState(key, newState);
        } catch (error) {
            return failure(`Failed to update state ${key}: ${error}`);
        }
    }

    // Entity Management
    public addEntity(entity: Entity): Result<void, string> {
        if (this.state.entities.has(entity.id)) {
            return failure(`Entity already exists: ${entity.id}`);
        }

        const newEntities = new Map(this.state.entities);
        newEntities.set(entity.id, entity);

        return this.setState("entities", newEntities);
    }

    public updateEntity(
        entityId: EntityId,
        entity: Entity
    ): Result<void, string> {
        if (!this.state.entities.has(entityId)) {
            return failure(`Entity not found: ${entityId}`);
        }

        const newEntities = new Map(this.state.entities);
        newEntities.set(entityId, entity);

        return this.setState("entities", newEntities);
    }

    public removeEntity(entityId: EntityId): Result<void, string> {
        if (!this.state.entities.has(entityId)) {
            return failure(`Entity not found: ${entityId}`);
        }

        const newEntities = new Map(this.state.entities);
        newEntities.delete(entityId);

        return this.setState("entities", newEntities);
    }

    // Player State Management
    public updatePlayerState(
        updates: Partial<PlayerState>
    ): Result<void, string> {
        return this.updateSubState("player", (current) => ({
            ...current,
            ...updates,
        }));
    }

    public setPlayerSpells(spellIds: EntityId[]): Result<void, string> {
        return this.updatePlayerState({ equippedSpells: [...spellIds] });
    }

    public addPlayerArtifact(artifactId: EntityId): Result<void, string> {
        return this.updateSubState("player", (current) => ({
            ...current,
            acquiredArtifacts: [...current.acquiredArtifacts, artifactId],
        }));
    }

    public removePlayerArtifact(artifactId: EntityId): Result<void, string> {
        return this.updateSubState("player", (current) => ({
            ...current,
            acquiredArtifacts: current.acquiredArtifacts.filter(
                (id) => id !== artifactId
            ),
        }));
    }

    // Battle State Management
    public updateBattleState(
        updates: Partial<BattleState>
    ): Result<void, string> {
        return this.updateSubState("battle", (current) => ({
            ...current,
            ...updates,
        }));
    }

    public setCurrentTurn(entityId: EntityId): Result<void, string> {
        return this.updateBattleState({ currentTurn: entityId });
    }

    public addPlayerToBattle(playerId: EntityId): Result<void, string> {
        return this.updateSubState("battle", (current) => ({
            ...current,
            playerIds: [...current.playerIds, playerId],
            turnOrder: [...current.turnOrder, playerId],
        }));
    }

    public addEnemyToBattle(enemyId: EntityId): Result<void, string> {
        return this.updateSubState("battle", (current) => ({
            ...current,
            enemyIds: [...current.enemyIds, enemyId],
            turnOrder: [...current.turnOrder, enemyId],
        }));
    }

    // Progress State Management
    public updateProgressState(
        updates: Partial<ProgressState>
    ): Result<void, string> {
        return this.updateSubState("progress", (current) => ({
            ...current,
            ...updates,
        }));
    }

    public incrementWins(): Result<void, string> {
        return this.updateSubState("progress", (current) => ({
            ...current,
            wins: current.wins + 1,
        }));
    }

    public addBonus(bonusId: EntityId): Result<void, string> {
        return this.updateSubState("progress", (current) => ({
            ...current,
            appliedBonuses: [...current.appliedBonuses, bonusId],
        }));
    }

    // UI State Management
    public updateUIState(updates: Partial<UIState>): Result<void, string> {
        return this.updateSubState("ui", (current) => ({
            ...current,
            ...updates,
        }));
    }

    public setCurrentScene(sceneName: string): Result<void, string> {
        return this.updateUIState({ currentScene: sceneName });
    }

    public selectUnit(unitId?: EntityId): Result<void, string> {
        return this.updateUIState({ selectedUnit: unitId });
    }

    public selectSpell(spellId?: EntityId): Result<void, string> {
        return this.updateUIState({ selectedSpell: spellId });
    }

    // Listeners
    public subscribe<K extends keyof GameState>(
        key: K,
        listener: StateListener<K>
    ): () => void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }

        const keyListeners = this.listeners.get(key)!;
        keyListeners.add(listener);

        // Return unsubscribe function
        return () => {
            keyListeners.delete(listener);
            if (keyListeners.size === 0) {
                this.listeners.delete(key);
            }
        };
    }

    public subscribeToAll(
        listener: (newState: GameState, previousState: GameState) => void
    ): () => void {
        const unsubscribers: (() => void)[] = [];
        let previousState = this.state;

        const keys: (keyof GameState)[] = [
            "player",
            "battle",
            "progress",
            "ui",
            "entities",
        ];

        for (const key of keys) {
            const unsubscribe = this.subscribe(key, () => {
                const newState = this.state;
                listener(newState, previousState);
                previousState = newState;
            });
            unsubscribers.push(unsubscribe);
        }

        return () => {
            unsubscribers.forEach((unsub) => unsub());
        };
    }

    // History Management (if enabled)
    public canUndo(): boolean {
        return this.config.enableHistory && this.historyIndex > 0;
    }

    public canRedo(): boolean {
        return (
            this.config.enableHistory &&
            this.historyIndex < this.history.length - 1
        );
    }

    public undo(): Result<void, string> {
        if (!this.canUndo()) {
            return failure("Cannot undo: no history available");
        }

        this.historyIndex--;
        const previousState = this.history[this.historyIndex];
        this.state = this.config.enableDeepFreeze
            ? this.deepFreeze(previousState)
            : previousState;

        if (this.config.enableLogging) {
            console.log("[StateManager] Undo to state:", this.state);
        }

        return success(undefined);
    }

    public redo(): Result<void, string> {
        if (!this.canRedo()) {
            return failure("Cannot redo: no future history available");
        }

        this.historyIndex++;
        const nextState = this.history[this.historyIndex];
        this.state = this.config.enableDeepFreeze
            ? this.deepFreeze(nextState)
            : nextState;

        if (this.config.enableLogging) {
            console.log("[StateManager] Redo to state:", this.state);
        }

        return success(undefined);
    }

    public clearHistory(): void {
        this.history = [this.state];
        this.historyIndex = 0;
    }

    // Serialization
    public serialize(): string {
        return JSON.stringify({
            state: {
                ...this.state,
                entities: Array.from(this.state.entities.entries()),
            },
            timestamp: Date.now(),
        });
    }

    public deserialize(serialized: string): Result<void, string> {
        try {
            const data = JSON.parse(serialized);
            const state = {
                ...data.state,
                entities: new Map(data.state.entities),
            };

            this.state = this.config.enableDeepFreeze
                ? this.deepFreeze(state)
                : state;

            if (this.config.enableHistory) {
                this.saveToHistory();
            }

            if (this.config.enableLogging) {
                console.log("[StateManager] Deserialized state:", this.state);
            }

            return success(undefined);
        } catch (error) {
            return failure(`Failed to deserialize state: ${error}`);
        }
    }

    // Private Methods
    private createInitialState(partial?: Partial<GameState>): GameState {
        const defaultState: GameState = {
            player: {
                id: "player_default",
                classId: "warrior",
                equippedSpells: [],
                acquiredArtifacts: [],
                appliedBonuses: [],
            },
            battle: {
                id: "battle_default",
                playerIds: [],
                enemyIds: [],
                currentTurn: "",
                turnOrder: [],
                isActive: false,
            },
            progress: {
                wins: 0,
                selectedClass: "warrior",
                acquiredArtifacts: [],
                appliedBonuses: [],
                equippedSpells: [],
            },
            ui: {
                currentScene: "MainMenu",
                activeComponents: [],
                selectedUnit: undefined,
                selectedSpell: undefined,
            },
            entities: new Map(),
        };

        return {
            ...defaultState,
            ...partial,
        };
    }

    private updateState(newState: GameState): void {
        if (this.config.enableHistory) {
            this.saveToHistory();
        }

        this.state = newState;
    }

    private saveToHistory(): void {
        // Remove any future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Deep clone the current state for history
        const stateToSave = ObjectUtils.deepClone(this.state);
        this.history.push(stateToSave);
        this.historyIndex = this.history.length - 1;

        // Limit history size
        if (this.history.length > this.config.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    private notifyListeners<K extends keyof GameState>(
        key: K,
        newState: GameState[K],
        previousState: GameState[K]
    ): void {
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.forEach((listener) => {
                try {
                    listener(newState, previousState);
                } catch (error) {
                    console.error(
                        `[StateManager] Error in listener for ${key}:`,
                        error
                    );
                }
            });
        }
    }

    private deepFreeze<T>(obj: T): T {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }

        // Freeze the object itself
        Object.freeze(obj);

        // Freeze all properties
        Object.getOwnPropertyNames(obj).forEach((property) => {
            const value = (obj as any)[property];
            if (value && typeof value === "object") {
                this.deepFreeze(value);
            }
        });

        return obj;
    }

    private setupEventListeners(): void {
        // Player events
        eventBus.on(GameEvent.PLAYER_SPELL_CHANGED, (data) => {
            this.updatePlayerState({
                equippedSpells: [...this.state.player.equippedSpells],
            });
        });

        eventBus.on(GameEvent.ARTIFACT_ACQUIRED, (data) => {
            this.addPlayerArtifact(data.artifactId);
        });

        eventBus.on(GameEvent.BONUS_APPLIED, (data) => {
            this.addBonus(data.bonusId);
        });

        eventBus.on(GameEvent.LEVEL_COMPLETED, () => {
            this.incrementWins();
        });

        // UI events
        eventBus.on(GameEvent.SCENE_CHANGED, (data) => {
            this.setCurrentScene(data.toScene);
        });

        // Battle events
        eventBus.on(GameEvent.COMBAT_STARTED, (data) => {
            this.updateBattleState({
                id: data.battleId,
                playerIds: [...data.playerIds],
                enemyIds: [...data.enemyIds],
                isActive: true,
            });
        });

        eventBus.on(GameEvent.COMBAT_ENDED, (data) => {
            this.updateBattleState({
                isActive: false,
            });
        });
    }

    // Debug methods
    public getDebugInfo() {
        return {
            stateSize: JSON.stringify(this.state).length,
            listenerCount: Array.from(this.listeners.values()).reduce(
                (sum, set) => sum + set.size,
                0
            ),
            historySize: this.history.length,
            historyIndex: this.historyIndex,
            entityCount: this.state.entities.size,
        };
    }
}

// Global state manager instance
export const stateManager = new StateManager();

