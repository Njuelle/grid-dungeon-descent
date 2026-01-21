/**
 * Core type definitions for game state.
 * These types are pure TypeScript with no Phaser dependencies,
 * making them suitable for server-side use.
 */

// =============================================================================
// Stat Types
// =============================================================================

export type StatName =
    | "health"
    | "maxHealth"
    | "force"
    | "dexterity"
    | "intelligence"
    | "armor"
    | "magicResistance"
    | "movementPoints"
    | "maxMovementPoints"
    | "actionPoints"
    | "maxActionPoints"
    | "moveRange"
    | "attackRange";

export type SpellProperty =
    | "damage"
    | "range"
    | "minRange"
    | "apCost"
    | "aoeShape"
    | "aoeRadius";

export type AttackType = "melee" | "ranged" | "magic";
export type DamageType = "physical" | "magic";
export type AoeShape = "circle" | "line" | "cone";
export type Team = "player" | "enemy";

// =============================================================================
// Player Class Types
// =============================================================================

export type PlayerClass = "warrior" | "ranger" | "magician";

export interface ClassDefinition {
    id: PlayerClass;
    name: string;
    description: string;
    spriteKey: string;
    baseStats: UnitStats;
    startingSpellIds: string[];
}

// =============================================================================
// Artifact Types
// =============================================================================

export interface ArtifactDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    /** If defined, only this class can use this artifact */
    classRestriction?: PlayerClass;
    /** The spell ID this artifact grants */
    grantedSpellId: string;
}

// =============================================================================
// Buff Types
// =============================================================================

export type BuffType = "stat_boost" | "damage_boost" | "mark" | "shield" | "instant";

export interface ActiveBuff {
    id: string;
    buffType: BuffType;
    remainingTurns: number;
    stat?: StatName;
    value: number;
    sourceSpellId: string;
}

// =============================================================================
// Unit Stats
// =============================================================================

export interface UnitStats {
    health: number;
    maxHealth: number;
    moveRange: number;
    attackRange: number;
    movementPoints?: number;
    maxMovementPoints?: number;
    actionPoints?: number;
    maxActionPoints?: number;
    force: number;
    dexterity: number;
    intelligence?: number;
    armor: number;
    magicResistance?: number;
}

// =============================================================================
// Position Types
// =============================================================================

export interface GridPosition {
    x: number;
    y: number;
}

// =============================================================================
// Spell Types
// =============================================================================

export type SpellCategory = "attack" | "buff";

export interface BuffEffect {
    type: BuffType;
    /** Stat to modify (for stat_boost type) */
    stat?: StatName;
    /** Value of the buff effect */
    value: number;
    /** Duration in turns (0 = instant effect like heal/gain AP) */
    duration: number;
    /** True for self-buffs, false for enemy debuffs/marks */
    targetSelf?: boolean;
}

export interface SpellDefinition {
    id: string;
    name: string;
    icon: string;
    apCost: number;
    range: number;
    minRange?: number;
    damage: number;
    description: string;
    type: AttackType;
    effect?: string;
    duration?: number;
    aoeShape?: AoeShape;
    aoeRadius?: number;
    /** Category of spell: attack (default) or buff */
    spellCategory?: SpellCategory;
    /** Buff effect configuration (for buff spells) */
    buffEffect?: BuffEffect;
}

// =============================================================================
// Bonus Types
// =============================================================================

export type BonusCategory = "stat" | "spell" | "passive";

export type BonusEffectType =
    | "stat_modifier"
    | "spell_modifier"
    | "on_hit"
    | "on_turn_start"
    | "on_damage_taken"
    | "on_kill"
    | "on_battle_start"
    | "conditional";

export interface StatModifier {
    stat: StatName;
    value: number;
}

export interface SpellModifier {
    property: SpellProperty;
    value: number | string; // string for aoeShape
}

export interface TriggerCondition {
    type:
        | "health_below"
        | "health_above"
        | "has_aoe"
        | "at_max_range"
        | "target_health_below"
        | "target_health_above"
        | "has_not_moved"
        | "is_melee_attack"
        | "is_magic_spell"
        | "is_ranged_spell"
        | "random_chance";
    value?: number; // percentage for health checks, chance for random
    targetSpell?: string; // for spell-specific conditions
}

export interface BonusEffect {
    type: BonusEffectType;
    target?: string; // spell id for spell modifiers
    statModifier?: StatModifier;
    spellModifier?: SpellModifier;
    trigger?: {
        effect: "heal" | "damage" | "add_mp" | "add_ap" | "add_stat" | "refund_ap";
        value: number;
        stat?: StatName;
    };
    condition?: TriggerCondition;
}

export interface BonusDefinition {
    id: string;
    category: BonusCategory;
    name: string;
    description: string;
    icon: string;
    effects: BonusEffect[];
    /** If true, this bonus can be picked multiple times */
    stackable?: boolean;
    /** Tags for filtering (e.g., "offensive", "defensive", "mobility") */
    tags?: string[];
}

// =============================================================================
// Combat Types
// =============================================================================

export interface DamageCalculation {
    baseDamage: number;
    statBonus: number;
    bonusEffects: number;
    randomFactor: number;
    totalRaw: number;
    resistance: number;
    finalDamage: number;
    isCritical: boolean;
}

export interface AttackContext {
    attackerId: string;
    targetId: string;
    spell: SpellDefinition;
    distance: number;
    attackerStats: UnitStats;
    targetStats: UnitStats;
    appliedBonuses: string[];
}

// =============================================================================
// Game State Types
// =============================================================================

export interface UnitState {
    id: string;
    team: Team;
    position: GridPosition;
    stats: UnitStats;
    hasActed: boolean;
    hasMovedThisTurn: boolean;
    currentSpellId?: string;
    enemyType?: string;
    /** Active buffs on this unit */
    activeBuffs?: ActiveBuff[];
}

export interface GameStateSnapshot {
    turn: number;
    currentTeam: Team;
    units: UnitState[];
    appliedBonuses: string[];
    wins: number;
    isGameOver: boolean;
    isVictory: boolean;
    /** Selected player class */
    playerClass?: PlayerClass;
    /** Equipped artifact IDs */
    equippedArtifacts?: string[];
}
