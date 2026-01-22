/**
 * Artifact Registry - Central export for all artifact definitions.
 * Provides typed access to all artifacts and utility functions for filtering.
 */

import { ArtifactDefinition, PlayerClass } from "../../core/types";
import { WARRIOR_ARTIFACTS } from "./warrior-artifacts";
import { RANGER_ARTIFACTS } from "./ranger-artifacts";
import { MAGICIAN_ARTIFACTS } from "./magician-artifacts";
import { GENERIC_ARTIFACTS } from "./generic-artifacts";

// =============================================================================
// Combined Registry
// =============================================================================

/**
 * All artifacts available in the game.
 */
export const ALL_ARTIFACTS: ArtifactDefinition[] = [
    ...WARRIOR_ARTIFACTS,
    ...RANGER_ARTIFACTS,
    ...MAGICIAN_ARTIFACTS,
    ...GENERIC_ARTIFACTS,
];

/**
 * Map of artifact ID to artifact definition for O(1) lookup.
 */
export const ARTIFACT_REGISTRY: Map<string, ArtifactDefinition> = new Map(
    ALL_ARTIFACTS.map((artifact) => [artifact.id, artifact])
);

/**
 * Class-specific artifact maps for quick access.
 */
const CLASS_ARTIFACTS: Record<PlayerClass, ArtifactDefinition[]> = {
    warrior: WARRIOR_ARTIFACTS,
    ranger: RANGER_ARTIFACTS,
    magician: MAGICIAN_ARTIFACTS,
};

// =============================================================================
// Lookup Functions
// =============================================================================

/**
 * Get an artifact by its ID.
 */
export function getArtifactById(id: string): ArtifactDefinition | undefined {
    return ARTIFACT_REGISTRY.get(id);
}

/**
 * Get all artifacts available for a specific class.
 * Returns class-specific artifacts + generic artifacts.
 */
export function getArtifactsForClass(playerClass: PlayerClass): ArtifactDefinition[] {
    return [...CLASS_ARTIFACTS[playerClass], ...GENERIC_ARTIFACTS];
}

/**
 * Get only class-specific artifacts for a class.
 */
export function getClassSpecificArtifacts(playerClass: PlayerClass): ArtifactDefinition[] {
    return CLASS_ARTIFACTS[playerClass];
}

/**
 * Get only generic artifacts (available to all classes).
 */
export function getGenericArtifacts(): ArtifactDefinition[] {
    return GENERIC_ARTIFACTS;
}

/**
 * Check if an artifact is valid for a specific class.
 */
export function isArtifactValidForClass(
    artifactId: string,
    playerClass: PlayerClass
): boolean {
    const artifact = ARTIFACT_REGISTRY.get(artifactId);
    if (!artifact) return false;
    return (
        artifact.classRestriction === undefined ||
        artifact.classRestriction === playerClass
    );
}

/**
 * Get the spell ID granted by an artifact.
 */
export function getArtifactSpellId(artifactId: string): string | undefined {
    return ARTIFACT_REGISTRY.get(artifactId)?.grantedSpellId;
}

/**
 * Check if an artifact exists.
 */
export function artifactExists(id: string): boolean {
    return ARTIFACT_REGISTRY.has(id);
}

// =============================================================================
// Re-exports
// =============================================================================

export { WARRIOR_ARTIFACTS } from "./warrior-artifacts";
export { RANGER_ARTIFACTS } from "./ranger-artifacts";
export { MAGICIAN_ARTIFACTS } from "./magician-artifacts";
export { GENERIC_ARTIFACTS } from "./generic-artifacts";
