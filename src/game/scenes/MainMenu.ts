import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";
import { GameProgress } from "../classes/GameProgress";
import { DifficultyScaling } from "../classes/DifficultyScaling";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    private particleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] =
        [];

    constructor() {
        super("MainMenu");
    }

    create() {
        // Get screen dimensions
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Create a medieval parchment-like background overlay
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x2d1b0e, 0x2d1b0e, 0x4a3019, 0x6b4423, 1);
        bgGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
        bgGraphics.setDepth(0);

        // Original background image with sepia tone
        this.background = this.add.image(centerX, centerY, "background");
        this.background.setScale(
            Math.max(
                this.scale.width / this.background.width,
                this.scale.height / this.background.height
            )
        );
        this.background.setAlpha(0.4);
        this.background.setTint(0xd4af37); // Golden tint
        this.background.setDepth(1);

        // Add medieval atmospheric effects
        this.createMedievalParticleEffects();

        // Medieval title "GRID DUNGEON DESCENT"
        const mainTitle = this.add
            .text(centerX, centerY - 240, "GRID", {
                fontFamily: "serif",
                fontSize: "100px",
                color: "#d4af37", // Gold
                stroke: "#8b4513", // Saddle brown
                strokeThickness: 12,
                align: "center",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(100);

        const middleTitle = this.add
            .text(centerX, centerY - 160, "DUNGEON", {
                fontFamily: "serif",
                fontSize: "84px",
                color: "#cd853f", // Peru gold
                stroke: "#8b4513",
                strokeThickness: 8,
                align: "center",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(100);

        const subTitle = this.add
            .text(centerX, centerY - 90, "DESCENT", {
                fontFamily: "serif",
                fontSize: "84px",
                color: "#cd853f", // Peru gold
                stroke: "#8b4513",
                strokeThickness: 8,
                align: "center",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(100);

        // Add medieval glow effect to titles
        this.addMedievalGlowEffect(mainTitle);
        this.addMedievalGlowEffect(middleTitle);
        this.addMedievalGlowEffect(subTitle);

        // Menu buttons container
        const buttonContainer = this.add.container(centerX, centerY + 100);
        buttonContainer.setDepth(100);

        // Medieval-styled buttons
        const playButton = this.createMedievalButton(
            0,
            -70,
            "🆕 BEGIN NEW EXPEDITION",
            "#8b4513", // Saddle brown
            "#a0522d", // Sienna
            () => {
                // Check if there's existing progress
                const progress = GameProgress.getInstance();
                const hasProgress =
                    progress.getWins() > 0 ||
                    progress.getAppliedBonuses().length > 0;

                if (hasProgress) {
                    // Show confirmation modal
                    this.showNewExpeditionConfirmation();
                } else {
                    // No progress, start fresh directly
                    GameProgress.getInstance().reset();
                    this.scene.start("TacticalBattle");
                }
            }
        );

        // Continue button (only show if there's progress)
        const progress = GameProgress.getInstance();
        const wins = progress.getWins();
        const bonuses = progress.getAppliedBonuses().length;

        let continueButton: GameObjects.Container | null = null;
        if (wins > 0 || bonuses > 0) {
            continueButton = this.createMedievalButton(
                0,
                0,
                "📜 RESUME EXPEDITION",
                "#2f4f2f", // Dark olive green
                "#556b2f", // Dark olive green (lighter)
                () => {
                    this.scene.start("TacticalBattle");
                }
            );
        }

        // Settings button
        const settingsButton = this.createMedievalButton(
            0,
            continueButton ? 70 : 0,
            "⚙️ ADVENTURER'S LOG",
            "#483d8b", // Dark slate blue
            "#6a5acd", // Slate blue
            () => {
                this.showMedievalSettingsModal();
            }
        );

        // Add buttons to container
        buttonContainer.add([playButton]);
        if (continueButton) {
            buttonContainer.add([continueButton]);
        }
        buttonContainer.add([settingsButton]);

        // Medieval progress panel
        this.createMedievalProgressPanel();

        // Medieval version/credits
        const versionText = this.add
            .text(
                this.scale.width - 20,
                this.scale.height - 20,
                "Expedition Log v1.0",
                {
                    fontSize: "18px",
                    color: "#8b7355",
                    fontFamily: "serif",
                    fontStyle: "italic",
                }
            )
            .setOrigin(1, 1)
            .setDepth(100);

        const creditsText = this.add
            .text(
                20,
                this.scale.height - 20,
                "~ Where Every Step Could Be Your Last ~",
                {
                    fontSize: "18px",
                    color: "#8b7355",
                    fontFamily: "serif",
                    fontStyle: "italic",
                }
            )
            .setOrigin(0, 1)
            .setDepth(100);

        // Add medieval entrance animations
        this.createMedievalEntranceAnimations([
            mainTitle,
            middleTitle,
            subTitle,
            buttonContainer,
        ]);

        EventBus.emit("current-scene-ready", this);
    }

    private createMedievalParticleEffects(): void {
        // Create floating embers/sparks
        const emberParticles = this.add.particles(0, 0, "star", {
            x: { min: 0, max: this.scale.width },
            y: { min: 0, max: this.scale.height },
            scale: { min: 0.05, max: 0.2 },
            alpha: { min: 0.2, max: 0.6 },
            speed: { min: 5, max: 20 },
            lifespan: 12000,
            frequency: 300,
            tint: [0xd4af37, 0xffd700, 0xff8c00, 0xdc143c], // Gold, orange, red embers
        });
        emberParticles.setDepth(50);
        this.particleEmitters.push(emberParticles);

        // Create dust motes
        const dustParticles = this.add.particles(0, 0, "star", {
            x: { min: 0, max: this.scale.width },
            y: { min: 0, max: this.scale.height },
            scale: { min: 0.03, max: 0.1 },
            alpha: { min: 0.1, max: 0.3 },
            speed: { min: 2, max: 8 },
            lifespan: 15000,
            frequency: 400,
            tint: [0x8b7355, 0xa0522d, 0xcd853f], // Earthy browns
        });
        dustParticles.setDepth(45);
        this.particleEmitters.push(dustParticles);
    }

    private addMedievalGlowEffect(textObject: GameObjects.Text): void {
        // Create a warm, flickering glow animation like candlelight
        this.tweens.add({
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
    ): GameObjects.Container {
        const container = this.add.container(x, y);

        // Medieval stone/wood button background - made wider for longer text
        const buttonWidth = 420; // Increased from 360
        const buttonHeight = 60;
        const bg = this.add.graphics();
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

        // Button text with medieval font - slightly smaller to fit better
        const buttonText = this.add
            .text(0, 0, text, {
                fontFamily: "serif",
                fontSize: "24px", // Reduced from 28px
                color: "#f5deb3", // Wheat color
                align: "center",
                fontStyle: "bold",
                stroke: "#654321",
                strokeThickness: 2,
                wordWrap: { width: buttonWidth - 20 }, // Add word wrap with padding
            })
            .setOrigin(0.5);

        container.add([bg, buttonText]);
        container.setSize(buttonWidth, buttonHeight);
        container.setInteractive();

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
            this.input.setDefaultCursor("pointer");
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
            this.input.setDefaultCursor("default");
        });

        container.on("pointerdown", () => {
            container.setScale(0.97);
            this.time.delayedCall(120, () => {
                container.setScale(1.01);
                onClick();
            });
        });

        return container;
    }

    private createMedievalProgressPanel(): void {
        const progress = GameProgress.getInstance();
        const wins = progress.getWins();
        const bonuses = progress.getAppliedBonuses().length;
        const difficulty = DifficultyScaling.getDifficultyDescription();

        // Medieval scroll/parchment background
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x3e2723, 0.9); // Dark brown
        panelBg.fillRoundedRect(20, 20, 400, 140, 12);

        // Ornate border
        panelBg.lineStyle(3, 0x8b7355, 0.9); // Bronze border
        panelBg.strokeRoundedRect(20, 20, 400, 140, 12);
        panelBg.lineStyle(1, 0xd4af37, 0.7); // Gold inner line
        panelBg.strokeRoundedRect(23, 23, 394, 134, 10);

        panelBg.setDepth(100);

        // Medieval scroll decorations (corner flourishes)
        const decorationText = this.add
            .text(30, 30, "⚜️", {
                fontSize: "24px",
                color: "#d4af37",
            })
            .setDepth(100);

        const decorationText2 = this.add
            .text(390, 30, "⚜️", {
                fontSize: "24px",
                color: "#d4af37",
            })
            .setDepth(100);

        // Progress title
        const progressTitle = this.add
            .text(60, 45, "EXPEDITION RECORDS", {
                fontSize: "22px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#654321",
                strokeThickness: 2,
            })
            .setDepth(100);

        // Stats with medieval language
        const statsText = this.add
            .text(60, 80, `Dungeons Cleared: ${wins}`, {
                fontSize: "18px",
                color: "#f5deb3",
                fontFamily: "serif",
            })
            .setDepth(100);

        const difficultyText = this.add
            .text(
                60,
                130,
                `Next Depth: ${this.getMedievalDifficulty(difficulty)}`,
                {
                    fontSize: "18px",
                    color: this.getDifficultyColor(difficulty),
                    fontFamily: "serif",
                    fontStyle: "italic",
                }
            )
            .setDepth(100);

        // Medieval achievement badges
        if (wins > 0) {
            const badgeContainer = this.add.container(350, 95);
            badgeContainer.setDepth(100);

            if (wins >= 1) {
                const badge1 = this.add
                    .text(0, -25, "🏆", { fontSize: "28px" })
                    .setOrigin(0.5);
                badgeContainer.add(badge1);
            }
            if (wins >= 5) {
                const badge2 = this.add
                    .text(0, 0, "⚔️", { fontSize: "28px" })
                    .setOrigin(0.5);
                badgeContainer.add(badge2);
            }
            if (wins >= 10) {
                const badge3 = this.add
                    .text(0, 25, "👑", { fontSize: "28px" })
                    .setOrigin(0.5);
                badgeContainer.add(badge3);
            }
        }
    }

    private getMedievalDifficulty(difficulty: string): string {
        switch (difficulty) {
            case "Tutorial":
                return "Surface Ruins";
            case "Easy":
                return "Shallow Depths";
            case "Normal":
                return "Ancient Catacombs";
            case "Hard":
                return "Cursed Depths";
            case "Very Hard":
                return "Abyssal Chambers";
            case "Nightmare":
                return "The Deepest Dark";
            default:
                return difficulty;
        }
    }

    private getDifficultyColor(difficulty: string): string {
        switch (difficulty) {
            case "Tutorial":
                return "#90ee90";
            case "Easy":
                return "#daa520";
            case "Normal":
                return "#ffd700";
            case "Hard":
                return "#ff8c00";
            case "Very Hard":
                return "#dc143c";
            case "Nightmare":
                return "#8b0000";
            default:
                return "#f5deb3";
        }
    }

    private createMedievalEntranceAnimations(
        elements: GameObjects.GameObject[]
    ): void {
        elements.forEach((element, index) => {
            if ("setAlpha" in element) {
                (element as any).setAlpha(0);
            }
            if ("y" in element && "setY" in element) {
                const originalY = (element as any).y;
                (element as any).setY(originalY + 30);
            }
            if ("setScale" in element) {
                (element as any).setScale(0.9);
            }

            this.tweens.add({
                targets: element,
                alpha: 1,
                y: "y" in element ? (element as any).y - 30 : 0,
                scale: 1,
                duration: 1000,
                delay: index * 300,
                ease: "Power3.easeOut",
            });
        });
    }

    private showMedievalSettingsModal(): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Create modal container
        const modalContainer = this.add.container(0, 0);
        modalContainer.setDepth(200);

        // Semi-transparent overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, this.scale.width, this.scale.height);
        overlay.setInteractive();

        // Medieval modal background (like a stone tablet)
        const modalBg = this.add.graphics();
        modalBg.fillStyle(0x2f1b14, 0.95); // Dark brown
        modalBg.fillRoundedRect(centerX - 350, centerY - 250, 700, 500, 25);

        // Ornate medieval border
        modalBg.lineStyle(5, 0x8b7355);
        modalBg.strokeRoundedRect(centerX - 350, centerY - 250, 700, 500, 25);
        modalBg.lineStyle(2, 0xd4af37, 0.8);
        modalBg.strokeRoundedRect(centerX - 345, centerY - 245, 690, 490, 20);

        // Modal title with medieval styling
        const modalTitle = this.add
            .text(centerX, centerY - 180, "📜 ADVENTURER'S LOG 📜", {
                fontSize: "42px",
                color: "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#654321",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        // Settings options
        const progress = GameProgress.getInstance();
        const wins = progress.getWins();
        const bonuses = progress.getAppliedBonuses().length;

        // Game info with medieval language
        const gameInfo = this.add
            .text(
                centerX,
                centerY - 80,
                `~ Expedition Summary ~\n\nDungeons Cleared: ${wins}`,
                {
                    fontSize: "24px",
                    color: "#f5deb3",
                    align: "center",
                    lineSpacing: 12,
                    fontFamily: "serif",
                }
            )
            .setOrigin(0.5);

        // Reset progress button (only if there's progress)
        let resetButton: GameObjects.Container | null = null;
        if (wins > 0 || bonuses > 0) {
            resetButton = this.createMedievalButton(
                centerX,
                centerY + 30,
                "🔥 START NEW EXPEDITION",
                "#8b0000", // Dark red
                "#a52a2a", // Brown red
                () => {
                    this.showMedievalResetConfirmation(modalContainer);
                }
            );
        }

        // Close button
        const closeButton = this.createMedievalButton(
            centerX,
            centerY + 120,
            "✕ RETURN TO CAMP",
            "#2f4f2f",
            "#556b2f",
            () => {
                modalContainer.destroy();
            }
        );

        // Add all elements to modal
        modalContainer.add([
            overlay,
            modalBg,
            modalTitle,
            gameInfo,
            closeButton,
        ]);

        if (resetButton) {
            modalContainer.add([resetButton]);
        }

        // Close modal when clicking overlay
        overlay.on("pointerdown", () => {
            modalContainer.destroy();
        });

        // Medieval entrance animation
        modalContainer.setAlpha(0);
        modalContainer.setScale(0.8);
        this.tweens.add({
            targets: modalContainer,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: "Back.easeOut",
        });
    }

    private showMedievalResetConfirmation(
        parentModal: GameObjects.Container
    ): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Create confirmation modal
        const confirmModal = this.add.container(0, 0);
        confirmModal.setDepth(250);

        // Darker overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.9);
        overlay.fillRect(0, 0, this.scale.width, this.scale.height);
        overlay.setInteractive();

        // Medieval confirmation background (like a warning scroll) - made even wider for buttons
        const confirmBg = this.add.graphics();
        confirmBg.fillStyle(0x8b0000, 0.95); // Dark red
        confirmBg.fillRoundedRect(centerX - 450, centerY - 180, 900, 360, 20);
        confirmBg.lineStyle(4, 0xd4af37);
        confirmBg.strokeRoundedRect(centerX - 450, centerY - 180, 900, 360, 20);
        confirmBg.lineStyle(2, 0xffd700, 0.6);
        confirmBg.strokeRoundedRect(centerX - 445, centerY - 175, 890, 350, 15);

        // Warning icon and text with medieval flavor
        const warningIcon = this.add
            .text(centerX, centerY - 100, "💀⚰️💀", {
                fontSize: "48px",
            })
            .setOrigin(0.5);

        const confirmText = this.add
            .text(centerX, centerY - 30, "Abandon this Expedition?", {
                fontSize: "32px",
                color: "#f5deb3",
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#654321",
                strokeThickness: 2,
            })
            .setOrigin(0.5);

        const warningText = this.add
            .text(
                centerX,
                centerY + 10,
                "All progress will be lost to the depths forever!",
                {
                    fontSize: "20px",
                    color: "#ffd700",
                    fontFamily: "serif",
                    fontStyle: "italic",
                }
            )
            .setOrigin(0.5);

        // Medieval buttons - spaced much further apart and use smaller scale
        const yesButton = this.createMedievalButton(
            centerX - 250,
            centerY + 80,
            "ABANDON",
            "#8b0000",
            "#a52a2a",
            () => {
                GameProgress.getInstance().reset();
                confirmModal.destroy();
                parentModal.destroy();
                this.scene.restart();
            }
        );

        const noButton = this.createMedievalButton(
            centerX + 250,
            centerY + 80,
            "CONTINUE",
            "#2f4f2f",
            "#556b2f",
            () => {
                confirmModal.destroy();
            }
        );

        // Scale buttons down and store the scale for proper hover behavior
        const buttonScale = 0.75;
        yesButton.setScale(buttonScale);
        noButton.setScale(buttonScale);

        // Override hover behavior to respect the initial scale
        yesButton.removeAllListeners("pointerover");
        yesButton.removeAllListeners("pointerout");
        noButton.removeAllListeners("pointerover");
        noButton.removeAllListeners("pointerout");

        // Add custom hover behavior that respects the initial scale
        yesButton.on("pointerover", () => {
            yesButton.setScale(buttonScale * 1.05);
            this.input.setDefaultCursor("pointer");
        });
        yesButton.on("pointerout", () => {
            yesButton.setScale(buttonScale);
            this.input.setDefaultCursor("default");
        });

        noButton.on("pointerover", () => {
            noButton.setScale(buttonScale * 1.05);
            this.input.setDefaultCursor("pointer");
        });
        noButton.on("pointerout", () => {
            noButton.setScale(buttonScale);
            this.input.setDefaultCursor("default");
        });

        confirmModal.add([
            overlay,
            confirmBg,
            warningIcon,
            confirmText,
            warningText,
            yesButton,
            noButton,
        ]);

        // Medieval entrance animation
        confirmModal.setAlpha(0);
        confirmModal.setScale(0.7);
        this.tweens.add({
            targets: confirmModal,
            alpha: 1,
            scale: 1,
            duration: 300,
            ease: "Back.easeOut",
        });
    }

    private showNewExpeditionConfirmation(): void {
        // Get current progress info
        const progress = GameProgress.getInstance();
        const wins = progress.getWins();
        const bonuses = progress.getAppliedBonuses().length;

        // Background overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, this.scale.width, this.scale.height);
        overlay.setDepth(150);

        // Modal container
        const modalContainer = this.add.container(
            this.scale.width / 2,
            this.scale.height / 2
        );
        modalContainer.setDepth(151);

        // Modal background - using dark red/brown to indicate danger
        const modalBg = this.add.graphics();
        modalBg.fillStyle(0x4d1f1f, 0.95); // Dark red brown
        modalBg.fillRoundedRect(-400, -200, 800, 400, 20); // Increased width from 600 to 800

        // Bronze warning border
        modalBg.lineStyle(4, 0xdc143c, 0.9); // Crimson border
        modalBg.strokeRoundedRect(-400, -200, 800, 400, 20);

        // Gold inner border
        modalBg.lineStyle(2, 0xffd700, 0.7);
        modalBg.strokeRoundedRect(-397, -197, 794, 394, 17);

        // Warning icon
        const warningIcon = this.add
            .text(0, -150, "⚠️", {
                fontSize: "64px",
            })
            .setOrigin(0.5);

        // Title
        const title = this.add
            .text(0, -80, "ABANDON CURRENT EXPEDITION?", {
                fontSize: "28px",
                color: "#dc143c", // Crimson
                fontStyle: "bold",
                fontFamily: "serif",
                stroke: "#4d1f1f",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        // Warning message
        const warningText = this.add
            .text(
                0,
                -20,
                "Starting a new expedition will erase all current progress!",
                {
                    fontSize: "20px",
                    color: "#f5deb3",
                    fontFamily: "serif",
                    fontStyle: "italic",
                    align: "center",
                    wordWrap: { width: 700 },
                }
            )
            .setOrigin(0.5);

        // Current progress info
        const progressText = this.add
            .text(
                0,
                40,
                `You will lose:\n• ${wins} Dungeon${
                    wins !== 1 ? "s" : ""
                } Cleared\n• ${bonuses} Artifact${
                    bonuses !== 1 ? "s" : ""
                } Found`,
                {
                    fontSize: "18px",
                    color: "#ffaaaa", // Light red
                    fontFamily: "serif",
                    align: "center",
                    lineSpacing: 5,
                }
            )
            .setOrigin(0.5);

        // Buttons container
        const buttonsContainer = this.add.container(0, 130);

        // Cancel button (safe option)
        const cancelBtn = this.createMedievalButton(
            -200,
            0,
            "📜 CONTINUE EXPEDITION",
            "#2f4f2f", // Dark olive green
            "#556b2f", // Lighter olive
            () => {
                modalContainer.destroy();
                overlay.destroy();
            }
        );
        cancelBtn.setScale(0.8);

        // Confirm button (dangerous option)
        const confirmBtn = this.createMedievalButton(
            200,
            0,
            "⚔️ START NEW",
            "#8b2635", // Dark red
            "#dc143c", // Crimson
            () => {
                modalContainer.destroy();
                overlay.destroy();
                GameProgress.getInstance().reset();
                this.scene.start("TacticalBattle");
            }
        );
        confirmBtn.setScale(0.8);

        // Override hover behavior to respect the initial scale
        const buttonScale = 0.8;

        // Remove default hover listeners
        cancelBtn.removeAllListeners("pointerover");
        cancelBtn.removeAllListeners("pointerout");
        cancelBtn.removeAllListeners("pointerdown");
        confirmBtn.removeAllListeners("pointerover");
        confirmBtn.removeAllListeners("pointerout");
        confirmBtn.removeAllListeners("pointerdown");

        // Add custom hover behavior for cancel button
        cancelBtn.on("pointerover", () => {
            cancelBtn.setScale(buttonScale * 1.05);
            this.input.setDefaultCursor("pointer");
        });
        cancelBtn.on("pointerout", () => {
            cancelBtn.setScale(buttonScale);
            this.input.setDefaultCursor("default");
        });
        cancelBtn.on("pointerdown", () => {
            cancelBtn.setScale(buttonScale * 0.97);
            this.time.delayedCall(120, () => {
                modalContainer.destroy();
                overlay.destroy();
            });
        });

        // Add custom hover behavior for confirm button
        confirmBtn.on("pointerover", () => {
            confirmBtn.setScale(buttonScale * 1.05);
            this.input.setDefaultCursor("pointer");
        });
        confirmBtn.on("pointerout", () => {
            confirmBtn.setScale(buttonScale);
            this.input.setDefaultCursor("default");
        });
        confirmBtn.on("pointerdown", () => {
            confirmBtn.setScale(buttonScale * 0.97);
            this.time.delayedCall(120, () => {
                modalContainer.destroy();
                overlay.destroy();
                GameProgress.getInstance().reset();
                this.scene.start("TacticalBattle");
            });
        });

        buttonsContainer.add([cancelBtn, confirmBtn]);

        // Add all elements to modal
        modalContainer.add([
            modalBg,
            warningIcon,
            title,
            warningText,
            progressText,
            buttonsContainer,
        ]);

        // Make overlay interactive to close modal
        overlay.setInteractive(
            new Phaser.Geom.Rectangle(
                0,
                0,
                this.scale.width,
                this.scale.height
            ),
            Phaser.Geom.Rectangle.Contains
        );
        overlay.on("pointerdown", () => {
            modalContainer.destroy();
            overlay.destroy();
        });

        // Add entrance animation
        modalContainer.setScale(0.9);
        modalContainer.setAlpha(0);
        this.tweens.add({
            targets: modalContainer,
            scale: 1,
            alpha: 1,
            duration: 200,
            ease: "Power2.easeOut",
        });
    }

    moveLogo(vueCallback: ({ x, y }: { x: number; y: number }) => void) {
        if (this.logoTween) {
            if (this.logoTween.isPlaying()) {
                this.logoTween.pause();
            } else {
                this.logoTween.play();
            }
        } else {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: "Back.easeInOut" },
                y: { value: 80, duration: 1500, ease: "Sine.easeOut" },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback) {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y),
                        });
                    }
                },
            });
        }
    }

    shutdown() {
        // Clean up particle emitters
        this.particleEmitters.forEach((emitter) => {
            emitter.destroy();
        });
        this.particleEmitters = [];
    }
}

