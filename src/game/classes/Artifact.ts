/**
 * Artifact System - Backward Compatibility Layer
 *
 * This file maintains backward compatibility with existing code while
 * using the new organized artifact content structure.
 */

import { Spell } from "./Spell";

export interface Artifact {
    id: string;
    name: string;
    description: string;
    icon: string;
    classId: string; // Which class this artifact is for
    spell: Spell; // The spell this artifact grants
    rarity: "common" | "rare" | "epic" | "legendary";
}

// Import from organized content structure
import {
    ALL_ARTIFACTS as ORGANIZED_ARTIFACTS,
    getArtifactsForClass as getOrganizedArtifactsForClass,
    getRandomArtifacts as getOrganizedRandomArtifacts,
} from "../content/artifacts";

// Maintain backward compatibility
export const ALL_ARTIFACTS: Artifact[] = ORGANIZED_ARTIFACTS;

// Re-export organized functions
export const getArtifactsForClass = getOrganizedArtifactsForClass;
export const getRandomArtifacts = getOrganizedRandomArtifacts;
