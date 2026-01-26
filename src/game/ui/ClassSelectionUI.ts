/**
 * ClassSelectionUI - Handles the class selection screen.
 *
 * This is a Phaser-dependent UI component that renders:
 * - Full-screen class selection
 * - Class cards with portrait, stats, and spells
 * - Click to select and start game
 */

import { Scene } from "phaser";
import { ClassDefinition, PlayerClass } from "../core/types";
import { PLAYER_CLASSES } from "../data/classes";

// =============================================================================
// Types
// =============================================================================

export interface ClassSelectionCallbacks {
    onClassSelected: (playerClass: PlayerClass) => void;
}

// =============================================================================
// ClassSelectionUI Class
// =============================================================================

export class ClassSelectionUI {
    private scene: Scene;
    private container: Phaser.GameObjects.Container;
    private classCards: Phaser.GameObjects.Container[] = [];
    private callbacks?: ClassSelectionCallbacks;
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
     * Shows the class selection screen.
     */
    public show(callbacks: ClassSelectionCallbacks): void {
        this.callbacks = callbacks;
        this.isActive = true;
        this.container.setVisible(true);
        this.container.removeAll(true);
        this.classCards = [];

        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        // Full screen overlay with medieval theme
        const overlay = this.scene.add.graphics();
        overlay.fillGradientStyle(0x2d1b0e, 0x2d1b0e, 0x4a3019, 0x6b4423, 1);
        overlay.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
        this.container.add(overlay);

        // Title banner
        this.createBanner(centerX);

        // Create class cards
        PLAYER_CLASSES.forEach((classDef, index) => {
            const x = centerX + (index - 1) * 320;
            const y = centerY + 80;
            const card = this.createClassCard(x, y, classDef);
            this.classCards.push(card);
            this.container.add(card);
        });

        // Animate entrance
        this.animateEntrance();
    }

    /**
     * Hides the class selection screen.
     */
    public hide(): void {
        this.isActive = false;
        this.container.setVisible(false);
        this.container.removeAll(true);
        this.classCards = [];
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
        bannerBg.fillRoundedRect(centerX - 400, 30, 800, 140, 20);
        bannerBg.lineStyle(4, 0x8b7355, 0.9);
        bannerBg.strokeRoundedRect(centerX - 400, 30, 800, 140, 20);
        bannerBg.lineStyle(2, 0xd4af37, 0.7);
        bannerBg.strokeRoundedRect(centerX - 397, 33, 794, 134, 18);
        this.container.add(bannerBg);

        // Title text
        const titleText = this.scene.add
            .text(centerX, 70, "CHOOSE YOUR CLASS", {
                fontSize: "48px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#654321",
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setAlpha(0);
        this.container.add(titleText);

        // Subtitle
        const subtitleText = this.scene.add
            .text(
                centerX,
                130,
                "Each class has unique abilities and playstyle",
                {
                    fontSize: "24px",
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
            targets: [titleText, subtitleText],
            alpha: 1,
            duration: 500,
            ease: "Power2.easeOut",
        });
    }

    private createClassCard(
        x: number,
        y: number,
        classDef: ClassDefinition,
    ): Phaser.GameObjects.Container {
        const card = this.scene.add.container(x, y);
        card.setAlpha(0);

        const cardWidth = 280;
        const cardHeight = 480;

        // Card background
        const cardBg = this.scene.add.graphics();
        cardBg.fillStyle(0x3e2723, 0.95);
        cardBg.fillRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            15,
        );
        cardBg.lineStyle(3, 0x8b7355, 0.9);
        cardBg.strokeRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            15,
        );
        cardBg.lineStyle(1, 0xd4af37, 0.7);
        cardBg.strokeRoundedRect(
            -cardWidth / 2 + 3,
            -cardHeight / 2 + 3,
            cardWidth - 6,
            cardHeight - 6,
            13,
        );

        // Hover background
        const hoverBg = this.scene.add.graphics();
        hoverBg.fillStyle(0x4a332a, 0.95);
        hoverBg.fillRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            15,
        );
        hoverBg.lineStyle(3, 0xd4af37, 1);
        hoverBg.strokeRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            15,
        );
        hoverBg.lineStyle(1, 0xffd700, 0.8);
        hoverBg.strokeRoundedRect(
            -cardWidth / 2 + 3,
            -cardHeight / 2 + 3,
            cardWidth - 6,
            cardHeight - 6,
            13,
        );
        hoverBg.setVisible(false);

        // Class portrait (sprite)
        const portrait = this.scene.add.image(0, -160, classDef.spriteKey);
        portrait.setDisplaySize(120, 120);

        // Class name
        const nameText = this.scene.add
            .text(0, -80, classDef.name.toUpperCase(), {
                fontSize: "28px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#654321",
                strokeThickness: 2,
            })
            .setOrigin(0.5);

        // Class description
        const descText = this.scene.add
            .text(0, -10, classDef.description, {
                fontSize: "14px",
                color: "#f5deb3",
                fontFamily: "serif",
                align: "center",
                wordWrap: { width: cardWidth - 30 },
                lineSpacing: 4,
            })
            .setOrigin(0.5);

        // Stats section
        const statsY = 90;
        const statsTitle = this.scene.add
            .text(0, statsY, "~ Stats ~", {
                fontSize: "16px",
                color: "#d4af37",
                fontFamily: "serif",
                fontStyle: "italic",
            })
            .setOrigin(0.5);

        const stats = classDef.baseStats;
        const statsText = this.scene.add
            .text(
                0,
                statsY + 25,
                `HP: ${stats.maxHealth}  Force: ${stats.force}  Dex: ${stats.dexterity}\nInt: ${stats.intelligence}  Armor: ${stats.armor}  MP: ${stats.maxMovementPoints}`,
                {
                    fontSize: "12px",
                    color: "#c0c0c0",
                    fontFamily: "serif",
                    align: "center",
                    lineSpacing: 4,
                },
            )
            .setOrigin(0.5);

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

        card.add([
            cardBg,
            hoverBg,
            portrait,
            nameText,
            descText,
            statsTitle,
            statsText,
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
                if (this.callbacks?.onClassSelected) {
                    this.callbacks.onClassSelected(classDef.id);
                }
            });
        });

        return card;
    }

    // =========================================================================
    // Animations
    // =========================================================================

    private animateEntrance(): void {
        // Animate class cards
        this.classCards.forEach((card, index) => {
            card.setY(card.y + 50);
            this.scene.tweens.add({
                targets: card,
                y: card.y - 50,
                alpha: 1,
                duration: 600,
                delay: 200 + index * 150,
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

