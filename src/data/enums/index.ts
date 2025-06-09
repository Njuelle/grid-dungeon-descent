/**
 * Centralized enums and constants for the tactical game
 * All game enums should be defined here for consistency
 */

// Entity Types
export enum EntityType {
    PLAYER = "player",
    ENEMY = "enemy",
    SPELL = "spell",
    ARTIFACT = "artifact",
    BONUS = "bonus",
    CLASS = "class",
}

// Player Classes
export enum PlayerClass {
    WARRIOR = "warrior",
    RANGER = "ranger",
    MAGE = "mage",
}

// Spell Types
export enum SpellType {
    MELEE = "melee",
    RANGED = "ranged",
    MAGIC = "magic",
}

// Damage Types
export enum DamageType {
    PHYSICAL = "physical",
    MAGICAL = "magical",
}

// AOE Shapes
export enum AoeShape {
    CIRCLE = "circle",
    LINE = "line",
    CONE = "cone",
}

// Component Types
export enum ComponentType {
    HEALTH = "health",
    POSITION = "position",
    STATS = "stats",
    SPELLS = "spells",
    RENDERER = "renderer",
    MOVEMENT = "movement",
    COMBAT = "combat",
}

// Game Scenes
export enum GameScene {
    BOOT = "Boot",
    PRELOADER = "Preloader",
    MAIN_MENU = "MainMenu",
    CLASS_SELECTION = "ClassSelection",
    TACTICAL_BATTLE = "TacticalBattle",
    ARTIFACT_SELECTION = "ArtifactSelection",
    GAME_OVER = "GameOver",
    GAME = "Game",
}

// Battle States
export enum BattleState {
    SETUP = "setup",
    PLAYER_TURN = "player_turn",
    ENEMY_TURN = "enemy_turn",
    VICTORY = "victory",
    DEFEAT = "defeat",
    PAUSED = "paused",
}

// Turn Phases
export enum TurnPhase {
    START = "start",
    MOVEMENT = "movement",
    ACTION = "action",
    END = "end",
}

// Unit States
export enum UnitState {
    IDLE = "idle",
    MOVING = "moving",
    ATTACKING = "attacking",
    CASTING = "casting",
    DEAD = "dead",
    STUNNED = "stunned",
}

// UI States
export enum UIState {
    MENU = "menu",
    GAME = "game",
    SELECTION = "selection",
    DIALOG = "dialog",
    LOADING = "loading",
}

// Error Severity
export enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
}

// Save Types
export enum SaveType {
    AUTO = "auto",
    MANUAL = "manual",
    CHECKPOINT = "checkpoint",
}

// Animation Types
export enum AnimationType {
    MOVE = "move",
    ATTACK = "attack",
    SPELL = "spell",
    DAMAGE = "damage",
    HEAL = "heal",
    DEATH = "death",
}

// Input Types
export enum InputType {
    MOUSE = "mouse",
    KEYBOARD = "keyboard",
    TOUCH = "touch",
}

// Direction Enum for movement and targeting
export enum Direction {
    NORTH = "north",
    SOUTH = "south",
    EAST = "east",
    WEST = "west",
    NORTHEAST = "northeast",
    NORTHWEST = "northwest",
    SOUTHEAST = "southeast",
    SOUTHWEST = "southwest",
}

// Priority Levels for systems
export enum Priority {
    HIGHEST = 1000,
    HIGH = 800,
    NORMAL = 500,
    LOW = 200,
    LOWEST = 100,
}

// Game Constants
export const GAME_CONSTANTS = {
    // Grid and Display
    GRID_SIZE: 20,
    TILE_SIZE: 64,

    // Player Limits
    MAX_SPELL_SLOTS: 5,
    MAX_ARTIFACTS: 3,
    MAX_BONUSES: 10,

    // Turn System
    MAX_TURN_TIME: 60000, // 60 seconds
    TURN_ANIMATION_SPEED: 500,

    // Combat
    BASE_CRIT_CHANCE: 0.05, // 5%
    MAX_DAMAGE_VARIANCE: 0.2, // 20%

    // Progression
    ARTIFACT_SELECTION_INTERVAL: 3, // Every 3 wins
    ARTIFACT_SELECTION_COUNT: 2, // Number of artifacts to show in selection
    MAX_LEVEL: 100,

    // UI
    TOOLTIP_DELAY: 500,
    ANIMATION_DURATION: 300,
    FADE_DURATION: 200,

    // Performance
    MAX_ENTITIES: 1000,
    MAX_PARTICLES: 100,
    TARGET_FPS: 60,

    // Save System
    MAX_SAVE_SLOTS: 3,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    SAVE_VERSION: "1.0.0",
} as const;

// Color Constants
export const COLORS = {
    // UI Colors
    PRIMARY: 0xd4af37,
    SECONDARY: 0x8b7355,
    BACKGROUND: 0x2d1b0e,
    TEXT: 0xf5deb3,
    ERROR: 0xff4444,
    SUCCESS: 0x44ff44,
    WARNING: 0xffaa44,

    // Rarity Colors
    COMMON: 0xffffff,
    UNCOMMON: 0x00ff00,
    RARE: 0x0080ff,
    EPIC: 0x8000ff,
    LEGENDARY: 0xff8000,

    // Damage Type Colors
    PHYSICAL_DAMAGE: 0xff6b6b,
    MAGICAL_DAMAGE: 0x6b9bff,
    HEAL: 0x6bff6b,

    // Status Colors
    HEALTH_FULL: 0x00ff00,
    HEALTH_HALF: 0xffff00,
    HEALTH_LOW: 0xff0000,
    MANA_FULL: 0x0080ff,
    MANA_EMPTY: 0x404040,
} as const;

// Z-Depth Constants
export const Z_DEPTHS = {
    BACKGROUND: 0,
    FLOOR: 10,
    WALLS: 20,
    EFFECTS: 30,
    UNITS: 40,
    PROJECTILES: 50,
    UI_BACKGROUND: 100,
    UI_ELEMENTS: 110,
    UI_TEXT: 120,
    TOOLTIPS: 130,
    MODAL: 200,
    DEBUG: 1000,
} as const;

