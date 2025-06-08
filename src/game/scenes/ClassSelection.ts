import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { PLAYER_CLASSES, PlayerClass } from "../classes/PlayerClass";
import { GameProgress } from "../classes/GameProgress";

export class ClassSelection extends Scene {
    private selectedClass: PlayerClass | null = null;
    private classCards: GameObjects.Container[] = [];
    private continueButton: GameObjects.Container | null = null;

    constructor() {
        super("ClassSelection");
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Create background similar to main menu
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x2d1b0e, 0x2d1b0e, 0x4a3019, 0x6b4423, 1);
        bgGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
        bgGraphics.setDepth(0);

        // Title
        const title = this.add
            .text(centerX, 80, "CHOOSE YOUR CLASS", {
                fontFamily: "serif",
                fontSize: "48px",
                color: "#d4af37",
                stroke: "#8b4513",
                strokeThickness: 8,
                align: "center",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(100);

        const subtitle = this.add
            .text(centerX, 130, "Select your adventurer's path", {
                fontFamily: "serif",
                fontSize: "24px",
                color: "#cd853f",
                align: "center",
                fontStyle: "italic",
            })
            .setOrigin(0.5)
            .setDepth(100);

        // Create class cards
        const cardSpacing = 280;
        const startX = centerX - cardSpacing;

        PLAYER_CLASSES.forEach((playerClass, index) => {
            const cardX = startX + index * cardSpacing;
            const cardY = centerY;
            const card = this.createClassCard(playerClass, cardX, cardY);
            this.classCards.push(card);
        });

        // Continue button (initially disabled) - positioned at the bottom
        this.continueButton = this.createContinueButton(
            centerX,
            this.scale.height - 250
        );
        this.continueButton.setAlpha(0.5);
        this.continueButton.setData("enabled", false);

        // Back button
        this.createBackButton(80, this.scale.height - 60);

        EventBus.emit("current-scene-ready", this);
    }

    private createClassCard(
        playerClass: PlayerClass,
        x: number,
        y: number
    ): GameObjects.Container {
        const container = this.add.container(x, y);
        const cardWidth = 240;
        const cardHeight = 320;

        // Card background
        const bg = this.add.graphics();
        bg.fillStyle(0x3e2723, 0.9);
        bg.fillRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            12
        );

        // Border
        bg.lineStyle(3, 0x8b7355, 0.9);
        bg.strokeRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            12
        );

        // Class sprite - show actual hero sprite
        const classSprite = this.add
            .image(0, -100, playerClass.icon)
            .setOrigin(0.5);

        // Scale the sprite to fit nicely in the card
        const spriteScale = Math.min(
            80 / classSprite.width,
            80 / classSprite.height
        );
        classSprite.setScale(spriteScale);

        // Class name
        const className = this.add
            .text(0, -40, playerClass.name, {
                fontFamily: "serif",
                fontSize: "28px",
                color: "#d4af37",
                fontStyle: "bold",
                align: "center",
            })
            .setOrigin(0.5);

        // Class description
        const description = this.add
            .text(0, 10, playerClass.description, {
                fontFamily: "serif",
                fontSize: "14px",
                color: "#f5deb3",
                align: "center",
                wordWrap: { width: cardWidth - 40 },
            })
            .setOrigin(0.5);

        // Stats preview
        const stats = playerClass.baseStats;
        const statsText =
            `HP: ${stats.health}  ARM: ${stats.armor}\n` +
            `STR: ${stats.force}  DEX: ${stats.dexterity}  INT: ${stats.intelligence}`;

        const statsDisplay = this.add
            .text(0, 80, statsText, {
                fontFamily: "serif",
                fontSize: "12px",
                color: "#cd853f",
                align: "center",
            })
            .setOrigin(0.5);

        // Spells preview
        const spellNames = playerClass.spells
            .map((spell) => spell.name)
            .join("\n");
        const spellsDisplay = this.add
            .text(0, 130, `Spells:\n${spellNames}`, {
                fontFamily: "serif",
                fontSize: "11px",
                color: "#a0522d",
                align: "center",
            })
            .setOrigin(0.5);

        container.add([
            bg,
            classSprite,
            className,
            description,
            statsDisplay,
            spellsDisplay,
        ]);
        container.setSize(cardWidth, cardHeight);
        container.setInteractive();
        container.setData("class", playerClass);

        // Hover effects
        container.on("pointerover", () => {
            if (this.selectedClass !== playerClass) {
                bg.clear();
                bg.fillStyle(0x4a3728, 0.9);
                bg.fillRoundedRect(
                    -cardWidth / 2,
                    -cardHeight / 2,
                    cardWidth,
                    cardHeight,
                    12
                );
                bg.lineStyle(3, 0xd4af37, 0.9);
                bg.strokeRoundedRect(
                    -cardWidth / 2,
                    -cardHeight / 2,
                    cardWidth,
                    cardHeight,
                    12
                );
                container.setScale(1.05);
            }
            this.input.setDefaultCursor("pointer");
        });

        container.on("pointerout", () => {
            if (this.selectedClass !== playerClass) {
                bg.clear();
                bg.fillStyle(0x3e2723, 0.9);
                bg.fillRoundedRect(
                    -cardWidth / 2,
                    -cardHeight / 2,
                    cardWidth,
                    cardHeight,
                    12
                );
                bg.lineStyle(3, 0x8b7355, 0.9);
                bg.strokeRoundedRect(
                    -cardWidth / 2,
                    -cardHeight / 2,
                    cardWidth,
                    cardHeight,
                    12
                );
                container.setScale(1);
            }
            this.input.setDefaultCursor("default");
        });

        container.on("pointerdown", () => {
            this.selectClass(playerClass);
        });

        return container;
    }

    private selectClass(playerClass: PlayerClass): void {
        // Clear previous selection
        this.classCards.forEach((card) => {
            const cardClass = card.getData("class") as PlayerClass;
            const bg = card.getAt(0) as GameObjects.Graphics;
            const cardWidth = 240;
            const cardHeight = 320;

            if (cardClass === this.selectedClass && cardClass !== playerClass) {
                // Deselect previous
                bg.clear();
                bg.fillStyle(0x3e2723, 0.9);
                bg.fillRoundedRect(
                    -cardWidth / 2,
                    -cardHeight / 2,
                    cardWidth,
                    cardHeight,
                    12
                );
                bg.lineStyle(3, 0x8b7355, 0.9);
                bg.strokeRoundedRect(
                    -cardWidth / 2,
                    -cardHeight / 2,
                    cardWidth,
                    cardHeight,
                    12
                );
                card.setScale(1);
            }
        });

        // Select new class
        this.selectedClass = playerClass;
        const selectedCard = this.classCards.find(
            (card) => card.getData("class") === playerClass
        );
        if (selectedCard) {
            const bg = selectedCard.getAt(0) as GameObjects.Graphics;
            const cardWidth = 240;
            const cardHeight = 320;

            bg.clear();
            bg.fillStyle(0x4a3728, 0.9);
            bg.fillRoundedRect(
                -cardWidth / 2,
                -cardHeight / 2,
                cardWidth,
                cardHeight,
                12
            );
            bg.lineStyle(4, 0xffd700, 1);
            bg.strokeRoundedRect(
                -cardWidth / 2,
                -cardHeight / 2,
                cardWidth,
                cardHeight,
                12
            );
            bg.lineStyle(2, 0xffffff, 0.8);
            bg.strokeRoundedRect(
                -cardWidth / 2 + 4,
                -cardHeight / 2 + 4,
                cardWidth - 8,
                cardHeight - 8,
                8
            );
            selectedCard.setScale(1.1);
        }

        // Enable continue button
        console.log("[ClassSelection] Selected class:", playerClass.name);
        console.log(
            "[ClassSelection] Continue button found:",
            !!this.continueButton
        );

        if (this.continueButton) {
            this.continueButton.setAlpha(1);
            this.continueButton.setData("enabled", true);
            console.log("[ClassSelection] Continue button enabled");
        } else {
            console.log("[ClassSelection] Continue button not found!");
        }
    }

    private createContinueButton(x: number, y: number): GameObjects.Container {
        const container = this.add.container(x, y);
        const buttonWidth = 200;
        const buttonHeight = 50;

        const bg = this.add.graphics();
        bg.fillStyle(0x2f4f2f);
        bg.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            8
        );
        bg.lineStyle(3, 0x8b7355);
        bg.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            8
        );

        const text = this.add
            .text(0, 0, "BEGIN ADVENTURE", {
                fontFamily: "serif",
                fontSize: "18px",
                color: "#f5deb3",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        container.add([bg, text]);
        container.setSize(buttonWidth, buttonHeight);
        container.setInteractive();
        container.setData("type", "continue");

        container.on("pointerdown", () => {
            console.log("[ClassSelection] Continue button clicked");
            console.log(
                "[ClassSelection] Button enabled:",
                container.getData("enabled")
            );
            console.log("[ClassSelection] Selected class:", this.selectedClass);

            if (container.getData("enabled") && this.selectedClass) {
                console.log(
                    "[ClassSelection] Starting game with class:",
                    this.selectedClass.id
                );

                // Store selected class in GameProgress
                GameProgress.getInstance().setSelectedClass(
                    this.selectedClass.id
                );
                GameProgress.getInstance().reset(); // Reset progress for new game

                console.log("[ClassSelection] Starting TacticalBattle scene");
                this.scene.start("TacticalBattle");
            } else {
                console.log(
                    "[ClassSelection] Button click ignored - not enabled or no class selected"
                );
            }
        });

        container.on("pointerover", () => {
            if (container.getData("enabled")) {
                this.input.setDefaultCursor("pointer");
                container.setScale(1.05);
            }
        });

        container.on("pointerout", () => {
            this.input.setDefaultCursor("default");
            container.setScale(1);
        });

        return container;
    }

    private createBackButton(x: number, y: number): GameObjects.Container {
        const container = this.add.container(x, y);
        const buttonWidth = 120;
        const buttonHeight = 40;

        const bg = this.add.graphics();
        bg.fillStyle(0x8b4513);
        bg.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            6
        );
        bg.lineStyle(2, 0x8b7355);
        bg.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            6
        );

        const text = this.add
            .text(0, 0, "← BACK", {
                fontFamily: "serif",
                fontSize: "16px",
                color: "#f5deb3",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        container.add([bg, text]);
        container.setSize(buttonWidth, buttonHeight);
        container.setInteractive();

        container.on("pointerdown", () => {
            this.scene.start("MainMenu");
        });

        container.on("pointerover", () => {
            this.input.setDefaultCursor("pointer");
            container.setScale(1.05);
        });

        container.on("pointerout", () => {
            this.input.setDefaultCursor("default");
            container.setScale(1);
        });

        return container;
    }
}

