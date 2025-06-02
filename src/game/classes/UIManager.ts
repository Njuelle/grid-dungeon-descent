import { Scene } from "phaser";
import { Player, AttackType } from "./Player";
import { Spell } from "./Spell";
import { Bonus, getRandomBonuses, AVAILABLE_BONUSES } from "./Bonus";
import { GameProgress } from "./GameProgress";
import { DifficultyScaling } from "./DifficultyScaling";

export class UIManager {
    private scene: Scene;
    private uiBar: Phaser.GameObjects.Graphics;
    private spellButtons: Phaser.GameObjects.Container[] = [];
    private mpText: Phaser.GameObjects.Text;
    private apText: Phaser.GameObjects.Text;
    private turnText: Phaser.GameObjects.Text;
    private actionText: Phaser.GameObjects.Text;
    private endTurnButton: Phaser.GameObjects.Text;
    private selectedSpell: Spell | null = null;
    private onSpellSelected?: (spell: Spell) => void;
    private onEndTurn?: () => void;
    private combatLog: Phaser.GameObjects.Text;
    private combatLogMessages: string[] = [];
    private currentPlayer: Player | null = null;
    private bonusHistoryButton: Phaser.GameObjects.Text;
    private bonusHistoryModal?: Phaser.GameObjects.Container;
    private playerStatsContainer?: Phaser.GameObjects.Container;
    private levelText: Phaser.GameObjects.Text;
    private statTooltip?: Phaser.GameObjects.Container;
    private bonusSelectionActive: boolean = false;
    private uiReady: boolean = false;
    private rerollUsedThisVictory: boolean = false;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createUI();
        this.createBottomBar();

        // Mark UI as ready
        this.uiReady = true;

        // Listen for playerDamaged event to refresh stats
        this.scene.events.on(
            "playerDamaged",
            (player: Player) => {
                // Only process if UI is ready
                if (this.uiReady) {
                    this.refreshPlayerStatsDisplay(player);
                }
            },
            this
        );
    }

    private createUI(): void {
        // Turn indicator - moved to right side
        this.turnText = this.scene.add
            .text(this.scene.scale.width - 100, 50, "", {
                fontSize: "20px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(50);

        // Level indicator - below turn indicator
        const difficulty = DifficultyScaling.getDifficultyDescription();
        const progress = GameProgress.getInstance();
        const wins = progress.getWins();

        this.levelText = this.scene.add
            .text(
                this.scene.scale.width - 100,
                90,
                `Level ${wins + 1}\n${difficulty}`,
                {
                    fontSize: "18px",
                    color: "#ffff00",
                    stroke: "#000000",
                    strokeThickness: 3,
                    align: "center",
                }
            )
            .setOrigin(0.5)
            .setDepth(50);

        // Action text
        this.actionText = this.scene.add
            .text(
                this.scene.scale.width / 2,
                this.scene.scale.height - 130, // Adjusted for larger bar
                "Click a unit to select",
                {
                    fontSize: "20px",
                    color: "#ffffff",
                    stroke: "#000000",
                    strokeThickness: 3,
                }
            )
            .setOrigin(0.5)
            .setDepth(50);

        // Combat log
        this.combatLog = this.scene.add
            .text(20, 50, "", {
                fontSize: "14px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 2,
                wordWrap: { width: 200 },
            })
            .setDepth(50);
    }

    private createBottomBar(): void {
        const barHeight = 100; // Increased from 70
        const barY = this.scene.scale.height - barHeight;

        // Create background bar - using expedition records colors
        this.uiBar = this.scene.add.graphics();
        this.uiBar.fillStyle(0x3e2723, 0.9); // Dark brown (matching expedition records)
        this.uiBar.fillRect(0, barY, this.scene.scale.width, barHeight);

        // Bronze border (matching expedition records)
        this.uiBar.lineStyle(3, 0x8b7355, 0.9);
        this.uiBar.strokeRect(0, barY, this.scene.scale.width, barHeight);

        // Gold inner border (matching expedition records)
        this.uiBar.lineStyle(1, 0xd4af37, 0.7);
        this.uiBar.strokeRect(
            2,
            barY + 2,
            this.scene.scale.width - 4,
            barHeight - 4
        );

        this.uiBar.setDepth(50);

        // End turn button - positioned in the middle area
        this.endTurnButton = this.scene.add
            .text(630, barY + 50, "END TURN", {
                fontSize: "20px",
                color: "#ffffff",
                backgroundColor: "#aa4444",
                padding: { x: 15, y: 8 },
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(50);

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

        // Bonus History button - positioned at far right
        this.bonusHistoryButton = this.scene.add
            .text(this.scene.scale.width - 100, barY + 50, "Bonus History", {
                fontSize: "18px",
                color: "#ffffff",
                backgroundColor: "#4444aa",
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(50);

        this.bonusHistoryButton.on("pointerdown", () => {
            this.showBonusHistoryModal();
        });
        this.bonusHistoryButton.on("pointerover", () => {
            this.bonusHistoryButton.setBackgroundColor("#6666cc");
            this.scene.input.setDefaultCursor("pointer");
        });
        this.bonusHistoryButton.on("pointerout", () => {
            this.bonusHistoryButton.setBackgroundColor("#4444aa");
            this.scene.input.setDefaultCursor("default");
        });

        // Create player stats display
        this.createPlayerStatsDisplay(barY);
    }

    private createPlayerStatsDisplay(barY: number): void {
        // Position where the bonus history button was
        this.playerStatsContainer = this.scene.add.container(
            950, // Moved from 900 to add more margin between End Turn button
            barY + 50
        );
        this.playerStatsContainer.setDepth(50);

        // Compact background without title - using expedition records colors
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x3e2723, 0.9); // Dark brown (matching expedition records)
        bg.fillRoundedRect(-200, -40, 400, 80, 14); // Increased width from 360 to 400

        // Bronze border (matching expedition records)
        bg.lineStyle(3, 0x8b7355, 0.9);
        bg.strokeRoundedRect(-200, -40, 400, 80, 14);

        // Gold inner border (matching expedition records)
        bg.lineStyle(1, 0xd4af37, 0.7);
        bg.strokeRoundedRect(-197, -37, 394, 74, 12);

        // Health bar background - positioned at top
        const healthBarBg = this.scene.add.graphics();
        healthBarBg.fillStyle(0x000000, 0.8);
        healthBarBg.fillRoundedRect(-180, -30, 360, 26, 12); // Increased width from 320 to 360

        // Health bar (will be updated)
        const healthBar = this.scene.add.graphics();

        // Health text - larger font
        const healthText = this.scene.add
            .text(0, -17, "", {
                fontSize: "18px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(1);

        // Single row layout with all stats - reduced spacing
        const statsY = 15;

        // Movement Points - more compact
        const mpIcon = this.scene.add
            .text(-175, statsY, "👟", {
                fontSize: "22px", // Reduced from 24px
            })
            .setOrigin(0.5);

        const mpText = this.scene.add
            .text(-152, statsY, "", {
                fontSize: "15px", // Reduced from 16px
                color: "#00ff00",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Make MP interactive for tooltip
        const mpHitArea = this.scene.add.rectangle(
            -163,
            statsY,
            46,
            30,
            0x000000,
            0
        );
        mpHitArea.setInteractive();
        mpHitArea.on("pointerover", () => {
            this.showStatTooltip(
                -163,
                statsY - 40,
                "Movement Points",
                "Points used to move around the battlefield.\nEach tile costs 1 MP to move."
            );
        });
        mpHitArea.on("pointerout", () => {
            this.hideStatTooltip();
        });

        // Action Points
        const apIcon = this.scene.add
            .text(-120, statsY, "⚡", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const apText = this.scene.add
            .text(-97, statsY, "", {
                fontSize: "15px",
                color: "#ffff00",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Make AP interactive for tooltip
        const apHitArea = this.scene.add.rectangle(
            -108,
            statsY,
            46,
            30,
            0x000000,
            0
        );
        apHitArea.setInteractive();
        apHitArea.on("pointerover", () => {
            this.showStatTooltip(
                -108,
                statsY - 40,
                "Action Points",
                "Points used to cast spells.\nEach spell has an AP cost."
            );
        });
        apHitArea.on("pointerout", () => {
            this.hideStatTooltip();
        });

        // Force
        const forceIcon = this.scene.add
            .text(-65, statsY, "⚔️", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const forceText = this.scene.add
            .text(-42, statsY, "", {
                fontSize: "15px",
                color: "#ff6666",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Make Force interactive for tooltip
        const forceHitArea = this.scene.add.rectangle(
            -53,
            statsY,
            46,
            30,
            0x000000,
            0
        );
        forceHitArea.setInteractive();
        forceHitArea.on("pointerover", () => {
            this.showStatTooltip(
                -53,
                statsY - 40,
                "Force",
                "Physical strength. Increases damage\nfor melee attacks and spells."
            );
        });
        forceHitArea.on("pointerout", () => {
            this.hideStatTooltip();
        });

        // Dexterity
        const dexIcon = this.scene.add
            .text(-10, statsY, "🏹", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const dexText = this.scene.add
            .text(13, statsY, "", {
                fontSize: "15px",
                color: "#66ff66",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Make Dexterity interactive for tooltip
        const dexHitArea = this.scene.add.rectangle(
            2,
            statsY,
            46,
            30,
            0x000000,
            0
        );
        dexHitArea.setInteractive();
        dexHitArea.on("pointerover", () => {
            this.showStatTooltip(
                2,
                statsY - 40,
                "Dexterity",
                "Precision and agility. Increases damage\nfor ranged attacks and spells."
            );
        });
        dexHitArea.on("pointerout", () => {
            this.hideStatTooltip();
        });

        // Intelligence
        const intIcon = this.scene.add
            .text(45, statsY, "🧠", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const intText = this.scene.add
            .text(68, statsY, "", {
                fontSize: "15px",
                color: "#ff66ff", // Changed to match enemy tooltip
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Make Intelligence interactive for tooltip
        const intHitArea = this.scene.add.rectangle(
            57,
            statsY,
            46,
            30,
            0x000000,
            0
        );
        intHitArea.setInteractive();
        intHitArea.on("pointerover", () => {
            this.showStatTooltip(
                57,
                statsY - 40,
                "Intelligence",
                "Magical power. Increases damage\nfor magic attacks and spells."
            );
        });
        intHitArea.on("pointerout", () => {
            this.hideStatTooltip();
        });

        // Armor
        const armorIcon = this.scene.add
            .text(100, statsY, "🛡️", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const armorText = this.scene.add
            .text(123, statsY, "", {
                fontSize: "15px",
                color: "#6666ff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Make Armor interactive for tooltip
        const armorHitArea = this.scene.add.rectangle(
            112,
            statsY,
            46,
            30,
            0x000000,
            0
        );
        armorHitArea.setInteractive();
        armorHitArea.on("pointerover", () => {
            this.showStatTooltip(
                112,
                statsY - 40,
                "Armor",
                "Physical defense. Reduces damage\nfrom melee and ranged attacks."
            );
        });
        armorHitArea.on("pointerout", () => {
            this.hideStatTooltip();
        });

        // Magic Resistance
        const mrIcon = this.scene.add
            .text(155, statsY, "✨", {
                fontSize: "22px",
            })
            .setOrigin(0.5);

        const mrText = this.scene.add
            .text(178, statsY, "", {
                fontSize: "15px",
                color: "#cc99ff", // Light purple for magic resistance
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Make Magic Resistance interactive for tooltip
        const mrHitArea = this.scene.add.rectangle(
            167,
            statsY,
            46,
            30,
            0x000000,
            0
        );
        mrHitArea.setInteractive();
        mrHitArea.on("pointerover", () => {
            this.showStatTooltip(
                167,
                statsY - 40,
                "Magic Resistance",
                "Magical defense. Reduces damage\nfrom magic attacks and spells."
            );
        });
        mrHitArea.on("pointerout", () => {
            this.scene.input.setDefaultCursor("default");
            this.hideStatTooltip();
        });

        this.playerStatsContainer.add([
            bg,
            healthBarBg,
            healthBar,
            healthText,
            mpIcon,
            mpText,
            mpHitArea,
            apIcon,
            apText,
            apHitArea,
            forceIcon,
            forceText,
            forceHitArea,
            dexIcon,
            dexText,
            dexHitArea,
            intIcon,
            intText,
            intHitArea,
            armorIcon,
            armorText,
            armorHitArea,
            mrIcon,
            mrText,
            mrHitArea,
        ]);

        // Store references for updates
        this.playerStatsContainer.setData("healthBar", healthBar);
        this.playerStatsContainer.setData("healthText", healthText);
        this.playerStatsContainer.setData("mpText", mpText);
        this.playerStatsContainer.setData("apText", apText);
        this.playerStatsContainer.setData("forceText", forceText);
        this.playerStatsContainer.setData("dexText", dexText);
        this.playerStatsContainer.setData("intText", intText);
        this.playerStatsContainer.setData("armorText", armorText);
        this.playerStatsContainer.setData("mrText", mrText);

        // Store references to the MP/AP texts for compatibility
        this.mpText = mpText;
        this.apText = apText;
    }

    private updatePlayerStats(player: Player | null): void {
        if (!this.playerStatsContainer) return;

        const healthBar = this.playerStatsContainer.getData(
            "healthBar"
        ) as Phaser.GameObjects.Graphics;
        const healthText = this.playerStatsContainer.getData(
            "healthText"
        ) as Phaser.GameObjects.Text;
        const mpText = this.playerStatsContainer.getData(
            "mpText"
        ) as Phaser.GameObjects.Text;
        const apText = this.playerStatsContainer.getData(
            "apText"
        ) as Phaser.GameObjects.Text;
        const forceText = this.playerStatsContainer.getData(
            "forceText"
        ) as Phaser.GameObjects.Text;
        const dexText = this.playerStatsContainer.getData(
            "dexText"
        ) as Phaser.GameObjects.Text;
        const intText = this.playerStatsContainer.getData(
            "intText"
        ) as Phaser.GameObjects.Text;
        const armorText = this.playerStatsContainer.getData(
            "armorText"
        ) as Phaser.GameObjects.Text;
        const mrText = this.playerStatsContainer.getData(
            "mrText"
        ) as Phaser.GameObjects.Text;

        // Add null checks for all elements
        if (
            !healthBar ||
            !healthText ||
            !mpText ||
            !apText ||
            !forceText ||
            !dexText ||
            !intText ||
            !armorText ||
            !mrText
        ) {
            console.warn(
                "[UIManager] Some UI elements are not initialized yet"
            );
            return;
        }

        if (player) {
            // Update health bar
            healthBar.clear();
            const healthPercent = player.health / player.maxHealth;
            const barWidth = 356 * healthPercent; // Updated for new width (360 - 4 for padding)

            // Choose color based on health percentage
            let healthColor = 0x00aa00; // Darker green (matching enemy tooltips)
            if (healthPercent <= 0.25) {
                healthColor = 0xff0000; // Red
            } else if (healthPercent <= 0.5) {
                healthColor = 0xffaa00; // Orange
            }

            healthBar.fillStyle(healthColor, 0.9);
            healthBar.fillRoundedRect(-178, -28, barWidth, 22, 10); // Updated dimensions to match new health bar background

            // Update health text
            healthText.setText(`${player.health} / ${player.maxHealth}`);

            // Update MP/AP
            mpText.setText(
                `${player.movementPoints}/${player.maxMovementPoints}`
            );
            apText.setText(`${player.actionPoints}/${player.maxActionPoints}`);

            // Update stat values
            forceText.setText(player.force.toString());
            dexText.setText(player.dexterity.toString());
            intText.setText(player.intelligence.toString());
            armorText.setText(player.armor.toString());
            mrText.setText(player.magicResistance.toString());
        } else {
            // Clear everything if no player
            healthBar.clear();
            healthText.setText("");
            mpText.setText("");
            apText.setText("");
            forceText.setText("");
            dexText.setText("");
            intText.setText("");
            armorText.setText("");
            mrText.setText("");
        }
    }

    private createSpellButton(
        x: number,
        y: number,
        spell: Spell,
        index: number
    ): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);
        container.setDepth(50);

        // Icon - much larger size, no background
        const iconSprite = this.scene.add.image(0, 0, spell.icon);
        iconSprite.setScale(1.2); // Reduced from 1.5
        iconSprite.setDisplaySize(48, 48); // Reduced from 60x60

        // AP cost - positioned at top-right corner of icon
        const apCostText = this.scene.add
            .text(20, -20, `${spell.apCost}`, {
                fontSize: "14px",
                color: "#ffff00",
                backgroundColor: "#000000",
                padding: { x: 2, y: 1 },
                stroke: "#000000",
                strokeThickness: 2,
            })
            .setOrigin(0.5);

        // Selection border (initially hidden)
        const selectionBorder = this.scene.add.graphics();
        selectionBorder.setVisible(false);

        container.add([selectionBorder, iconSprite, apCostText]);
        container.setData("iconSprite", iconSprite);
        container.setData("spell", spell);
        container.setData("apCostText", apCostText);
        container.setData("selectionBorder", selectionBorder);
        container.setInteractive(
            new Phaser.Geom.Rectangle(-24, -24, 48, 48),
            Phaser.Geom.Rectangle.Contains
        );

        container.on("pointerdown", () => {
            if (this.currentPlayer && this.currentPlayer.canCastSpell(spell)) {
                this.selectSpell(spell);
                if (this.onSpellSelected) {
                    this.onSpellSelected(spell);
                }
            }
        });

        container.on("pointerover", () => {
            if (this.currentPlayer && this.currentPlayer.canCastSpell(spell)) {
                iconSprite.setTint(0xccccff);
                this.scene.input.setDefaultCursor("pointer");
            } else {
                this.scene.input.setDefaultCursor("default");
            }

            // Show spell tooltip
            this.showSpellTooltip(spell, x, y - 50);
        });

        container.on("pointerout", () => {
            if (container.getData("spell") !== this.selectedSpell) {
                iconSprite.clearTint();
            }
            this.scene.input.setDefaultCursor("default");

            this.hideSpellTooltip();
        });

        return container;
    }

    private spellTooltip?: Phaser.GameObjects.Container;

    private showSpellTooltip(spell: Spell, x: number, y: number): void {
        if (this.spellTooltip) return;

        // Build range text
        let rangeText = `Range: ${spell.range}`;
        if (spell.minRange) {
            rangeText = `Range: ${spell.minRange}-${spell.range}`;
        }

        let descriptionText =
            `${spell.description}\n` +
            `Damage: ${spell.damage} + ${
                spell.type === "melee"
                    ? "FOR"
                    : spell.type === "magic"
                    ? "INT"
                    : "DEX"
            }\n` +
            `${rangeText} | AP: ${spell.apCost}`;

        if (spell.aoeShape && spell.aoeRadius) {
            descriptionText += `\nAoE: ${spell.aoeShape} (Radius: ${spell.aoeRadius})`;
        }

        // Create title text (spell name) - yellow and larger
        const titleText = this.scene.add
            .text(0, 0, spell.name, {
                fontSize: "16px",
                color: "#ffff00",
                fontStyle: "bold",
                align: "center",
            })
            .setOrigin(0.5);

        // Create description text
        const descText = this.scene.add
            .text(0, 0, descriptionText, {
                fontSize: "14px",
                color: "#ffffff",
                align: "center",
                lineSpacing: 3,
                wordWrap: { width: 250 }, // Add word wrap to prevent very long lines
            })
            .setOrigin(0.5);

        // Calculate the required size for the background
        const padding = 20;
        const titleBounds = titleText.getBounds();
        const descBounds = descText.getBounds();
        const maxWidth =
            Math.max(titleBounds.width, descBounds.width) + padding * 2;
        const totalHeight =
            titleBounds.height + descBounds.height + padding * 2 + 10; // 10 for spacing

        // Create background with dynamic size
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(
            -maxWidth / 2,
            -totalHeight / 2,
            maxWidth,
            totalHeight,
            5
        );
        bg.lineStyle(2, 0x444444);
        bg.strokeRoundedRect(
            -maxWidth / 2,
            -totalHeight / 2,
            maxWidth,
            totalHeight,
            5
        );

        // Adjust text positions based on background size
        titleText.setY(-totalHeight / 2 + padding + titleBounds.height / 2);
        descText.setY(
            -totalHeight / 2 +
                padding +
                titleBounds.height +
                10 +
                descBounds.height / 2
        );

        // Position tooltip above the bottom bar instead of potentially overlapping with buttons
        const bottomBarHeight = 100;
        const tooltipY =
            this.scene.scale.height - bottomBarHeight - totalHeight / 2 - 10; // 10px gap above bottom bar

        this.spellTooltip = this.scene.add.container(x, tooltipY, [
            bg,
            titleText,
            descText,
        ]);
        this.spellTooltip.setDepth(100);
    }

    private hideSpellTooltip(): void {
        if (this.spellTooltip) {
            this.spellTooltip.destroy();
            this.spellTooltip = undefined;
        }
    }

    public updateSpellButtons(player: Player | null): void {
        // Clear existing spell buttons
        this.spellButtons.forEach((button) => button.destroy());
        this.spellButtons = [];

        if (!player) return;

        this.currentPlayer = player;
        const spells = player.getSpells();
        const buttonY = this.scene.scale.height - 50; // Adjusted for larger bar
        const startX = 100;
        const spacing = 80; // Reduced from 120

        spells.forEach((spell, index) => {
            const button = this.createSpellButton(
                startX + index * spacing,
                buttonY,
                spell,
                index
            );
            this.spellButtons.push(button);

            // Update button state based on AP availability
            const iconSprite = button.getData(
                "iconSprite"
            ) as Phaser.GameObjects.Image;
            const apCostText = button.getData(
                "apCostText"
            ) as Phaser.GameObjects.Text;

            if (!player.canCastSpell(spell)) {
                // Disabled state
                iconSprite.setTint(0x666666);
                iconSprite.setAlpha(0.5);
                apCostText.setColor("#ff4444");
            } else {
                iconSprite.clearTint();
                iconSprite.setAlpha(1);
                apCostText.setColor("#ffff00");
            }
        });

        // Select the current spell
        if (player.getCurrentSpell()) {
            this.selectSpell(player.getCurrentSpell());
        }

        // Update player stats
        this.updatePlayerStats(player);
    }

    public selectSpell(spell: Spell): void {
        this.selectedSpell = spell;

        // Update button visuals
        this.spellButtons.forEach((button) => {
            const iconSprite = button.getData(
                "iconSprite"
            ) as Phaser.GameObjects.Image;
            const buttonSpell = button.getData("spell") as Spell;
            const selectionBorder = button.getData(
                "selectionBorder"
            ) as Phaser.GameObjects.Graphics;

            if (buttonSpell === spell) {
                // Selected state - green border and larger
                iconSprite.clearTint();
                iconSprite.setScale(1.4); // Larger when selected
                iconSprite.setDisplaySize(56, 56); // Larger display size

                // Draw green border
                selectionBorder.clear();
                selectionBorder.lineStyle(3, 0x00ff00, 1);
                selectionBorder.strokeRoundedRect(-30, -30, 60, 60, 8);
                selectionBorder.setVisible(true);
            } else if (
                this.currentPlayer &&
                !this.currentPlayer.canCastSpell(buttonSpell)
            ) {
                // Disabled state
                iconSprite.setTint(0x666666);
                iconSprite.setAlpha(0.5);
                iconSprite.setScale(1.2); // Reduced from 1.5
                iconSprite.setDisplaySize(48, 48);
                selectionBorder.setVisible(false);
            } else {
                // Normal state
                iconSprite.clearTint();
                iconSprite.setAlpha(1);
                iconSprite.setScale(1.2); // Reduced from 1.5
                iconSprite.setDisplaySize(48, 48);
                selectionBorder.setVisible(false);
            }
        });
    }

    public updatePointsDisplay(player: Player | null): void {
        if (player) {
            // MP and AP are now updated in updatePlayerStats

            // Update spell buttons when points change
            this.updateSpellButtons(player);

            // Update player stats (which includes MP/AP)
            this.updatePlayerStats(player);
        } else {
            // MP and AP are now cleared in updatePlayerStats
            this.updateSpellButtons(null);
            this.updatePlayerStats(null);
        }
    }

    /**
     * Specifically refreshes the player stats block in the UI, including health, MP, AP, and combat stats.
     * This is a more targeted update than updatePointsDisplay and should be used when only the visual stats need refreshing,
     * for example, when the player takes damage on an enemy's turn.
     */
    public refreshPlayerStatsDisplay(player: Player | null): void {
        // Check if UI is ready before updating
        if (!this.playerStatsContainer) {
            console.warn(
                "[UIManager] refreshPlayerStatsDisplay called but playerStatsContainer not ready"
            );
            return;
        }
        this.updatePlayerStats(player);
    }

    public setTurnText(text: string): void {
        this.turnText.setText(text);
    }

    public setActionText(text: string): void {
        this.actionText.setText(text);
    }

    public addCombatLogMessage(message: string): void {
        this.combatLogMessages.push(message);
        if (this.combatLogMessages.length > 5) {
            this.combatLogMessages.shift();
        }
        this.combatLog.setText(this.combatLogMessages.join("\n"));
    }

    public onSpellSelectedChanged(callback: (spell: Spell) => void): void {
        this.onSpellSelected = callback;
    }

    // Legacy method for compatibility
    public onAttackTypeChanged(callback: (type: AttackType) => void): void {
        // Convert spell selection to attack type
        this.onSpellSelected = (spell: Spell) => {
            callback(spell.type);
        };
    }

    public onEndTurnClicked(callback: () => void): void {
        this.onEndTurn = callback;
    }

    public showGameOver(victory: boolean, onRestart: () => void): void {
        if (victory) {
            // Show bonus selection
            this.showBonusSelection(onRestart);
        } else {
            // Show regular game over
            this.showDefeatScreen(onRestart);
        }
    }

    private disableAllGameInteractions(): void {
        // Stop all walking sounds from units
        if ((this.scene as any).gameManager) {
            const gameManager = (this.scene as any).gameManager;
            gameManager.stopAllWalkingSounds();

            // Disable hover preview system to prevent cursor interference
            gameManager.disableHoverPreview();

            // Disable all unit interactions and tooltips
            const units = gameManager.getUnits();
            units.forEach((unit: any) => {
                if (unit.sprite) {
                    // Remove all listeners to prevent tooltips
                    unit.sprite.removeAllListeners();
                    // Make sprite non-interactive
                    unit.sprite.disableInteractive();
                }

                // Hide any existing tooltips
                if (unit.hideStatsTooltip) {
                    unit.hideStatsTooltip();
                }
            });

            // Clear any game highlights/previews
            gameManager.clearHighlights();
        }

        // Hide any existing tooltips
        this.hideSpellTooltip();
        this.hideStatTooltip();
    }

    private disableAllGameInteractionsAndStopSounds(): void {
        // First disable all game interactions
        this.disableAllGameInteractions();

        // Stop ALL currently playing sounds (including attack sounds) - only for defeat screen
        this.scene.sound.stopAll();
    }

    private showDefeatScreen(onRestart: () => void): void {
        // Guard against duplicate calls
        if (this.bonusSelectionActive) {
            return;
        }
        this.bonusSelectionActive = true;

        // Reset all game progress immediately on defeat
        GameProgress.getInstance().reset();
        console.log("[UIManager] Game progress reset due to defeat");

        // Disable all game interactions and tooltips
        this.disableAllGameInteractionsAndStopSounds();

        // Get screen dimensions
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        // Full screen overlay with medieval background (same as victory screen)
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x2a1d16, 1); // Dark medieval brown background
        overlay.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
        overlay.setDepth(99);

        // Add medieval atmospheric effects
        this.createMedievalParticleEffects();

        // Defeat banner background (using dark red medieval colors)
        const bannerBg = this.scene.add.graphics();
        bannerBg.fillStyle(0x4d1f1f, 0.95); // Dark red brown
        bannerBg.fillRoundedRect(centerX - 400, 50, 800, 120, 20);
        bannerBg.lineStyle(4, 0x8b2635, 0.9); // Dark red border
        bannerBg.strokeRoundedRect(centerX - 400, 50, 800, 120, 20);
        bannerBg.lineStyle(1, 0xdc143c, 0.7); // Crimson inner line
        bannerBg.strokeRoundedRect(centerX - 397, 53, 794, 114, 17);
        bannerBg.setDepth(100);

        // Medieval defeat text with proper styling
        const gameOverText = this.scene.add
            .text(centerX, 110, "DEFEAT!", {
                fontSize: "72px",
                color: "#dc143c", // Crimson red
                fontStyle: "bold",
                fontFamily: "serif", // Medieval font
                stroke: "#4d1f1f", // Dark red stroke
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setDepth(101);

        // Add medieval glow effect to title
        this.addMedievalGlowEffect(gameOverText);

        // Subtitle with medieval language
        const subTextObj = this.scene.add
            .text(centerX, centerY - 80, "Your hero has fallen in battle!", {
                fontSize: "28px",
                color: "#f5deb3", // Wheat color (matching main menu)
                fontFamily: "serif", // Medieval font
                fontStyle: "italic",
                stroke: "#654321",
                strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setDepth(100);

        // Medieval progress panel background for message - adjusted position and size
        const messagePanelBg = this.scene.add.graphics();
        messagePanelBg.fillStyle(0x3e2723, 0.9); // Dark brown (matching main menu)
        messagePanelBg.fillRoundedRect(
            centerX - 350,
            centerY - 40,
            700,
            240, // Extended height to include button
            12
        );

        // Ornate border (same as main menu)
        messagePanelBg.lineStyle(3, 0x8b7355, 0.9); // Bronze border
        messagePanelBg.strokeRoundedRect(
            centerX - 350,
            centerY - 40,
            700,
            240, // Extended height to include button
            12
        );
        messagePanelBg.lineStyle(1, 0xd4af37, 0.7); // Gold inner line
        messagePanelBg.strokeRoundedRect(
            centerX - 347,
            centerY - 37,
            694,
            234, // Extended height to include button
            10
        );
        messagePanelBg.setDepth(100);

        // Medieval scroll decorations (corner flourishes)
        const decorationText = this.scene.add
            .text(centerX - 335, centerY - 25, "⚜️", {
                fontSize: "24px",
                color: "#d4af37",
            })
            .setDepth(100);

        const decorationText2 = this.scene.add
            .text(centerX + 311, centerY - 25, "⚜️", {
                fontSize: "24px",
                color: "#d4af37",
            })
            .setDepth(100);

        // Medieval defeat message - adjusted position and reduced line spacing
        const defeatMessage = this.scene.add
            .text(
                centerX,
                centerY + 30, // Moved down from centerY + 10 for better spacing
                "The darkness has claimed another soul...\nBut legends are forged in defeat!\n\nYour progress has been lost to the winds of fate.",
                {
                    fontSize: "18px", // Reduced from 20px
                    color: "#f5deb3", // Wheat color
                    fontFamily: "serif",
                    fontStyle: "italic",
                    align: "center",
                    lineSpacing: 6, // Reduced from 8
                }
            )
            .setOrigin(0.5)
            .setDepth(100);

        // Medieval restart button - positioned within the panel
        const restartBtn = this.createMedievalButton(
            centerX,
            centerY + 120, // Positioned within the extended panel
            "⚔️ NEW EXPEDITION",
            "#8b4513", // Saddle brown (matching main menu)
            "#a0522d", // Sienna hover
            () => {
                this.bonusSelectionActive = false; // Reset flag

                // Game progress already reset at the start of showDefeatScreen
                onRestart();
            }
        );

        // Add medieval entrance animations
        this.createMedievalEntranceAnimations([
            gameOverText,
            subTextObj,
            messagePanelBg,
            restartBtn,
        ]);
    }

    private createMedievalParticleEffects(): void {
        // Create floating embers/sparks (same as main menu and loading screen)
        const emberParticles = this.scene.add.particles(0, 0, "star", {
            x: { min: 0, max: this.scene.scale.width },
            y: { min: 0, max: this.scene.scale.height },
            scale: { min: 0.05, max: 0.2 },
            alpha: { min: 0.2, max: 0.6 },
            speed: { min: 5, max: 20 },
            lifespan: 12000,
            frequency: 300,
            tint: [0xd4af37, 0xffd700, 0xff8c00, 0xdc143c], // Gold, orange, red embers
        });
        emberParticles.setDepth(50);

        // Create dust motes (same as main menu and loading screen)
        const dustParticles = this.scene.add.particles(0, 0, "star", {
            x: { min: 0, max: this.scene.scale.width },
            y: { min: 0, max: this.scene.scale.height },
            scale: { min: 0.03, max: 0.1 },
            alpha: { min: 0.1, max: 0.3 },
            speed: { min: 2, max: 8 },
            lifespan: 15000,
            frequency: 400,
            tint: [0x8b7355, 0xa0522d, 0xcd853f], // Earthy browns
        });
        dustParticles.setDepth(45);
    }

    private addMedievalGlowEffect(textObject: Phaser.GameObjects.Text): void {
        // Create a warm, flickering glow animation like candlelight (same as main menu)
        this.scene.tweens.add({
            targets: textObject,
            alpha: 0.7,
            duration: 1500 + Math.random() * 1000, // Irregular timing like flames
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });
    }

    private createMedievalButton(
        x: number,
        y: number,
        text: string,
        baseColor: string,
        hoverColor: string,
        onClick: () => void
    ): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);

        // Medieval stone/wood button background - reduced width for shorter text
        const buttonWidth = 320; // Reduced from 420
        const buttonHeight = 60;
        const bg = this.scene.add.graphics();
        bg.fillStyle(Phaser.Display.Color.HexStringToColor(baseColor).color);
        bg.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            8
        );

        // Add medieval border with metal studs look
        bg.lineStyle(4, 0x8b7355, 1); // Brown bronze border
        bg.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            8
        );

        // Add inner highlight
        bg.lineStyle(2, 0xd4af37, 0.6); // Gold inner highlight
        bg.strokeRoundedRect(
            -buttonWidth / 2 + 3,
            -buttonHeight / 2 + 3,
            buttonWidth - 6,
            buttonHeight - 6,
            6
        );

        // Button text with medieval font
        const buttonText = this.scene.add
            .text(0, 0, text, {
                fontFamily: "serif",
                fontSize: "24px",
                color: "#f5deb3", // Wheat color
                align: "center",
                fontStyle: "bold",
                stroke: "#654321",
                strokeThickness: 2,
                wordWrap: { width: buttonWidth - 20 },
            })
            .setOrigin(0.5);

        container.add([bg, buttonText]);
        container.setSize(buttonWidth, buttonHeight);
        container.setInteractive();
        container.setDepth(100);

        // Medieval hover effects
        container.on("pointerover", () => {
            bg.clear();
            bg.fillStyle(
                Phaser.Display.Color.HexStringToColor(hoverColor).color
            );
            bg.fillRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8
            );
            bg.lineStyle(4, 0xd4af37, 1); // Gold border on hover
            bg.strokeRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8
            );
            bg.lineStyle(2, 0xffd700, 0.8); // Brighter gold inner highlight
            bg.strokeRoundedRect(
                -buttonWidth / 2 + 3,
                -buttonHeight / 2 + 3,
                buttonWidth - 6,
                buttonHeight - 6,
                6
            );

            container.setScale(1.01);
            buttonText.setColor("#ffffff"); // Brighter text on hover
            this.scene.input.setDefaultCursor("pointer");
        });

        container.on("pointerout", () => {
            bg.clear();
            bg.fillStyle(
                Phaser.Display.Color.HexStringToColor(baseColor).color
            );
            bg.fillRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8
            );
            bg.lineStyle(4, 0x8b7355, 1);
            bg.strokeRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8
            );
            bg.lineStyle(2, 0xd4af37, 0.6);
            bg.strokeRoundedRect(
                -buttonWidth / 2 + 3,
                -buttonHeight / 2 + 3,
                buttonWidth - 6,
                buttonHeight - 6,
                6
            );

            container.setScale(1);
            buttonText.setColor("#f5deb3");
            this.scene.input.setDefaultCursor("default");
        });

        container.on("pointerdown", () => {
            container.setScale(0.97);
            this.scene.time.delayedCall(120, () => {
                container.setScale(1.01);
                onClick();
            });
        });

        return container;
    }

    private createMedievalEntranceAnimations(
        elements: (
            | Phaser.GameObjects.Text
            | Phaser.GameObjects.Graphics
            | Phaser.GameObjects.Container
        )[]
    ): void {
        elements.forEach((element, index) => {
            if ("setAlpha" in element) {
                element.setAlpha(0);
            }
            if ("y" in element && "setY" in element) {
                const originalY = element.y;
                element.setY(originalY + 30);
            }
            if ("setScale" in element) {
                element.setScale(0.9);
            }

            this.scene.tweens.add({
                targets: element,
                alpha: 1,
                y: "y" in element ? element.y - 30 : 0,
                scale: 1,
                duration: 1000,
                delay: index * 300,
                ease: "Power3.easeOut",
            });
        });
    }

    private showBonusHistoryModal(): void {
        if (this.bonusHistoryModal) return; // Already showing

        const progress = GameProgress.getInstance();
        const bonuses = progress.getAppliedBonuses();
        const wins = progress.getWins();

        // Calculate modal dimensions based on content
        const modalWidth = 600;
        const itemHeight = 60;
        const maxVisibleItems = 6; // Maximum items visible without scrolling
        const headerHeight = 120; // Space for title and wins text
        const footerHeight = 80; // Space for close button
        const listPadding = 20;

        // Calculate actual list height needed
        const actualItemCount = Math.max(1, bonuses.length); // At least 1 for "no bonuses" message
        const neededListHeight = actualItemCount * itemHeight;
        const maxListHeight = maxVisibleItems * itemHeight;
        const listHeight = Math.min(neededListHeight, maxListHeight);

        // Calculate total modal height
        const modalHeight =
            headerHeight + listHeight + footerHeight + listPadding * 2;

        // Create modal container
        this.bonusHistoryModal = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        );
        this.bonusHistoryModal.setDepth(200);

        // Background overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(
            -this.scene.scale.width / 2,
            -this.scene.scale.height / 2,
            this.scene.scale.width,
            this.scene.scale.height
        );

        // Modal background - using expedition records colors
        const modalBg = this.scene.add.graphics();
        modalBg.fillStyle(0x3e2723, 0.9); // Dark brown (matching expedition records)
        modalBg.fillRoundedRect(
            -modalWidth / 2,
            -modalHeight / 2,
            modalWidth,
            modalHeight,
            20
        );

        // Bronze border (matching expedition records)
        modalBg.lineStyle(3, 0x8b7355, 0.9);
        modalBg.strokeRoundedRect(
            -modalWidth / 2,
            -modalHeight / 2,
            modalWidth,
            modalHeight,
            20
        );

        // Gold inner border (matching expedition records)
        modalBg.lineStyle(1, 0xd4af37, 0.7);
        modalBg.strokeRoundedRect(
            -modalWidth / 2 + 3,
            -modalHeight / 2 + 3,
            modalWidth - 6,
            modalHeight - 6,
            17
        );

        // Title - using expedition records gold color
        const title = this.scene.add
            .text(0, -modalHeight / 2 + 30, "Bonus History", {
                fontSize: "32px",
                color: "#d4af37", // Gold color (matching expedition records)
                fontStyle: "bold",
                fontFamily: "serif", // Medieval font
                stroke: "#654321", // Brown stroke
                strokeThickness: 2,
            })
            .setOrigin(0.5);

        // Wins counter - using expedition records text color
        const winsText = this.scene.add
            .text(0, -modalHeight / 2 + 70, `Total Wins: ${wins}`, {
                fontSize: "24px",
                color: "#f5deb3", // Wheat/beige color (matching expedition records)
                fontFamily: "serif", // Medieval font
            })
            .setOrigin(0.5);

        // Create mask for scrollable area
        const maskShape = this.scene.make.graphics({});
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(
            this.scene.scale.width / 2 - 280,
            this.scene.scale.height / 2 - modalHeight / 2 + headerHeight,
            560,
            listHeight
        );
        const mask = maskShape.createGeometryMask();

        // Bonus list container - positioned for scrolling
        const listContainer = this.scene.add.container(
            0,
            -modalHeight / 2 + headerHeight + listPadding
        );
        listContainer.setMask(mask);

        // Scroll variables
        let scrollY = 0;
        const maxScroll = Math.max(0, neededListHeight - listHeight);

        if (bonuses.length === 0) {
            const noBonusText = this.scene.add
                .text(0, 30, "No bonuses acquired yet", {
                    fontSize: "20px",
                    color: "#f5deb3", // Wheat/beige color (matching expedition records)
                    fontFamily: "serif", // Medieval font
                    fontStyle: "italic",
                })
                .setOrigin(0.5);
            listContainer.add(noBonusText);
        } else {
            // Get bonus details
            const bonusDetails = bonuses
                .map((bonusId) => {
                    const bonus = this.getBonusById(bonusId);
                    return bonus;
                })
                .filter(Boolean);

            // Create list items
            let yOffset = 0;
            bonusDetails.forEach((bonus, index) => {
                if (!bonus) return;

                // Bonus item background - using complementary medieval color
                const itemBg = this.scene.add.graphics();
                itemBg.fillStyle(0x4a332a, 0.8); // Slightly lighter brown for contrast
                itemBg.fillRoundedRect(-250, yOffset - 25, 500, 50, 10);

                // Icon
                let iconDisplay:
                    | Phaser.GameObjects.Image
                    | Phaser.GameObjects.Text;
                if (bonus.icon.startsWith("icon_")) {
                    iconDisplay = this.scene.add.image(
                        -220,
                        yOffset,
                        bonus.icon
                    );
                    iconDisplay.setDisplaySize(32, 32);
                } else {
                    iconDisplay = this.scene.add
                        .text(-220, yOffset, bonus.icon, {
                            fontSize: "32px",
                        })
                        .setOrigin(0.5);
                }
                iconDisplay.setOrigin(0.5);

                // Name - using expedition records gold color
                const name = this.scene.add
                    .text(-170, yOffset - 10, bonus.name, {
                        fontSize: "18px",
                        color: "#d4af37", // Gold color (matching expedition records)
                        fontStyle: "bold",
                        fontFamily: "serif", // Medieval font
                    })
                    .setOrigin(0, 0.5);

                // Description - using expedition records text color
                const desc = this.scene.add
                    .text(-170, yOffset + 10, bonus.description, {
                        fontSize: "14px",
                        color: "#f5deb3", // Wheat/beige color (matching expedition records)
                        fontFamily: "serif", // Medieval font
                    })
                    .setOrigin(0, 0.5);

                listContainer.add([itemBg, iconDisplay, name, desc]);
                yOffset += itemHeight;
            });

            // Add scroll indicators if needed
            if (maxScroll > 0) {
                // Scroll hint text
                const scrollHint = this.scene.add
                    .text(
                        0,
                        modalHeight / 2 - footerHeight - 10,
                        "↕ Scroll for more",
                        {
                            fontSize: "14px",
                            color: "#888888",
                        }
                    )
                    .setOrigin(0.5);
                this.bonusHistoryModal.add(scrollHint);

                // Enable mouse wheel scrolling
                this.scene.input.on(
                    "wheel",
                    (
                        pointer: any,
                        gameObjects: any[],
                        deltaX: number,
                        deltaY: number
                    ) => {
                        if (this.bonusHistoryModal) {
                            scrollY = Phaser.Math.Clamp(
                                scrollY + deltaY * 0.5,
                                0,
                                maxScroll
                            );
                            listContainer.y =
                                -modalHeight / 2 +
                                headerHeight +
                                listPadding -
                                scrollY;
                        }
                    }
                );
            }
        }

        // Close button - positioned at bottom
        const closeBtn = this.scene.add
            .text(0, modalHeight / 2 - 40, "Close", {
                fontSize: "24px",
                color: "#ffffff",
                backgroundColor: "#aa4444",
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setInteractive();

        closeBtn.on("pointerdown", () => {
            this.closeBonusHistoryModal();
        });
        closeBtn.on("pointerover", () => {
            closeBtn.setBackgroundColor("#cc6666");
            this.scene.input.setDefaultCursor("pointer");
        });
        closeBtn.on("pointerout", () => {
            closeBtn.setBackgroundColor("#aa4444");
            this.scene.input.setDefaultCursor("default");
        });

        // Add all elements to modal (except masked content)
        this.bonusHistoryModal.add([
            overlay,
            modalBg,
            title,
            winsText,
            closeBtn,
        ]);

        // Add list container separately (it has its own mask)
        this.bonusHistoryModal.add(listContainer);

        // Make overlay interactive to close on click
        overlay.setInteractive(
            new Phaser.Geom.Rectangle(
                -this.scene.scale.width / 2,
                -this.scene.scale.height / 2,
                this.scene.scale.width,
                this.scene.scale.height
            ),
            Phaser.Geom.Rectangle.Contains
        );
        overlay.on("pointerdown", () => {
            this.closeBonusHistoryModal();
        });

        // Clean up mask when modal is destroyed
        this.bonusHistoryModal.on("destroy", () => {
            maskShape.destroy();
            this.scene.input.off("wheel");
        });
    }

    private closeBonusHistoryModal(): void {
        if (this.bonusHistoryModal) {
            this.bonusHistoryModal.destroy();
            this.bonusHistoryModal = undefined;
        }
    }

    private showPlayerStatsModal(): void {
        if (this.bonusHistoryModal) return; // Reuse the same modal property to prevent multiple modals

        const player = this.currentPlayer;
        if (!player) return;

        const progress = GameProgress.getInstance();
        const wins = progress.getWins();

        // Calculate modal dimensions
        const modalWidth = 500;
        const modalHeight = 650; // Increased from 600 to prevent overlap

        // Create modal container
        this.bonusHistoryModal = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        );
        this.bonusHistoryModal.setDepth(200);

        // Background overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(
            -this.scene.scale.width / 2,
            -this.scene.scale.height / 2,
            this.scene.scale.width,
            this.scene.scale.height
        );

        // Modal background - matching expedition records style
        const modalBg = this.scene.add.graphics();
        modalBg.fillStyle(0x3e2723, 0.9); // Dark brown
        modalBg.fillRoundedRect(
            -modalWidth / 2,
            -modalHeight / 2,
            modalWidth,
            modalHeight,
            20
        );
        modalBg.lineStyle(4, 0x8b7355, 0.9); // Bronze border
        modalBg.strokeRoundedRect(
            -modalWidth / 2,
            -modalHeight / 2,
            modalWidth,
            modalHeight,
            20
        );

        // Title
        const title = this.scene.add
            .text(0, -modalHeight / 2 + 40, "Player Statistics", {
                fontSize: "32px",
                color: "#d4af37", // Gold
                fontStyle: "bold",
                fontFamily: "serif",
            })
            .setOrigin(0.5);

        // Win count
        const winsText = this.scene.add
            .text(0, -modalHeight / 2 + 80, `Victories: ${wins}`, {
                fontSize: "20px",
                color: "#f5deb3", // Wheat/beige
                fontFamily: "serif",
            })
            .setOrigin(0.5);

        // Stats section
        let yOffset = -modalHeight / 2 + 140;
        const lineHeight = 35;

        // Combat Stats
        const combatTitle = this.scene.add
            .text(0, yOffset, "Combat Statistics", {
                fontSize: "24px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        yOffset += lineHeight + 10;

        const healthStat = this.scene.add
            .text(0, yOffset, `Max Health: ${player.maxHealth}`, {
                fontSize: "18px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        yOffset += lineHeight;

        const forceStat = this.scene.add
            .text(0, yOffset, `Force: ${player.force}`, {
                fontSize: "18px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        yOffset += lineHeight;

        const dexterityStat = this.scene.add
            .text(0, yOffset, `Dexterity: ${player.dexterity}`, {
                fontSize: "18px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        yOffset += lineHeight;

        const intelligenceStat = this.scene.add
            .text(0, yOffset, `Intelligence: ${player.intelligence || 0}`, {
                fontSize: "18px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        yOffset += lineHeight + 20;

        // Defense Stats
        const defenseTitle = this.scene.add
            .text(0, yOffset, "Defense Statistics", {
                fontSize: "24px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        yOffset += lineHeight + 10;

        const armorStat = this.scene.add
            .text(0, yOffset, `Armor: ${player.armor}`, {
                fontSize: "18px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        yOffset += lineHeight;

        const magicResistStat = this.scene.add
            .text(0, yOffset, `Magic Resistance: ${player.magicResistance}`, {
                fontSize: "18px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        yOffset += lineHeight + 20;

        // Action Points
        const actionTitle = this.scene.add
            .text(0, yOffset, "Action Economy", {
                fontSize: "24px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        yOffset += lineHeight + 10;

        const movementStat = this.scene.add
            .text(
                0,
                yOffset,
                `Max Movement Points: ${player.maxMovementPoints}`,
                {
                    fontSize: "18px",
                    color: "#f5deb3",
                    fontFamily: "serif",
                }
            )
            .setOrigin(0.5);
        yOffset += lineHeight;

        const actionStat = this.scene.add
            .text(0, yOffset, `Max Action Points: ${player.maxActionPoints}`, {
                fontSize: "18px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0.5);

        // Close button
        const closeBtn = this.scene.add
            .text(0, modalHeight / 2 - 40, "Close", {
                fontSize: "24px",
                color: "#ffffff",
                backgroundColor: "#aa4444",
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setInteractive();

        closeBtn.on("pointerdown", () => {
            this.closeBonusHistoryModal(); // Reusing the same method
        });
        closeBtn.on("pointerover", () => {
            closeBtn.setBackgroundColor("#cc6666");
            this.scene.input.setDefaultCursor("pointer");
        });
        closeBtn.on("pointerout", () => {
            closeBtn.setBackgroundColor("#aa4444");
            this.scene.input.setDefaultCursor("default");
        });

        // Add all elements to modal
        this.bonusHistoryModal.add([
            overlay,
            modalBg,
            title,
            winsText,
            combatTitle,
            healthStat,
            forceStat,
            dexterityStat,
            intelligenceStat,
            defenseTitle,
            armorStat,
            magicResistStat,
            actionTitle,
            movementStat,
            actionStat,
            closeBtn,
        ]);

        // Make overlay interactive to close on click
        overlay.setInteractive(
            new Phaser.Geom.Rectangle(
                -this.scene.scale.width / 2,
                -this.scene.scale.height / 2,
                this.scene.scale.width,
                this.scene.scale.height
            ),
            Phaser.Geom.Rectangle.Contains
        );
        overlay.on("pointerdown", () => {
            this.closeBonusHistoryModal();
        });
    }

    public updateLevelDisplay(): void {
        const difficulty = DifficultyScaling.getDifficultyDescription();
        const progress = GameProgress.getInstance();
        const wins = progress.getWins();

        this.levelText.setText(`Level ${wins + 1}\n${difficulty}`);

        // Update color based on difficulty with gradual progression
        if (difficulty === "Tutorial") {
            this.levelText.setColor("#00ff00"); // Bright green
        } else if (difficulty === "Beginner") {
            this.levelText.setColor("#66ff00"); // Green-yellow
        } else if (difficulty === "Easy") {
            this.levelText.setColor("#88ff00"); // Light green
        } else if (difficulty === "Normal") {
            this.levelText.setColor("#ffff00"); // Yellow
        } else if (difficulty === "Challenging") {
            this.levelText.setColor("#ffcc00"); // Gold
        } else if (difficulty === "Hard") {
            this.levelText.setColor("#ff8800"); // Orange
        } else if (difficulty === "Very Hard") {
            this.levelText.setColor("#ff4400"); // Red-orange
        } else if (difficulty === "Extreme") {
            this.levelText.setColor("#ff2200"); // Dark orange-red
        } else if (difficulty === "Nightmare") {
            this.levelText.setColor("#ff0000"); // Red
        } else if (difficulty === "Inferno") {
            this.levelText.setColor("#cc0000"); // Dark red
        } else if (difficulty === "Apocalypse") {
            this.levelText.setColor("#990000"); // Very dark red
        } else if (difficulty === "Legendary") {
            this.levelText.setColor("#ff00ff"); // Magenta for legendary status
        }
    }

    private getBonusById(bonusId: string): Bonus | null {
        // Import AVAILABLE_BONUSES from Bonus.ts
        return AVAILABLE_BONUSES.find((bonus) => bonus.id === bonusId) || null;
    }

    private showStatTooltip(
        x: number,
        y: number,
        title: string,
        description: string
    ): void {
        if (this.statTooltip) return;

        // Calculate position relative to player stats container
        const containerPos =
            this.playerStatsContainer!.getWorldTransformMatrix();
        const worldX = containerPos.tx + x;

        // Create text elements first to measure their size
        const titleText = this.scene.add
            .text(0, -20, title, {
                fontSize: "16px",
                color: "#ffff00",
                fontStyle: "bold",
                align: "center",
            })
            .setOrigin(0.5);

        const descText = this.scene.add
            .text(0, 5, description, {
                fontSize: "14px",
                color: "#ffffff",
                align: "center",
                lineSpacing: 3,
                wordWrap: { width: 250 }, // Add word wrap to prevent very long lines
            })
            .setOrigin(0.5);

        // Calculate the required size for the background
        const padding = 20;
        const titleBounds = titleText.getBounds();
        const descBounds = descText.getBounds();
        const maxWidth =
            Math.max(titleBounds.width, descBounds.width) + padding * 2;
        const totalHeight =
            titleBounds.height + descBounds.height + padding * 2 + 10; // 10 for spacing

        // Create background with dynamic size
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(
            -maxWidth / 2,
            -totalHeight / 2,
            maxWidth,
            totalHeight,
            5
        );
        bg.lineStyle(2, 0x444444);
        bg.strokeRoundedRect(
            -maxWidth / 2,
            -totalHeight / 2,
            maxWidth,
            totalHeight,
            5
        );

        // Adjust text positions based on background size
        titleText.setY(-totalHeight / 2 + padding + titleBounds.height / 2);
        descText.setY(
            -totalHeight / 2 +
                padding +
                titleBounds.height +
                10 +
                descBounds.height / 2
        );

        // Position tooltip above the bottom bar instead of potentially overlapping with stats
        const bottomBarHeight = 100;
        const tooltipY =
            this.scene.scale.height - bottomBarHeight - totalHeight / 2 - 10; // 10px gap above bottom bar

        this.statTooltip = this.scene.add.container(worldX, tooltipY, [
            bg,
            titleText,
            descText,
        ]);
        this.statTooltip.setDepth(100);
    }

    private hideStatTooltip(): void {
        if (this.statTooltip) {
            this.statTooltip.destroy();
            this.statTooltip = undefined;
        }
    }

    public destroy(): void {
        // Clean up existing spell buttons
        this.spellButtons.forEach((button) => button.destroy());
        this.spellButtons = [];

        // Destroy UI elements
        this.uiBar.destroy();
        this.mpText.destroy(); // This might be part of playerStatsContainer
        this.apText.destroy(); // This might be part of playerStatsContainer
        this.turnText.destroy();
        this.actionText.destroy();
        this.endTurnButton.destroy();
        this.combatLog.destroy();
        this.bonusHistoryButton.destroy();
        this.levelText.destroy();

        if (this.playerStatsContainer) {
            this.playerStatsContainer.destroy();
        }
        if (this.bonusHistoryModal) {
            this.bonusHistoryModal.destroy();
        }
        if (this.spellTooltip) {
            this.spellTooltip.destroy();
        }
        if (this.statTooltip) {
            this.statTooltip.destroy();
        }

        // Remove event listeners
        this.scene.events.off(
            "playerDamaged",
            this.refreshPlayerStatsDisplay,
            this
        );
        // Nullify references
        this.currentPlayer = null;
        this.selectedSpell = null;
        this.onSpellSelected = undefined;
        this.onEndTurn = undefined;
        this.bonusSelectionActive = false;
    }

    private showBonusSelection(onRestart: () => void): void {
        // Guard against duplicate calls
        if (this.bonusSelectionActive) {
            return;
        }
        this.bonusSelectionActive = true;
        this.rerollUsedThisVictory = false; // Reset reroll usage for new victory

        // Disable all game interactions and tooltips
        this.disableAllGameInteractions();

        const progress = GameProgress.getInstance();
        progress.incrementWins();

        // Full screen overlay with medieval background
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x2a1d16, 1); // Dark medieval brown background
        overlay.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
        overlay.setDepth(99);

        // Victory banner background - using expedition records colors
        const bannerBg = this.scene.add.graphics();
        bannerBg.fillStyle(0x3e2723, 0.95); // Dark brown (matching expedition records)
        bannerBg.fillRoundedRect(
            this.scene.scale.width / 2 - 400,
            50,
            800,
            120,
            20
        );
        bannerBg.lineStyle(4, 0x8b7355, 0.9); // Bronze border (matching expedition records)
        bannerBg.strokeRoundedRect(
            this.scene.scale.width / 2 - 400,
            50,
            800,
            120,
            20
        );
        bannerBg.setDepth(100);

        // Victory text with medieval styling
        const victoryText = this.scene.add
            .text(this.scene.scale.width / 2, 110, "VICTORY!", {
                fontSize: "72px",
                color: "#d4af37", // Gold color (matching expedition records)
                fontStyle: "bold",
                fontFamily: "serif", // Medieval font
                stroke: "#654321", // Brown stroke
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setDepth(101)
            .setAlpha(0); // Start invisible

        const instructionText = this.scene.add
            .text(this.scene.scale.width / 2, 200, "Choose your reward:", {
                fontSize: "28px",
                color: "#f5deb3", // Wheat/beige color (matching expedition records)
                fontStyle: "bold",
                fontFamily: "serif", // Medieval font
            })
            .setOrigin(0.5)
            .setDepth(100)
            .setAlpha(0); // Start invisible

        // Add bonus history button in top-right corner
        const historyButton = this.scene.add
            .text(this.scene.scale.width - 100, 50, "Bonus History", {
                fontSize: "18px",
                color: "#ffffff",
                backgroundColor: "#4444aa",
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(100)
            .setAlpha(0); // Start invisible

        historyButton.on("pointerdown", () => {
            this.showBonusHistoryModal();
        });
        historyButton.on("pointerover", () => {
            historyButton.setBackgroundColor("#6666cc");
            this.scene.input.setDefaultCursor("pointer");
        });
        historyButton.on("pointerout", () => {
            historyButton.setBackgroundColor("#4444aa");
            this.scene.input.setDefaultCursor("default");
        });

        // Add player stats button next to bonus history
        const playerStatsButton = this.scene.add
            .text(this.scene.scale.width - 100, 90, "Player Stats", {
                fontSize: "18px",
                color: "#ffffff",
                backgroundColor: "#44aa44",
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(100)
            .setAlpha(0); // Start invisible

        playerStatsButton.on("pointerdown", () => {
            this.showPlayerStatsModal();
        });
        playerStatsButton.on("pointerover", () => {
            playerStatsButton.setBackgroundColor("#66cc66");
            this.scene.input.setDefaultCursor("pointer");
        });
        playerStatsButton.on("pointerout", () => {
            playerStatsButton.setBackgroundColor("#44aa44");
            this.scene.input.setDefaultCursor("default");
        });

        // Get 3 random bonuses
        const bonuses = getRandomBonuses(3, progress.getAppliedBonuses());
        const bonusContainers: Phaser.GameObjects.Container[] = [];

        // Create bonus cards
        bonuses.forEach((bonus, index) => {
            const x = this.scene.scale.width / 2 + (index - 1) * 250;
            const y = this.scene.scale.height / 2 + 50;

            const container = this.scene.add.container(x, y);
            container.setDepth(100);
            container.setAlpha(0);

            // Card background with medieval style
            const cardBg = this.scene.add.graphics();
            cardBg.fillStyle(0x3e2723, 0.95); // Dark brown
            cardBg.fillRoundedRect(-100, -150, 200, 300, 15);

            // Bronze border
            cardBg.lineStyle(3, 0x8b7355, 0.9);
            cardBg.strokeRoundedRect(-100, -150, 200, 300, 15);

            // Gold inner border
            cardBg.lineStyle(1, 0xd4af37, 0.7);
            cardBg.strokeRoundedRect(-97, -147, 194, 294, 13);

            // Hover highlight (initially hidden)
            const hoverBg = this.scene.add.graphics();
            hoverBg.fillStyle(0x4a332a, 0.95); // Lighter brown
            hoverBg.fillRoundedRect(-100, -150, 200, 300, 15);
            hoverBg.lineStyle(3, 0xd4af37, 1); // Gold border
            hoverBg.strokeRoundedRect(-100, -150, 200, 300, 15);
            hoverBg.lineStyle(1, 0xffd700, 0.8); // Bright gold inner
            hoverBg.strokeRoundedRect(-97, -147, 194, 294, 13);
            hoverBg.setVisible(false);

            // Icon display
            let iconDisplay: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
            if (bonus.icon.startsWith("icon_")) {
                iconDisplay = this.scene.add.image(0, -100, bonus.icon);
                iconDisplay.setDisplaySize(48, 48);
            } else {
                iconDisplay = this.scene.add
                    .text(0, -100, bonus.icon, {
                        fontSize: "48px",
                    })
                    .setOrigin(0.5);
            }

            // Bonus name
            const name = this.scene.add
                .text(0, -50, bonus.name, {
                    fontSize: "20px",
                    color: "#d4af37",
                    fontStyle: "bold",
                    fontFamily: "serif",
                    align: "center",
                    wordWrap: { width: 170 },
                })
                .setOrigin(0.5);

            // Bonus description
            const desc = this.scene.add
                .text(0, 20, bonus.description, {
                    fontSize: "16px",
                    color: "#f5deb3",
                    fontFamily: "serif",
                    align: "center",
                    wordWrap: { width: 170 },
                    lineSpacing: 4,
                })
                .setOrigin(0.5);

            // Add "Click to Select" hint
            const selectHint = this.scene.add
                .text(0, 120, "Click to Select", {
                    fontSize: "14px",
                    color: "#888888",
                    fontStyle: "italic",
                    fontFamily: "serif",
                })
                .setOrigin(0.5);

            // Create invisible hit area
            const hitArea = this.scene.add.rectangle(
                0,
                0,
                200,
                300,
                0x000000,
                0
            );
            hitArea.setInteractive();

            container.add([
                cardBg,
                hoverBg,
                iconDisplay,
                name,
                desc,
                selectHint,
                hitArea,
            ]);

            // Hover effects using the hit area
            hitArea.on("pointerover", () => {
                cardBg.setVisible(false);
                hoverBg.setVisible(true);
                container.setScale(1.05);
                selectHint.setColor("#d4af37");
                this.scene.input.setDefaultCursor("pointer");
            });

            hitArea.on("pointerout", () => {
                cardBg.setVisible(true);
                hoverBg.setVisible(false);
                container.setScale(1);
                selectHint.setColor("#888888");
                this.scene.input.setDefaultCursor("default");
            });

            hitArea.on("pointerdown", () => {
                // Visual feedback on click
                container.setScale(0.95);

                // Apply the bonus and restart
                this.scene.time.delayedCall(100, () => {
                    progress.addBonus(bonus.id);

                    // Clean up
                    bonusContainers.forEach((c) => c.destroy());
                    victoryText.destroy();
                    instructionText.destroy();
                    bannerBg.destroy();
                    overlay.destroy();
                    historyButton.destroy();
                    playerStatsButton.destroy();
                    this.bonusSelectionActive = false;
                    this.scene.input.setDefaultCursor("default");

                    onRestart();
                });
            });

            bonusContainers.push(container);
        });

        // Add entrance animation for bonus cards
        bonusContainers.forEach((container, index) => {
            container.setY(container.y + 50);
            this.scene.tweens.add({
                targets: container,
                y: container.y - 50,
                alpha: 1,
                duration: 600,
                delay: 300 + index * 100,
                ease: "Power3.easeOut",
            });
        });

        // Add reroll button if player has gamblers_luck bonus and hasn't used it yet
        let rerollButton: Phaser.GameObjects.Container | undefined;
        if (
            progress.getAppliedBonuses().includes("gamblers_luck") &&
            !this.rerollUsedThisVictory
        ) {
            const rerollButtonY = this.scene.scale.height / 2 + 250;

            // Create reroll button with medieval style
            rerollButton = this.createMedievalButton(
                this.scene.scale.width / 2,
                rerollButtonY,
                "🎲 Reroll Bonuses",
                "#6b4423", // Dark brown
                "#8b5a2b", // Lighter brown on hover
                () => {
                    // Mark reroll as used
                    this.rerollUsedThisVictory = true;

                    // Destroy current bonus cards
                    bonusContainers.forEach((c) => c.destroy());
                    bonusContainers.length = 0;

                    // Destroy the reroll button
                    if (rerollButton) {
                        rerollButton.destroy();
                        rerollButton = undefined;
                    }

                    // Get new bonuses
                    const newBonuses = getRandomBonuses(
                        3,
                        progress.getAppliedBonuses()
                    );

                    // Recreate bonus cards
                    newBonuses.forEach((bonus, index) => {
                        const x =
                            this.scene.scale.width / 2 + (index - 1) * 250;
                        const y = this.scene.scale.height / 2 + 50;

                        const container = this.scene.add.container(x, y);
                        container.setDepth(100);
                        container.setAlpha(0);

                        // Card background with medieval style
                        const cardBg = this.scene.add.graphics();
                        cardBg.fillStyle(0x3e2723, 0.95); // Dark brown
                        cardBg.fillRoundedRect(-100, -150, 200, 300, 15);

                        // Bronze border
                        cardBg.lineStyle(3, 0x8b7355, 0.9);
                        cardBg.strokeRoundedRect(-100, -150, 200, 300, 15);

                        // Gold inner border
                        cardBg.lineStyle(1, 0xd4af37, 0.7);
                        cardBg.strokeRoundedRect(-97, -147, 194, 294, 13);

                        // Hover highlight (initially hidden)
                        const hoverBg = this.scene.add.graphics();
                        hoverBg.fillStyle(0x4a332a, 0.95); // Lighter brown
                        hoverBg.fillRoundedRect(-100, -150, 200, 300, 15);
                        hoverBg.lineStyle(3, 0xd4af37, 1); // Gold border
                        hoverBg.strokeRoundedRect(-100, -150, 200, 300, 15);
                        hoverBg.lineStyle(1, 0xffd700, 0.8); // Bright gold inner
                        hoverBg.strokeRoundedRect(-97, -147, 194, 294, 13);
                        hoverBg.setVisible(false);

                        // Icon display
                        let iconDisplay:
                            | Phaser.GameObjects.Image
                            | Phaser.GameObjects.Text;
                        if (bonus.icon.startsWith("icon_")) {
                            iconDisplay = this.scene.add.image(
                                0,
                                -100,
                                bonus.icon
                            );
                            iconDisplay.setDisplaySize(48, 48);
                        } else {
                            iconDisplay = this.scene.add
                                .text(0, -100, bonus.icon, {
                                    fontSize: "48px",
                                })
                                .setOrigin(0.5);
                        }

                        // Bonus name
                        const name = this.scene.add
                            .text(0, -50, bonus.name, {
                                fontSize: "20px",
                                color: "#d4af37",
                                fontStyle: "bold",
                                fontFamily: "serif",
                                align: "center",
                                wordWrap: { width: 170 },
                            })
                            .setOrigin(0.5);

                        // Bonus description
                        const desc = this.scene.add
                            .text(0, 20, bonus.description, {
                                fontSize: "16px",
                                color: "#f5deb3",
                                fontFamily: "serif",
                                align: "center",
                                wordWrap: { width: 170 },
                                lineSpacing: 4,
                            })
                            .setOrigin(0.5);

                        // Add "Click to Select" hint
                        const selectHint = this.scene.add
                            .text(0, 120, "Click to Select", {
                                fontSize: "14px",
                                color: "#888888",
                                fontStyle: "italic",
                                fontFamily: "serif",
                            })
                            .setOrigin(0.5);

                        // Create invisible hit area
                        const hitArea = this.scene.add.rectangle(
                            0,
                            0,
                            200,
                            300,
                            0x000000,
                            0
                        );
                        hitArea.setInteractive();

                        container.add([
                            cardBg,
                            hoverBg,
                            iconDisplay,
                            name,
                            desc,
                            selectHint,
                            hitArea,
                        ]);

                        // Hover effects using the hit area
                        hitArea.on("pointerover", () => {
                            cardBg.setVisible(false);
                            hoverBg.setVisible(true);
                            container.setScale(1.05);
                            selectHint.setColor("#d4af37");
                            this.scene.input.setDefaultCursor("pointer");
                        });

                        hitArea.on("pointerout", () => {
                            cardBg.setVisible(true);
                            hoverBg.setVisible(false);
                            container.setScale(1);
                            selectHint.setColor("#888888");
                            this.scene.input.setDefaultCursor("default");
                        });

                        hitArea.on("pointerdown", () => {
                            // Visual feedback on click
                            container.setScale(0.95);

                            // Apply the bonus and restart
                            this.scene.time.delayedCall(100, () => {
                                progress.addBonus(bonus.id);

                                // Clean up
                                bonusContainers.forEach((c) => c.destroy());
                                victoryText.destroy();
                                instructionText.destroy();
                                bannerBg.destroy();
                                overlay.destroy();
                                historyButton.destroy();
                                playerStatsButton.destroy();
                                this.bonusSelectionActive = false;
                                this.scene.input.setDefaultCursor("default");

                                onRestart();
                            });
                        });

                        bonusContainers.push(container);
                    });

                    // Animate new cards
                    bonusContainers.forEach((container, index) => {
                        container.setY(container.y + 50);
                        this.scene.tweens.add({
                            targets: container,
                            y: container.y - 50,
                            alpha: 1,
                            duration: 600,
                            delay: index * 100,
                            ease: "Power3.easeOut",
                        });
                    });
                }
            );

            rerollButton.setDepth(100);
            rerollButton.setAlpha(0);

            // Animate reroll button entrance
            this.scene.tweens.add({
                targets: rerollButton,
                alpha: 1,
                duration: 300,
                delay: 600,
                ease: "Power2.easeOut",
            });
        }

        // Fade-in for other elements
        this.scene.tweens.add({
            targets: [
                bannerBg,
                victoryText,
                instructionText,
                historyButton,
                playerStatsButton,
            ],
            alpha: 1,
            duration: 300,
            ease: "Power2.easeOut",
        });
    }
}

