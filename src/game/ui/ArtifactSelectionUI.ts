/**
 * ArtifactSelectionUI - Handles the artifact selection screen after victories.
 *
 * This is a Phaser-dependent UI component that renders:
 * - Victory overlay
 * - 2 artifact cards for selection
 * - Shows artifact info and the spell it grants
 * - Swap UI when inventory is full
 */

import { Scene } from "phaser";
import { ArtifactDefinition } from "../core/types";
import { artifactSystem } from "../systems/ArtifactSystem";
import { GameProgress } from "../classes/GameProgress";
import { getSpellById } from "../data/spells/index";
import { CurseSystem } from "../systems/CurseSystem";

// =============================================================================
// Types
// =============================================================================

export interface ArtifactSelectionCallbacks {
    onArtifactSelected: (artifact: ArtifactDefinition) => void;
    onSkip?: () => void;
}

// =============================================================================
// ArtifactSelectionUI Class
// =============================================================================

export class ArtifactSelectionUI {
    private scene: Scene;
    private container: Phaser.GameObjects.Container;
    private artifactCards: Phaser.GameObjects.Container[] = [];
    private swapContainer?: Phaser.GameObjects.Container;
    private callbacks?: ArtifactSelectionCallbacks;
    private isActive: boolean = false;
    private pendingArtifact?: ArtifactDefinition;

    constructor(scene: Scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        this.container.setDepth(99);
        this.container.setVisible(false);
    }

    // =========================================================================
    // Show/Hide
    // =========================================================================

    /**
     * Shows the artifact selection screen with 2 random artifacts.
     */
    public show(callbacks: ArtifactSelectionCallbacks): void {
        this.callbacks = callbacks;
        this.isActive = true;
        this.container.setVisible(true);
        this.container.removeAll(true);
        this.artifactCards = [];

        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        // Full screen overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x2a1d16, 1);
        overlay.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
        this.container.add(overlay);

        // Victory banner
        this.createBanner(centerX);

        // Get random artifacts
        const artifacts = artifactSystem.getArtifactChoices();

        if (artifacts.length === 0) {
            // No artifacts available, show message and skip button
            this.showNoArtifactsMessage(centerX, centerY);
            return;
        }

        // Instruction text
        const instructionText = this.scene.add
            .text(
                centerX,
                200,
                "Choose an artifact to add to your collection:",
                {
                    fontSize: "28px",
                    color: "#f5deb3",
                    fontStyle: "bold",
                    fontFamily: "serif",
                },
            )
            .setOrigin(0.5)
            .setAlpha(0);
        this.container.add(instructionText);

        // Show current inventory status
        const progress = GameProgress.getInstance();
        const equippedCount = progress.getEquippedArtifacts().length;
        const maxArtifacts = progress.getMaxArtifacts();

        const inventoryText = this.scene.add
            .text(centerX, 240, `Artifacts: ${equippedCount}/${maxArtifacts}`, {
                fontSize: "20px",
                color: equippedCount >= maxArtifacts ? "#ff6b6b" : "#90ee90",
                fontFamily: "serif",
            })
            .setOrigin(0.5)
            .setAlpha(0);
        this.container.add(inventoryText);

        // Create artifact cards
        artifacts.forEach((artifact, index) => {
            const x = centerX + (index === 0 ? -180 : 180);
            const y = centerY + 80;
            const card = this.createArtifactCard(x, y, artifact);
            this.artifactCards.push(card);
            this.container.add(card);
        });

        // Animate entrance
        this.animateEntrance(instructionText, inventoryText);
    }

    /**
     * Hides the artifact selection screen.
     */
    public hide(): void {
        this.isActive = false;
        this.container.setVisible(false);
        this.container.removeAll(true);
        this.artifactCards = [];
        this.swapContainer = undefined;
        this.pendingArtifact = undefined;
    }

    /**
     * Checks if the selection screen is active.
     */
    public isShowing(): boolean {
        return this.isActive;
    }

    // =========================================================================
    // UI Creation
    // =========================================================================

    private createBanner(centerX: number): void {
        // Banner background
        const bannerBg = this.scene.add.graphics();
        bannerBg.fillStyle(0x3e2723, 0.95);
        bannerBg.fillRoundedRect(centerX - 400, 50, 800, 120, 20);
        bannerBg.lineStyle(4, 0x8b7355, 0.9);
        bannerBg.strokeRoundedRect(centerX - 400, 50, 800, 120, 20);
        this.container.add(bannerBg);

        // Victory text
        const victoryText = this.scene.add
            .text(centerX, 85, "ARTIFACT FOUND!", {
                fontSize: "52px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#654321",
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setAlpha(0);
        this.container.add(victoryText);

        // Subtitle
        const subtitleText = this.scene.add
            .text(
                centerX,
                140,
                "Every 5 victories grants you a powerful artifact",
                {
                    fontSize: "20px",
                    color: "#f5deb3",
                    fontFamily: "serif",
                    fontStyle: "italic",
                },
            )
            .setOrigin(0.5)
            .setAlpha(0);
        this.container.add(subtitleText);

        // Animate
        this.scene.tweens.add({
            targets: [victoryText, subtitleText],
            alpha: 1,
            duration: 500,
            ease: "Power2.easeOut",
        });
    }

    private createArtifactCard(
        x: number,
        y: number,
        artifact: ArtifactDefinition,
    ): Phaser.GameObjects.Container {
        const card = this.scene.add.container(x, y);
        card.setAlpha(0);

        const cardWidth = 300;
        const cardHeight = 450;
        const isCursed = CurseSystem.isCursedArtifact(artifact);

        // Card background - purple tint for cursed artifacts
        const cardBg = this.scene.add.graphics();
        cardBg.fillStyle(isCursed ? 0x2d1f3d : 0x3e2723, 0.95);
        cardBg.fillRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            15,
        );
        cardBg.lineStyle(3, isCursed ? 0x8b008b : 0x8b7355, 0.9);
        cardBg.strokeRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            15,
        );
        cardBg.lineStyle(1, isCursed ? 0x9932cc : 0xd4af37, 0.7);
        cardBg.strokeRoundedRect(
            -cardWidth / 2 + 3,
            -cardHeight / 2 + 3,
            cardWidth - 6,
            cardHeight - 6,
            13,
        );

        // Hover background - purple tint for cursed
        const hoverBg = this.scene.add.graphics();
        hoverBg.fillStyle(isCursed ? 0x3d2a4d : 0x4a332a, 0.95);
        hoverBg.fillRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            15,
        );
        hoverBg.lineStyle(3, isCursed ? 0x9932cc : 0xd4af37, 1);
        hoverBg.strokeRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            15,
        );
        hoverBg.lineStyle(1, isCursed ? 0xda70d6 : 0xffd700, 0.8);
        hoverBg.strokeRoundedRect(
            -cardWidth / 2 + 3,
            -cardHeight / 2 + 3,
            cardWidth - 6,
            cardHeight - 6,
            13,
        );
        hoverBg.setVisible(false);

        // Cursed label with skull (only for cursed artifacts)
        let cursedLabel: Phaser.GameObjects.Text | null = null;
        if (isCursed) {
            cursedLabel = this.scene.add
                .text(0, -cardHeight / 2 + 20, "CURSED", {
                    fontSize: "16px",
                    color: "#ff4444",
                    fontStyle: "bold",
                    fontFamily: "serif",
                    stroke: "#000000",
                    strokeThickness: 2,
                })
                .setOrigin(0.5);
        }

        // Artifact icon
        let iconDisplay: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
        if (artifact.icon.startsWith("icon_")) {
            iconDisplay = this.scene.add.image(0, -130, artifact.icon);
            iconDisplay.setOrigin(0.5);
            iconDisplay.setDisplaySize(64, 64);
        } else {
            iconDisplay = this.scene.add
                .text(0, -130, artifact.icon, { fontSize: "64px" })
                .setOrigin(0.5);
        }

        // Add purple tint to icon if cursed
        if (isCursed && iconDisplay instanceof Phaser.GameObjects.Image) {
            iconDisplay.setTint(0xcc88ff);
        }

        // Artifact name - purple for cursed
        const nameText = this.scene.add
            .text(0, -60, artifact.name, {
                fontSize: "22px",
                color: isCursed ? "#cc88ff" : "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
                align: "center",
                wordWrap: { width: cardWidth - 30 },
            })
            .setOrigin(0.5);

        // Artifact description
        const descText = this.scene.add
            .text(0, -15, artifact.description, {
                fontSize: "15px",
                color: "#f5deb3",
                fontFamily: "serif",
                align: "center",
                wordWrap: { width: cardWidth - 30 },
                lineSpacing: 4,
            })
            .setOrigin(0.5);

        // Granted spell section
        const spellTitle = this.scene.add
            .text(0, 35, "~ Grants Spell ~", {
                fontSize: "14px",
                color: isCursed ? "#cc88ff" : "#d4af37",
                fontFamily: "serif",
                fontStyle: "italic",
            })
            .setOrigin(0.5);

        const spell = getSpellById(artifact.grantedSpellId);

        // Spell icon as image
        let spellIconDisplay:
            | Phaser.GameObjects.Image
            | Phaser.GameObjects.Text;
        if (spell && spell.icon.startsWith("icon_")) {
            spellIconDisplay = this.scene.add.image(0, 60, spell.icon);
            spellIconDisplay.setOrigin(0.5);
            spellIconDisplay.setDisplaySize(32, 32);
        } else {
            // Fallback for emoji icons or unknown spells
            spellIconDisplay = this.scene.add
                .text(0, 60, spell?.icon || "?", { fontSize: "32px" })
                .setOrigin(0.5);
        }

        // Spell name
        const spellNameText = this.scene.add
            .text(0, 85, spell?.name || "Unknown spell", {
                fontSize: "16px",
                color: "#90ee90",
                fontFamily: "serif",
                fontStyle: "bold",
                align: "center",
            })
            .setOrigin(0.5);

        // Spell stats (AP, Range, Damage)
        let spellStatsStr = "Unknown";
        if (spell) {
            const rangeStr = spell.minRange
                ? `${spell.minRange}-${spell.range}`
                : `${spell.range}`;
            spellStatsStr = `AP: ${spell.apCost} | Range: ${rangeStr} | Dmg: ${spell.damage}`;
        }
        const spellStats = this.scene.add
            .text(0, 105, spellStatsStr, {
                fontSize: "13px",
                color: "#c0c0c0",
                fontFamily: "serif",
                align: "center",
            })
            .setOrigin(0.5);

        // Spell description
        const spellDescText = this.scene.add
            .text(0, 125, spell?.description || "", {
                fontSize: "12px",
                color: "#aaaaaa",
                fontFamily: "serif",
                align: "center",
                wordWrap: { width: cardWidth - 30 },
                lineSpacing: 2,
                fontStyle: "italic",
            })
            .setOrigin(0.5);

        // Curse description (for cursed artifacts)
        let curseText: Phaser.GameObjects.Text | null = null;
        if (isCursed && artifact.curse) {
            curseText = this.scene.add
                .text(0, 165, `⚠ CURSE: ${artifact.curse.description}`, {
                    fontSize: "13px",
                    color: "#ff6666",
                    fontFamily: "serif",
                    align: "center",
                    wordWrap: { width: cardWidth - 30 },
                    lineSpacing: 2,
                    fontStyle: "bold",
                })
                .setOrigin(0.5);
        }

        // Select hint
        const selectHint = this.scene.add
            .text(0, cardHeight / 2 - 30, "Click to Select", {
                fontSize: "14px",
                color: "#888888",
                fontStyle: "italic",
                fontFamily: "serif",
            })
            .setOrigin(0.5);

        // Hit area
        const hitArea = this.scene.add.rectangle(
            0,
            0,
            cardWidth,
            cardHeight,
            0x000000,
            0,
        );
        hitArea.setInteractive();

        // Build card contents
        const cardContents: Phaser.GameObjects.GameObject[] = [
            cardBg,
            hoverBg,
            iconDisplay,
            nameText,
            descText,
            spellTitle,
            spellIconDisplay,
            spellNameText,
            spellStats,
            spellDescText,
            selectHint,
            hitArea,
        ];

        if (cursedLabel) {
            cardContents.push(cursedLabel);
        }
        if (curseText) {
            cardContents.push(curseText);
        }

        card.add(cardContents);

        // Events
        hitArea.on("pointerover", () => {
            cardBg.setVisible(false);
            hoverBg.setVisible(true);
            card.setScale(1.05);
            selectHint.setColor(isCursed ? "#cc88ff" : "#d4af37");
            this.scene.input.setDefaultCursor("pointer");
        });

        hitArea.on("pointerout", () => {
            cardBg.setVisible(true);
            hoverBg.setVisible(false);
            card.setScale(1);
            selectHint.setColor("#888888");
            this.scene.input.setDefaultCursor("default");
        });

        hitArea.on("pointerdown", () => {
            card.setScale(0.95);
            this.scene.time.delayedCall(100, () => {
                this.handleArtifactSelection(artifact);
            });
        });

        return card;
    }

    private showNoArtifactsMessage(centerX: number, centerY: number): void {
        const messageText = this.scene.add
            .text(
                centerX,
                centerY,
                "No more artifacts available!\nYou've collected them all.",
                {
                    fontSize: "28px",
                    color: "#f5deb3",
                    fontFamily: "serif",
                    align: "center",
                    lineSpacing: 10,
                },
            )
            .setOrigin(0.5);
        this.container.add(messageText);

        // Continue button
        const continueBtn = this.createButton(
            centerX,
            centerY + 100,
            "Continue",
            () => {
                if (this.callbacks?.onSkip) {
                    this.callbacks.onSkip();
                }
                this.hide();
            },
        );
        this.container.add(continueBtn);
    }

    // =========================================================================
    // Swap UI (when inventory is full)
    // =========================================================================

    private showSwapUI(newArtifact: ArtifactDefinition): void {
        this.pendingArtifact = newArtifact;

        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        // Create swap container
        this.swapContainer = this.scene.add.container(0, 0);
        this.swapContainer.setDepth(100);

        // Solid background (not transparent)
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x2a1d16, 1);
        overlay.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
        this.swapContainer.add(overlay);

        // Title
        const titleText = this.scene.add
            .text(centerX, 100, "ARTIFACT BAG FULL!", {
                fontSize: "42px",
                color: "#ff6b6b",
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#654321",
                strokeThickness: 4,
            })
            .setOrigin(0.5);
        this.swapContainer.add(titleText);

        const subtitleText = this.scene.add
            .text(centerX, 150, "Choose an artifact to replace:", {
                fontSize: "24px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        this.swapContainer.add(subtitleText);

        // Show current artifacts
        const equippedArtifacts = artifactSystem.getEquippedArtifacts();
        equippedArtifacts.forEach((artifact, index) => {
            const x = centerX + (index - 1) * 250;
            const y = centerY;
            const card = this.createSwapCard(x, y, artifact, index);
            this.swapContainer!.add(card);
        });

        // Cancel button - keep current artifacts and continue
        const cancelBtn = this.createButton(
            centerX,
            centerY + 250,
            "Cancel (Keep Current)",
            () => {
                this.swapContainer?.destroy();
                this.swapContainer = undefined;
                this.pendingArtifact = undefined;

                // Call onSkip callback to properly close the artifact selection and continue the game
                if (this.callbacks?.onSkip) {
                    this.callbacks.onSkip();
                }
                this.hide();
            },
        );
        this.swapContainer.add(cancelBtn);

        this.container.add(this.swapContainer);
    }

    private createSwapCard(
        x: number,
        y: number,
        artifact: ArtifactDefinition,
        index: number,
    ): Phaser.GameObjects.Container {
        const card = this.scene.add.container(x, y);

        const cardWidth = 200;
        const cardHeight = 280;
        const isCursed = CurseSystem.isCursedArtifact(artifact);

        // Card background - purple tint for cursed
        const cardBg = this.scene.add.graphics();
        cardBg.fillStyle(isCursed ? 0x2d1f3d : 0x3e2723, 0.95);
        cardBg.fillRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            12,
        );
        cardBg.lineStyle(2, isCursed ? 0x8b008b : 0x8b7355, 0.9);
        cardBg.strokeRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            12,
        );

        // Hover background
        const hoverBg = this.scene.add.graphics();
        hoverBg.fillStyle(0x8b0000, 0.95);
        hoverBg.fillRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            12,
        );
        hoverBg.lineStyle(2, 0xff6b6b, 1);
        hoverBg.strokeRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            12,
        );
        hoverBg.setVisible(false);

        // Cursed label
        let cursedLabel: Phaser.GameObjects.Text | null = null;
        if (isCursed) {
            cursedLabel = this.scene.add
                .text(0, -cardHeight / 2 + 15, "CURSED", {
                    fontSize: "12px",
                    color: "#ff4444",
                    fontStyle: "bold",
                    fontFamily: "serif",
                    stroke: "#000000",
                    strokeThickness: 2,
                })
                .setOrigin(0.5);
        }

        // Icon
        let iconDisplay: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
        if (artifact.icon.startsWith("icon_")) {
            iconDisplay = this.scene.add.image(0, -70, artifact.icon);
            iconDisplay.setOrigin(0.5);
            iconDisplay.setDisplaySize(48, 48);
        } else {
            iconDisplay = this.scene.add
                .text(0, -70, artifact.icon, { fontSize: "48px" })
                .setOrigin(0.5);
        }

        // Add purple tint to icon if cursed
        if (isCursed && iconDisplay instanceof Phaser.GameObjects.Image) {
            iconDisplay.setTint(0xcc88ff);
        }

        // Name - purple for cursed
        const nameText = this.scene.add
            .text(0, -15, artifact.name, {
                fontSize: "16px",
                color: isCursed ? "#cc88ff" : "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
                align: "center",
                wordWrap: { width: cardWidth - 20 },
            })
            .setOrigin(0.5);

        // Spell info
        const spell = getSpellById(artifact.grantedSpellId);

        // Spell icon as image
        let spellIconDisplay2:
            | Phaser.GameObjects.Image
            | Phaser.GameObjects.Text;
        if (spell && spell.icon.startsWith("icon_")) {
            spellIconDisplay2 = this.scene.add.image(-40, 30, spell.icon);
            spellIconDisplay2.setOrigin(0.5);
            spellIconDisplay2.setDisplaySize(20, 20);
        } else {
            spellIconDisplay2 = this.scene.add
                .text(-40, 30, spell?.icon || "?", { fontSize: "18px" })
                .setOrigin(0.5);
        }

        const spellName = spell ? spell.name : "Unknown";
        const spellText = this.scene.add
            .text(10, 30, spellName, {
                fontSize: "14px",
                color: "#c0c0c0",
                fontFamily: "serif",
            })
            .setOrigin(0.5);

        // Curse info (small text for cursed artifacts)
        let curseText: Phaser.GameObjects.Text | null = null;
        if (isCursed && artifact.curse) {
            curseText = this.scene.add
                .text(0, 65, artifact.curse.description, {
                    fontSize: "10px",
                    color: "#ff6666",
                    fontFamily: "serif",
                    align: "center",
                    wordWrap: { width: cardWidth - 20 },
                })
                .setOrigin(0.5);
        }

        // Replace hint
        const replaceHint = this.scene.add
            .text(0, cardHeight / 2 - 25, "Click to Replace", {
                fontSize: "12px",
                color: "#ff6b6b",
                fontStyle: "italic",
                fontFamily: "serif",
            })
            .setOrigin(0.5);

        // Hit area
        const hitArea = this.scene.add.rectangle(
            0,
            0,
            cardWidth,
            cardHeight,
            0x000000,
            0,
        );
        hitArea.setInteractive();

        const cardContents: Phaser.GameObjects.GameObject[] = [
            cardBg,
            hoverBg,
            iconDisplay,
            nameText,
            spellIconDisplay2,
            spellText,
            replaceHint,
            hitArea,
        ];
        if (cursedLabel) cardContents.push(cursedLabel);
        if (curseText) cardContents.push(curseText);

        card.add(cardContents);

        // Events
        hitArea.on("pointerover", () => {
            cardBg.setVisible(false);
            hoverBg.setVisible(true);
            card.setScale(1.05);
            this.scene.input.setDefaultCursor("pointer");
        });

        hitArea.on("pointerout", () => {
            cardBg.setVisible(true);
            hoverBg.setVisible(false);
            card.setScale(1);
            this.scene.input.setDefaultCursor("default");
        });

        hitArea.on("pointerdown", () => {
            if (this.pendingArtifact) {
                // Replace this artifact with the new one
                artifactSystem.replaceArtifact(index, this.pendingArtifact.id);
                console.log(
                    `[ArtifactSelectionUI] Replaced ${artifact.name} with ${this.pendingArtifact.name}`,
                );

                if (this.callbacks?.onArtifactSelected) {
                    this.callbacks.onArtifactSelected(this.pendingArtifact);
                }
                this.hide();
            }
        });

        return card;
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private createButton(
        x: number,
        y: number,
        text: string,
        onClick: () => void,
    ): Phaser.GameObjects.Container {
        const btn = this.scene.add.container(x, y);

        const buttonWidth = 280;
        const buttonHeight = 50;

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x6b4423);
        bg.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            8,
        );
        bg.lineStyle(3, 0x8b7355, 1);
        bg.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            8,
        );

        const btnText = this.scene.add
            .text(0, 0, text, {
                fontFamily: "serif",
                fontSize: "20px",
                color: "#f5deb3",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        btn.add([bg, btnText]);
        btn.setSize(buttonWidth, buttonHeight);
        btn.setInteractive();

        btn.on("pointerover", () => {
            bg.clear();
            bg.fillStyle(0x8b5a2b);
            bg.fillRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8,
            );
            bg.lineStyle(3, 0xd4af37, 1);
            bg.strokeRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8,
            );
            btn.setScale(1.02);
            this.scene.input.setDefaultCursor("pointer");
        });

        btn.on("pointerout", () => {
            bg.clear();
            bg.fillStyle(0x6b4423);
            bg.fillRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8,
            );
            bg.lineStyle(3, 0x8b7355, 1);
            bg.strokeRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8,
            );
            btn.setScale(1);
            this.scene.input.setDefaultCursor("default");
        });

        btn.on("pointerdown", onClick);

        return btn;
    }

    private handleArtifactSelection(artifact: ArtifactDefinition): void {
        const progress = GameProgress.getInstance();

        if (progress.isArtifactInventoryFull()) {
            // Show swap UI
            this.showSwapUI(artifact);
        } else {
            // Add artifact directly
            artifactSystem.equipArtifact(artifact.id);
            console.log(`[ArtifactSelectionUI] Equipped ${artifact.name}`);

            if (this.callbacks?.onArtifactSelected) {
                this.callbacks.onArtifactSelected(artifact);
            }
            this.hide();
        }
    }

    // =========================================================================
    // Animations
    // =========================================================================

    private animateEntrance(
        instructionText: Phaser.GameObjects.Text,
        inventoryText: Phaser.GameObjects.Text,
    ): void {
        // Animate instruction text
        this.scene.tweens.add({
            targets: [instructionText, inventoryText],
            alpha: 1,
            duration: 300,
            ease: "Power2.easeOut",
        });

        // Animate artifact cards
        this.artifactCards.forEach((card, index) => {
            card.setY(card.y + 50);
            this.scene.tweens.add({
                targets: card,
                y: card.y - 50,
                alpha: 1,
                duration: 600,
                delay: 300 + index * 150,
                ease: "Power3.easeOut",
            });
        });
    }

    // =========================================================================
    // Cleanup
    // =========================================================================

    public destroy(): void {
        this.hide();
        this.container.destroy();
    }
}

