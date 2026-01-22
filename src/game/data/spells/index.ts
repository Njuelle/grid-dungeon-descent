/**
 * Spell Registry - Central export for all spell definitions.
 * Provides typed access to all spells and utility functions for filtering.
 */

import { SpellDefinition, PlayerClass } from "../../core/types";
import { WARRIOR_STARTING_SPELLS, WARRIOR_ARTIFACT_SPELLS } from "./warrior-spells";
import { RANGER_STARTING_SPELLS, RANGER_ARTIFACT_SPELLS } from "./ranger-spells";
import { MAGICIAN_STARTING_SPELLS, MAGICIAN_ARTIFACT_SPELLS } from "./magician-spells";
import { GENERIC_ARTIFACT_SPELLS } from "./generic-spells";

// =============================================================================
// Combined Registry
// =============================================================================

/**
 * All player spells available in the game.
 */
export const PLAYER_SPELLS: SpellDefinition[] = [
    ...WARRIOR_STARTING_SPELLS,
    ...RANGER_STARTING_SPELLS,
    ...MAGICIAN_STARTING_SPELLS,
    ...WARRIOR_ARTIFACT_SPELLS,
    ...RANGER_ARTIFACT_SPELLS,
    ...MAGICIAN_ARTIFACT_SPELLS,
    ...GENERIC_ARTIFACT_SPELLS,
];

/**
 * Map of spell ID to spell definition for O(1) lookup.
 */
export const SPELL_REGISTRY: Map<string, SpellDefinition> = new Map(
    PLAYER_SPELLS.map((spell) => [spell.id, spell])
);

/**
 * Class-specific starting spell maps for quick access.
 */
const CLASS_STARTING_SPELLS: Record<PlayerClass, SpellDefinition[]> = {
    warrior: WARRIOR_STARTING_SPELLS,
    ranger: RANGER_STARTING_SPELLS,
    magician: MAGICIAN_STARTING_SPELLS,
};

/**
 * Class-specific artifact spell maps for quick access.
 */
const CLASS_ARTIFACT_SPELLS: Record<PlayerClass, SpellDefinition[]> = {
    warrior: WARRIOR_ARTIFACT_SPELLS,
    ranger: RANGER_ARTIFACT_SPELLS,
    magician: MAGICIAN_ARTIFACT_SPELLS,
};

// =============================================================================
// Lookup Functions
// =============================================================================

/**
 * Get a spell by its ID.
 */
export function getSpellById(id: string): SpellDefinition | undefined {
    return SPELL_REGISTRY.get(id);
}

/**
 * Get multiple spells by their IDs.
 */
export function getSpellsByIds(ids: string[]): SpellDefinition[] {
    return ids
        .map((id) => SPELL_REGISTRY.get(id))
        .filter((spell): spell is SpellDefinition => spell !== undefined);
}

/**
 * Get all spells of a specific type.
 */
export function getSpellsByType(
    type: "melee" | "ranged" | "magic"
): SpellDefinition[] {
    return PLAYER_SPELLS.filter((spell) => spell.type === type);
}

/**
 * Get all buff spells.
 */
export function getBuffSpells(): SpellDefinition[] {
    return PLAYER_SPELLS.filter((spell) => spell.spellCategory === "buff");
}

/**
 * Get all attack spells.
 */
export function getAttackSpells(): SpellDefinition[] {
    return PLAYER_SPELLS.filter((spell) => spell.spellCategory !== "buff");
}

/**
 * Check if a spell is a buff spell.
 */
export function isBuffSpell(spellId: string): boolean {
    const spell = SPELL_REGISTRY.get(spellId);
    return spell?.spellCategory === "buff";
}

/**
 * Get starting spells for a specific class.
 */
export function getStartingSpellsForClass(playerClass: PlayerClass): SpellDefinition[] {
    return CLASS_STARTING_SPELLS[playerClass];
}

/**
 * Get artifact spells for a specific class.
 */
export function getArtifactSpellsForClass(playerClass: PlayerClass): SpellDefinition[] {
    return [...CLASS_ARTIFACT_SPELLS[playerClass], ...GENERIC_ARTIFACT_SPELLS];
}

/**
 * Check if a spell exists.
 */
export function spellExists(id: string): boolean {
    return SPELL_REGISTRY.has(id);
}

// =============================================================================
// Re-exports
// =============================================================================

export { WARRIOR_STARTING_SPELLS, WARRIOR_ARTIFACT_SPELLS } from "./warrior-spells";
export { RANGER_STARTING_SPELLS, RANGER_ARTIFACT_SPELLS } from "./ranger-spells";
export { MAGICIAN_STARTING_SPELLS, MAGICIAN_ARTIFACT_SPELLS } from "./magician-spells";
export { GENERIC_ARTIFACT_SPELLS } from "./generic-spells";
