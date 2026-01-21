/**
 * BuffSystem - Manages temporary buffs and instant effects.
 * This is a pure TypeScript class with no Phaser dependencies.
 *
 * Responsibilities:
 * - Apply buffs to units (temporary stat boosts)
 * - Apply instant effects (heal, gain AP/MP)
 * - Tick buffs at turn start (decrement duration, remove expired)
 * - Calculate stat modifiers from active buffs
 */

import { ActiveBuff, BuffType, StatName, SpellDefinition, BuffEffect } from "../core/types";

// =============================================================================
// BuffSystem Class
// =============================================================================

export class BuffSystem {
    // =========================================================================
    // Buff Application
    // =========================================================================

    /**
     * Apply a buff from a spell's buff effect.
     * Returns the created ActiveBuff for temporary buffs, or null for instant effects.
     */
    public applyBuffEffect(
        buffEffect: BuffEffect,
        sourceSpellId: string,
        currentBuffs: ActiveBuff[]
    ): { buff: ActiveBuff | null; instantEffect: { stat: StatName; value: number } | null } {
        // Handle instant effects (duration = 0)
        if (buffEffect.duration === 0 || buffEffect.type === "instant") {
            return {
                buff: null,
                instantEffect: {
                    stat: buffEffect.stat || "health",
                    value: buffEffect.value,
                },
            };
        }

        // Create temporary buff
        const buff: ActiveBuff = {
            id: `${sourceSpellId}_${Date.now()}`,
            buffType: buffEffect.type,
            remainingTurns: buffEffect.duration,
            stat: buffEffect.stat,
            value: buffEffect.value,
            sourceSpellId: sourceSpellId,
        };

        return { buff, instantEffect: null };
    }

    /**
     * Add a buff to a unit's active buffs array.
     * Returns the updated array.
     */
    public addBuff(activeBuffs: ActiveBuff[], newBuff: ActiveBuff): ActiveBuff[] {
        // Check if a similar buff already exists (same source spell)
        const existingIndex = activeBuffs.findIndex(
            (b) => b.sourceSpellId === newBuff.sourceSpellId && b.stat === newBuff.stat
        );

        if (existingIndex !== -1) {
            // Refresh the existing buff
            const updated = [...activeBuffs];
            updated[existingIndex] = newBuff;
            return updated;
        }

        // Add new buff
        return [...activeBuffs, newBuff];
    }

    /**
     * Remove a specific buff from active buffs.
     */
    public removeBuff(activeBuffs: ActiveBuff[], buffId: string): ActiveBuff[] {
        return activeBuffs.filter((b) => b.id !== buffId);
    }

    /**
     * Remove all buffs from a specific source spell.
     */
    public removeBuffsBySource(activeBuffs: ActiveBuff[], sourceSpellId: string): ActiveBuff[] {
        return activeBuffs.filter((b) => b.sourceSpellId !== sourceSpellId);
    }

    // =========================================================================
    // Turn Management
    // =========================================================================

    /**
     * Tick all buffs at turn start.
     * Decrements duration and removes expired buffs.
     * Returns updated buffs array and any effects that should trigger (like regeneration).
     */
    public tickBuffs(activeBuffs: ActiveBuff[]): {
        updatedBuffs: ActiveBuff[];
        expiredBuffs: ActiveBuff[];
        tickEffects: { stat: StatName; value: number }[];
    } {
        const updatedBuffs: ActiveBuff[] = [];
        const expiredBuffs: ActiveBuff[] = [];
        const tickEffects: { stat: StatName; value: number }[] = [];

        for (const buff of activeBuffs) {
            // Handle tick effects (like regeneration)
            if (buff.stat === "health" && buff.buffType === "stat_boost" && buff.value > 0) {
                tickEffects.push({ stat: "health", value: buff.value });
            }

            // Decrement duration
            const newTurns = buff.remainingTurns - 1;

            if (newTurns <= 0) {
                expiredBuffs.push(buff);
            } else {
                updatedBuffs.push({
                    ...buff,
                    remainingTurns: newTurns,
                });
            }
        }

        return { updatedBuffs, expiredBuffs, tickEffects };
    }

    // =========================================================================
    // Stat Calculation
    // =========================================================================

    /**
     * Get the total modifier for a stat from all active buffs.
     */
    public getStatModifier(activeBuffs: ActiveBuff[], stat: StatName): number {
        return activeBuffs
            .filter((b) => b.stat === stat && b.buffType === "stat_boost")
            .reduce((total, b) => total + b.value, 0);
    }

    /**
     * Get all stat modifiers from active buffs.
     */
    public getAllStatModifiers(activeBuffs: ActiveBuff[]): Map<StatName, number> {
        const modifiers = new Map<StatName, number>();

        for (const buff of activeBuffs) {
            if (buff.stat && buff.buffType === "stat_boost") {
                const current = modifiers.get(buff.stat) || 0;
                modifiers.set(buff.stat, current + buff.value);
            }
        }

        return modifiers;
    }

    /**
     * Get damage boost from active buffs.
     */
    public getDamageBoost(activeBuffs: ActiveBuff[]): number {
        return activeBuffs
            .filter((b) => b.buffType === "damage_boost")
            .reduce((total, b) => total + b.value, 0);
    }

    /**
     * Get shield value from active buffs.
     */
    public getShieldValue(activeBuffs: ActiveBuff[]): number {
        return activeBuffs
            .filter((b) => b.buffType === "shield")
            .reduce((total, b) => total + b.value, 0);
    }

    /**
     * Get mark damage bonus (damage enemy takes extra).
     */
    public getMarkDamageBonus(activeBuffs: ActiveBuff[]): number {
        return activeBuffs
            .filter((b) => b.buffType === "mark")
            .reduce((total, b) => total + b.value, 0);
    }

    /**
     * Consume shield to absorb damage.
     * Returns remaining damage after shield absorption and updated buffs.
     */
    public consumeShield(
        activeBuffs: ActiveBuff[],
        incomingDamage: number
    ): { remainingDamage: number; updatedBuffs: ActiveBuff[] } {
        let remainingDamage = incomingDamage;
        const updatedBuffs: ActiveBuff[] = [];

        for (const buff of activeBuffs) {
            if (buff.buffType === "shield" && remainingDamage > 0) {
                const absorbed = Math.min(buff.value, remainingDamage);
                remainingDamage -= absorbed;
                const newShieldValue = buff.value - absorbed;

                if (newShieldValue > 0) {
                    updatedBuffs.push({ ...buff, value: newShieldValue });
                }
                // Shield depleted, don't add to updated buffs
            } else {
                updatedBuffs.push(buff);
            }
        }

        return { remainingDamage, updatedBuffs };
    }

    /**
     * Consume mark after dealing damage (mark is one-time use per hit).
     * Returns updated buffs with mark removed.
     */
    public consumeMark(activeBuffs: ActiveBuff[]): ActiveBuff[] {
        // Remove first mark buff found
        const markIndex = activeBuffs.findIndex((b) => b.buffType === "mark");
        if (markIndex !== -1) {
            return [...activeBuffs.slice(0, markIndex), ...activeBuffs.slice(markIndex + 1)];
        }
        return activeBuffs;
    }

    // =========================================================================
    // Queries
    // =========================================================================

    /**
     * Check if unit has a specific buff type active.
     */
    public hasBuffType(activeBuffs: ActiveBuff[], buffType: BuffType): boolean {
        return activeBuffs.some((b) => b.buffType === buffType);
    }

    /**
     * Check if unit has a buff from a specific source spell.
     */
    public hasBuffFromSpell(activeBuffs: ActiveBuff[], spellId: string): boolean {
        return activeBuffs.some((b) => b.sourceSpellId === spellId);
    }

    /**
     * Get all active buffs of a specific type.
     */
    public getBuffsByType(activeBuffs: ActiveBuff[], buffType: BuffType): ActiveBuff[] {
        return activeBuffs.filter((b) => b.buffType === buffType);
    }

    /**
     * Get buff descriptions for UI display.
     */
    public getBuffDescriptions(activeBuffs: ActiveBuff[]): string[] {
        return activeBuffs.map((buff) => {
            const sign = buff.value >= 0 ? "+" : "";
            switch (buff.buffType) {
                case "stat_boost":
                    return `${sign}${buff.value} ${buff.stat} (${buff.remainingTurns} turns)`;
                case "damage_boost":
                    return `${sign}${buff.value} damage (${buff.remainingTurns} turns)`;
                case "shield":
                    return `Shield: ${buff.value} HP (${buff.remainingTurns} turns)`;
                case "mark":
                    return `Marked: +${buff.value} damage taken (${buff.remainingTurns} turns)`;
                default:
                    return `Buff (${buff.remainingTurns} turns)`;
            }
        });
    }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const buffSystem = new BuffSystem();
