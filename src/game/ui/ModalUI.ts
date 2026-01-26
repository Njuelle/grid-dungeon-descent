/**
 * ModalUI - Generic modal system for displaying overlays.
 *
 * This is a Phaser-dependent UI component that handles:
 * - Bonus history modal
 * - Player stats modal
 * - Game over screens
 */

import { Scene } from "phaser";
import { BonusDefinition, UnitStats } from "../core/types";

// =============================================================================
// Types
// =============================================================================

export interface ModalConfig {
    title: string;
    width?: number;
    height?: number;
    onClose?: () => void;
}

// =============================================================================
// ModalUI Class
// =============================================================================

export class ModalUI {
    private scene: Scene;
    private container: Phaser.GameObjects.Container | null = null;
    private overlay: Phaser.GameObjects.Graphics | null = null;
    private onCloseCallback?: () => void;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // =========================================================================
    // Modal Management
    // =========================================================================

    /**
     * Checks if a modal is currently showing.
     */
    public isShowing(): boolean {
        return this.container !== null;
    }

    /**
     * Closes the current modal.
     */
    public close(): void {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        this.scene.input.setDefaultCursor("default");
        if (this.onCloseCallback) {
            this.onCloseCallback();
            this.onCloseCallback = undefined;
        }
    }

    // =========================================================================
    // Bonus History Modal
    // =========================================================================

    /**
     * Shows the bonus history modal.
     */
    public showBonusHistory(
        bonuses: BonusDefinition[],
        wins: number,
        _getBonusById: (id: string) => BonusDefinition | undefined,
    ): void {
        if (this.isShowing()) return;

        const modalWidth = 600;
        const itemHeight = 60;
        const maxVisibleItems = 6;
        const headerHeight = 120;
        const footerHeight = 80;
        const listPadding = 20;

        const actualItemCount = Math.max(1, bonuses.length);
        const neededListHeight = actualItemCount * itemHeight;
        const maxListHeight = maxVisibleItems * itemHeight;
        const listHeight = Math.min(neededListHeight, maxListHeight);
        const modalHeight =
            headerHeight + listHeight + footerHeight + listPadding * 2;

        this.createModalBase(modalWidth, modalHeight);

        // Title
        const title = this.scene.add
            .text(0, -modalHeight / 2 + 30, "Bonus History", {
                fontSize: "32px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#654321",
                strokeThickness: 2,
            })
            .setOrigin(0.5);
        this.container!.add(title);

        // Wins counter
        const winsText = this.scene.add
            .text(0, -modalHeight / 2 + 70, `Total Wins: ${wins}`, {
                fontSize: "24px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        this.container!.add(winsText);

        // Bonus list
        const listY = -modalHeight / 2 + headerHeight + listPadding;

        if (bonuses.length === 0) {
            const noBonusText = this.scene.add
                .text(0, listY + 30, "No bonuses acquired yet", {
                    fontSize: "20px",
                    color: "#f5deb3",
                    fontFamily: "serif",
                    fontStyle: "italic",
                })
                .setOrigin(0.5);
            this.container!.add(noBonusText);
        } else {
            let yOffset = listY;
            bonuses.forEach((bonus, _index) => {
                this.createBonusListItem(bonus, 0, yOffset, modalWidth);
                yOffset += itemHeight;
            });
        }

        // Close button
        this.createCloseButton(modalHeight);
    }

    // =========================================================================
    // Player Stats Modal
    // =========================================================================

    /**
     * Shows the player stats modal.
     */
    public showPlayerStats(stats: UnitStats, wins: number): void {
        if (this.isShowing()) return;

        const modalWidth = 500;
        const modalHeight = 650;

        this.createModalBase(modalWidth, modalHeight);

        // Title
        const title = this.scene.add
            .text(0, -modalHeight / 2 + 40, "Player Statistics", {
                fontSize: "32px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        this.container!.add(title);

        // Wins
        const winsText = this.scene.add
            .text(0, -modalHeight / 2 + 80, `Victories: ${wins}`, {
                fontSize: "20px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        this.container!.add(winsText);

        // Stats sections
        let yOffset = -modalHeight / 2 + 140;
        const lineHeight = 35;

        // Combat Stats
        yOffset = this.createStatSection(
            "Combat Statistics",
            yOffset,
            lineHeight,
            [
                `Max Health: ${stats.maxHealth}`,
                `Force: ${stats.force}`,
                `Dexterity: ${stats.dexterity}`,
                `Intelligence: ${stats.intelligence || 0}`,
            ],
        );

        // Defense Stats
        yOffset = this.createStatSection(
            "Defense Statistics",
            yOffset + 20,
            lineHeight,
            [
                `Armor: ${stats.armor}`,
                `Magic Resistance: ${stats.magicResistance || 0}`,
            ],
        );

        // Action Economy
        this.createStatSection("Action Economy", yOffset + 20, lineHeight, [
            `Max Movement Points: ${stats.maxMovementPoints}`,
            `Max Action Points: ${stats.maxActionPoints}`,
        ]);

        // Close button
        this.createCloseButton(modalHeight);
    }

    // =========================================================================
    // Defeat Screen
    // =========================================================================

    /**
     * Shows the defeat screen.
     */
    public showDefeatScreen(onRestart: () => void): void {
        if (this.isShowing()) return;

        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        // Full overlay
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x2a1d16, 1);
        this.overlay.fillRect(
            0,
            0,
            this.scene.scale.width,
            this.scene.scale.height,
        );
        this.overlay.setDepth(99);

        this.container = this.scene.add.container(centerX, centerY);
        this.container.setDepth(100);

        // Defeat banner
        const bannerBg = this.scene.add.graphics();
        bannerBg.fillStyle(0x4d1f1f, 0.95);
        bannerBg.fillRoundedRect(-400, -centerY + 50, 800, 120, 20);
        bannerBg.lineStyle(4, 0x8b2635, 0.9);
        bannerBg.strokeRoundedRect(-400, -centerY + 50, 800, 120, 20);
        this.container.add(bannerBg);

        // Defeat text
        const defeatText = this.scene.add
            .text(0, -centerY + 110, "DEFEAT!", {
                fontSize: "72px",
                color: "#dc143c",
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#4d1f1f",
                strokeThickness: 6,
            })
            .setOrigin(0.5);
        this.container.add(defeatText);

        // Subtitle
        const subtitle = this.scene.add
            .text(0, -80, "Your hero has fallen in battle!", {
                fontSize: "28px",
                color: "#f5deb3",
                fontFamily: "serif",
                fontStyle: "italic",
                stroke: "#654321",
                strokeThickness: 2,
            })
            .setOrigin(0.5);
        this.container.add(subtitle);

        // Message panel
        const messageBg = this.scene.add.graphics();
        messageBg.fillStyle(0x3e2723, 0.9);
        messageBg.fillRoundedRect(-350, -40, 700, 240, 12);
        messageBg.lineStyle(3, 0x8b7355, 0.9);
        messageBg.strokeRoundedRect(-350, -40, 700, 240, 12);
        messageBg.lineStyle(1, 0xd4af37, 0.7);
        messageBg.strokeRoundedRect(-347, -37, 694, 234, 10);
        this.container.add(messageBg);

        // Defeat message
        const message = this.scene.add
            .text(
                0,
                30,
                "The darkness has claimed another soul...\nBut legends are forged in defeat!\n\nYour progress has been lost to the winds of fate.",
                {
                    fontSize: "18px",
                    color: "#f5deb3",
                    fontFamily: "serif",
                    fontStyle: "italic",
                    align: "center",
                    lineSpacing: 6,
                },
            )
            .setOrigin(0.5);
        this.container.add(message);

        // Restart button
        this.createMedievalButton(0, 120, "⚔️ NEW EXPEDITION", () => {
            this.close();
            onRestart();
        });
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    private createModalBase(width: number, height: number): void {
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        // Background overlay
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 0.7);
        this.overlay.fillRect(
            0,
            0,
            this.scene.scale.width,
            this.scene.scale.height,
        );
        this.overlay.setDepth(199);
        this.overlay.setInteractive(
            new Phaser.Geom.Rectangle(
                0,
                0,
                this.scene.scale.width,
                this.scene.scale.height,
            ),
            Phaser.Geom.Rectangle.Contains,
        );
        this.overlay.on("pointerdown", () => this.close());

        // Modal container
        this.container = this.scene.add.container(centerX, centerY);
        this.container.setDepth(200);

        // Modal background
        const modalBg = this.scene.add.graphics();
        modalBg.fillStyle(0x3e2723, 0.9);
        modalBg.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
        modalBg.lineStyle(3, 0x8b7355, 0.9);
        modalBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);
        modalBg.lineStyle(1, 0xd4af37, 0.7);
        modalBg.strokeRoundedRect(
            -width / 2 + 3,
            -height / 2 + 3,
            width - 6,
            height - 6,
            17,
        );
        this.container.add(modalBg);
    }

    private createBonusListItem(
        bonus: BonusDefinition,
        _x: number,
        y: number,
        _modalWidth: number,
    ): void {
        const itemBg = this.scene.add.graphics();
        itemBg.fillStyle(0x4a332a, 0.8);
        itemBg.fillRoundedRect(-250, y - 25, 500, 50, 10);
        this.container!.add(itemBg);

        // Icon
        let iconDisplay: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
        if (bonus.icon.startsWith("icon_")) {
            iconDisplay = this.scene.add.image(-220, y, bonus.icon);
            iconDisplay.setDisplaySize(32, 32);
        } else {
            iconDisplay = this.scene.add
                .text(-220, y, bonus.icon, { fontSize: "32px" })
                .setOrigin(0.5);
        }
        this.container!.add(iconDisplay);

        // Name
        const nameText = this.scene.add
            .text(-170, y - 10, bonus.name, {
                fontSize: "18px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
            })
            .setOrigin(0, 0.5);
        this.container!.add(nameText);

        // Description
        const descText = this.scene.add
            .text(-170, y + 10, bonus.description, {
                fontSize: "14px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setOrigin(0, 0.5);
        this.container!.add(descText);
    }

    private createStatSection(
        title: string,
        startY: number,
        lineHeight: number,
        stats: string[],
    ): number {
        const titleText = this.scene.add
            .text(0, startY, title, {
                fontSize: "24px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        this.container!.add(titleText);

        let yOffset = startY + lineHeight + 10;
        stats.forEach((stat) => {
            const statText = this.scene.add
                .text(0, yOffset, stat, {
                    fontSize: "18px",
                    color: "#f5deb3",
                    fontFamily: "serif",
                })
                .setOrigin(0.5);
            this.container!.add(statText);
            yOffset += lineHeight;
        });

        return yOffset;
    }

    private createCloseButton(modalHeight: number): void {
        const closeBtn = this.scene.add
            .text(0, modalHeight / 2 - 40, "Close", {
                fontSize: "24px",
                color: "#ffffff",
                backgroundColor: "#aa4444",
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setInteractive();

        closeBtn.on("pointerdown", () => this.close());
        closeBtn.on("pointerover", () => {
            closeBtn.setBackgroundColor("#cc6666");
            this.scene.input.setDefaultCursor("pointer");
        });
        closeBtn.on("pointerout", () => {
            closeBtn.setBackgroundColor("#aa4444");
            this.scene.input.setDefaultCursor("default");
        });

        this.container!.add(closeBtn);
    }

    private createMedievalButton(
        x: number,
        y: number,
        text: string,
        onClick: () => void,
    ): void {
        const buttonWidth = 320;
        const buttonHeight = 60;

        const buttonContainer = this.scene.add.container(x, y);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x8b4513);
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

        const buttonText = this.scene.add
            .text(0, 0, text, {
                fontFamily: "serif",
                fontSize: "24px",
                color: "#f5deb3",
                align: "center",
                fontStyle: "bold",
                stroke: "#654321",
                strokeThickness: 2,
            })
            .setOrigin(0.5);

        buttonContainer.add([bg, buttonText]);
        buttonContainer.setSize(buttonWidth, buttonHeight);
        buttonContainer.setInteractive();

        buttonContainer.on("pointerover", () => {
            bg.clear();
            bg.fillStyle(0xa0522d);
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
            buttonContainer.setScale(1.01);
            buttonText.setColor("#ffffff");
            this.scene.input.setDefaultCursor("pointer");
        });

        buttonContainer.on("pointerout", () => {
            bg.clear();
            bg.fillStyle(0x8b4513);
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
            buttonContainer.setScale(1);
            buttonText.setColor("#f5deb3");
            this.scene.input.setDefaultCursor("default");
        });

        buttonContainer.on("pointerdown", () => {
            buttonContainer.setScale(0.97);
            this.scene.time.delayedCall(120, () => {
                buttonContainer.setScale(1.01);
                onClick();
            });
        });

        this.container!.add(buttonContainer);
    }

    // =========================================================================
    // Cleanup
    // =========================================================================

    public destroy(): void {
        this.close();
    }
}

