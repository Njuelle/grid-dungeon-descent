/**
 * Bonus Registry - Central export for all bonus definitions.
 * Provides typed access to all bonuses and utility functions for filtering.
 */

import { BonusDefinition, BonusCategory, PlayerClass } from "../../core/types";
import { COMMON_BONUSES } from "./common-bonuses";
import { WARRIOR_BONUSES } from "./warrior-bonuses";
import { RANGER_BONUSES } from "./ranger-bonuses";
import { MAGICIAN_BONUSES } from "./magician-bonuses";

// =============================================================================
// Combined Registry
// =============================================================================

/**
 * All available bonuses in the game, combined from all categories.
 */
export const ALL_BONUSES: BonusDefinition[] = [
    ...COMMON_BONUSES,
    ...WARRIOR_BONUSES,
    ...RANGER_BONUSES,
    ...MAGICIAN_BONUSES,
];

/**
 * Map of bonus ID to bonus definition for O(1) lookup.
 */
export const BONUS_REGISTRY: Map<string, BonusDefinition> = new Map(
    ALL_BONUSES.map((bonus) => [bonus.id, bonus])
);

/**
 * Class-specific bonus maps for quick access.
 */
const CLASS_BONUSES: Record<PlayerClass, BonusDefinition[]> = {
    warrior: WARRIOR_BONUSES,
    ranger: RANGER_BONUSES,
    magician: MAGICIAN_BONUSES,
};

// =============================================================================
// Class-Based Lookup Functions
// =============================================================================

/**
 * Get all bonuses available to a specific class.
 * Returns common bonuses + class-specific bonuses.
 */
export function getBonusesForClass(playerClass: PlayerClass): BonusDefinition[] {
    return [...COMMON_BONUSES, ...CLASS_BONUSES[playerClass]];
}

/**
 * Get only class-specific bonuses (excludes common).
 */
export function getClassSpecificBonuses(playerClass: PlayerClass): BonusDefinition[] {
    return CLASS_BONUSES[playerClass];
}

/**
 * Get only common bonuses (available to all classes).
 */
export function getCommonBonuses(): BonusDefinition[] {
    return COMMON_BONUSES;
}

// =============================================================================
// General Lookup Functions
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

export { COMMON_BONUSES } from "./common-bonuses";
export { WARRIOR_BONUSES } from "./warrior-bonuses";
export { RANGER_BONUSES } from "./ranger-bonuses";
export { MAGICIAN_BONUSES } from "./magician-bonuses";
