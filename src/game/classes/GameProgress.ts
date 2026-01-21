import { PlayerClass } from "../core/types";

/** Maximum number of artifacts a player can equip */
const MAX_ARTIFACTS = 3;

/** Wins interval for artifact selection (every N wins) */
const ARTIFACT_SELECTION_INTERVAL = 5;

export class GameProgress {
    private static instance: GameProgress;
    private appliedBonuses: string[] = [];
    private wins: number = 0;
    private selectedClass: PlayerClass | null = null;
    private equippedArtifacts: string[] = [];

    private constructor() {
        // Load from localStorage if available
        this.load();
    }

    public static getInstance(): GameProgress {
        if (!GameProgress.instance) {
            GameProgress.instance = new GameProgress();
        }
        return GameProgress.instance;
    }

    // =========================================================================
    // Bonus Methods
    // =========================================================================

    public addBonus(bonusId: string): void {
        if (!this.appliedBonuses.includes(bonusId)) {
            this.appliedBonuses.push(bonusId);
            this.save();
        }
    }

    public getAppliedBonuses(): string[] {
        return [...this.appliedBonuses];
    }

    // =========================================================================
    // Wins Methods
    // =========================================================================

    public incrementWins(): void {
        this.wins++;
        this.save();
    }

    public getWins(): number {
        return this.wins;
    }

    // =========================================================================
    // Class Methods
    // =========================================================================

    public setClass(playerClass: PlayerClass): void {
        this.selectedClass = playerClass;
        this.save();
    }

    public getClass(): PlayerClass | null {
        return this.selectedClass;
    }

    public hasSelectedClass(): boolean {
        return this.selectedClass !== null;
    }

    // =========================================================================
    // Artifact Methods
    // =========================================================================

    /**
     * Add an artifact to equipped list.
     * Returns true if successful, false if inventory is full.
     */
    public addArtifact(artifactId: string): boolean {
        if (this.equippedArtifacts.length >= MAX_ARTIFACTS) {
            return false;
        }
        if (!this.equippedArtifacts.includes(artifactId)) {
            this.equippedArtifacts.push(artifactId);
            this.save();
        }
        return true;
    }

    /**
     * Remove an artifact from equipped list.
     */
    public removeArtifact(artifactId: string): void {
        const index = this.equippedArtifacts.indexOf(artifactId);
        if (index !== -1) {
            this.equippedArtifacts.splice(index, 1);
            this.save();
        }
    }

    /**
     * Replace an artifact at a specific index.
     * Used for drag-and-drop swap functionality.
     */
    public replaceArtifact(index: number, newArtifactId: string): void {
        if (index >= 0 && index < this.equippedArtifacts.length) {
            this.equippedArtifacts[index] = newArtifactId;
            this.save();
        }
    }

    /**
     * Get all equipped artifact IDs.
     */
    public getEquippedArtifacts(): string[] {
        return [...this.equippedArtifacts];
    }

    /**
     * Check if a specific artifact is equipped.
     */
    public hasArtifact(artifactId: string): boolean {
        return this.equippedArtifacts.includes(artifactId);
    }

    /**
     * Check if artifact inventory is full.
     */
    public isArtifactInventoryFull(): boolean {
        return this.equippedArtifacts.length >= MAX_ARTIFACTS;
    }

    /**
     * Get maximum number of artifacts that can be equipped.
     */
    public getMaxArtifacts(): number {
        return MAX_ARTIFACTS;
    }

    // =========================================================================
    // Selection Logic
    // =========================================================================

    /**
     * Check if artifact selection should be shown instead of bonus selection.
     * Returns true if wins is a multiple of ARTIFACT_SELECTION_INTERVAL (e.g., 5, 10, 15...)
     */
    public shouldShowArtifactSelection(): boolean {
        return this.wins > 0 && this.wins % ARTIFACT_SELECTION_INTERVAL === 0;
    }

    /**
     * Get the artifact selection interval.
     */
    public getArtifactSelectionInterval(): number {
        return ARTIFACT_SELECTION_INTERVAL;
    }

    // =========================================================================
    // Reset
    // =========================================================================

    public reset(): void {
        this.appliedBonuses = [];
        this.wins = 0;
        this.selectedClass = null;
        this.equippedArtifacts = [];
        this.save();
    }

    // =========================================================================
    // Persistence
    // =========================================================================

    private save(): void {
        const data = {
            appliedBonuses: this.appliedBonuses,
            wins: this.wins,
            selectedClass: this.selectedClass,
            equippedArtifacts: this.equippedArtifacts,
        };
        localStorage.setItem("tacticalGameProgress", JSON.stringify(data));
    }

    private load(): void {
        const saved = localStorage.getItem("tacticalGameProgress");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.appliedBonuses = data.appliedBonuses || [];
                this.wins = data.wins || 0;
                this.selectedClass = data.selectedClass || null;
                this.equippedArtifacts = data.equippedArtifacts || [];
            } catch (e) {
                console.error("Failed to load game progress:", e);
            }
        }
    }
}

