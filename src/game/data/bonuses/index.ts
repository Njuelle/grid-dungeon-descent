/**
 * Bonus Registry - Central export for all bonus definitions.
 * Provides typed access to all bonuses and utility functions for filtering.
 */

import { BonusDefinition, BonusCategory } from "../../core/types";
import { STAT_BONUSES } from "./stat-bonuses";
import { SPELL_BONUSES } from "./spell-bonuses";
import { PASSIVE_BONUSES } from "./passive-bonuses";

// =============================================================================
// Combined Registry
// =============================================================================

/**
 * All available bonuses in the game, combined from all categories.
 */
export const ALL_BONUSES: BonusDefinition[] = [
    ...STAT_BONUSES,
    ...SPELL_BONUSES,
    ...PASSIVE_BONUSES,
];

/**
 * Map of bonus ID to bonus definition for O(1) lookup.
 */
export const BONUS_REGISTRY: Map<string, BonusDefinition> = new Map(
    ALL_BONUSES.map((bonus) => [bonus.id, bonus])
);

// =============================================================================
// Lookup Functions
// =============================================================================

/**
 * Get a bonus by its ID.
 */
export function getBonusById(id: string): BonusDefinition | undefined {
    return BONUS_REGISTRY.get(id);
}

/**
 * Get all bonuses of a specific category.
 */
export function getBonusesByCategory(
    category: BonusCategory
): BonusDefinition[] {
    return ALL_BONUSES.filter((bonus) => bonus.category === category);
}

/**
 * Get all bonuses with a specific tag.
 */
export function getBonusesByTag(tag: string): BonusDefinition[] {
    return ALL_BONUSES.filter((bonus) => bonus.tags?.includes(tag));
}

/**
 * Get all bonuses that target a specific spell.
 */
export function getBonusesForSpell(spellId: string): BonusDefinition[] {
    return ALL_BONUSES.filter((bonus) =>
        bonus.effects.some((effect) => effect.target === spellId)
    );
}

/**
 * Get all stackable bonuses.
 */
export function getStackableBonuses(): BonusDefinition[] {
    return ALL_BONUSES.filter((bonus) => bonus.stackable === true);
}

/**
 * Check if a bonus exists.
 */
export function bonusExists(id: string): boolean {
    return BONUS_REGISTRY.has(id);
}

// =============================================================================
// Re-exports
// =============================================================================

export { STAT_BONUSES } from "./stat-bonuses";
export { SPELL_BONUSES } from "./spell-bonuses";
export { PASSIVE_BONUSES } from "./passive-bonuses";
