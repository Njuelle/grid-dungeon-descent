import { Scene } from "phaser";
import { Unit, UnitStats } from "./Unit";
import { DifficultyScaling } from "./DifficultyScaling";
import { GameProgress } from "./GameProgress";
import { ActiveBuff } from "../core/types";
import { buffSystem } from "../systems/BuffSystem";

export abstract class Enemy extends Unit {
    protected static unitCount = 0;
    public enemyType: string;
    protected activeBuffs: ActiveBuff[] = [];

    constructor(
        scene: Scene,
        gridX: number,
        gridY: number,
        baseStats: UnitStats,
        enemyType?: string
    ) {
        // Apply difficulty modifiers to stats
        const stats = Enemy.applyDifficultyModifiers(baseStats);

        super(scene, gridX, gridY, "enemy", stats);
        this.enemyType = enemyType || this.constructor.name;
        this.enableStatsTooltip();
    }

    private static applyDifficultyModifiers(baseStats: UnitStats): UnitStats {
        const modifiers = DifficultyScaling.getDifficultyModifiers();

        return {
            health: Math.round(
                baseStats.health * modifiers.enemyHealthMultiplier
            ),
            maxHealth: Math.round(
                baseStats.maxHealth * modifiers.enemyHealthMultiplier
            ),
            moveRange: baseStats.moveRange + modifiers.enemyMoveRangeBonus,
            attackRange: baseStats.attackRange,
            force: Math.round(
                baseStats.force * modifiers.enemyDamageMultiplier
            ),
            dexterity: Math.round(
                baseStats.dexterity * modifiers.enemyDamageMultiplier
            ),
            intelligence: baseStats.intelligence
                ? Math.round(
                      baseStats.intelligence * modifiers.enemyDamageMultiplier
                  )
                : baseStats.intelligence,
            armor: baseStats.armor + modifiers.enemyArmorBonus,
            magicResistance:
                baseStats.magicResistance !== undefined
                    ? baseStats.magicResistance +
                      Math.floor(modifiers.enemyArmorBonus / 2) // Half of armor bonus for magic resistance
                    : baseStats.magicResistance,
            movementPoints: baseStats.movementPoints,
            maxMovementPoints: baseStats.maxMovementPoints,
            actionPoints: baseStats.actionPoints,
            maxActionPoints: baseStats.maxActionPoints,
        };
    }

    protected abstract getColor(): number;
    protected abstract getOutlineColor(): number;
    protected abstract getLabel(): string;

    protected createSprite(): void {
        const unitGraphics = this.scene.add.graphics();

        // Enemy: Circle shape with type-specific colors
        unitGraphics.fillStyle(this.getColor());
        unitGraphics.lineStyle(3, this.getOutlineColor());
        unitGraphics.fillCircle(0, 0, 20);
        unitGraphics.strokeCircle(0, 0, 20);

        // Add label text on enemy unit
        this.labelText = this.scene.add
            .text(0, 0, this.getLabel(), {
                fontSize: "16px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(3);

        const textureKey = `enemy_${this.enemyType}_${Enemy.unitCount++}`;
        unitGraphics.generateTexture(textureKey, 40, 40);
        unitGraphics.destroy();

        this.sprite = this.scene.add.sprite(0, 0, textureKey);
        this.sprite.setInteractive();
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2);
    }

    private statsTooltip?: Phaser.GameObjects.Container;
    private isTooltipVisible: boolean = false;

    private enableStatsTooltip(): void {
        // Add hover effect to show stats
        this.sprite.on("pointerover", () => this.showStatsTooltip());
        this.sprite.on("pointerout", () => this.hideStatsTooltip());
    }

    private showStatsTooltip(): void {
        if (this.statsTooltip) return;

        this.isTooltipVisible = true;

        // Get the player to check selected spell
        const gameManager = (this.scene as any).gameManager;
        const player = gameManager?.getPlayer();
        const selectedSpell = player?.getCurrentSpell();

        // Check if spell should show damage preview (not a pure debuff spell)
        const shouldShowDamagePreview = selectedSpell && 
            !(selectedSpell.damage === 0 && selectedSpell.spellCategory === "buff");

        // Check if should show debuff spell effect (for non-damaging debuff spells)
        const shouldShowDebuffPreview = selectedSpell && 
            selectedSpell.buffEffect && 
            !selectedSpell.buffEffect.targetSelf &&
            !shouldShowDamagePreview;

        // Check if enemy has active debuffs
        const hasDebuffs = this.activeBuffs.length > 0;

        const x = this.sprite.x;

        // Calculate tooltip height based on content
        // Title: 22px + Health bar: 40px + Stats: 22px + padding: 28px = 132px base
        let tooltipHeight = 132;
        if (hasDebuffs) tooltipHeight += 40; // Debuff status row
        if (shouldShowDamagePreview || shouldShowDebuffPreview) tooltipHeight += 42; // Spell preview
        
        const tooltipOffset = 140;

        // Check if positioning above would cause cropping (with some margin)
        const topMargin = 20;
        const wouldCropAtTop =
            this.sprite.y - tooltipOffset - tooltipHeight / 2 < topMargin;

        // Position tooltip below enemy if it would crop at top, otherwise above
        const y = wouldCropAtTop
            ? this.sprite.y + tooltipOffset // Below enemy
            : this.sprite.y - tooltipOffset; // Above enemy (original behavior)

        // Container for all tooltip elements
        const container = this.scene.add.container(x, y);

        // Background - wider tooltip (360px)
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a2a2a, 0.95);

        const bgHeight = tooltipHeight;
        const bgY = -tooltipHeight / 2;
        const tooltipWidth = 360;
        const halfWidth = tooltipWidth / 2;

        bg.fillRoundedRect(-halfWidth, bgY, tooltipWidth, bgHeight, 16);
        
        // Change border color if marked
        const borderColor = this.isMarked() ? 0xff6600 : 0xaa4444;
        bg.lineStyle(4, borderColor);
        bg.strokeRoundedRect(-halfWidth, bgY, tooltipWidth, bgHeight, 16);

        // Use fixed Y positions relative to bgY for consistent layout
        let yPos = bgY + 15;

        // Title - enemy type
        const titleText = this.scene.add
            .text(0, yPos, this.enemyType.toUpperCase(), {
                fontSize: "18px",
                color: this.isMarked() ? "#ff8844" : "#ffaaaa",
                fontStyle: "bold",
            })
            .setOrigin(0.5);
        yPos += 22;

        // Health bar
        const healthBarY = yPos;
        const healthBarBg = this.scene.add.graphics();
        healthBarBg.fillStyle(0x000000, 0.8);
        healthBarBg.fillRoundedRect(-100, healthBarY, 200, 22, 11);

        const healthBar = this.scene.add.graphics();
        const healthPercent = this.health / this.maxHealth;
        const barWidth = 196 * healthPercent;

        let healthColor = 0x00aa00;
        if (healthPercent <= 0.25) {
            healthColor = 0xff0000;
        } else if (healthPercent <= 0.5) {
            healthColor = 0xffaa00;
        }

        healthBar.fillStyle(healthColor, 0.9);
        healthBar.fillRoundedRect(-98, healthBarY + 2, barWidth, 18, 9);

        const healthText = this.scene.add
            .text(0, healthBarY + 11, `${this.health} / ${this.maxHealth}`, {
                fontSize: "16px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);
        yPos += 40; // Added margin between health bar and stats

        // Stats row - use smaller font to prevent overlap
        const statsY = yPos;

        // Force icon and value
        const forceIcon = this.scene.add
            .text(-125, statsY, "⚔️", {
                fontSize: "18px",
            })
            .setOrigin(0.5);

        const forceText = this.scene.add
            .text(-104, statsY, this.force.toString(), {
                fontSize: "16px",
                color: "#ff6666",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Dexterity icon and value
        const dexIcon = this.scene.add
            .text(-70, statsY, "🏹", {
                fontSize: "18px",
            })
            .setOrigin(0.5);

        const dexText = this.scene.add
            .text(-49, statsY, this.dexterity.toString(), {
                fontSize: "16px",
                color: "#66ff66",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Intelligence icon and value
        const intIcon = this.scene.add
            .text(-15, statsY, "🧠", {
                fontSize: "18px",
            })
            .setOrigin(0.5);

        const intText = this.scene.add
            .text(6, statsY, this.intelligence.toString(), {
                fontSize: "16px",
                color: "#ff66ff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Armor icon and value
        const armorIcon = this.scene.add
            .text(40, statsY, "🛡️", {
                fontSize: "18px",
            })
            .setOrigin(0.5);

        const armorText = this.scene.add
            .text(61, statsY, this.armor.toString(), {
                fontSize: "16px",
                color: "#6666ff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Magic Resistance icon and value
        const mrIcon = this.scene.add
            .text(95, statsY, "✨", {
                fontSize: "18px",
            })
            .setOrigin(0.5);

        const mrText = this.scene.add
            .text(116, statsY, this.magicResistance.toString(), {
                fontSize: "16px",
                color: "#cc99ff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Add all elements to container
        container.add([
            bg,
            titleText,
            healthBarBg,
            healthBar,
            healthText,
            forceIcon,
            forceText,
            dexIcon,
            dexText,
            intIcon,
            intText,
            armorIcon,
            armorText,
            mrIcon,
            mrText,
        ]);

        // Store references to elements that may need updating
        container.setData("healthBar", healthBar);
        container.setData("healthText", healthText);
        container.setData("healthBarY", healthBarY);
        container.setData("selectedSpell", selectedSpell);

        // Move yPos well past stats row (stats icons are 22px tall emoji, centered, but render larger)
        yPos = statsY + 22;

        // Show active debuffs/marks on this enemy
        if (hasDebuffs) {
            const debuffSeparator = this.scene.add.graphics();
            debuffSeparator.lineStyle(2, 0xff6600);
            debuffSeparator.moveTo(-160, yPos);
            debuffSeparator.lineTo(160, yPos);
            debuffSeparator.strokePath();
            container.add(debuffSeparator);

            // Display debuff icons and text below separator
            const debuffDescriptions = this.getBuffDescriptions();
            const debuffText = this.scene.add
                .text(-160, yPos + 20, "🎯 " + debuffDescriptions.join(", "), {
                    fontSize: "12px",
                    color: "#ff8844",
                    fontStyle: "bold",
                    wordWrap: { width: 320 },
                })
                .setOrigin(0, 0.5);
            container.add(debuffText);
            yPos += 40;
        }

        // Add damage preview if player has damaging spell selected
        if (player && shouldShowDamagePreview) {
            // Calculate distance from player to this enemy
            const distance =
                Math.abs(player.gridX - this.gridX) +
                Math.abs(player.gridY - this.gridY);

            // Calculate min and max damage
            const baseDamage = selectedSpell.damage;
            let statBonus = 0;

            if (selectedSpell.type === "melee") {
                statBonus = player.force;
            } else if (selectedSpell.type === "ranged") {
                statBonus = player.dexterity;
            } else if (selectedSpell.type === "magic") {
                statBonus = player.intelligence || 0;
            }

            // Apply bonuses manually for preview (to avoid randomness)
            const progress = GameProgress.getInstance();
            const appliedBonuses = progress.getAppliedBonuses();

            // Power through pain bonus
            if (appliedBonuses.includes("power_through_pain")) {
                const missingHP = player.maxHealth - player.health;
                const powerThroughPainBonus = Math.min(3, missingHP);
                if (powerThroughPainBonus > 0) {
                    statBonus += powerThroughPainBonus;
                }
            }

            // Last stand bonus
            if (appliedBonuses.includes("last_stand")) {
                const healthPercent = player.health / player.maxHealth;
                if (healthPercent <= 0.25) {
                    statBonus += 2;
                }
            }

            // Giant slayer bonus
            if (appliedBonuses.includes("giant_slayer")) {
                if (this.maxHealth > player.maxHealth) {
                    statBonus += 3;
                }
            }

            // Guerrilla tactics bonus
            if (appliedBonuses.includes("guerrilla_tactics")) {
                if (distance === player.attackRange) {
                    statBonus += 2;
                }
            }

            // Overload bonus
            let overloadDamage = 0;
            if (appliedBonuses.includes("overload")) {
                overloadDamage = 1;
            }

            // Add mark bonus if enemy is marked
            let markBonus = 0;
            if (this.isMarked()) {
                markBonus = this.getMarkDamageBonus();
            }

            // Calculate min and max damage (0.8x to 1.2x)
            const rawDamageMin = Math.round(
                (baseDamage + statBonus + overloadDamage + markBonus) * 0.8
            );
            const rawDamageMax = Math.round(
                (baseDamage + statBonus + overloadDamage + markBonus) * 1.2
            );

            // Apply resistance
            const damageType =
                selectedSpell.type === "magic" ? "magic" : "physical";
            const resistance =
                damageType === "magic" ? this.magicResistance : this.armor;

            const actualDamageMin = Math.max(1, rawDamageMin - resistance);
            const actualDamageMax = Math.max(1, rawDamageMax - resistance);

            // Damage preview separator
            const separator = this.scene.add.graphics();
            separator.lineStyle(2, 0x666666);
            separator.moveTo(-160, yPos);
            separator.lineTo(160, yPos);
            separator.strokePath();

            // Spell name and damage preview
            const spellPreviewY = yPos + 15;

            // Spell name on the left
            const spellNameText = this.scene.add
                .text(-160, spellPreviewY, selectedSpell.name, {
                    fontSize: "14px",
                    color: "#ffff00",
                    fontStyle: "bold",
                })
                .setOrigin(0, 0.5);

            // Damage range text on the right
            const damageRangeText = this.scene.add
                .text(
                    100,
                    spellPreviewY,
                    `${actualDamageMin}-${actualDamageMax} dmg`,
                    {
                        fontSize: "16px",
                        color: "#ff4444",
                        fontStyle: "bold",
                    }
                )
                .setOrigin(1, 0.5);

            // If damage is reduced, show the reduction
            if (resistance > 0) {
                const reductionText = this.scene.add
                    .text(150, spellPreviewY, `-${resistance}`, {
                        fontSize: "12px",
                        color: damageType === "magic" ? "#cc99ff" : "#6666ff",
                        fontStyle: "italic",
                    })
                    .setOrigin(0.5);
                container.add(reductionText);
            }

            // Show mark bonus if applicable
            if (markBonus > 0) {
                const markBonusText = this.scene.add
                    .text(120, spellPreviewY, `+${markBonus}🎯`, {
                        fontSize: "11px",
                        color: "#ff8844",
                    })
                    .setOrigin(0, 0.5);
                container.add(markBonusText);
            }

            container.add([separator, spellNameText, damageRangeText]);
        } else if (player && selectedSpell && selectedSpell.buffEffect && !selectedSpell.buffEffect.targetSelf) {
            // Show debuff spell effect preview (for non-damaging debuff spells)
            const separator = this.scene.add.graphics();
            separator.lineStyle(2, 0x666666);
            separator.moveTo(-160, yPos);
            separator.lineTo(160, yPos);
            separator.strokePath();

            const spellPreviewY = yPos + 15;

            // Spell name
            const spellNameText = this.scene.add
                .text(-160, spellPreviewY, selectedSpell.name, {
                    fontSize: "14px",
                    color: "#ffff00",
                    fontStyle: "bold",
                })
                .setOrigin(0, 0.5);

            // Effect description
            const buffEffect = selectedSpell.buffEffect;
            let effectText = "";
            if (buffEffect.type === "mark") {
                effectText = `🎯 Mark +${buffEffect.value} dmg (${buffEffect.duration}t)`;
            } else if (buffEffect.type === "stat_boost") {
                effectText = `${buffEffect.value > 0 ? "+" : ""}${buffEffect.value} ${buffEffect.stat} (${buffEffect.duration}t)`;
            }

            const effectDisplay = this.scene.add
                .text(160, spellPreviewY, effectText, {
                    fontSize: "13px",
                    color: "#ff8844",
                    fontStyle: "bold",
                })
                .setOrigin(1, 0.5);

            container.add([separator, spellNameText, effectDisplay]);
        }

        this.statsTooltip = container;
        this.statsTooltip.setDepth(100);
    }

    private hideStatsTooltip(): void {
        if (this.statsTooltip) {
            this.statsTooltip.destroy();
            this.statsTooltip = undefined;
        }
        this.isTooltipVisible = false;
    }

    private refreshTooltip(): void {
        if (this.isTooltipVisible && this.statsTooltip) {
            // Get references to the health elements
            const healthBar = this.statsTooltip.getData(
                "healthBar"
            ) as Phaser.GameObjects.Graphics;
            const healthText = this.statsTooltip.getData(
                "healthText"
            ) as Phaser.GameObjects.Text;
            const healthBarY = this.statsTooltip.getData("healthBarY") as number;

            if (healthBar && healthText && healthBarY !== undefined) {
                // Clear and redraw health bar
                healthBar.clear();
                const healthPercent = this.health / this.maxHealth;
                const barWidth = 196 * healthPercent;

                // Choose color based on health percentage
                let healthColor = 0x00aa00; // Darker green
                if (healthPercent <= 0.25) {
                    healthColor = 0xff0000; // Red
                } else if (healthPercent <= 0.5) {
                    healthColor = 0xffaa00; // Orange
                }

                healthBar.fillStyle(healthColor, 0.9);
                healthBar.fillRoundedRect(-98, healthBarY + 2, barWidth, 20, 10);

                // Update health text
                healthText.setText(`${this.health} / ${this.maxHealth}`);
            }
        }
    }

    // Override takeDamage to refresh tooltip when health changes
    public takeDamage(
        damage: number,
        damageType: "physical" | "magic" = "physical",
        attacker?: Unit
    ): void {
        super.takeDamage(damage, damageType, attacker);

        // Refresh tooltip if it's currently visible
        this.refreshTooltip();
    }

    public getAttackDamage(): number {
        // Determine attack type based on range
        const attackType = this.attackRange > 1 ? "ranged" : "melee";
        return this.calculateDamage(attackType);
    }

    public destroy(): void {
        this.hideStatsTooltip();
        super.destroy();
    }

    public get intelligence(): number {
        return this.stats.intelligence || 0;
    }

    // =========================================================================
    // Buff System Support
    // =========================================================================

    /**
     * Get all active buffs/debuffs on this enemy.
     */
    public getActiveBuffs(): ActiveBuff[] {
        return [...this.activeBuffs];
    }

    /**
     * Add a buff/debuff to this enemy.
     */
    public addBuff(buff: ActiveBuff): void {
        this.activeBuffs = buffSystem.addBuff(this.activeBuffs, buff);
        console.log(`[Enemy] Added buff: ${buff.buffType} (${buff.remainingTurns} turns)`);
        this.refreshTooltip();
    }

    /**
     * Remove a specific buff.
     */
    public removeBuff(buffId: string): void {
        this.activeBuffs = buffSystem.removeBuff(this.activeBuffs, buffId);
    }

    /**
     * Tick buffs at turn start.
     */
    public tickBuffs(): { stat: string; value: number }[] {
        const result = buffSystem.tickBuffs(this.activeBuffs);
        this.activeBuffs = result.updatedBuffs;

        for (const expired of result.expiredBuffs) {
            console.log(`[Enemy] Buff expired: ${expired.buffType}`);
        }

        this.refreshTooltip();
        return result.tickEffects;
    }

    /**
     * Check if enemy is marked (takes extra damage).
     */
    public isMarked(): boolean {
        return buffSystem.hasBuffType(this.activeBuffs, "mark");
    }

    /**
     * Get mark damage bonus (extra damage taken).
     */
    public getMarkDamageBonus(): number {
        return buffSystem.getMarkDamageBonus(this.activeBuffs);
    }

    /**
     * Consume mark after being hit.
     */
    public consumeMark(): void {
        this.activeBuffs = buffSystem.consumeMark(this.activeBuffs);
        this.refreshTooltip();
    }

    /**
     * Get stat modifier from active buffs.
     */
    public getBuffStatModifier(stat: string): number {
        return buffSystem.getStatModifier(this.activeBuffs, stat as any);
    }

    /**
     * Clear all buffs.
     */
    public clearAllBuffs(): void {
        this.activeBuffs = [];
    }

    /**
     * Get buff descriptions for UI.
     */
    public getBuffDescriptions(): string[] {
        return buffSystem.getBuffDescriptions(this.activeBuffs);
    }
}

