/**
 * Core data types and interfaces for the tactical game
 * These are the fundamental building blocks used throughout the application
 */

// Basic Types
export type EntityId = string;
export type ComponentType = string;

// Position Types
export interface Position {
    readonly x: number;
    readonly y: number;
}

export interface GridPosition extends Position {
    readonly gridX: number;
    readonly gridY: number;
}

// Stats Types
export interface BaseStats {
    readonly health: number;
    readonly maxHealth: number;
    readonly force: number;
    readonly dexterity: number;
    readonly intelligence: number;
    readonly armor: number;
    readonly magicResistance: number;
}

export interface MovementStats {
    readonly moveRange: number;
    readonly movementPoints: number;
    readonly maxMovementPoints: number;
}

export interface ActionStats {
    readonly actionPoints: number;
    readonly maxActionPoints: number;
    readonly attackRange: number;
}

export interface UnitStats extends BaseStats, MovementStats, ActionStats {}

// Spell Types
export type SpellType = "melee" | "ranged" | "magic";
export type AoeShape = "circle" | "line" | "cone";
export type DamageType = "physical" | "magical";

export interface SpellStats {
    readonly damage: number;
    readonly apCost: number;
    readonly range: number;
    readonly minRange?: number;
    readonly aoeShape?: AoeShape;
    readonly aoeRadius?: number;
}

export interface SpellRequirement {
    readonly type: "stat" | "level" | "artifact" | "class";
    readonly value: string | number;
    readonly operator?: "gte" | "lte" | "eq" | "has";
}

export interface SpellModifier {
    readonly id: string;
    readonly name: string;
    readonly property: keyof SpellStats;
    readonly value: number | string;
    readonly type: "add" | "multiply" | "set";
}

// Component Types
export interface Component {
    readonly type: ComponentType;
    readonly entityId: EntityId;
}

export interface HealthComponent extends Component {
    readonly type: "health";
    current: number;
    max: number;
}

export interface PositionComponent extends Component {
    readonly type: "position";
    position: Position;
    gridPosition: GridPosition;
}

export interface StatsComponent extends Component {
    readonly type: "stats";
    stats: UnitStats;
}

export interface SpellsComponent extends Component {
    readonly type: "spells";
    equippedSpells: EntityId[];
    currentSpell?: EntityId;
}

export interface RendererComponent extends Component {
    readonly type: "renderer";
    spriteKey: string;
    scale?: number;
    tint?: number;
    visible: boolean;
}

// Entity Types
export interface Entity {
    readonly id: EntityId;
    readonly components: Map<ComponentType, Component>;
}

// Game State Types
export interface PlayerState {
    readonly id: EntityId;
    readonly classId: string;
    readonly equippedSpells: EntityId[];
    readonly acquiredArtifacts: EntityId[];
    readonly appliedBonuses: EntityId[];
}

export interface BattleState {
    readonly id: EntityId;
    readonly playerIds: EntityId[];
    readonly enemyIds: EntityId[];
    readonly currentTurn: EntityId;
    readonly turnOrder: EntityId[];
    readonly isActive: boolean;
}

export interface ProgressState {
    readonly wins: number;
    readonly selectedClass: string;
    readonly acquiredArtifacts: EntityId[];
    readonly appliedBonuses: EntityId[];
    readonly equippedSpells: EntityId[];
}

export interface UIState {
    readonly currentScene: string;
    readonly activeComponents: string[];
    readonly selectedUnit?: EntityId;
    readonly selectedSpell?: EntityId;
}

export interface GameState {
    readonly player: PlayerState;
    readonly battle: BattleState;
    readonly progress: ProgressState;
    readonly ui: UIState;
    readonly entities: Map<EntityId, Entity>;
}

// Validation Types
export interface ValidationResult {
    readonly isValid: boolean;
    readonly errors: string[];
    readonly warnings: string[];
}

export interface Validator<T> {
    validate(data: T): ValidationResult;
}

// Save/Load Types
export interface SaveData {
    readonly version: string;
    readonly timestamp: number;
    readonly gameState: GameState;
    readonly metadata: SaveMetadata;
}

export interface SaveMetadata {
    readonly playerId: string;
    readonly sessionId: string;
    readonly platform: string;
    readonly gameVersion: string;
}

// Configuration Types
export interface GameConfig {
    readonly version: string;
    readonly debug: boolean;
    readonly maxSaveSlots: number;
    readonly autoSaveInterval: number;
    readonly maxUndoSteps: number;
}

// Service Interfaces
export interface Service {
    readonly name: string;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
}

export interface Repository<T, K = EntityId> {
    get(id: K): T | null;
    getAll(): T[];
    save(item: T): void;
    delete(id: K): boolean;
    exists(id: K): boolean;
}

// Query Types for ECS
export interface Query {
    readonly components: ComponentType[];
    readonly optional?: ComponentType[];
    readonly exclude?: ComponentType[];
}

export interface QueryResult {
    readonly entities: Entity[];
    readonly components: Component[][];
}

// Event Types (re-exported for convenience)
export type {
    GameEventDataMap,
    TypedEventHandler,
} from "../../core/events/GameEvents";
export { GameEvent } from "../../core/events/GameEvents";

// Utility Types
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type Brand<T, B> = T & { __brand: B };

// Game-specific branded types
export type PlayerId = Brand<EntityId, "Player">;
export type SpellId = Brand<EntityId, "Spell">;
export type ArtifactId = Brand<EntityId, "Artifact">;
export type BonusId = Brand<EntityId, "Bonus">;
export type EnemyId = Brand<EntityId, "Enemy">;

// Constants
export const DEFAULT_GRID_SIZE = 20;
export const DEFAULT_TILE_SIZE = 64;
export const MAX_SPELL_SLOTS = 5;
export const MAX_ARTIFACTS = 3;

