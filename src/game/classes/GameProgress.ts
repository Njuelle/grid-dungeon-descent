import { Bonus } from "./Bonus";
import { Artifact } from "./Artifact";
import { Spell } from "./Spell";
import { GAME_CONSTANTS } from "../../data/enums";

export class GameProgress {
    private static instance: GameProgress;
    private appliedBonuses: string[] = [];
    private wins: number = 0;
    private selectedClass: string = "warrior"; // Default to warrior
    private acquiredArtifacts: string[] = []; // IDs of acquired artifacts
    private equippedSpells: string[] = []; // IDs of equipped spells (max 5)

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

    public addBonus(bonusId: string): void {
        if (!this.appliedBonuses.includes(bonusId)) {
            this.appliedBonuses.push(bonusId);
            this.save();
        }
    }

    public getAppliedBonuses(): string[] {
        return [...this.appliedBonuses];
    }

    public incrementWins(): void {
        this.wins++;
        this.save();
    }

    public getWins(): number {
        return this.wins;
    }

    public setSelectedClass(classId: string): void {
        console.log("[GameProgress] Setting selected class to:", classId);
        this.selectedClass = classId;
        this.save();
        console.log("[GameProgress] Selected class saved");
    }

    public getSelectedClass(): string {
        return this.selectedClass;
    }

    public addArtifact(artifactId: string): void {
        if (!this.acquiredArtifacts.includes(artifactId)) {
            this.acquiredArtifacts.push(artifactId);
            this.save();
        }
    }

    public getAcquiredArtifacts(): string[] {
        return [...this.acquiredArtifacts];
    }

    public setAcquiredArtifacts(artifactIds: string[]): void {
        this.acquiredArtifacts = [...artifactIds];
        this.save();
    }

    public setEquippedSpells(spellIds: string[]): void {
        console.log("[GameProgress] setEquippedSpells called with:", spellIds);
        this.equippedSpells = spellIds.slice(0, 5); // Max 5 spells
        console.log(
            "[GameProgress] Set equipped spells to:",
            this.equippedSpells
        );
        this.save();
        console.log("[GameProgress] Equipped spells saved to localStorage");
    }

    public getEquippedSpells(): string[] {
        console.log(
            "[GameProgress] getEquippedSpells returning:",
            this.equippedSpells
        );
        return [...this.equippedSpells];
    }

    public shouldShowArtifactSelection(): boolean {
        // Check if next win (current wins + 1) would be a multiple of ARTIFACT_SELECTION_INTERVAL
        const nextWins = this.wins + 1;
        const shouldShow =
            nextWins > 0 &&
            nextWins % GAME_CONSTANTS.ARTIFACT_SELECTION_INTERVAL === 0;
        console.log(
            `[GameProgress] shouldShowArtifactSelection: current wins=${this.wins}, next wins=${nextWins}, interval=${GAME_CONSTANTS.ARTIFACT_SELECTION_INTERVAL}, shouldShow=${shouldShow}`
        );
        return shouldShow;
    }

    public reset(): void {
        this.appliedBonuses = [];
        this.wins = 0;
        this.acquiredArtifacts = [];
        this.equippedSpells = [];
        // Don't reset selected class when resetting progress
        this.save();
    }

    private save(): void {
        const data = {
            appliedBonuses: this.appliedBonuses,
            wins: this.wins,
            selectedClass: this.selectedClass,
            acquiredArtifacts: this.acquiredArtifacts,
            equippedSpells: this.equippedSpells,
        };
        console.log("[GameProgress] Saving to localStorage:", data);
        localStorage.setItem("tacticalGameProgress", JSON.stringify(data));
    }

    private load(): void {
        const saved = localStorage.getItem("tacticalGameProgress");
        console.log("[GameProgress] Loading from localStorage:", saved);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                console.log("[GameProgress] Parsed data:", data);
                this.appliedBonuses = data.appliedBonuses || [];
                this.wins = data.wins || 0;
                this.selectedClass = data.selectedClass || "warrior";
                this.acquiredArtifacts = data.acquiredArtifacts || [];
                this.equippedSpells = data.equippedSpells || [];
                console.log(
                    "[GameProgress] Loaded equipped spells:",
                    this.equippedSpells
                );
                console.log(
                    "[GameProgress] Loaded acquired artifacts:",
                    this.acquiredArtifacts
                );
            } catch (e) {
                console.error("Failed to load game progress:", e);
            }
        } else {
            console.log("[GameProgress] No saved data found in localStorage");
        }
    }
}

