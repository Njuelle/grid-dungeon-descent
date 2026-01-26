/**
 * StormTitan - Area denial boss with positioning puzzles.
 * 
 * Theme: "Floor is lava" - constant movement required.
 * 
 * Mechanics:
 * - Thunder Strike: 2 AP melee with stun chance
 * - Lightning Field: 2 AP mark tiles for delayed damage
 * - Grounding Aura (Passive): Root adjacent units
 * - Thunderclap (Phase 2): 3 AP AoE knockback
 */

import { Scene } from "phaser";
import { Boss, BossPhaseConfig } from "./Boss";
import { UnitStats, GridPosition } from "../../../core/types";
import { getBossSpellsByType } from "../../../data/spells/boss-spells";

export class StormTitan extends Boss {
    /** Tiles marked by Lightning Field */
    private lightningTiles: GridPosition[] = [];
    
    /** Turn when lightning was placed (for delayed explosion) */
    private lightningPlacedTurn: number = -1;
    
    /** Graphics for lightning warning indicators */
    private lightningGraphics: Phaser.GameObjects.Graphics[] = [];

    protected phaseConfigs: BossPhaseConfig[] = [
        { 
            phase: 1, 
            hpThreshold: 1.0 
        },
        {
            phase: 2,
            hpThreshold: 0.5,
            onEnter: () => this.onThunderPhase(),
            unlockedSpells: ["boss_thunderclap"],
        }
    ];

    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 45,
            maxHealth: 45,
            force: 2,
            dexterity: 0,
            intelligence: 2,
            armor: 2,
            magicResistance: 2,
            moveRange: 2,
            attackRange: 1,
            actionPoints: 3,
            maxActionPoints: 3,
            movementPoints: 2,
            maxMovementPoints: 2,
        };

        super(scene, gridX, gridY, stats, "StormTitan");
        this.initializeStormTitanSpells();
    }

    private initializeStormTitanSpells(): void {
        this.spells = getBossSpellsByType("StormTitan");
        this.currentSpell = this.spells[0]; // Thunder Strike
    }

    protected createSprite(): void {
        this.sprite = this.scene.add.sprite(0, 0, "storm_titan_idle");
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
    // Lightning Field Mechanic
    // =========================================================================

    /**
     * Place lightning field on random tiles.
     */
    public placeLightningField(): GridPosition[] {
        // Clear old lightning
        this.clearLightningTiles();
        
        // Select 4 random valid tiles
        const validTiles: GridPosition[] = [];
        const occupiedByBoss = this.getOccupiedTiles();
        
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                // Skip boss tiles and walls
                if (!occupiedByBoss.some(t => t.x === x && t.y === y) &&
                    !this.grid.isWall(x, y)) {
                    validTiles.push({ x, y });
                }
            }
        }
        
        // Shuffle and take 4
        const shuffled = validTiles.sort(() => Math.random() - 0.5);
        this.lightningTiles = shuffled.slice(0, 4);
        this.lightningPlacedTurn = this.turnCount;
        
        // Show warning indicators
        this.showLightningWarnings();
        
        console.log(`[StormTitan] Lightning Field placed at:`, this.lightningTiles);
        return this.lightningTiles;
    }

    /**
     * Check if lightning should explode this turn.
     */
    public shouldLightningExplode(): boolean {
        return this.lightningPlacedTurn >= 0 && this.turnCount > this.lightningPlacedTurn;
    }

    /**
     * Get tiles that will be hit by lightning explosion.
     */
    public getLightningTiles(): GridPosition[] {
        return [...this.lightningTiles];
    }

    /**
     * Trigger lightning explosion and clear tiles.
     */
    public explodeLightning(): GridPosition[] {
        const tiles = [...this.lightningTiles];
        console.log(`[StormTitan] Lightning Field exploding!`);
        
        // Visual effect
        this.showLightningExplosion();
        
        // Clear tiles
        this.clearLightningTiles();
        
        return tiles;
    }

    private showLightningWarnings(): void {
        const tileSize = 64;
        const gridStartX = (this.scene.scale.width - (10 + 2) * tileSize) / 2 + tileSize;
        const gridStartY = (this.scene.scale.height - (10 + 2) * tileSize) / 2 - 50 + tileSize;
        
        for (const tile of this.lightningTiles) {
            const worldX = gridStartX + tile.x * tileSize + tileSize / 2;
            const worldY = gridStartY + tile.y * tileSize + tileSize / 2;
            
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(3, 0x00ffff, 0.8);
            graphics.strokeRect(worldX - tileSize / 2 + 5, worldY - tileSize / 2 + 5, tileSize - 10, tileSize - 10);
            graphics.setDepth(1);
            
            // Pulsing animation
            this.scene.tweens.add({
                targets: graphics,
                alpha: 0.3,
                duration: 300,
                yoyo: true,
                repeat: -1,
            });
            
            this.lightningGraphics.push(graphics);
        }
    }

    private showLightningExplosion(): void {
        const tileSize = 64;
        const gridStartX = (this.scene.scale.width - (10 + 2) * tileSize) / 2 + tileSize;
        const gridStartY = (this.scene.scale.height - (10 + 2) * tileSize) / 2 - 50 + tileSize;
        
        for (const tile of this.lightningTiles) {
            const worldX = gridStartX + tile.x * tileSize + tileSize / 2;
            const worldY = gridStartY + tile.y * tileSize + tileSize / 2;
            
            // Lightning bolt effect
            const particles = this.scene.add.particles(worldX, worldY, "star", {
                speed: { min: 100, max: 200 },
                scale: { start: 0.4, end: 0 },
                alpha: { start: 1, end: 0 },
                tint: [0x00ffff, 0xffffff, 0x0088ff],
                lifespan: 400,
                quantity: 15,
                emitting: false,
            });
            
            particles.explode(15);
            
            this.scene.time.delayedCall(500, () => {
                particles.destroy();
            });
        }
    }

    private clearLightningTiles(): void {
        this.lightningTiles = [];
        this.lightningPlacedTurn = -1;
        
        for (const graphics of this.lightningGraphics) {
            graphics.destroy();
        }
        this.lightningGraphics = [];
    }

    // =========================================================================
    // Grounding Aura Passive
    // =========================================================================

    /**
     * Get tiles affected by Grounding Aura.
     */
    public getGroundingAuraTiles(): GridPosition[] {
        return this.getAdjacentTiles();
    }

    // =========================================================================
    // Phase 2: Enhanced Storm
    // =========================================================================

    private onThunderPhase(): void {
        console.log("[StormTitan] Storm intensifies! Thunderclap unlocked!");
        
        // Visual: constant storm particles
        this.showStormEffect();
    }

    private showStormEffect(): void {
        // Create continuous storm particles
        const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, "star", {
            speed: { min: 30, max: 60 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: [0x00ffff, 0xffffff],
            lifespan: 1500,
            frequency: 150,
            quantity: 2,
            radial: true,
            angle: { min: 0, max: 360 },
        });
        
        particles.setDepth(1);
    }

    // =========================================================================
    // Turn Hooks
    // =========================================================================

    public onBossTurnStart(): void {
        super.onBossTurnStart();
        
        // Check if lightning should explode
        if (this.shouldLightningExplode()) {
            // The actual damage will be handled by the combat system
            // This just triggers the explosion
            this.explodeLightning();
        }
    }

    public destroy(): void {
        this.clearLightningTiles();
        super.destroy();
    }

    // =========================================================================
    // Colors
    // =========================================================================

    protected getColor(): number {
        return 0x4169e1; // Royal blue
    }

    protected getOutlineColor(): number {
        return 0x00ffff; // Cyan
    }

    protected getLabel(): string {
        return "T";
    }
}
