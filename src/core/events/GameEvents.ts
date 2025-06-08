/**
 * Centralized game event definitions with type safety
 * All game events should be defined here for consistency
 */

// Game Events Enum
export enum GameEvent {
    // Player Events
    PLAYER_CREATED = "player:created",
    PLAYER_SPELL_CHANGED = "player:spell:changed",
    PLAYER_STATS_UPDATED = "player:stats:updated",
    PLAYER_HEALTH_CHANGED = "player:health:changed",
    PLAYER_MOVED = "player:moved",
    PLAYER_ACTED = "player:acted",
    PLAYER_ACTION = "player:action",

    // Combat Events
    COMBAT_STARTED = "combat:started",
    COMBAT_ENDED = "combat:ended",
    COMBAT_DAMAGE_DEALT = "combat:damage:dealt",
    COMBAT_DAMAGE_TAKEN = "combat:damage:taken",
    COMBAT_ENTITY_CREATED = "combat:entity:created",
    COMBAT_ENTITY_KILLED = "combat:entity:killed",
    SPELL_CAST = "spell:cast",
    DAMAGE_DEALT = "damage:dealt",
    UNIT_DIED = "unit:died",

    // Progression Events
    ARTIFACT_ACQUIRED = "artifact:acquired",
    ARTIFACT_EQUIPPED = "artifact:equipped",
    BONUS_APPLIED = "bonus:applied",
    LEVEL_COMPLETED = "level:completed",
    VICTORY = "victory",
    DEFEAT = "defeat",

    // UI Events
    UI_UPDATED = "ui:updated",
    UI_LAYOUT_CHANGED = "ui:layout:changed",
    UI_ELEMENT_UPDATED = "ui:element:updated",
    SCENE_READY = "scene:ready",
    SCENE_CHANGED = "scene:changed",
    SCENE_PAUSED = "scene:paused",
    SCENE_RESUMED = "scene:resumed",

    // System Events
    GAME_PAUSED = "game:paused",
    GAME_RESUMED = "game:resumed",
    SAVE_REQUESTED = "save:requested",
    LOAD_REQUESTED = "load:requested",
    ERROR_OCCURRED = "error:occurred",
}

// Event Data Types
export interface PlayerCreatedData {
    playerId: string;
    classId: string;
    position: { x: number; y: number };
}

export interface PlayerSpellChangedData {
    playerId: string;
    previousSpellId?: string;
    newSpellId: string;
}

export interface PlayerStatsUpdatedData {
    playerId: string;
    changedStats: string[];
    previousValues: Record<string, number>;
    newValues: Record<string, number>;
}

export interface PlayerHealthChangedData {
    playerId: string;
    previousHealth: number;
    newHealth: number;
    maxHealth: number;
}

export interface PlayerMovedData {
    playerId: string;
    fromPosition: { x: number; y: number };
    toPosition: { x: number; y: number };
    movementCost: number;
}

export interface PlayerActedData {
    playerId: string;
    actionType: "spell" | "move" | "wait";
    actionData?: any;
}

export interface CombatStartedData {
    playerIds: string[];
    enemyIds: string[];
    battleId: string;
}

export interface CombatEndedData {
    battleId: string;
    result: "victory" | "defeat";
    duration: number;
}

export interface SpellCastData {
    casterId: string;
    spellId: string;
    targetPosition: { x: number; y: number };
    affectedUnits: string[];
    damage?: number;
}

export interface DamageDealtData {
    sourceId: string;
    targetId: string;
    damage: number;
    damageType: "physical" | "magical";
    isCritical?: boolean;
}

export interface UnitDiedData {
    unitId: string;
    killerId?: string;
    cause: string;
}

export interface ArtifactAcquiredData {
    artifactId: string;
    playerId: string;
    source: "selection" | "reward" | "replacement";
}

export interface ArtifactEquippedData {
    artifactId: string;
    playerId: string;
    spellId: string;
}

export interface BonusAppliedData {
    bonusId: string;
    playerId: string;
    effectType: "stat" | "spell" | "special";
}

export interface LevelCompletedData {
    levelNumber: number;
    duration: number;
    enemiesDefeated: number;
    damageDealt: number;
    damageTaken: number;
}

export interface VictoryData {
    totalLevels: number;
    totalTime: number;
    finalStats: Record<string, number>;
}

export interface DefeatData {
    levelReached: number;
    cause: string;
    finalStats: Record<string, number>;
}

export interface UIUpdatedData {
    component: string;
    updateType: "refresh" | "partial" | "complete";
    data?: any;
}

export interface SceneReadyData {
    sceneName: string;
    sceneData?: any;
}

export interface SceneChangedData {
    sceneName: string;
    sceneType?: string;
    fromScene?: string;
    toScene?: string;
    transitionData?: any;
}

export interface ScenePausedData {
    sceneName: string;
    timestamp: number;
}

export interface SceneResumedData {
    sceneName: string;
    timestamp: number;
}

export interface UILayoutChangedData {
    layoutName: string;
    active: boolean;
}

export interface UIElementUpdatedData {
    elementId: string;
    updates: Record<string, any>;
}

export interface CombatDamageDealtData {
    attackerId: string;
    targetId: string;
    damage: number;
    damageType: "physical" | "magic";
    spell?: string;
}

export interface CombatDamageTakenData {
    targetId: string;
    damage: number;
    damageType: "physical" | "magic";
    attackerId?: string;
}

export interface CombatEntityCreatedData {
    entityId: string;
    entityType: "player" | "enemy";
    position: { x: number; y: number };
}

export interface CombatEntityKilledData {
    killedId: string;
    killerId?: string;
}

export interface PlayerActionData {
    action: string;
    entityId: string;
    target?: { x: number; y: number };
    data?: any;
}

export interface GamePausedData {
    reason: string;
    timestamp: number;
}

export interface GameResumedData {
    pauseDuration: number;
    timestamp: number;
}

export interface SaveRequestedData {
    type: "auto" | "manual";
    checkpoint?: string;
}

export interface LoadRequestedData {
    saveId?: string;
    timestamp?: number;
}

export interface ErrorOccurredData {
    error: Error;
    context: string;
    severity: "low" | "medium" | "high" | "critical";
    recoverable: boolean;
}

// Event Data Type Map
export interface GameEventDataMap {
    [GameEvent.PLAYER_CREATED]: PlayerCreatedData;
    [GameEvent.PLAYER_SPELL_CHANGED]: PlayerSpellChangedData;
    [GameEvent.PLAYER_STATS_UPDATED]: PlayerStatsUpdatedData;
    [GameEvent.PLAYER_HEALTH_CHANGED]: PlayerHealthChangedData;
    [GameEvent.PLAYER_MOVED]: PlayerMovedData;
    [GameEvent.PLAYER_ACTED]: PlayerActedData;
    [GameEvent.PLAYER_ACTION]: PlayerActionData;
    [GameEvent.COMBAT_STARTED]: CombatStartedData;
    [GameEvent.COMBAT_ENDED]: CombatEndedData;
    [GameEvent.COMBAT_DAMAGE_DEALT]: CombatDamageDealtData;
    [GameEvent.COMBAT_DAMAGE_TAKEN]: CombatDamageTakenData;
    [GameEvent.COMBAT_ENTITY_CREATED]: CombatEntityCreatedData;
    [GameEvent.COMBAT_ENTITY_KILLED]: CombatEntityKilledData;
    [GameEvent.SPELL_CAST]: SpellCastData;
    [GameEvent.DAMAGE_DEALT]: DamageDealtData;
    [GameEvent.UNIT_DIED]: UnitDiedData;
    [GameEvent.ARTIFACT_ACQUIRED]: ArtifactAcquiredData;
    [GameEvent.ARTIFACT_EQUIPPED]: ArtifactEquippedData;
    [GameEvent.BONUS_APPLIED]: BonusAppliedData;
    [GameEvent.LEVEL_COMPLETED]: LevelCompletedData;
    [GameEvent.VICTORY]: VictoryData;
    [GameEvent.DEFEAT]: DefeatData;
    [GameEvent.UI_UPDATED]: UIUpdatedData;
    [GameEvent.UI_LAYOUT_CHANGED]: UILayoutChangedData;
    [GameEvent.UI_ELEMENT_UPDATED]: UIElementUpdatedData;
    [GameEvent.SCENE_READY]: SceneReadyData;
    [GameEvent.SCENE_CHANGED]: SceneChangedData;
    [GameEvent.SCENE_PAUSED]: ScenePausedData;
    [GameEvent.SCENE_RESUMED]: SceneResumedData;
    [GameEvent.GAME_PAUSED]: GamePausedData;
    [GameEvent.GAME_RESUMED]: GameResumedData;
    [GameEvent.SAVE_REQUESTED]: SaveRequestedData;
    [GameEvent.LOAD_REQUESTED]: LoadRequestedData;
    [GameEvent.ERROR_OCCURRED]: ErrorOccurredData;
}

// Type-safe event bus methods
export type TypedEventHandler<K extends GameEvent> = (
    data: GameEventDataMap[K]
) => void | Promise<void>;

// Helper type for event emissions
export type EventEmission<K extends GameEvent> = {
    event: K;
    data: GameEventDataMap[K];
};

