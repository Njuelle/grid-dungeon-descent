/**
 * StatusEffectSystem - Manages status effects on units.
 *
 * Responsibilities:
 * - Apply status effects to units
 * - Remove status effects from units
 * - Process effects at turn start (poison damage, stun AP removal)
 * - Process effects at turn end (decrement durations, remove expired)
 * - Query active effects on units
 * - Handle immunity checks
 */

import {
    StatusEffect,
    StatusEffectType,
    StatusEffectDefinition,
} from "../core/types";

// =============================================================================
// Status Effect Constants
// =============================================================================

/** Default values for status effects */
export const STATUS_EFFECT_DEFAULTS: Record<StatusEffectType, { value: number; duration: number }> = {
    poison: { value: 2, duration: 2 },      // 2 damage per turn for 2 turns
    stun: { value: 0, duration: 1 },        // Lose all AP for 1 turn
    root: { value: 0, duration: 1 },        // Cannot move for 1 turn
    vulnerable: { value: 1.5, duration: 2 }, // +50% damage taken for 2 turns
};

/** Visual colors for each status effect (hex values) */
export const STATUS_EFFECT_COLORS: Record<StatusEffectType, number> = {
    poison: 0x00ff00,    // Green
    stun: 0xffff00,      // Yellow
    root: 0x8b4513,      // Brown
    vulnerable: 0xff0000, // Red
};

/** Icon keys for status effects */
export const STATUS_EFFECT_ICONS: Record<StatusEffectType, string> = {
    poison: "icon_status_poison",
    stun: "icon_status_stun",
    root: "icon_status_root",
    vulnerable: "icon_status_vulnerable",
};

// =============================================================================
// Status Effect Event Types
// =============================================================================

export type StatusEffectEventType =
    | "effect_applied"
    | "effect_removed"
    | "effect_tick"
    | "effect_expired"
    | "effect_resisted"
    | "poison_damage";

export interface StatusEffectEvent {
    type: StatusEffectEventType;
    unitId: string;
    effect: StatusEffect;
    damage?: number;
}

export type StatusEffectEventCallback = (event: StatusEffectEvent) => void;

// =============================================================================
// Status Effect Result Types
// =============================================================================

export interface ApplyStatusResult {
    success: boolean;
    effect?: StatusEffect;
    reason?: string;
    wasRefreshed: boolean;
}

export interface TickResult {
    updatedEffects: StatusEffect[];
    expiredEffects: StatusEffect[];
    poisonDamage: number;
    wasStunned: boolean;
    wasRooted: boolean;
}

// =============================================================================
// StatusEffectSystem Class
// =============================================================================

export class StatusEffectSystem {
    private eventCallbacks: StatusEffectEventCallback[] = [];
    private immunities: Map<string, Set<StatusEffectType>> = new Map();

    // =========================================================================
    // Event Registration
    // =========================================================================

    /**
     * Register a callback for status effect events.
     */
    public onStatusEffectEvent(callback: StatusEffectEventCallback): void {
        this.eventCallbacks.push(callback);
    }

    /**
     * Remove a callback.
     */
    public offStatusEffectEvent(callback: StatusEffectEventCallback): void {
        const index = this.eventCallbacks.indexOf(callback);
        if (index !== -1) {
            this.eventCallbacks.splice(index, 1);
        }
    }

    // =========================================================================
    // Immunity Management
    // =========================================================================

    /**
     * Grant immunity to a status effect type for a unit.
     */
    public grantImmunity(unitId: string, statusType: StatusEffectType): void {
        if (!this.immunities.has(unitId)) {
            this.immunities.set(unitId, new Set());
        }
        this.immunities.get(unitId)!.add(statusType);
    }

    /**
     * Remove immunity to a status effect type for a unit.
     */
    public removeImmunity(unitId: string, statusType: StatusEffectType): void {
        const unitImmunities = this.immunities.get(unitId);
        if (unitImmunities) {
            unitImmunities.delete(statusType);
        }
    }

    /**
     * Check if a unit is immune to a status effect type.
     */
    public isImmune(unitId: string, statusType: StatusEffectType): boolean {
        const unitImmunities = this.immunities.get(unitId);
        return unitImmunities?.has(statusType) ?? false;
    }

    /**
     * Clear all immunities for a unit.
     */
    public clearImmunities(unitId: string): void {
        this.immunities.delete(unitId);
    }

    // =========================================================================
    // Status Effect Application
    // =========================================================================

    /**
     * Apply a status effect to a unit.
     */
    public applyStatusEffect(
        currentEffects: StatusEffect[],
        definition: StatusEffectDefinition,
        unitId: string,
        sourceId: string
    ): ApplyStatusResult {
        // Check immunity
        if (this.isImmune(unitId, definition.type)) {
            const resistedEffect: StatusEffect = {
                id: `${definition.type}_${Date.now()}`,
                type: definition.type,
                remainingTurns: 0,
                value: definition.value ?? STATUS_EFFECT_DEFAULTS[definition.type].value,
                sourceId,
            };
            
            this.emitEvent({
                type: "effect_resisted",
                unitId,
                effect: resistedEffect,
            });

            return {
                success: false,
                reason: `Unit is immune to ${definition.type}`,
                wasRefreshed: false,
            };
        }

        // Get default values if not specified
        const duration = definition.duration ?? STATUS_EFFECT_DEFAULTS[definition.type].duration;
        const value = definition.value ?? STATUS_EFFECT_DEFAULTS[definition.type].value;

        // Check if effect already exists (refresh duration instead of stacking)
        const existingIndex = currentEffects.findIndex(e => e.type === definition.type);
        
        if (existingIndex !== -1) {
            // Refresh the existing effect with the longer duration
            const existing = currentEffects[existingIndex];
            const newDuration = Math.max(existing.remainingTurns, duration);
            
            const refreshedEffect: StatusEffect = {
                ...existing,
                remainingTurns: newDuration,
                value: Math.max(existing.value, value), // Use higher value
                sourceId,
            };

            this.emitEvent({
                type: "effect_applied",
                unitId,
                effect: refreshedEffect,
            });

            return {
                success: true,
                effect: refreshedEffect,
                wasRefreshed: true,
            };
        }

        // Create new effect
        const newEffect: StatusEffect = {
            id: `${definition.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: definition.type,
            remainingTurns: duration,
            value,
            sourceId,
        };

        this.emitEvent({
            type: "effect_applied",
            unitId,
            effect: newEffect,
        });

        return {
            success: true,
            effect: newEffect,
            wasRefreshed: false,
        };
    }

    /**
     * Remove a specific status effect by ID.
     */
    public removeStatusEffect(
        currentEffects: StatusEffect[],
        effectId: string,
        unitId: string
    ): StatusEffect[] {
        const effectIndex = currentEffects.findIndex(e => e.id === effectId);
        
        if (effectIndex !== -1) {
            const removedEffect = currentEffects[effectIndex];
            
            this.emitEvent({
                type: "effect_removed",
                unitId,
                effect: removedEffect,
            });

            return [
                ...currentEffects.slice(0, effectIndex),
                ...currentEffects.slice(effectIndex + 1),
            ];
        }

        return currentEffects;
    }

    /**
     * Remove all status effects of a specific type.
     */
    public removeStatusEffectByType(
        currentEffects: StatusEffect[],
        statusType: StatusEffectType,
        unitId: string
    ): StatusEffect[] {
        const removed = currentEffects.filter(e => e.type === statusType);
        const remaining = currentEffects.filter(e => e.type !== statusType);

        for (const effect of removed) {
            this.emitEvent({
                type: "effect_removed",
                unitId,
                effect,
            });
        }

        return remaining;
    }

    /**
     * Remove all status effects from a unit.
     */
    public clearAllStatusEffects(
        currentEffects: StatusEffect[],
        unitId: string
    ): StatusEffect[] {
        for (const effect of currentEffects) {
            this.emitEvent({
                type: "effect_removed",
                unitId,
                effect,
            });
        }

        return [];
    }

    // =========================================================================
    // Turn Processing
    // =========================================================================

    /**
     * Process status effects at the start of a unit's turn.
     * - Apply poison damage
     * - Check for stun (will be handled by caller to set AP to 0)
     * - Check for root (will be handled by caller to set MP to 0)
     */
    public processEffectsOnTurnStart(
        currentEffects: StatusEffect[],
        unitId: string
    ): TickResult {
        let poisonDamage = 0;
        let wasStunned = false;
        let wasRooted = false;

        for (const effect of currentEffects) {
            switch (effect.type) {
                case "poison":
                    poisonDamage += effect.value;
                    this.emitEvent({
                        type: "poison_damage",
                        unitId,
                        effect,
                        damage: effect.value,
                    });
                    break;
                case "stun":
                    wasStunned = true;
                    break;
                case "root":
                    wasRooted = true;
                    break;
                // vulnerable doesn't do anything on turn start
            }

            this.emitEvent({
                type: "effect_tick",
                unitId,
                effect,
            });
        }

        return {
            updatedEffects: currentEffects,
            expiredEffects: [],
            poisonDamage,
            wasStunned,
            wasRooted,
        };
    }

    /**
     * Process status effects at the end of a unit's turn.
     * - Decrement durations
     * - Remove expired effects
     */
    public processEffectsOnTurnEnd(
        currentEffects: StatusEffect[],
        unitId: string
    ): TickResult {
        const updatedEffects: StatusEffect[] = [];
        const expiredEffects: StatusEffect[] = [];

        for (const effect of currentEffects) {
            const newDuration = effect.remainingTurns - 1;

            if (newDuration <= 0) {
                expiredEffects.push(effect);
                this.emitEvent({
                    type: "effect_expired",
                    unitId,
                    effect,
                });
            } else {
                updatedEffects.push({
                    ...effect,
                    remainingTurns: newDuration,
                });
            }
        }

        return {
            updatedEffects,
            expiredEffects,
            poisonDamage: 0,
            wasStunned: false,
            wasRooted: false,
        };
    }

    // =========================================================================
    // Queries
    // =========================================================================

    /**
     * Check if a unit has a specific status effect.
     */
    public hasStatusEffect(
        currentEffects: StatusEffect[],
        statusType: StatusEffectType
    ): boolean {
        return currentEffects.some(e => e.type === statusType);
    }

    /**
     * Check if a unit has any status effect.
     */
    public hasAnyStatusEffect(currentEffects: StatusEffect[]): boolean {
        return currentEffects.length > 0;
    }

    /**
     * Get a specific status effect by type.
     */
    public getStatusEffect(
        currentEffects: StatusEffect[],
        statusType: StatusEffectType
    ): StatusEffect | undefined {
        return currentEffects.find(e => e.type === statusType);
    }

    /**
     * Get all status effects of a specific type.
     */
    public getStatusEffectsByType(
        currentEffects: StatusEffect[],
        statusType: StatusEffectType
    ): StatusEffect[] {
        return currentEffects.filter(e => e.type === statusType);
    }

    /**
     * Get the number of different status effect types on a unit.
     */
    public getStatusEffectCount(currentEffects: StatusEffect[]): number {
        const types = new Set(currentEffects.map(e => e.type));
        return types.size;
    }

    /**
     * Check if unit is vulnerable and get the damage multiplier.
     */
    public getVulnerableMultiplier(currentEffects: StatusEffect[]): number {
        const vulnerable = this.getStatusEffect(currentEffects, "vulnerable");
        return vulnerable ? vulnerable.value : 1.0;
    }

    /**
     * Check if unit is stunned (has stun effect).
     */
    public isStunned(currentEffects: StatusEffect[]): boolean {
        return this.hasStatusEffect(currentEffects, "stun");
    }

    /**
     * Check if unit is rooted (has root effect).
     */
    public isRooted(currentEffects: StatusEffect[]): boolean {
        return this.hasStatusEffect(currentEffects, "root");
    }

    /**
     * Check if unit is poisoned (has poison effect).
     */
    public isPoisoned(currentEffects: StatusEffect[]): boolean {
        return this.hasStatusEffect(currentEffects, "poison");
    }

    /**
     * Check if unit is vulnerable (has vulnerable effect).
     */
    public isVulnerable(currentEffects: StatusEffect[]): boolean {
        return this.hasStatusEffect(currentEffects, "vulnerable");
    }

    /**
     * Get status effect descriptions for UI display.
     */
    public getStatusEffectDescriptions(currentEffects: StatusEffect[]): string[] {
        return currentEffects.map(effect => {
            switch (effect.type) {
                case "poison":
                    return `Poisoned: ${effect.value} dmg/turn (${effect.remainingTurns} turns)`;
                case "stun":
                    return `Stunned: Cannot act (${effect.remainingTurns} turns)`;
                case "root":
                    return `Rooted: Cannot move (${effect.remainingTurns} turns)`;
                case "vulnerable":
                    return `Vulnerable: +${Math.round((effect.value - 1) * 100)}% damage taken (${effect.remainingTurns} turns)`;
                default:
                    return `Unknown effect (${effect.remainingTurns} turns)`;
            }
        });
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    private emitEvent(event: StatusEffectEvent): void {
        for (const callback of this.eventCallbacks) {
            callback(event);
        }
    }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const statusEffectSystem = new StatusEffectSystem();
