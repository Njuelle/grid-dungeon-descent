/**
 * BonusSelectionUI - Handles the victory bonus selection screen.
 *
 * This is a Phaser-dependent UI component that renders:
 * - Victory overlay
 * - Bonus cards for selection
 * - Reroll button (if applicable)
 */

import { Scene } from "phaser";
import { BonusDefinition } from "../core/types";

// =============================================================================
// Types
// =============================================================================

export interface BonusSelectionCallbacks {
    onBonusSelected: (bonus: BonusDefinition) => void;
    onReroll?: () => BonusDefinition[];
}

// =============================================================================
// BonusSelectionUI Class
// =============================================================================

export class BonusSelectionUI {
    private scene: Scene;
    private container: Phaser.GameObjects.Container;
    private bonusCards: Phaser.GameObjects.Container[] = [];
    private rerollButton?: Phaser.GameObjects.Container;
    private callbacks?: BonusSelectionCallbacks;
    private isActive: boolean = false;

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
     * Shows the bonus selection screen with given bonuses.
     */
    public show(
        bonuses: BonusDefinition[],
        callbacks: BonusSelectionCallbacks,
        canReroll: boolean = false,
    ): void {
        this.callbacks = callbacks;
        this.isActive = true;
        this.container.setVisible(true);
        this.container.removeAll(true);
        this.bonusCards = [];

        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        // Full screen overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x2a1d16, 1);
        overlay.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
        this.container.add(overlay);

        // Victory banner
        this.createBanner(centerX);

        // Instruction text
        const instructionText = this.scene.add
            .text(centerX, 200, "Choose your reward:", {
                fontSize: "28px",
                color: "#f5deb3",
                fontStyle: "bold",
                fontFamily: "serif",
            })
            .setOrigin(0.5)
            .setAlpha(0);
        this.container.add(instructionText);

        // Create bonus cards
        bonuses.forEach((bonus, index) => {
            const x = centerX + (index - 1) * 250;
            const y = centerY + 50;
            const card = this.createBonusCard(x, y, bonus);
            this.bonusCards.push(card);
            this.container.add(card);
        });

        // Add reroll button if applicable
        if (canReroll) {
            this.createRerollButton(centerX, centerY + 270, bonuses);
        }

        // Animate entrance
        this.animateEntrance(instructionText);
    }

    /**
     * Hides the bonus selection screen.
     */
    public hide(): void {
        this.isActive = false;
        this.container.setVisible(false);
        this.container.removeAll(true);
        this.bonusCards = [];
        this.rerollButton = undefined;
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
            .text(centerX, 110, "VICTORY!", {
                fontSize: "72px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#654321",
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setAlpha(0);
        this.container.add(victoryText);

        // Animate victory text
        this.scene.tweens.add({
            targets: victoryText,
            alpha: 1,
            duration: 500,
            ease: "Power2.easeOut",
        });
    }

    private createBonusCard(
        x: number,
        y: number,
        bonus: BonusDefinition,
    ): Phaser.GameObjects.Container {
        const card = this.scene.add.container(x, y);
        card.setAlpha(0);

        // Card background
        const cardBg = this.scene.add.graphics();
        cardBg.fillStyle(0x3e2723, 0.95);
        cardBg.fillRoundedRect(-100, -150, 200, 300, 15);
        cardBg.lineStyle(3, 0x8b7355, 0.9);
        cardBg.strokeRoundedRect(-100, -150, 200, 300, 15);
        cardBg.lineStyle(1, 0xd4af37, 0.7);
        cardBg.strokeRoundedRect(-97, -147, 194, 294, 13);

        // Hover background
        const hoverBg = this.scene.add.graphics();
        hoverBg.fillStyle(0x4a332a, 0.95);
        hoverBg.fillRoundedRect(-100, -150, 200, 300, 15);
        hoverBg.lineStyle(3, 0xd4af37, 1);
        hoverBg.strokeRoundedRect(-100, -150, 200, 300, 15);
        hoverBg.lineStyle(1, 0xffd700, 0.8);
        hoverBg.strokeRoundedRect(-97, -147, 194, 294, 13);
        hoverBg.setVisible(false);

        // Icon
        let iconDisplay: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
        if (bonus.icon.startsWith("icon_")) {
            iconDisplay = this.scene.add.image(0, -100, bonus.icon);
            iconDisplay.setOrigin(0.5);
            iconDisplay.setDisplaySize(64, 64);
        } else {
            iconDisplay = this.scene.add
                .text(0, -100, bonus.icon, { fontSize: "64px" })
                .setOrigin(0.5);
        }

        // Name
        const nameText = this.scene.add
            .text(0, -50, bonus.name, {
                fontSize: "20px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
                align: "center",
                wordWrap: { width: 170 },
            })
            .setOrigin(0.5);

        // Description
        const descText = this.scene.add
            .text(0, 20, bonus.description, {
                fontSize: "16px",
                color: "#f5deb3",
                fontFamily: "serif",
                align: "center",
                wordWrap: { width: 170 },
                lineSpacing: 4,
            })
            .setOrigin(0.5);

        // Select hint
        const selectHint = this.scene.add
            .text(0, 120, "Click to Select", {
                fontSize: "14px",
                color: "#888888",
                fontStyle: "italic",
                fontFamily: "serif",
            })
            .setOrigin(0.5);

        // Hit area
        const hitArea = this.scene.add.rectangle(0, 0, 200, 300, 0x000000, 0);
        hitArea.setInteractive();

        card.add([
            cardBg,
            hoverBg,
            iconDisplay,
            nameText,
            descText,
            selectHint,
            hitArea,
        ]);

        // Events
        hitArea.on("pointerover", () => {
            cardBg.setVisible(false);
            hoverBg.setVisible(true);
            card.setScale(1.05);
            selectHint.setColor("#d4af37");
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
                if (this.callbacks?.onBonusSelected) {
                    this.callbacks.onBonusSelected(bonus);
                }
                this.hide();
            });
        });

        return card;
    }

    private createRerollButton(
        x: number,
        y: number,
        _currentBonuses: BonusDefinition[],
    ): void {
        this.rerollButton = this.scene.add.container(x, y);

        const buttonWidth = 320;
        const buttonHeight = 60;

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x6b4423);
        bg.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            8,
        );
        bg.lineStyle(4, 0x8b7355, 1);
        bg.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            8,
        );
        bg.lineStyle(2, 0xd4af37, 0.6);
        bg.strokeRoundedRect(
            -buttonWidth / 2 + 3,
            -buttonHeight / 2 + 3,
            buttonWidth - 6,
            buttonHeight - 6,
            6,
        );

        const text = this.scene.add
            .text(0, 0, "🎲 Reroll Bonuses", {
                fontFamily: "serif",
                fontSize: "24px",
                color: "#f5deb3",
                align: "center",
                fontStyle: "bold",
                stroke: "#654321",
                strokeThickness: 2,
            })
            .setOrigin(0.5);

        this.rerollButton.add([bg, text]);
        this.rerollButton.setSize(buttonWidth, buttonHeight);
        this.rerollButton.setInteractive();
        this.rerollButton.setAlpha(0);
        this.container.add(this.rerollButton);

        // Events
        this.rerollButton.on("pointerover", () => {
            bg.clear();
            bg.fillStyle(0x8b5a2b);
            bg.fillRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8,
            );
            bg.lineStyle(4, 0xd4af37, 1);
            bg.strokeRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8,
            );
            bg.lineStyle(2, 0xffd700, 0.8);
            bg.strokeRoundedRect(
                -buttonWidth / 2 + 3,
                -buttonHeight / 2 + 3,
                buttonWidth - 6,
                buttonHeight - 6,
                6,
            );
            this.rerollButton!.setScale(1.01);
            text.setColor("#ffffff");
            this.scene.input.setDefaultCursor("pointer");
        });

        this.rerollButton.on("pointerout", () => {
            bg.clear();
            bg.fillStyle(0x6b4423);
            bg.fillRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8,
            );
            bg.lineStyle(4, 0x8b7355, 1);
            bg.strokeRoundedRect(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                8,
            );
            bg.lineStyle(2, 0xd4af37, 0.6);
            bg.strokeRoundedRect(
                -buttonWidth / 2 + 3,
                -buttonHeight / 2 + 3,
                buttonWidth - 6,
                buttonHeight - 6,
                6,
            );
            this.rerollButton!.setScale(1);
            text.setColor("#f5deb3");
            this.scene.input.setDefaultCursor("default");
        });

        this.rerollButton.on("pointerdown", () => {
            if (this.callbacks?.onReroll) {
                const newBonuses = this.callbacks.onReroll();
                this.refreshBonusCards(newBonuses);

                // Hide reroll button after use
                if (this.rerollButton) {
                    this.rerollButton.destroy();
                    this.rerollButton = undefined;
                }
            }
        });

        // Animate entrance
        this.scene.tweens.add({
            targets: this.rerollButton,
            alpha: 1,
            duration: 300,
            delay: 600,
            ease: "Power2.easeOut",
        });
    }

    private refreshBonusCards(newBonuses: BonusDefinition[]): void {
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        // Remove old cards
        this.bonusCards.forEach((card) => card.destroy());
        this.bonusCards = [];

        // Create new cards
        newBonuses.forEach((bonus, index) => {
            const x = centerX + (index - 1) * 250;
            const y = centerY + 50;
            const card = this.createBonusCard(x, y, bonus);
            this.bonusCards.push(card);
            this.container.add(card);

            // Animate new cards
            card.setY(y + 50);
            this.scene.tweens.add({
                targets: card,
                y: y,
                alpha: 1,
                duration: 600,
                delay: index * 100,
                ease: "Power3.easeOut",
            });
        });
    }

    // =========================================================================
    // Animations
    // =========================================================================

    private animateEntrance(instructionText: Phaser.GameObjects.Text): void {
        // Animate instruction text
        this.scene.tweens.add({
            targets: instructionText,
            alpha: 1,
            duration: 300,
            ease: "Power2.easeOut",
        });

        // Animate bonus cards
        this.bonusCards.forEach((card, index) => {
            card.setY(card.y + 50);
            this.scene.tweens.add({
                targets: card,
                y: card.y - 50,
                alpha: 1,
                duration: 600,
                delay: 300 + index * 100,
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

