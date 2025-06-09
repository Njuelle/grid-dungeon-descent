/**
 * Artifact System - Simplified and Clean
 *
 * Artifacts now simply reference spells by ID instead of embedding full spell objects.
 * This creates a cleaner separation between artifacts and spells.
 */

import { getSpellById, ALL_SPELLS } from "../content/spells";
import { Spell } from "./Spell";

export interface Artifact {
    id: string;
    name: string;
    description: string;
    icon: string;
    classId: string; // Which class this artifact is for
    spellId: string; // Reference to the spell this artifact grants
    rarity: "common" | "rare" | "epic" | "legendary";
}

/**
 * Get the spell associated with an artifact
 */
export function getArtifactSpell(artifact: Artifact): Spell | undefined {
    return getSpellById(artifact.spellId);
}

/**
 * Check if an artifact's spell is valid
 */
export function isValidArtifact(artifact: Artifact): boolean {
    return getSpellById(artifact.spellId) !== undefined;
}

// Re-export from organized content
export {
    getRandomArtifacts,
    ALL_ARTIFACTS,
    getArtifactsForClass,
} from "../content/artifacts";

