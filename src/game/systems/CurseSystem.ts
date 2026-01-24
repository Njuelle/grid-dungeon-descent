/**
 * CurseSystem - Manages curse effects from cursed artifacts.
 * This is a pure TypeScript class with no Phaser dependencies.
 *
 * Responsibilities:
 * - Track active curses on the player
 * - Apply curse effects at appropriate times (turn start, on cast, etc.)
 * - Provide curse information for UI display
 */

import { CurseEffect, CurseType, StatName, ArtifactDefinition } from "../core/types";

// =============================================================================
// Active Curse Interface
// =============================================================================

export interface ActiveCurse {
    /** The artifact ID that caused this curse */
    sourceArtifactId: string;
    /** The curse effect definition */
    curse: CurseEffect;
    /** The spell ID granted by the cursed artifact */
    grantedSpellId: string;
}

// =============================================================================
// CurseSystem Class
// =============================================================================

export class CurseSystem {
    private activeCurses: ActiveCurse[] = [];

    // =========================================================================
    // Curse Management
    // =========================================================================

    /**
     * Add a curse from an equipped cursed artifact.
     */
    public addCurse(artifact: ArtifactDefinition): void {
        if (!artifact.curse) return;

        // Check if curse from this artifact already exists
        const existing = this.activeCurses.find(c => c.sourceArtifactId === artifact.id);
        if (existing) return;

        this.activeCurses.push({
            sourceArtifactId: artifact.id,
            curse: artifact.curse,
            grantedSpellId: artifact.grantedSpellId,
        });
    }

    /**
     * Remove a curse when an artifact is unequipped.
     */
    public removeCurse(artifactId: string): void {
        this.activeCurses = this.activeCurses.filter(c => c.sourceArtifactId !== artifactId);
    }

    /**
     * Clear all curses (e.g., on game reset).
     */
    public clearAllCurses(): void {
        this.activeCurses = [];
    }

    /**
     * Get all active curses.
     */
    public getActiveCurses(): ActiveCurse[] {
        return [...this.activeCurses];
    }

    /**
     * Check if player has any active curses.
     */
    public hasAnyCurse(): boolean {
        return this.activeCurses.length > 0;
    }

    /**
     * Check if player has a specific curse type.
     */
    public hasCurseType(curseType: CurseType): boolean {
        return this.activeCurses.some(c => c.curse.type === curseType);
    }

    // =========================================================================
    // Turn Start Effects
    // =========================================================================

    /**
     * Get damage to apply at the start of the player's turn.
     */
    public getTurnStartDamage(): number {
        return this.activeCurses
            .filter(c => c.curse.type === "damage_per_turn")
            .reduce((total, c) => total + (c.curse.value || 0), 0);
    }

    /**
     * Get damage based on turn number (for turn_limit_damage curses).
     */
    public getTurnLimitDamage(currentTurn: number): number {
        return this.activeCurses
            .filter(c => c.curse.type === "turn_limit_damage" && currentTurn >= (c.curse.turnThreshold || 10))
            .reduce((total, c) => total + (c.curse.value || 0), 0);
    }

    // =========================================================================
    // On Cast Effects
    // =========================================================================

    /**
     * Get damage to apply when casting a specific spell.
     * Only applies if the spell is from a cursed artifact with damage_on_cast.
     */
    public getOnCastDamage(spellId: string): number {
        const curse = this.activeCurses.find(
            c => c.grantedSpellId === spellId && c.curse.type === "damage_on_cast"
        );
        return curse?.curse.value || 0;
    }

    /**
     * Check if player can cast a spell (not blocked by no_buff_spells curse).
     */
    public canCastSpell(spellCategory: "attack" | "buff" | undefined): boolean {
        if (spellCategory !== "buff") return true;
        return !this.hasCurseType("no_buff_spells");
    }

    /**
     * Check if player should be immobilized after casting a spell.
     */
    public shouldImmobilizeAfterCast(spellId: string): boolean {
        return this.activeCurses.some(
            c => c.grantedSpellId === spellId && c.curse.type === "no_move_after_cast"
        );
    }

    /**
     * Get self-pull distance when casting a spell (for self_pull curse).
     */
    public getSelfPullDistance(spellId: string): number {
        const curse = this.activeCurses.find(
            c => c.grantedSpellId === spellId && c.curse.type === "self_pull"
        );
        return curse?.curse.value || 0;
    }

    // =========================================================================
    // Combat Effects
    // =========================================================================

    /**
     * Get miss chance percentage from curses.
     */
    public getMissChance(): number {
        return this.activeCurses
            .filter(c => c.curse.type === "miss_chance")
            .reduce((total, c) => total + (c.curse.value || 0), 0);
    }

    /**
     * Check if an attack misses due to curse.
     */
    public shouldMiss(): boolean {
        const missChance = this.getMissChance();
        if (missChance <= 0) return false;
        return Math.random() * 100 < missChance;
    }

    /**
     * Get AP penalty if spell doesn't kill (for ap_penalty_on_miss curse).
     */
    public getAPPenaltyForNonKill(spellId: string): number {
        const curse = this.activeCurses.find(
            c => c.grantedSpellId === spellId && c.curse.type === "ap_penalty_on_miss"
        );
        return curse?.curse.value || 0;
    }

    /**
     * Get AP bonus if spell kills (for ap_penalty_on_miss curse - inverse).
     * The curse description says "gain +2 AP if kills, lose 1 AP if doesn't"
     * So we need both values. The curse stores the penalty, and grants bonus on success.
     */
    public getAPBonusForKill(spellId: string): number {
        const curse = this.activeCurses.find(
            c => c.grantedSpellId === spellId && c.curse.type === "ap_penalty_on_miss"
        );
        // If there's an AP penalty curse, the bonus for kill is typically value * 2
        return curse ? (curse.curse.value || 1) * 2 : 0;
    }

    // =========================================================================
    // Stat Effects
    // =========================================================================

    /**
     * Get permanent stat penalties from curses.
     */
    public getStatPenalties(): Map<StatName, number> {
        const penalties = new Map<StatName, number>();

        for (const activeCurse of this.activeCurses) {
            if (activeCurse.curse.type === "stat_penalty" && activeCurse.curse.stat) {
                const current = penalties.get(activeCurse.curse.stat) || 0;
                penalties.set(activeCurse.curse.stat, current + (activeCurse.curse.value || 0));
            }
        }

        return penalties;
    }

    /**
     * Get total penalty for a specific stat.
     */
    public getStatPenalty(stat: StatName): number {
        return this.activeCurses
            .filter(c => c.curse.type === "stat_penalty" && c.curse.stat === stat)
            .reduce((total, c) => total + (c.curse.value || 0), 0);
    }

    /**
     * Get healing reduction percentage.
     */
    public getHealingReduction(): number {
        return this.activeCurses
            .filter(c => c.curse.type === "healing_reduction")
            .reduce((total, c) => total + (c.curse.value || 0), 0);
    }

    /**
     * Apply healing reduction to a heal amount.
     */
    public applyHealingReduction(healAmount: number): number {
        const reduction = this.getHealingReduction();
        if (reduction <= 0) return healAmount;
        return Math.floor(healAmount * (1 - reduction / 100));
    }

    // =========================================================================
    // UI Display
    // =========================================================================

    /**
     * Get curse descriptions for tooltip display.
     */
    public getCurseDescriptions(): string[] {
        return this.activeCurses.map(c => c.curse.description);
    }

    /**
     * Get detailed curse info for tooltip.
     */
    public getCurseInfo(): Array<{ artifactId: string; description: string; type: CurseType }> {
        return this.activeCurses.map(c => ({
            artifactId: c.sourceArtifactId,
            description: c.curse.description,
            type: c.curse.type,
        }));
    }

    /**
     * Check if an artifact is cursed.
     */
    public static isCursedArtifact(artifact: ArtifactDefinition): boolean {
        return artifact.curse !== undefined;
    }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const curseSystem = new CurseSystem();
