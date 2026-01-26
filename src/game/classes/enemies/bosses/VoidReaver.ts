/**
 * VoidReaver - Unpredictable assassin boss with teleportation.
 * 
 * Theme: Mind games, misdirection, and area denial.
 * 
 * Mechanics:
 * - Void Strike: 1 AP melee that applies Vulnerable
 * - Blink: 1 AP teleport (can use twice per turn)
 * - Void Zone: 2 AP delayed AoE explosion
 * - Phase Shift (Passive): +50% damage after teleporting
 * - Shadow Clone (Phase 2): Leave clone when blinking
 */

import { Scene } from "phaser";
import { Boss, BossPhaseConfig } from "./Boss";
import { UnitStats, GridPosition } from "../../../core/types";
import { getBossSpellsByType } from "../../../data/spells/boss-spells";

export interface VoidZone {
    position: GridPosition;
    turnPlaced: number;
}

export class VoidReaver extends Boss {
    /** Active void zones */
    private voidZones: VoidZone[] = [];
    
    /** Maximum void zones allowed */
    private readonly maxVoidZones: number = 2;
    
    /** Whether Phase Shift bonus is active */
    private phaseShiftActive: boolean = false;
    
    /** Blinks used this turn */
    private blinksUsedThisTurn: number = 0;
    
    /** Maximum blinks per turn */
    private readonly maxBlinksPerTurn: number = 2;
    
    /** Whether Shadow Clone is active (Phase 2) */
    private shadowCloneActive: boolean = false;
    
    /** Graphics for void zone warnings */
    private voidZoneGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();

    protected phaseConfigs: BossPhaseConfig[] = [
        { 
            phase: 1, 
            hpThreshold: 1.0 
        },
        {
            phase: 2,
            hpThreshold: 0.5,
            onEnter: () => this.onShadowPhase(),
        }
    ];

    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 35,
            maxHealth: 35,
            force: 2,
            dexterity: 3,
            intelligence: 2,
            armor: 1,
            magicResistance: 3,
            moveRange: 4,
            attackRange: 1,
            actionPoints: 4,
            maxActionPoints: 4,
            movementPoints: 4,
            maxMovementPoints: 4,
        };

        super(scene, gridX, gridY, stats, "VoidReaver");
        this.initializeVoidReaverSpells();
    }

    private initializeVoidReaverSpells(): void {
        this.spells = getBossSpellsByType("VoidReaver");
        this.currentSpell = this.spells[0]; // Void Strike
    }

    protected createSprite(): void {
        this.sprite = this.scene.add.sprite(0, 0, "void_reaver_idle");
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
    // Blink Mechanic
    // =========================================================================

    /**
     * Check if can blink this turn.
     */
    public canBlink(): boolean {
        return this.blinksUsedThisTurn < this.maxBlinksPerTurn;
    }

    /**
     * Execute blink to target position.
     */
    public executeBlink(targetX: number, targetY: number): GridPosition | null {
        if (!this.canBlink()) {
            return null;
        }
        
        const oldPosition = { x: this.gridX, y: this.gridY };
        
        // Move to new position
        this.gridX = targetX;
        this.gridY = targetY;
        this.updatePosition();
        
        // Activate Phase Shift
        this.phaseShiftActive = true;
        
        this.blinksUsedThisTurn++;
        console.log(`[VoidReaver] Blinked to (${targetX}, ${targetY}). Phase Shift active!`);
        
        // Visual effect
        this.showBlinkEffect(oldPosition, { x: targetX, y: targetY });
        
        // Phase 2: Leave shadow clone at old position
        if (this.shadowCloneActive) {
            return oldPosition; // Return position for clone spawning
        }
        
        return null;
    }

    private showBlinkEffect(from: GridPosition, to: GridPosition): void {
        const tileSize = 64;
        const gridStartX = (this.scene.scale.width - (10 + 2) * tileSize) / 2 + tileSize;
        const gridStartY = (this.scene.scale.height - (10 + 2) * tileSize) / 2 - 50 + tileSize;
        
        const fromX = gridStartX + from.x * tileSize + tileSize / 2;
        const fromY = gridStartY + from.y * tileSize + tileSize / 2;
        const toX = gridStartX + to.x * tileSize + tileSize / 2;
        const toY = gridStartY + to.y * tileSize + tileSize / 2;
        
        // Disappear particles at origin
        const particles1 = this.scene.add.particles(fromX, fromY, "star", {
            speed: { min: 50, max: 100 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0x9932cc, 0x000000],
            lifespan: 400,
            quantity: 15,
            emitting: false,
        });
        particles1.explode(15);
        
        // Appear particles at destination
        const particles2 = this.scene.add.particles(toX, toY, "star", {
            speed: { min: 50, max: 100 },
            scale: { start: 0, end: 0.3 },
            alpha: { start: 0, end: 1 },
            tint: [0x9932cc, 0x000000],
            lifespan: 400,
            quantity: 15,
            emitting: false,
        });
        
        this.scene.time.delayedCall(200, () => {
            particles2.explode(15);
        });
        
        this.scene.time.delayedCall(500, () => {
            particles1.destroy();
            particles2.destroy();
        });
    }

    // =========================================================================
    // Phase Shift Passive
    // =========================================================================

    /**
     * Check if Phase Shift damage bonus is active.
     */
    public isPhaseShiftActive(): boolean {
        return this.phaseShiftActive;
    }

    /**
     * Get Phase Shift damage multiplier.
     */
    public getPhaseShiftMultiplier(): number {
        return this.phaseShiftActive ? 1.5 : 1.0;
    }

    /**
     * Consume Phase Shift after attacking.
     */
    public consumePhaseShift(): void {
        this.phaseShiftActive = false;
        console.log("[VoidReaver] Phase Shift consumed");
    }

    // =========================================================================
    // Void Zone Mechanic
    // =========================================================================

    /**
     * Place a void zone at target position.
     */
    public placeVoidZone(position: GridPosition): boolean {
        // Remove oldest if at max
        if (this.voidZones.length >= this.maxVoidZones) {
            const oldest = this.voidZones.shift();
            if (oldest) {
                this.removeVoidZoneGraphics(oldest.position);
            }
        }
        
        this.voidZones.push({
            position,
            turnPlaced: this.turnCount,
        });
        
        this.showVoidZoneWarning(position);
        console.log(`[VoidReaver] Void Zone placed at (${position.x}, ${position.y})`);
        
        return true;
    }

    /**
     * Get void zones ready to explode.
     */
    public getExplodingVoidZones(): GridPosition[] {
        return this.voidZones
            .filter(vz => this.turnCount > vz.turnPlaced)
            .map(vz => vz.position);
    }

    /**
     * Explode ready void zones.
     */
    public explodeVoidZones(): GridPosition[] {
        const exploding = this.getExplodingVoidZones();
        
        for (const pos of exploding) {
            this.showVoidZoneExplosion(pos);
            this.removeVoidZoneGraphics(pos);
        }
        
        // Remove exploded zones
        this.voidZones = this.voidZones.filter(vz => this.turnCount <= vz.turnPlaced);
        
        return exploding;
    }

    private showVoidZoneWarning(position: GridPosition): void {
        const tileSize = 64;
        const gridStartX = (this.scene.scale.width - (10 + 2) * tileSize) / 2 + tileSize;
        const gridStartY = (this.scene.scale.height - (10 + 2) * tileSize) / 2 - 50 + tileSize;
        const worldX = gridStartX + position.x * tileSize + tileSize / 2;
        const worldY = gridStartY + position.y * tileSize + tileSize / 2;
        
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x9932cc, 0.3);
        graphics.fillCircle(worldX, worldY, tileSize / 2);
        graphics.lineStyle(2, 0x9932cc, 0.8);
        graphics.strokeCircle(worldX, worldY, tileSize / 2);
        graphics.setDepth(1);
        
        // Pulsing animation
        this.scene.tweens.add({
            targets: graphics,
            alpha: 0.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });
        
        this.voidZoneGraphics.set(`${position.x},${position.y}`, graphics);
    }

    private showVoidZoneExplosion(position: GridPosition): void {
        const tileSize = 64;
        const gridStartX = (this.scene.scale.width - (10 + 2) * tileSize) / 2 + tileSize;
        const gridStartY = (this.scene.scale.height - (10 + 2) * tileSize) / 2 - 50 + tileSize;
        const worldX = gridStartX + position.x * tileSize + tileSize / 2;
        const worldY = gridStartY + position.y * tileSize + tileSize / 2;
        
        const particles = this.scene.add.particles(worldX, worldY, "star", {
            speed: { min: 150, max: 250 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0x9932cc, 0x000000, 0x4b0082],
            lifespan: 500,
            quantity: 25,
            emitting: false,
        });
        
        particles.explode(25);
        
        this.scene.time.delayedCall(600, () => {
            particles.destroy();
        });
    }

    private removeVoidZoneGraphics(position: GridPosition): void {
        const key = `${position.x},${position.y}`;
        const graphics = this.voidZoneGraphics.get(key);
        if (graphics) {
            graphics.destroy();
            this.voidZoneGraphics.delete(key);
        }
    }

    // =========================================================================
    // Phase 2: Shadow Clone
    // =========================================================================

    private onShadowPhase(): void {
        console.log("[VoidReaver] Shadow Clone activated! Blinks leave clones!");
        this.shadowCloneActive = true;
    }

    /**
     * Check if Shadow Clone mechanic is active.
     */
    public isShadowCloneActive(): boolean {
        return this.shadowCloneActive;
    }

    // =========================================================================
    // Turn Hooks
    // =========================================================================

    public onBossTurnStart(): void {
        super.onBossTurnStart();
        
        // Reset blinks for new turn
        this.blinksUsedThisTurn = 0;
        
        // Explode ready void zones
        const exploding = this.explodeVoidZones();
        if (exploding.length > 0) {
            console.log(`[VoidReaver] ${exploding.length} Void Zone(s) exploded!`);
        }
    }

    public destroy(): void {
        // Clean up void zone graphics
        for (const graphics of this.voidZoneGraphics.values()) {
            graphics.destroy();
        }
        this.voidZoneGraphics.clear();
        super.destroy();
    }

    // =========================================================================
    // Colors
    // =========================================================================

    protected getColor(): number {
        return 0x2f0f3f; // Dark purple
    }

    protected getOutlineColor(): number {
        return 0x9932cc; // Purple
    }

    protected getLabel(): string {
        return "V";
    }
}
