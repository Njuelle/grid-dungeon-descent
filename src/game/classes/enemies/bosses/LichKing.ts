/**
 * LichKing - Summoner boss with strategic dilemmas.
 * 
 * Theme: Creates a puzzle around killing vs ignoring minions.
 * 
 * Mechanics:
 * - Soul Bolt: 1 AP ranged magic attack
 * - Raise Dead: 2 AP summon skeletons
 * - Soul Link (Passive): 30% damage reduction while skeletons alive
 * - Death Nova (Phase 2): Skeletons explode on death
 */

import { Scene } from "phaser";
import { Boss, BossPhaseConfig } from "./Boss";
import { UnitStats, GridPosition } from "../../../core/types";
import { getBossSpellsByType } from "../../../data/spells/boss-spells";

export class LichKing extends Boss {
    /** Active skeleton minions */
    private skeletonCount: number = 0;
    
    /** Maximum skeletons allowed */
    private readonly maxSkeletons: number = 4;
    
    /** Whether Death Nova is active (Phase 2) */
    private deathNovaActive: boolean = false;

    protected phaseConfigs: BossPhaseConfig[] = [
        { 
            phase: 1, 
            hpThreshold: 1.0 
        },
        {
            phase: 2,
            hpThreshold: 0.5,
            onEnter: () => this.onDeathNovaPhase(),
        }
    ];

    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 40,
            maxHealth: 40,
            force: 1,
            dexterity: 0,
            intelligence: 4,
            armor: 1,
            magicResistance: 3,
            moveRange: 2,
            attackRange: 5,
            actionPoints: 3,
            maxActionPoints: 3,
            movementPoints: 2,
            maxMovementPoints: 2,
        };

        super(scene, gridX, gridY, stats, "LichKing");
        this.initializeLichKingSpells();
    }

    private initializeLichKingSpells(): void {
        this.spells = getBossSpellsByType("LichKing");
        this.currentSpell = this.spells[0]; // Soul Bolt
    }

    protected createSprite(): void {
        this.sprite = this.scene.add.sprite(0, 0, "lich_king_idle");
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2);

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

        this.labelText = this.scene.add
            .text(0, 0, "", { fontSize: "1px" })
            .setOrigin(0.5)
            .setDepth(3);
    }

    // =========================================================================
    // Soul Link Passive
    // =========================================================================

    /**
     * Check if Soul Link is active (skeletons alive).
     */
    public isSoulLinkActive(): boolean {
        return this.skeletonCount > 0;
    }

    /**
     * Get damage reduction from Soul Link.
     */
    public getSoulLinkReduction(): number {
        return this.isSoulLinkActive() ? 0.3 : 0; // 30% reduction
    }

    /**
     * Override takeDamage to apply Soul Link reduction.
     */
    public takeDamage(
        damage: number,
        damageType: "physical" | "magic" = "physical",
        attacker?: any
    ): void {
        let actualDamage = damage;
        
        // Apply Soul Link damage reduction
        if (this.isSoulLinkActive()) {
            actualDamage = Math.round(damage * (1 - this.getSoulLinkReduction()));
            console.log(`[LichKing] Soul Link absorbed ${damage - actualDamage} damage!`);
        }
        
        super.takeDamage(actualDamage, damageType, attacker);
    }

    // =========================================================================
    // Skeleton Management
    // =========================================================================

    /**
     * Called when a skeleton is summoned.
     */
    public onSkeletonSummoned(): void {
        this.skeletonCount++;
        console.log(`[LichKing] Skeleton summoned. Total: ${this.skeletonCount}`);
        this.updateSoulLinkVisual();
    }

    /**
     * Called when a skeleton dies.
     */
    public onSkeletonDied(skeletonPosition: GridPosition): void {
        this.skeletonCount = Math.max(0, this.skeletonCount - 1);
        console.log(`[LichKing] Skeleton died. Remaining: ${this.skeletonCount}`);
        this.updateSoulLinkVisual();
        
        // Phase 2: Death Nova explosion
        if (this.deathNovaActive) {
            this.triggerDeathNova(skeletonPosition);
        }
    }

    /**
     * Check if more skeletons can be summoned.
     */
    public canSummonMoreSkeletons(): boolean {
        return this.skeletonCount < this.maxSkeletons;
    }

    /**
     * Get current skeleton count.
     */
    public getSkeletonCount(): number {
        return this.skeletonCount;
    }

    private updateSoulLinkVisual(): void {
        if (this.isSoulLinkActive()) {
            // Purple tint when Soul Link active
            this.sprite.setTint(0x9932cc);
        } else {
            this.sprite.clearTint();
        }
    }

    // =========================================================================
    // Phase 2: Death Nova
    // =========================================================================

    private onDeathNovaPhase(): void {
        console.log("[LichKing] Death Nova activated! Skeletons will explode on death!");
        this.deathNovaActive = true;
    }

    private triggerDeathNova(position: GridPosition): void {
        console.log(`[LichKing] Death Nova explosion at (${position.x}, ${position.y})!`);
        
        // Visual effect
        this.showDeathNovaEffect(position);
        
        // Damage is handled by the combat system when called
        // This just triggers the visual
    }

    private showDeathNovaEffect(position: GridPosition): void {
        // Convert grid to world position
        const tileSize = 64;
        const gridStartX = (this.scene.scale.width - (10 + 2) * tileSize) / 2 + tileSize;
        const gridStartY = (this.scene.scale.height - (10 + 2) * tileSize) / 2 - 50 + tileSize;
        const worldX = gridStartX + position.x * tileSize + tileSize / 2;
        const worldY = gridStartY + position.y * tileSize + tileSize / 2;
        
        // Create explosion particles
        const particles = this.scene.add.particles(worldX, worldY, "star", {
            speed: { min: 100, max: 200 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0x00ff00, 0x9932cc, 0x000000],
            lifespan: 500,
            quantity: 20,
            emitting: false,
        });
        
        particles.explode(20);
        
        this.scene.time.delayedCall(600, () => {
            particles.destroy();
        });
    }

    /**
     * Check if Death Nova is active.
     */
    public isDeathNovaActive(): boolean {
        return this.deathNovaActive;
    }

    // =========================================================================
    // Colors
    // =========================================================================

    protected getColor(): number {
        return 0x4b0082; // Indigo
    }

    protected getOutlineColor(): number {
        return 0x00ff00; // Green (soul fire)
    }

    protected getLabel(): string {
        return "L";
    }
}
