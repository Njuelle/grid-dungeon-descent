/**
 * Boss - Abstract base class for all boss enemies.
 * 
 * Features:
 * - 2x2 tile occupation via LargeUnitGridAdapter
 * - Phase system with HP thresholds
 * - Turn hooks for passive abilities
 * - Difficulty scaling integration
 */

import { Scene } from "phaser";
import { Enemy } from "../../Enemy";
import { UnitStats, GridPosition, SpellDefinition } from "../../../core/types";
import { LargeUnitGridAdapter } from "../../../systems/LargeUnitGridAdapter";
import { DifficultyScaling, BossDifficultyModifiers } from "../../DifficultyScaling";
import { Grid } from "../../Grid";
import { BossType } from "../../GameProgress";

// =============================================================================
// Boss Phase Configuration
// =============================================================================

export interface BossPhaseConfig {
    /** Phase number (1, 2, etc.) */
    phase: number;
    /** HP threshold percentage to trigger this phase (e.g., 0.5 = 50%) */
    hpThreshold: number;
    /** Callback when entering this phase */
    onEnter?: () => void;
    /** Spell IDs unlocked in this phase */
    unlockedSpells?: string[];
    /** Stat modifiers applied in this phase */
    statModifiers?: Partial<UnitStats>;
}

// =============================================================================
// Boss Base Class
// =============================================================================

export abstract class Boss extends Enemy {
    /** Size in grid tiles (2 = 2x2) */
    public readonly size: number = 2;
    
    /** Current phase (starts at 1) */
    protected currentPhase: number = 1;
    
    /** Turn counter for timed mechanics */
    protected turnCount: number = 0;
    
    /** Phase configurations - override in subclasses */
    protected abstract phaseConfigs: BossPhaseConfig[];
    
    /** Boss type identifier */
    public readonly bossType: BossType;
    
    /** Large unit grid adapter for 2x2 operations */
    protected gridAdapter: LargeUnitGridAdapter;
    
    /** Reference to the grid */
    protected grid: Grid;
    
    /** Difficulty modifiers applied to this boss */
    protected difficultyModifiers: BossDifficultyModifiers;

    constructor(
        scene: Scene,
        gridX: number,
        gridY: number,
        baseStats: UnitStats,
        bossType: BossType
    ) {
        // Apply boss difficulty modifiers to stats
        const modifiers = DifficultyScaling.getBossDifficultyModifiers();
        const scaledStats = Boss.applyBossDifficultyModifiers(baseStats, modifiers);
        
        super(scene, gridX, gridY, scaledStats, bossType);
        
        this.bossType = bossType;
        this.difficultyModifiers = modifiers;
        
        // Get grid reference
        this.grid = (scene as any).grid;
        this.gridAdapter = new LargeUnitGridAdapter(this.grid);
    }

    /**
     * Apply boss difficulty modifiers to base stats.
     */
    private static applyBossDifficultyModifiers(
        baseStats: UnitStats,
        modifiers: BossDifficultyModifiers
    ): UnitStats {
        return {
            ...baseStats,
            health: Math.round(baseStats.health * modifiers.healthMultiplier),
            maxHealth: Math.round(baseStats.maxHealth * modifiers.healthMultiplier),
            force: Math.round(baseStats.force * modifiers.damageMultiplier),
            dexterity: Math.round(baseStats.dexterity * modifiers.damageMultiplier),
            intelligence: baseStats.intelligence 
                ? Math.round(baseStats.intelligence * modifiers.damageMultiplier)
                : baseStats.intelligence,
            armor: baseStats.armor + modifiers.armorBonus,
            magicResistance: (baseStats.magicResistance || 0) + modifiers.magicResistBonus,
        };
    }

    // =========================================================================
    // 2x2 Grid Support
    // =========================================================================

    /**
     * Get all tiles occupied by this boss.
     */
    public getOccupiedTiles(): GridPosition[] {
        return this.gridAdapter.getOccupiedTiles(this.gridX, this.gridY, this.size);
    }

    /**
     * Check if a position is part of this boss's body.
     */
    public occupiesTile(x: number, y: number): boolean {
        return this.gridAdapter.isPositionInUnit(this.gridX, this.gridY, this.size, x, y);
    }

    /**
     * Check if boss can fit at a position.
     */
    public canFitAt(x: number, y: number, isOccupied: (x: number, y: number) => boolean): boolean {
        // Exclude our own tiles from occupation check
        const selfOccupied = (checkX: number, checkY: number) => this.occupiesTile(checkX, checkY);
        return this.gridAdapter.canFitAt(x, y, this.size, (tx, ty) => {
            if (selfOccupied(tx, ty)) return false;
            return isOccupied(tx, ty);
        });
    }

    /**
     * Get distance from boss edge to target (for attack range).
     */
    public getDistanceToTarget(targetX: number, targetY: number): number {
        return this.gridAdapter.getDistanceFromLargeUnit(
            this.gridX, this.gridY, this.size, targetX, targetY
        );
    }

    /**
     * Check if target is adjacent to boss (for melee).
     */
    public isTargetAdjacent(targetX: number, targetY: number): boolean {
        return this.gridAdapter.isAdjacentToLargeUnit(
            this.gridX, this.gridY, this.size, targetX, targetY
        );
    }

    /**
     * Get all tiles adjacent to boss.
     */
    public getAdjacentTiles(): GridPosition[] {
        return this.gridAdapter.getAdjacentTiles(this.gridX, this.gridY, this.size);
    }

    // =========================================================================
    // Sprite Creation (Override for 2x2)
    // =========================================================================

    protected createSprite(): void {
        // Subclasses should override to use their specific sprite
        // Default implementation uses a placeholder
        // Note: this.bossType may not be set yet during super() call, so subclasses must override
        this.sprite = this.scene.add.sprite(0, 0, "star"); // Fallback texture
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2);

        // Scale to 2x2 tile size (128x128)
        // Note: Using hardcoded size (2) because this.size isn't initialized yet during super() call
        const tileSize = 64;
        const bossSize = 2;
        const targetSize = tileSize * bossSize;
        const scaleX = targetSize / this.sprite.width;
        const scaleY = targetSize / this.sprite.height;
        this.sprite.setScale(Math.min(scaleX, scaleY));

        // Set interactive with explicit hit area covering 2x2 tiles
        this.sprite.setInteractive(
            new Phaser.Geom.Rectangle(
                -targetSize / 2,
                -targetSize / 2,
                targetSize,
                targetSize
            ),
            Phaser.Geom.Rectangle.Contains
        );

        // No label text for bosses
        this.labelText = this.scene.add
            .text(0, 0, "", { fontSize: "1px" })
            .setOrigin(0.5)
            .setDepth(3);
    }

    /**
     * Update sprite position (centered over 2x2 area).
     */
    public updatePosition(): void {
        // Center sprite over 2x2 area
        const centerX = this.gridX + (this.size - 1) / 2;
        const centerY = this.gridY + (this.size - 1) / 2;
        
        const tileSize = 64;
        const gridStartX = (this.scene.scale.width - (10 + 2) * tileSize) / 2 + tileSize;
        const gridStartY = (this.scene.scale.height - (10 + 2) * tileSize) / 2 - 50 + tileSize;
        
        const worldX = gridStartX + centerX * tileSize + tileSize / 2;
        const worldY = gridStartY + centerY * tileSize + tileSize / 2;
        
        this.sprite.setPosition(worldX, worldY);
        
        if (this.labelText) {
            this.labelText.setPosition(worldX, worldY);
        }
        
        this.updateHealthBar();
    }

    // =========================================================================
    // Phase System
    // =========================================================================

    /**
     * Check if boss should transition to a new phase.
     */
    public checkPhaseTransition(): void {
        const hpPercent = this.health / this.maxHealth;
        
        for (const config of this.phaseConfigs) {
            if (config.phase > this.currentPhase && hpPercent <= config.hpThreshold) {
                this.transitionToPhase(config);
                break; // Only transition one phase at a time
            }
        }
    }

    /**
     * Transition to a new phase.
     */
    protected transitionToPhase(config: BossPhaseConfig): void {
        console.log(`[Boss] ${this.bossType} entering Phase ${config.phase}!`);
        this.currentPhase = config.phase;
        
        // Apply stat modifiers
        if (config.statModifiers) {
            this.applyPhaseStatModifiers(config.statModifiers);
        }
        
        // Call phase enter callback
        if (config.onEnter) {
            config.onEnter();
        }
        
        // Visual feedback for phase transition
        this.showPhaseTransitionEffect();
    }

    /**
     * Apply stat modifiers from phase config.
     */
    protected applyPhaseStatModifiers(modifiers: Partial<UnitStats>): void {
        if (modifiers.force !== undefined) {
            this.stats.force += modifiers.force;
        }
        if (modifiers.dexterity !== undefined) {
            this.stats.dexterity += modifiers.dexterity;
        }
        if (modifiers.intelligence !== undefined && this.stats.intelligence !== undefined) {
            this.stats.intelligence += modifiers.intelligence;
        }
        if (modifiers.armor !== undefined) {
            this.stats.armor += modifiers.armor;
        }
    }

    /**
     * Show visual effect for phase transition.
     */
    protected showPhaseTransitionEffect(): void {
        // Flash the boss red/orange
        this.scene.tweens.add({
            targets: this.sprite,
            tint: 0xff4400,
            duration: 200,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.sprite.clearTint();
            }
        });
        
        // Scale pulse effect
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: this.sprite.scaleX * 1.2,
            scaleY: this.sprite.scaleY * 1.2,
            duration: 300,
            yoyo: true,
            ease: 'Bounce.easeOut'
        });
    }

    /**
     * Get current phase number.
     */
    public getCurrentPhase(): number {
        return this.currentPhase;
    }

    /**
     * Check if a spell is available in current phase.
     */
    public isSpellAvailableInPhase(spellId: string): boolean {
        // Check all phases up to current
        for (const config of this.phaseConfigs) {
            if (config.phase <= this.currentPhase && config.unlockedSpells?.includes(spellId)) {
                return true;
            }
        }
        
        // Also check if it's a base spell (phase 1 or not phase-locked)
        const phase1 = this.phaseConfigs.find(p => p.phase === 1);
        if (!phase1?.unlockedSpells) {
            // No spells are phase-locked, all are available
            return true;
        }
        
        return false;
    }

    // =========================================================================
    // Turn Hooks
    // =========================================================================

    /**
     * Called at the start of boss's turn.
     * Override in subclasses for passive effects.
     */
    public onBossTurnStart(): void {
        this.turnCount++;
        this.checkPhaseTransition();
        console.log(`[Boss] ${this.bossType} turn ${this.turnCount} started (Phase ${this.currentPhase})`);
    }

    /**
     * Called at the end of boss's turn.
     * Override in subclasses for delayed effects.
     */
    public onBossTurnEnd(): void {
        console.log(`[Boss] ${this.bossType} turn ${this.turnCount} ended`);
    }

    /**
     * Called when boss takes damage.
     */
    public takeDamage(
        damage: number,
        damageType: "physical" | "magic" = "physical",
        attacker?: any
    ): void {
        super.takeDamage(damage, damageType, attacker);
        
        // Check for phase transition after taking damage
        this.checkPhaseTransition();
    }

    // =========================================================================
    // Abstract Methods (Override in subclasses)
    // =========================================================================

    protected getColor(): number {
        return 0x8b0000; // Dark red for bosses
    }

    protected getOutlineColor(): number {
        return 0xff4400; // Orange outline
    }

    protected getLabel(): string {
        return "B";
    }

    // =========================================================================
    // Utility Methods
    // =========================================================================

    /**
     * Get turn count for timed mechanics.
     */
    public getTurnCount(): number {
        return this.turnCount;
    }

    /**
     * Check if boss is in an enraged/enhanced phase.
     */
    public isEnraged(): boolean {
        return this.currentPhase > 1;
    }
}
