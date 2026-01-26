/**
 * DreadWarlord - Aggressive melee berserker boss.
 * 
 * Theme: Punishes passive play, gets stronger as HP drops.
 * 
 * Mechanics:
 * - Brutal Cleave: 2 AP melee AoE
 * - Battle Charge: 2 AP dash + stun
 * - Bloodlust (Passive): +1 Force per 10 HP lost
 * - Enraged Slam (Phase 2): 3 AP massive AoE
 */

import { Scene } from "phaser";
import { Boss, BossPhaseConfig } from "./Boss";
import { UnitStats } from "../../../core/types";
import { getBossSpellsByType } from "../../../data/spells/boss-spells";

export class DreadWarlord extends Boss {
    /** Bloodlust stacks (passive damage bonus) */
    private bloodlustStacks: number = 0;

    protected phaseConfigs: BossPhaseConfig[] = [
        { 
            phase: 1, 
            hpThreshold: 1.0 
        },
        {
            phase: 2,
            hpThreshold: 0.5,
            onEnter: () => this.onEnragePhase(),
            unlockedSpells: ["boss_enraged_slam"],
            statModifiers: { force: 2 }
        }
    ];

    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 40,
            maxHealth: 40,
            force: 3,
            dexterity: 2,
            intelligence: 0,
            armor: 3,
            magicResistance: 1,
            moveRange: 3,
            attackRange: 1,
            actionPoints: 3,
            maxActionPoints: 3,
            movementPoints: 3,
            maxMovementPoints: 3,
        };

        super(scene, gridX, gridY, stats, "DreadWarlord");
        this.initializeDreadWarlordSpells();
    }

    private initializeDreadWarlordSpells(): void {
        this.spells = getBossSpellsByType("DreadWarlord");
        this.currentSpell = this.spells[0]; // Brutal Cleave
    }

    protected createSprite(): void {
        this.sprite = this.scene.add.sprite(0, 0, "dread_warlord_idle");
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

        this.labelText = this.scene.add
            .text(0, 0, "", { fontSize: "1px" })
            .setOrigin(0.5)
            .setDepth(3);
    }

    // =========================================================================
    // Bloodlust Passive
    // =========================================================================

    /**
     * Update bloodlust stacks based on missing HP.
     * +1 Force per 10 HP lost (max +4).
     */
    private updateBloodlust(): void {
        const missingHP = this.maxHealth - this.health;
        const newStacks = Math.min(4, Math.floor(missingHP / 10));
        
        if (newStacks > this.bloodlustStacks) {
            const gained = newStacks - this.bloodlustStacks;
            this.bloodlustStacks = newStacks;
            console.log(`[DreadWarlord] Bloodlust! Gained ${gained} stack(s). Total: ${this.bloodlustStacks}`);
            
            // Visual feedback - tint redder
            this.updateBloodlustVisual();
        }
    }

    /**
     * Update visual to show bloodlust intensity.
     */
    private updateBloodlustVisual(): void {
        // Tint progressively redder based on stacks
        const redIntensity = Math.min(255, 150 + this.bloodlustStacks * 25);
        const tint = Phaser.Display.Color.GetColor(redIntensity, 50, 50);
        this.sprite.setTint(tint);
    }

    /**
     * Get effective Force including Bloodlust bonus.
     */
    public get force(): number {
        return this.stats.force + this.bloodlustStacks;
    }

    // =========================================================================
    // Phase 2: Enrage
    // =========================================================================

    private onEnragePhase(): void {
        console.log("[DreadWarlord] ENRAGE! The Warlord's fury knows no bounds!");
        
        // Visual: flames/embers around boss
        this.showEnrageEffect();
    }

    private showEnrageEffect(): void {
        // Create particle effect for enrage
        const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, "star", {
            speed: { min: 50, max: 100 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0xff4400, 0xff0000, 0xff8800],
            lifespan: 1000,
            frequency: 100,
            quantity: 3,
        });
        
        // Stop after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            particles.destroy();
        });
    }

    // =========================================================================
    // Turn Hooks
    // =========================================================================

    public onBossTurnStart(): void {
        super.onBossTurnStart();
        this.updateBloodlust();
    }

    public takeDamage(
        damage: number,
        damageType: "physical" | "magic" = "physical",
        attacker?: any
    ): void {
        super.takeDamage(damage, damageType, attacker);
        this.updateBloodlust();
    }

    // =========================================================================
    // Colors
    // =========================================================================

    protected getColor(): number {
        return 0x8b4513; // Saddle brown
    }

    protected getOutlineColor(): number {
        return 0xff4400; // Orange-red
    }

    protected getLabel(): string {
        return "W";
    }
}
