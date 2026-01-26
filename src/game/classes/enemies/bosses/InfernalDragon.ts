/**
 * InfernalDragon - Massive threat boss with clear telegraphs.
 * 
 * Theme: Classic dragon fight fantasy with positioning game.
 * 
 * Mechanics:
 * - Claw Rake: 1 AP melee hitting adjacent tiles
 * - Dragon Breath: 3 AP cone attack with Burning
 * - Tail Sweep: 2 AP hits behind, pushes back
 * - Heat Aura (Passive): Adjacent units take 1 damage
 * - Inferno (Phase 2): Dragon Breath cooldown removed
 */

import { Scene } from "phaser";
import { Boss, BossPhaseConfig } from "./Boss";
import { UnitStats, GridPosition } from "../../../core/types";
import { getBossSpellsByType } from "../../../data/spells/boss-spells";

export class InfernalDragon extends Boss {
    /** Dragon Breath cooldown counter */
    private breathCooldown: number = 0;
    
    /** Base cooldown for Dragon Breath */
    private readonly breathCooldownBase: number = 2;
    
    /** Whether Inferno mode is active (Phase 2) */
    private infernoActive: boolean = false;
    
    /** Direction the dragon is facing (for breath/tail) */
    private facingDirection: "up" | "down" | "left" | "right" = "left";

    protected phaseConfigs: BossPhaseConfig[] = [
        { 
            phase: 1, 
            hpThreshold: 1.0 
        },
        {
            phase: 2,
            hpThreshold: 0.4, // 40% HP threshold
            onEnter: () => this.onInfernoPhase(),
            statModifiers: { force: 2, intelligence: 2 }
        }
    ];

    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 45,
            maxHealth: 45,
            force: 2,
            dexterity: 2,
            intelligence: 2,
            armor: 3,
            magicResistance: 1,
            moveRange: 3,
            attackRange: 1,
            actionPoints: 4,
            maxActionPoints: 4,
            movementPoints: 3,
            maxMovementPoints: 3,
        };

        super(scene, gridX, gridY, stats, "InfernalDragon");
        this.initializeInfernalDragonSpells();
    }

    private initializeInfernalDragonSpells(): void {
        this.spells = getBossSpellsByType("InfernalDragon");
        this.currentSpell = this.spells[0]; // Claw Rake
    }

    protected createSprite(): void {
        this.sprite = this.scene.add.sprite(0, 0, "infernal_dragon_idle");
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
    // Dragon Breath Mechanic
    // =========================================================================

    /**
     * Check if Dragon Breath is off cooldown.
     */
    public canUseBreath(): boolean {
        return this.breathCooldown <= 0;
    }

    /**
     * Use Dragon Breath and start cooldown.
     */
    public useBreath(): void {
        if (!this.infernoActive) {
            this.breathCooldown = this.breathCooldownBase;
        }
        console.log(`[InfernalDragon] Dragon Breath used! Cooldown: ${this.breathCooldown}`);
    }

    /**
     * Get breath cone tiles based on facing direction.
     */
    public getBreathConeTiles(targetX: number, targetY: number): GridPosition[] {
        // Update facing direction based on target
        this.updateFacingDirection(targetX, targetY);
        
        const tiles: GridPosition[] = [];
        const centerX = this.gridX + (this.size - 1) / 2;
        const centerY = this.gridY + (this.size - 1) / 2;
        
        // Cone extends 3 tiles, widening each row
        // Row 1: 1 tile wide, Row 2: 3 tiles wide, Row 3: 5 tiles wide
        for (let dist = 1; dist <= 3; dist++) {
            const spread = dist - 1;
            
            for (let offset = -spread; offset <= spread; offset++) {
                let x: number, y: number;
                
                switch (this.facingDirection) {
                    case "up":
                        x = Math.round(centerX + offset);
                        y = Math.round(centerY - dist);
                        break;
                    case "down":
                        x = Math.round(centerX + offset);
                        y = Math.round(centerY + dist);
                        break;
                    case "left":
                        x = Math.round(centerX - dist);
                        y = Math.round(centerY + offset);
                        break;
                    case "right":
                        x = Math.round(centerX + dist);
                        y = Math.round(centerY + offset);
                        break;
                }
                
                if (this.grid.isValidPosition(x!, y!) && !this.grid.isWall(x!, y!)) {
                    tiles.push({ x: x!, y: y! });
                }
            }
        }
        
        return tiles;
    }

    private updateFacingDirection(targetX: number, targetY: number): void {
        const centerX = this.gridX + (this.size - 1) / 2;
        const centerY = this.gridY + (this.size - 1) / 2;
        
        const dx = targetX - centerX;
        const dy = targetY - centerY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.facingDirection = dx > 0 ? "right" : "left";
        } else {
            this.facingDirection = dy > 0 ? "down" : "up";
        }
    }

    // =========================================================================
    // Tail Sweep Mechanic
    // =========================================================================

    /**
     * Get tiles hit by tail sweep (behind the dragon).
     */
    public getTailSweepTiles(): GridPosition[] {
        const tiles: GridPosition[] = [];
        const centerX = this.gridX + (this.size - 1) / 2;
        const centerY = this.gridY + (this.size - 1) / 2;
        
        // Tail hits tiles opposite to facing direction
        let tailOffsets: { x: number, y: number }[] = [];
        
        switch (this.facingDirection) {
            case "up":
                tailOffsets = [
                    { x: -1, y: 2 }, { x: 0, y: 2 }, { x: 1, y: 2 },
                    { x: -1, y: 3 }, { x: 0, y: 3 }, { x: 1, y: 3 },
                ];
                break;
            case "down":
                tailOffsets = [
                    { x: -1, y: -2 }, { x: 0, y: -2 }, { x: 1, y: -2 },
                    { x: -1, y: -3 }, { x: 0, y: -3 }, { x: 1, y: -3 },
                ];
                break;
            case "left":
                tailOffsets = [
                    { x: 2, y: -1 }, { x: 2, y: 0 }, { x: 2, y: 1 },
                    { x: 3, y: -1 }, { x: 3, y: 0 }, { x: 3, y: 1 },
                ];
                break;
            case "right":
                tailOffsets = [
                    { x: -2, y: -1 }, { x: -2, y: 0 }, { x: -2, y: 1 },
                    { x: -3, y: -1 }, { x: -3, y: 0 }, { x: -3, y: 1 },
                ];
                break;
        }
        
        for (const offset of tailOffsets) {
            const x = Math.round(centerX + offset.x);
            const y = Math.round(centerY + offset.y);
            
            if (this.grid.isValidPosition(x, y) && !this.grid.isWall(x, y)) {
                tiles.push({ x, y });
            }
        }
        
        return tiles;
    }

    // =========================================================================
    // Heat Aura Passive
    // =========================================================================

    /**
     * Get tiles affected by Heat Aura (adjacent to dragon).
     */
    public getHeatAuraTiles(): GridPosition[] {
        return this.getAdjacentTiles();
    }

    /**
     * Get Heat Aura damage (increases in Inferno phase).
     */
    public getHeatAuraDamage(): number {
        return this.infernoActive ? 2 : 1;
    }

    // =========================================================================
    // Phase 2: Inferno
    // =========================================================================

    private onInfernoPhase(): void {
        console.log("[InfernalDragon] INFERNO! Dragon Breath cooldown removed!");
        this.infernoActive = true;
        this.breathCooldown = 0;
        
        // Visual: engulf in flames
        this.showInfernoEffect();
    }

    private showInfernoEffect(): void {
        // Permanent flame tint
        this.sprite.setTint(0xff4400);
        
        // Create continuous fire particles
        const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, "star", {
            speed: { min: 30, max: 80 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: [0xff4400, 0xff0000, 0xffaa00],
            lifespan: 1000,
            frequency: 80,
            quantity: 3,
            radial: true,
            angle: { min: 0, max: 360 },
        });
        
        particles.setDepth(1);
    }

    /**
     * Check if Inferno mode is active.
     */
    public isInfernoActive(): boolean {
        return this.infernoActive;
    }

    // =========================================================================
    // Turn Hooks
    // =========================================================================

    public onBossTurnStart(): void {
        super.onBossTurnStart();
        
        // Reduce breath cooldown
        if (this.breathCooldown > 0) {
            this.breathCooldown--;
            console.log(`[InfernalDragon] Breath cooldown: ${this.breathCooldown}`);
        }
    }

    /**
     * Get facing direction for visual/targeting.
     */
    public getFacingDirection(): "up" | "down" | "left" | "right" {
        return this.facingDirection;
    }

    // =========================================================================
    // Colors
    // =========================================================================

    protected getColor(): number {
        return 0x8b0000; // Dark red
    }

    protected getOutlineColor(): number {
        return 0xff4400; // Orange
    }

    protected getLabel(): string {
        return "D";
    }
}
