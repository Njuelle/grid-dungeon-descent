/**
 * ArtifactSystem - Handles all artifact-related logic.
 * This is a pure TypeScript class with no Phaser dependencies.
 *
 * Responsibilities:
 * - Registry: Look up artifacts by ID, filter by class
 * - Selection: Generate random artifact choices for victory screen
 * - Validation: Check if artifact is valid for current class
 * - Inventory: Manage artifact add/remove/swap
 */

import { ArtifactDefinition, PlayerClass, SpellDefinition } from "../core/types";
import {
    ALL_ARTIFACTS,
    ARTIFACT_REGISTRY,
    getArtifactById,
    getArtifactsForClass,
    isArtifactValidForClass,
} from "../data/artifacts/index";
import { getSpellById } from "../data/spells/index";
import { GameProgress } from "../classes/GameProgress";

// =============================================================================
// ArtifactSystem Class
// =============================================================================

export class ArtifactSystem {
    // =========================================================================
    // Registry Methods
    // =========================================================================

    /**
     * Get an artifact by ID.
     */
    public getArtifact(id: string): ArtifactDefinition | undefined {
        return getArtifactById(id);
    }

    /**
     * Get all artifacts.
     */
    public getAllArtifacts(): ArtifactDefinition[] {
        return ALL_ARTIFACTS;
    }

    /**
     * Check if an artifact exists.
     */
    public hasArtifact(id: string): boolean {
        return ARTIFACT_REGISTRY.has(id);
    }

    /**
     * Get all artifacts available for a specific class.
     */
    public getArtifactsForClass(playerClass: PlayerClass): ArtifactDefinition[] {
        return getArtifactsForClass(playerClass);
    }

    /**
     * Check if an artifact is valid for a class.
     */
    public isArtifactValidForClass(artifactId: string, playerClass: PlayerClass): boolean {
        return isArtifactValidForClass(artifactId, playerClass);
    }

    // =========================================================================
    // Spell Access
    // =========================================================================

    /**
     * Get the spell granted by an artifact.
     */
    public getArtifactSpell(artifactId: string): SpellDefinition | undefined {
        const artifact = this.getArtifact(artifactId);
        if (!artifact) return undefined;
        return getSpellById(artifact.grantedSpellId);
    }

    /**
     * Get all spells from equipped artifacts.
     */
    public getSpellsFromArtifacts(artifactIds: string[]): SpellDefinition[] {
        const spells: SpellDefinition[] = [];
        for (const artifactId of artifactIds) {
            const spell = this.getArtifactSpell(artifactId);
            if (spell) {
                spells.push(spell);
            }
        }
        return spells;
    }

    // =========================================================================
    // Selection (Victory Screen)
    // =========================================================================

    /**
     * Get random artifacts for selection, filtered by player class.
     * Excludes already equipped artifacts.
     */
    public getRandomArtifacts(count: number): ArtifactDefinition[] {
        const progress = GameProgress.getInstance();
        const playerClass = progress.getClass();
        const equippedArtifacts = progress.getEquippedArtifacts();

        if (!playerClass) {
            console.warn("[ArtifactSystem] No class selected, returning empty array");
            return [];
        }

        // Get all valid artifacts for this class
        const validArtifacts = this.getArtifactsForClass(playerClass).filter(
            (artifact) => !equippedArtifacts.includes(artifact.id)
        );

        if (validArtifacts.length === 0) {
            console.warn("[ArtifactSystem] No valid artifacts available");
            return [];
        }

        // Shuffle and return requested count
        const shuffled = [...validArtifacts].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    /**
     * Get 2 random artifacts for the artifact selection screen.
     */
    public getArtifactChoices(): ArtifactDefinition[] {
        return this.getRandomArtifacts(2);
    }

    // =========================================================================
    // Inventory Management
    // =========================================================================

    /**
     * Equip an artifact.
     * Returns true if successful, false if inventory is full.
     */
    public equipArtifact(artifactId: string): boolean {
        const progress = GameProgress.getInstance();
        const playerClass = progress.getClass();

        if (!playerClass) {
            console.error("[ArtifactSystem] Cannot equip artifact: no class selected");
            return false;
        }

        // Validate artifact is valid for this class
        if (!this.isArtifactValidForClass(artifactId, playerClass)) {
            console.error(
                `[ArtifactSystem] Artifact ${artifactId} is not valid for class ${playerClass}`
            );
            return false;
        }

        return progress.addArtifact(artifactId);
    }

    /**
     * Unequip an artifact.
     */
    public unequipArtifact(artifactId: string): void {
        const progress = GameProgress.getInstance();
        progress.removeArtifact(artifactId);
    }

    /**
     * Replace an artifact at a specific index (for swap functionality).
     */
    public replaceArtifact(index: number, newArtifactId: string): boolean {
        const progress = GameProgress.getInstance();
        const playerClass = progress.getClass();

        if (!playerClass) {
            console.error("[ArtifactSystem] Cannot replace artifact: no class selected");
            return false;
        }

        // Validate new artifact is valid for this class
        if (!this.isArtifactValidForClass(newArtifactId, playerClass)) {
            console.error(
                `[ArtifactSystem] Artifact ${newArtifactId} is not valid for class ${playerClass}`
            );
            return false;
        }

        progress.replaceArtifact(index, newArtifactId);
        return true;
    }

    /**
     * Get currently equipped artifacts.
     */
    public getEquippedArtifacts(): ArtifactDefinition[] {
        const progress = GameProgress.getInstance();
        const artifactIds = progress.getEquippedArtifacts();
        return artifactIds
            .map((id) => this.getArtifact(id))
            .filter((a): a is ArtifactDefinition => a !== undefined);
    }

    /**
     * Check if inventory is full.
     */
    public isInventoryFull(): boolean {
        return GameProgress.getInstance().isArtifactInventoryFull();
    }

    /**
     * Get number of free inventory slots.
     */
    public getFreeSlots(): number {
        const progress = GameProgress.getInstance();
        return progress.getMaxArtifacts() - progress.getEquippedArtifacts().length;
    }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const artifactSystem = new ArtifactSystem();
