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
// Status Effect Types
// =============================================================================

export type StatusEffectType = "poison" | "stun" | "root" | "vulnerable";

export interface StatusEffect {
    /** Unique ID for this status effect instance */
    id: string;
    /** Type of status effect */
    type: StatusEffectType;
    /** Remaining turns before effect expires */
    remainingTurns: number;
    /** Value of the effect (damage for poison, multiplier for vulnerable) */
    value: number;
    /** ID of the unit/spell that applied this effect */
    sourceId: string;
}

export interface StatusEffectDefinition {
    /** Type of status effect to apply */
    type: StatusEffectType;
    /** Duration in turns */
    duration: number;
    /** Value of the effect (damage per turn for poison, damage multiplier for vulnerable) */
    value?: number;
}

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

export type CurseType =
    | "damage_per_turn"      // Lose HP at start of each turn
    | "damage_on_cast"       // Lose HP when casting the granted spell
    | "stat_penalty"         // Permanent stat reduction
    | "healing_reduction"    // Reduced healing from all sources
    | "miss_chance"          // Chance for attacks to miss
    | "turn_limit_damage"    // Take damage after N turns
    | "no_buff_spells"       // Cannot use buff spells
    | "no_move_after_cast"   // Cannot move after casting
    | "self_pull"            // Pulled toward target when casting
    | "ap_penalty_on_miss"   // Lose AP if spell doesn't kill
    // Status effect related curses
    | "start_battle_poisoned"   // Start each battle with Poison
    | "start_battle_rooted"     // Start each battle Rooted
    | "self_status_on_apply"    // Chance to apply status to yourself when applying to enemy
    | "status_on_attack"        // Every attack applies a status to yourself
    | "damage_on_status_apply"  // Take damage when applying status effects
    | "min_attack_range";       // Cannot attack enemies within X tiles

export interface CurseEffect {
    type: CurseType;
    /** Value for the curse (damage amount, stat reduction, percentage, etc.) */
    value?: number;
    /** Stat affected (for stat_penalty type) */
    stat?: StatName;
    /** Turn threshold (for turn_limit_damage) */
    turnThreshold?: number;
    /** Status effect type for status-related curses */
    statusType?: StatusEffectType;
    /** Duration for status effect curses */
    statusDuration?: number;
    /** Human-readable description of the curse */
    description: string;
}

export interface ArtifactDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    /** Visual description for AI icon generation */
    iconDescription?: string;
    /** If defined, only this class can use this artifact */
    classRestriction?: PlayerClass;
    /** The spell ID this artifact grants */
    grantedSpellId: string;
    /** If present, this artifact is cursed with a drawback */
    curse?: CurseEffect;
}

// =============================================================================
// Buff Types
// =============================================================================

export type BuffType = "stat_boost" | "damage_boost" | "shield" | "instant";

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
    /** Visual description for AI icon generation */
    iconDescription?: string;
    type: AttackType;
    effect?: string;
    duration?: number;
    aoeShape?: AoeShape;
    aoeRadius?: number;
    /** Category of spell: attack (default) or buff */
    spellCategory?: SpellCategory;
    /** Buff effect configuration (for buff spells) */
    buffEffect?: BuffEffect;
    /** Status effect to apply on hit */
    statusEffect?: StatusEffectDefinition;
    /** VFX animation key to play when spell is cast */
    animation?: string;
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
    | "conditional"
    | "on_first_attack"      // First attack of turn/battle
    | "scaling_per_kill"     // Scales with kills this battle
    | "scaling_per_damage"   // Scales when taking damage
    | "scaling_per_spell"    // Scales with spell casts
    | "scaling_no_attack"    // Scales when not attacking
    | "chance_on_hit"        // Random chance effect on hit
    | "chance_on_cast"       // Random chance effect on spell cast
    | "chance_on_damage"     // Random chance when taking damage
    | "chance_on_battle_start" // Random effect at battle start
    // Status effect related
    | "on_status_apply"      // Triggers when applying a status effect
    | "on_status_receive"    // Triggers when receiving a status effect
    | "status_duration_mod"  // Modifies duration of status effects
    | "status_damage_mod"    // Modifies damage from status effects (poison)
    | "status_immunity"      // Grants immunity to specific status
    | "conditional_status";  // Bonus activates based on target's status

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
        | "random_chance"
        | "is_first_attack"         // First attack of the turn
        | "is_first_attack_battle"  // First attack of the battle
        | "adjacent_enemies"        // Number of adjacent enemies
        | "distance_from_start"     // Distance from starting position
        | "consecutive_attacks"     // Number of attacks without moving
        // Status effect conditions
        | "target_has_status"       // Target has specific status effect
        | "target_has_any_status"   // Target has any status effect
        | "self_has_status"         // Self has specific status effect
        | "self_has_no_status"      // Self has no status effects
        | "on_status_expire"        // When a status effect expires
        | "multiple_statuses";      // Target has 2+ different statuses
    value?: number; // percentage for health checks, chance for random, count for adjacents
    targetSpell?: string; // for spell-specific conditions
    /** Status effect type for status-related conditions */
    statusType?: StatusEffectType;
}

export interface BonusEffect {
    type: BonusEffectType;
    target?: string; // spell id for spell modifiers
    statModifier?: StatModifier;
    spellModifier?: SpellModifier;
    trigger?: {
        effect: "heal" | "damage" | "add_mp" | "add_ap" | "add_stat" | "refund_ap" | "damage_multiplier" | "negate_damage" | "apply_status" | "remove_status" | "spread_status";
        value: number;
        stat?: StatName;
        /** For scaling effects: max stacks or max bonus */
        maxValue?: number;
        /** For chance effects: percentage chance (0-100) */
        chance?: number;
        /** For status effect triggers */
        statusType?: StatusEffectType;
        /** Duration for status effects */
        statusDuration?: number;
    };
    condition?: TriggerCondition;
    /** For status immunity bonuses */
    immuneToStatus?: StatusEffectType;
}

export interface BonusDefinition {
    id: string;
    category: BonusCategory;
    name: string;
    description: string;
    icon: string;
    /** Visual description for AI icon generation */
    iconDescription?: string;
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
    /** Active status effects on this unit */
    statusEffects?: StatusEffect[];
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
