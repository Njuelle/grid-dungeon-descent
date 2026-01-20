/**
 * BottomBarUI - Handles the bottom bar UI including stats and spell buttons.
 * 
 * This is a Phaser-dependent UI component that renders:
 * - Player stats display (health, MP, AP, combat stats)
 * - Spell buttons
 * - End turn button
 * - Turn/level indicators
 */

import { Scene } from "phaser";
import { SpellDefinition, UnitStats } from "../core/types";

// =============================================================================
// Types
// =============================================================================

export interface PlayerDisplayData {
    health: number;
    maxHealth: number;
    movementPoints: number;
    maxMovementPoints: number;
    actionPoints: number;
    maxActionPoints: number;
    force: number;
    dexterity: number;
    intelligence: number;
    armor: number;
    magicResistance: number;
    hasMovedThisTurn: boolean;
}

export interface SpellButtonData {
    spell: SpellDefinition;
    canCast: boolean;
}

// =============================================================================
// BottomBarUI Class
// =============================================================================

export class BottomBarUI {
    private scene: Scene;
    private container: Phaser.GameObjects.Container;
    private uiBar: Phaser.GameObjects.Graphics;
    private spellButtons: Phaser.GameObjects.Container[] = [];
    private endTurnButton: Phaser.GameObjects.Text;
    private turnText: Phaser.GameObjects.Text;
    private levelText: Phaser.GameObjects.Text;
    private actionText: Phaser.GameObjects.Text;
    private playerStatsContainer: Phaser.GameObjects.Container;
    private statTooltip?: Phaser.GameObjects.Container;
    private spellTooltip?: Phaser.GameObjects.Container;

    // Callbacks
    private onSpellSelected?: (spell: SpellDefinition) => void;
    private onEndTurn?: () => void;

    // State
    private selectedSpell: SpellDefinition | null = null;
    private currentSpells: SpellDefinition[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        this.container.setDepth(50);

        this.createUI();
    }

    // =========================================================================
    // UI Creation
    // =========================================================================

    private createUI(): void {
        const barHeight = 100;
        const barY = this.scene.scale.height - barHeight;

        // Create background bar
        this.uiBar = this.scene.add.graphics();
        this.uiBar.fillStyle(0x3e2723, 0.9);
        this.uiBar.fillRect(0, barY, this.scene.scale.width, barHeight);
        this.uiBar.lineStyle(3, 0x8b7355, 0.9);
        this.uiBar.strokeRect(0, barY, this.scene.scale.width, barHeight);
        this.uiBar.lineStyle(1, 0xd4af37, 0.7);
        this.uiBar.strokeRect(2, barY + 2, this.scene.scale.width - 4, barHeight - 4);
        this.container.add(this.uiBar);

        // Turn indicator
        this.turnText = this.scene.add
            .text(this.scene.scale.width - 100, 50, "", {
                fontSize: "20px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 4,
            })
            .setOrigin(0.5);
        this.container.add(this.turnText);

        // Level indicator
        this.levelText = this.scene.add
            .text(this.scene.scale.width - 100, 90, "", {
                fontSize: "18px",
                color: "#ffff00",
                stroke: "#000000",
                strokeThickness: 3,
                align: "center",
            })
            .setOrigin(0.5);
        this.container.add(this.levelText);

        // Action text
        this.actionText = this.scene.add
            .text(this.scene.scale.width / 2, barY - 30, "", {
                fontSize: "20px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);
        this.container.add(this.actionText);

        // End turn button
        this.endTurnButton = this.scene.add
            .text(630, barY + 50, "END TURN", {
                fontSize: "20px",
                color: "#ffffff",
                backgroundColor: "#aa4444",
                padding: { x: 15, y: 8 },
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setInteractive();

        this.endTurnButton.on("pointerdown", () => {
            if (this.onEndTurn) this.onEndTurn();
        });
        this.endTurnButton.on("pointerover", () => {
            this.endTurnButton.setBackgroundColor("#cc6666");
            this.scene.input.setDefaultCursor("pointer");
        });
        this.endTurnButton.on("pointerout", () => {
            this.endTurnButton.setBackgroundColor("#aa4444");
            this.scene.input.setDefaultCursor("default");
        });
        this.container.add(this.endTurnButton);

        // Player stats container
        this.createPlayerStatsDisplay(barY);
    }

    private createPlayerStatsDisplay(barY: number): void {
        this.playerStatsContainer = this.scene.add.container(950, barY + 50);
        this.container.add(this.playerStatsContainer);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x3e2723, 0.9);
        bg.fillRoundedRect(-200, -40, 400, 80, 14);
        bg.lineStyle(3, 0x8b7355, 0.9);
        bg.strokeRoundedRect(-200, -40, 400, 80, 14);
        bg.lineStyle(1, 0xd4af37, 0.7);
        bg.strokeRoundedRect(-197, -37, 394, 74, 12);
        this.playerStatsContainer.add(bg);

        // Health bar background
        const healthBarBg = this.scene.add.graphics();
        healthBarBg.fillStyle(0x000000, 0.8);
        healthBarBg.fillRoundedRect(-180, -30, 360, 26, 12);
        this.playerStatsContainer.add(healthBarBg);

        // Health bar
        const healthBar = this.scene.add.graphics();
        this.playerStatsContainer.add(healthBar);
        this.playerStatsContainer.setData("healthBar", healthBar);

        // Health text
        const healthText = this.scene.add
            .text(0, -17, "", {
                fontSize: "18px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);
        this.playerStatsContainer.add(healthText);
        this.playerStatsContainer.setData("healthText", healthText);

        // Stats row
        const statsY = 15;
        this.createStatDisplay(this.playerStatsContainer, "👟", -175, statsY, "mpText", "#00ff00", "Movement Points");
        this.createStatDisplay(this.playerStatsContainer, "⚡", -120, statsY, "apText", "#ffff00", "Action Points");
        this.createStatDisplay(this.playerStatsContainer, "⚔️", -65, statsY, "forceText", "#ff6666", "Force");
        this.createStatDisplay(this.playerStatsContainer, "🏹", -10, statsY, "dexText", "#66ff66", "Dexterity");
        this.createStatDisplay(this.playerStatsContainer, "🧠", 45, statsY, "intText", "#ff66ff", "Intelligence");
        this.createStatDisplay(this.playerStatsContainer, "🛡️", 100, statsY, "armorText", "#6666ff", "Armor");
        this.createStatDisplay(this.playerStatsContainer, "✨", 155, statsY, "mrText", "#cc99ff", "Magic Resistance");
    }

    private createStatDisplay(
        container: Phaser.GameObjects.Container,
        icon: string,
        x: number,
        y: number,
        dataKey: string,
        color: string,
        tooltipTitle: string
    ): void {
        const iconText = this.scene.add.text(x, y, icon, { fontSize: "22px" }).setOrigin(0.5);
        const valueText = this.scene.add
            .text(x + 23, y, "", { fontSize: "15px", color, fontStyle: "bold" })
            .setOrigin(0.5);
        
        container.add([iconText, valueText]);
        container.setData(dataKey, valueText);
    }

    // =========================================================================
    // Spell Buttons
    // =========================================================================

    /**
     * Updates spell buttons with current spells and availability.
     */
    public updateSpellButtons(spells: SpellDefinition[], canCast: (spell: SpellDefinition) => boolean): void {
        // Clear existing buttons
        this.spellButtons.forEach((button) => button.destroy());
        this.spellButtons = [];
        this.currentSpells = spells;

        const buttonY = this.scene.scale.height - 50;
        const startX = 100;
        const spacing = 80;

        spells.forEach((spell, index) => {
            const button = this.createSpellButton(
                startX + index * spacing,
                buttonY,
                spell,
                canCast(spell)
            );
            this.spellButtons.push(button);
            this.container.add(button);
        });
    }

    private createSpellButton(
        x: number,
        y: number,
        spell: SpellDefinition,
        canCastSpell: boolean
    ): Phaser.GameObjects.Container {
        const buttonContainer = this.scene.add.container(x, y);

        // Icon
        const iconSprite = this.scene.add.image(0, 0, spell.icon);
        iconSprite.setScale(1.2);
        iconSprite.setDisplaySize(48, 48);

        // AP cost
        const apCostText = this.scene.add
            .text(20, -20, `${spell.apCost}`, {
                fontSize: "14px",
                color: canCastSpell ? "#ffff00" : "#ff4444",
                backgroundColor: "#000000",
                padding: { x: 2, y: 1 },
                stroke: "#000000",
                strokeThickness: 2,
            })
            .setOrigin(0.5);

        // Selection border
        const selectionBorder = this.scene.add.graphics();
        selectionBorder.setVisible(false);

        buttonContainer.add([selectionBorder, iconSprite, apCostText]);
        buttonContainer.setData("iconSprite", iconSprite);
        buttonContainer.setData("spell", spell);
        buttonContainer.setData("apCostText", apCostText);
        buttonContainer.setData("selectionBorder", selectionBorder);
        buttonContainer.setInteractive(
            new Phaser.Geom.Rectangle(-24, -24, 48, 48),
            Phaser.Geom.Rectangle.Contains
        );

        // Set initial state
        if (!canCastSpell) {
            iconSprite.setTint(0x666666);
            iconSprite.setAlpha(0.5);
        }

        // Events
        buttonContainer.on("pointerdown", () => {
            if (canCastSpell) {
                this.selectSpell(spell);
                if (this.onSpellSelected) {
                    this.onSpellSelected(spell);
                }
            }
        });

        buttonContainer.on("pointerover", () => {
            if (canCastSpell) {
                iconSprite.setTint(0xccccff);
                this.scene.input.setDefaultCursor("pointer");
            }
            this.showSpellTooltip(spell, x, y - 50);
        });

        buttonContainer.on("pointerout", () => {
            if (buttonContainer.getData("spell") !== this.selectedSpell) {
                if (canCastSpell) {
                    iconSprite.clearTint();
                }
            }
            this.scene.input.setDefaultCursor("default");
            this.hideSpellTooltip();
        });

        return buttonContainer;
    }

    /**
     * Selects a spell and updates button visuals.
     */
    public selectSpell(spell: SpellDefinition): void {
        this.selectedSpell = spell;

        this.spellButtons.forEach((button) => {
            const iconSprite = button.getData("iconSprite") as Phaser.GameObjects.Image;
            const buttonSpell = button.getData("spell") as SpellDefinition;
            const selectionBorder = button.getData("selectionBorder") as Phaser.GameObjects.Graphics;

            if (buttonSpell.id === spell.id) {
                iconSprite.clearTint();
                iconSprite.setScale(1.4);
                iconSprite.setDisplaySize(56, 56);
                selectionBorder.clear();
                selectionBorder.lineStyle(3, 0x00ff00, 1);
                selectionBorder.strokeRoundedRect(-30, -30, 60, 60, 8);
                selectionBorder.setVisible(true);
            } else {
                iconSprite.setScale(1.2);
                iconSprite.setDisplaySize(48, 48);
                selectionBorder.setVisible(false);
            }
        });
    }

    // =========================================================================
    // Player Stats
    // =========================================================================

    /**
     * Updates the player stats display.
     */
    public updatePlayerStats(data: PlayerDisplayData, appliedBonuses: string[]): void {
        const healthBar = this.playerStatsContainer.getData("healthBar") as Phaser.GameObjects.Graphics;
        const healthText = this.playerStatsContainer.getData("healthText") as Phaser.GameObjects.Text;
        const mpText = this.playerStatsContainer.getData("mpText") as Phaser.GameObjects.Text;
        const apText = this.playerStatsContainer.getData("apText") as Phaser.GameObjects.Text;
        const forceText = this.playerStatsContainer.getData("forceText") as Phaser.GameObjects.Text;
        const dexText = this.playerStatsContainer.getData("dexText") as Phaser.GameObjects.Text;
        const intText = this.playerStatsContainer.getData("intText") as Phaser.GameObjects.Text;
        const armorText = this.playerStatsContainer.getData("armorText") as Phaser.GameObjects.Text;
        const mrText = this.playerStatsContainer.getData("mrText") as Phaser.GameObjects.Text;

        // Update health bar
        healthBar.clear();
        const healthPercent = data.health / data.maxHealth;
        const barWidth = 356 * healthPercent;

        let healthColor = 0x00aa00;
        if (healthPercent <= 0.25) healthColor = 0xff0000;
        else if (healthPercent <= 0.5) healthColor = 0xffaa00;

        healthBar.fillStyle(healthColor, 0.9);
        healthBar.fillRoundedRect(-178, -28, barWidth, 22, 10);

        healthText.setText(`${data.health} / ${data.maxHealth}`);
        mpText.setText(`${data.movementPoints}/${data.maxMovementPoints}`);
        apText.setText(`${data.actionPoints}/${data.maxActionPoints}`);
        forceText.setText(data.force.toString());
        dexText.setText(data.dexterity.toString());
        intText.setText(data.intelligence.toString());

        // Calculate effective armor including bonuses
        let effectiveArmor = data.armor;
        let hasArmorBonus = false;
        if (!data.hasMovedThisTurn && appliedBonuses.includes("fortified_position")) {
            effectiveArmor += 3;
            hasArmorBonus = true;
        }

        armorText.setText(effectiveArmor.toString());
        armorText.setColor(hasArmorBonus ? "#00ff00" : "#ffffff");
        mrText.setText(data.magicResistance.toString());
    }

    // =========================================================================
    // Tooltips
    // =========================================================================

    private showSpellTooltip(spell: SpellDefinition, x: number, y: number): void {
        if (this.spellTooltip) return;

        let rangeText = `Range: ${spell.range}`;
        if (spell.minRange) {
            rangeText = `Range: ${spell.minRange}-${spell.range}`;
        }

        const statLabel = spell.type === "melee" ? "FOR" : spell.type === "magic" ? "INT" : "DEX";
        let descText = `${spell.description}\nDamage: ${spell.damage} + ${statLabel}\n${rangeText} | AP: ${spell.apCost}`;

        if (spell.aoeShape && spell.aoeRadius) {
            descText += `\nAoE: ${spell.aoeShape} (Radius: ${spell.aoeRadius})`;
        }

        const titleText = this.scene.add
            .text(0, 0, spell.name, {
                fontSize: "16px",
                color: "#ffff00",
                fontStyle: "bold",
                align: "center",
            })
            .setOrigin(0.5);

        const descTextObj = this.scene.add
            .text(0, 0, descText, {
                fontSize: "14px",
                color: "#ffffff",
                align: "center",
                lineSpacing: 3,
                wordWrap: { width: 250 },
            })
            .setOrigin(0.5);

        const padding = 20;
        const titleBounds = titleText.getBounds();
        const descBounds = descTextObj.getBounds();
        const maxWidth = Math.max(titleBounds.width, descBounds.width) + padding * 2;
        const totalHeight = titleBounds.height + descBounds.height + padding * 2 + 10;

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(-maxWidth / 2, -totalHeight / 2, maxWidth, totalHeight, 5);
        bg.lineStyle(2, 0x444444);
        bg.strokeRoundedRect(-maxWidth / 2, -totalHeight / 2, maxWidth, totalHeight, 5);

        titleText.setY(-totalHeight / 2 + padding + titleBounds.height / 2);
        descTextObj.setY(-totalHeight / 2 + padding + titleBounds.height + 10 + descBounds.height / 2);

        const tooltipY = this.scene.scale.height - 100 - totalHeight / 2 - 10;

        this.spellTooltip = this.scene.add.container(x, tooltipY, [bg, titleText, descTextObj]);
        this.spellTooltip.setDepth(100);
    }

    private hideSpellTooltip(): void {
        if (this.spellTooltip) {
            this.spellTooltip.destroy();
            this.spellTooltip = undefined;
        }
    }

    // =========================================================================
    // Text Updates
    // =========================================================================

    public setTurnText(text: string): void {
        this.turnText.setText(text);
    }

    public setLevelText(level: number, difficulty: string): void {
        this.levelText.setText(`Level ${level}\n${difficulty}`);
    }

    public setActionText(text: string): void {
        this.actionText.setText(text);
    }

    public setLevelTextColor(color: string): void {
        this.levelText.setColor(color);
    }

    // =========================================================================
    // Event Registration
    // =========================================================================

    public setOnSpellSelected(callback: (spell: SpellDefinition) => void): void {
        this.onSpellSelected = callback;
    }

    public setOnEndTurn(callback: () => void): void {
        this.onEndTurn = callback;
    }

    // =========================================================================
    // Cleanup
    // =========================================================================

    public destroy(): void {
        this.hideSpellTooltip();
        if (this.statTooltip) {
            this.statTooltip.destroy();
        }
        this.spellButtons.forEach((button) => button.destroy());
        this.container.destroy();
    }
}
