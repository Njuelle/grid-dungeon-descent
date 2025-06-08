/**
 * Artifact Content Index - Organized artifact categories and utilities
 *
 * All artifacts are now organized by class for better maintainability:
 * - WarriorArtifacts: Melee combat and physical prowess focused
 * - RangerArtifacts: Ranged combat and agility focused
 * - MageArtifacts: Magic and spellcasting focused
 */

import { Artifact } from "../../classes/Artifact";
import { WARRIOR_ARTIFACTS } from "./WarriorArtifacts";
import { RANGER_ARTIFACTS } from "./RangerArtifacts";
import { MAGE_ARTIFACTS } from "./MageArtifacts";

// Export organized categories
export { WARRIOR_ARTIFACTS } from "./WarriorArtifacts";
export { RANGER_ARTIFACTS } from "./RangerArtifacts";
export { MAGE_ARTIFACTS } from "./MageArtifacts";

// Combined collection for backward compatibility
export const ALL_ARTIFACTS: Artifact[] = [
    ...WARRIOR_ARTIFACTS,
    ...RANGER_ARTIFACTS,
    ...MAGE_ARTIFACTS,
];

// ===== ARTIFACT UTILITIES =====

/**
 * Get all artifacts for a specific class
 */
export function getArtifactsForClass(classId: string): Artifact[] {
    return ALL_ARTIFACTS.filter((artifact) => artifact.classId === classId);
}

/**
 * Get artifacts by category for more granular filtering
 */
export function getArtifactsByCategory(
    category: "warrior" | "ranger" | "mage"
): Artifact[] {
    switch (category) {
        case "warrior":
            return WARRIOR_ARTIFACTS;
        case "ranger":
            return RANGER_ARTIFACTS;
        case "mage":
            return MAGE_ARTIFACTS;
        default:
            return [];
    }
}

/**
 * Get random artifacts for a specific class
 */
export function getRandomArtifacts(classId: string, count: number): Artifact[] {
    const classArtifacts = getArtifactsForClass(classId);
    const shuffled = [...classArtifacts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get artifacts by rarity level
 */
export function getArtifactsByRarity(
    rarity: "common" | "rare" | "epic" | "legendary"
): Artifact[] {
    return ALL_ARTIFACTS.filter((artifact) => artifact.rarity === rarity);
}

/**
 * Get artifacts for a class filtered by rarity
 */
export function getArtifactsForClassByRarity(
    classId: string,
    rarity: "common" | "rare" | "epic" | "legendary"
): Artifact[] {
    return getArtifactsForClass(classId).filter(
        (artifact) => artifact.rarity === rarity
    );
}

/**
 * Get an artifact by its ID from any category
 */
export function getArtifactById(artifactId: string): Artifact | undefined {
    return ALL_ARTIFACTS.find((artifact) => artifact.id === artifactId);
}

/**
 * Get artifacts that provide spells of a specific type
 */
export function getArtifactsBySpellType(
    spellType: "melee" | "ranged" | "magic"
): Artifact[] {
    return ALL_ARTIFACTS.filter(
        (artifact) => artifact.spell.type === spellType
    );
}

/**
 * Get artifacts with specific effects (healing, damage, utility, etc.)
 */
export function getArtifactsByEffect(
    effectType: "damage" | "healing" | "utility" | "aoe"
): Artifact[] {
    switch (effectType) {
        case "damage":
            return ALL_ARTIFACTS.filter(
                (artifact) => artifact.spell.damage > 0
            );
        case "healing":
            return ALL_ARTIFACTS.filter(
                (artifact) => artifact.spell.damage < 0
            );
        case "utility":
            return ALL_ARTIFACTS.filter(
                (artifact) => artifact.spell.damage === 0
            );
        case "aoe":
            return ALL_ARTIFACTS.filter((artifact) => artifact.spell.aoeShape);
        default:
            return [];
    }
}

/**
 * Get a weighted random selection of artifacts (legendaries are rarer)
 */
export function getWeightedRandomArtifacts(
    classId: string,
    count: number
): Artifact[] {
    const classArtifacts = getArtifactsForClass(classId);

    // Create weighted pool (common=4, rare=3, epic=2, legendary=1)
    const weightedPool: Artifact[] = [];

    classArtifacts.forEach((artifact) => {
        let weight = 1;
        switch (artifact.rarity) {
            case "common":
                weight = 4;
                break;
            case "rare":
                weight = 3;
                break;
            case "epic":
                weight = 2;
                break;
            case "legendary":
                weight = 1;
                break;
        }

        for (let i = 0; i < weight; i++) {
            weightedPool.push(artifact);
        }
    });

    // Shuffle and select unique artifacts
    const shuffled = [...weightedPool].sort(() => Math.random() - 0.5);
    const selected: Artifact[] = [];
    const seenIds = new Set<string>();

    for (const artifact of shuffled) {
        if (!seenIds.has(artifact.id)) {
            selected.push(artifact);
            seenIds.add(artifact.id);
            if (selected.length >= count) break;
        }
    }

    return selected;
}
