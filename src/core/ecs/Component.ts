/**
 * ECS Component System
 *
 * Components are pure data containers with no logic.
 * Each component represents a specific aspect of an entity.
 */

import { Spell } from "../../game/classes/Spell";
import { UnitStats } from "../../game/classes/Unit";

// Base component interface
export interface Component {
    readonly type: string;
}

// Entity ID type
export type EntityId = string;

// ============================================================================
// CORE COMPONENTS
// ============================================================================

export interface PositionComponent extends Component {
    type: "position";
    gridX: number;
    gridY: number;
    worldX: number;
    worldY: number;
}

export interface StatsComponent extends Component {
    type: "stats";
    stats: UnitStats;
    originalStats: UnitStats; // For bonus calculation
    bonusModifiers: Record<string, number>; // Track applied bonuses
}

export interface RenderComponent extends Component {
    type: "render";
    sprite?: Phaser.GameObjects.Sprite;
    graphics?: Phaser.GameObjects.Graphics;
    labelText?: Phaser.GameObjects.Text;
    spriteName?: string;
    color?: number;
    outlineColor?: number;
    scale?: number;
    depth?: number;
}

export interface MovementComponent extends Component {
    type: "movement";
    moveRange: number;
    movementPoints: number;
    maxMovementPoints: number;
    hasMovedThisTurn: boolean;
    isMoving: boolean;
    targetPosition?: { x: number; y: number };
    movementPath?: { x: number; y: number }[];
}

export interface CombatComponent extends Component {
    type: "combat";
    attackRange: number;
    hasActed: boolean;
    actionPoints: number;
    maxActionPoints: number;
    lastDamageType?: "physical" | "magic";
    attackType: "melee" | "ranged" | "magic";
    damageModifiers: Record<string, number>;
}

// ============================================================================
// PLAYER-SPECIFIC COMPONENTS
// ============================================================================

export interface SpellComponent extends Component {
    type: "spell";
    availableSpells: Spell[];
    equippedSpells: Spell[];
    currentSpell?: Spell;
    spellModifiers: Record<string, any>;
    spellSlots: number;
}

export interface PlayerClassComponent extends Component {
    type: "playerClass";
    classId: string;
    className: string;
    baseSpells: Spell[];
    classIcon: string;
}

export interface BonusComponent extends Component {
    type: "bonus";
    appliedBonuses: string[];
    bonusEffects: Record<string, any>;
    temporaryEffects: Record<string, { value: any; duration?: number }>;
}

// ============================================================================
// ENEMY-SPECIFIC COMPONENTS
// ============================================================================

export interface AIComponent extends Component {
    type: "ai";
    enemyType: string;
    behavior: "aggressive" | "defensive" | "support";
    targetEntityId?: EntityId;
    lastAction?: "move" | "attack" | "wait";
    decisionCooldown: number;
}

// ============================================================================
// UI & INTERACTION COMPONENTS
// ============================================================================

export interface UIComponent extends Component {
    type: "ui";
    healthBar?: Phaser.GameObjects.Graphics;
    tooltip?: Phaser.GameObjects.Container;
    isTooltipVisible: boolean;
    isInteractive: boolean;
    clickHandler?: () => void;
}

export interface SoundComponent extends Component {
    type: "sound";
    walkSound?: Phaser.Sound.BaseSound;
    attackSound?: string;
    hurtSound?: string;
    deathSound?: string;
    volume: number;
}

export interface TeamComponent extends Component {
    type: "team";
    team: "player" | "enemy";
    isActive: boolean;
}

// ============================================================================
// COMPONENT UNION TYPE
// ============================================================================

export type GameComponent =
    | PositionComponent
    | StatsComponent
    | RenderComponent
    | MovementComponent
    | CombatComponent
    | SpellComponent
    | PlayerClassComponent
    | BonusComponent
    | AIComponent
    | UIComponent
    | SoundComponent
    | TeamComponent;

// ============================================================================
// COMPONENT CREATION HELPERS
// ============================================================================

export const createPositionComponent = (
    gridX: number,
    gridY: number,
    worldX: number = 0,
    worldY: number = 0
): PositionComponent => ({
    type: "position",
    gridX,
    gridY,
    worldX,
    worldY,
});

export const createStatsComponent = (stats: UnitStats): StatsComponent => ({
    type: "stats",
    stats: { ...stats },
    originalStats: { ...stats },
    bonusModifiers: {},
});

export const createRenderComponent = (options: {
    spriteName?: string;
    color?: number;
    outlineColor?: number;
    scale?: number;
    depth?: number;
}): RenderComponent => ({
    type: "render",
    spriteName: options.spriteName,
    color: options.color,
    outlineColor: options.outlineColor,
    scale: options.scale || 1,
    depth: options.depth || 2,
});

export const createMovementComponent = (
    moveRange: number,
    movementPoints: number
): MovementComponent => ({
    type: "movement",
    moveRange,
    movementPoints,
    maxMovementPoints: movementPoints,
    hasMovedThisTurn: false,
    isMoving: false,
});

export const createCombatComponent = (
    attackRange: number,
    actionPoints: number,
    attackType: "melee" | "ranged" | "magic" = "melee"
): CombatComponent => ({
    type: "combat",
    attackRange,
    hasActed: false,
    actionPoints,
    maxActionPoints: actionPoints,
    attackType,
    damageModifiers: {},
});

export const createSpellComponent = (
    availableSpells: Spell[] = [],
    spellSlots: number = 5
): SpellComponent => ({
    type: "spell",
    availableSpells: [...availableSpells],
    equippedSpells: [],
    spellModifiers: {},
    spellSlots,
});

export const createAIComponent = (
    enemyType: string,
    behavior: "aggressive" | "defensive" | "support" = "aggressive"
): AIComponent => ({
    type: "ai",
    enemyType,
    behavior,
    decisionCooldown: 0,
});

export const createUIComponent = (): UIComponent => ({
    type: "ui",
    isTooltipVisible: false,
    isInteractive: true,
});

export const createSoundComponent = (volume: number = 0.3): SoundComponent => ({
    type: "sound",
    volume,
});

export const createTeamComponent = (
    team: "player" | "enemy",
    isActive: boolean = true
): TeamComponent => ({
    type: "team",
    team,
    isActive,
});

