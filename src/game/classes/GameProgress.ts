import { Bonus } from "./Bonus";

export class GameProgress {
    private static instance: GameProgress;
    private appliedBonuses: string[] = [];
    private wins: number = 0;

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

    public reset(): void {
        this.appliedBonuses = [];
        this.wins = 0;
        this.save();
    }

    private save(): void {
        const data = {
            appliedBonuses: this.appliedBonuses,
            wins: this.wins,
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
            } catch (e) {
                console.error("Failed to load game progress:", e);
            }
        }
    }
}

