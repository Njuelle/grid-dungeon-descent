import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { GameProgress } from "../classes/GameProgress";
import {
    Artifact,
    getRandomArtifacts,
    ALL_ARTIFACTS,
} from "../classes/Artifact";
import { PLAYER_CLASSES } from "../classes/PlayerClass";

export class ArtifactSelection extends Scene {
    private selectedArtifact: Artifact | null = null;
    private artifactCards: GameObjects.Container[] = [];
    private selectedCurrentArtifact: Artifact | null = null;
    private isReplacementMode: boolean = false;

    constructor() {
        super("ArtifactSelection");
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Create background
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x2d1b0e, 0x2d1b0e, 0x4a3019, 0x6b4423, 1);
        bgGraphics.fillRect(0, 0, this.scale.width, this.scale.height);

        // Get player's progress
        const progress = GameProgress.getInstance();
        const acquiredArtifacts = progress.getAcquiredArtifacts();

        // Check if player has maximum artifacts (3)
        if (acquiredArtifacts.length >= 3) {
            this.createReplacementInterface(centerX, centerY);
        } else {
            this.createRegularInterface(centerX, centerY);
        }

        EventBus.emit("current-scene-ready", this);
    }

    private createRegularInterface(centerX: number, centerY: number): void {
        // Title
        const title = this.add
            .text(centerX, 100, "CHOOSE AN ARTIFACT", {
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

        // Subtitle
        const subtitle = this.add
            .text(
                centerX,
                160,
                "Select one artifact to enhance your abilities",
                {
                    fontFamily: "serif",
                    fontSize: "24px",
                    color: "#cd853f",
                    align: "center",
                    fontStyle: "italic",
                }
            )
            .setOrigin(0.5)
            .setDepth(100);

        // Get player's class and show 2 random artifacts
        const progress = GameProgress.getInstance();
        const playerClassId = progress.getSelectedClass();
        const artifacts = getRandomArtifacts(playerClassId, 2);

        console.log("[ArtifactSelection] Showing artifacts:", artifacts);

        // Create artifact selection area
        this.createArtifactCards(artifacts, centerX, centerY);

        // Continue button (initially disabled)
        this.createContinueButton(centerX, this.scale.height - 80);
    }

    private createReplacementInterface(centerX: number, centerY: number): void {
        // Title
        const title = this.add
            .text(centerX, 80, "REPLACE AN ARTIFACT", {
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

        // Subtitle
        const subtitle = this.add
            .text(
                centerX,
                130,
                "Choose a current artifact to replace, or skip to keep your current setup",
                {
                    fontFamily: "serif",
                    fontSize: "20px",
                    color: "#cd853f",
                    align: "center",
                    fontStyle: "italic",
                    wordWrap: { width: 800 },
                }
            )
            .setOrigin(0.5)
            .setDepth(100);

        this.createReplacementCards(centerX, centerY);
    }

    private createArtifactCards(
        artifacts: Artifact[],
        centerX: number,
        y: number
    ): void {
        const cardSpacing = 350;
        const startX = centerX - cardSpacing / 2;

        artifacts.forEach((artifact, index) => {
            const cardX = startX + index * cardSpacing;
            const card = this.createArtifactCard(artifact, cardX, y);
            this.artifactCards.push(card);
        });
    }

    private createArtifactCard(
        artifact: Artifact,
        x: number,
        y: number
    ): GameObjects.Container {
        const container = this.add.container(x, y);
        const cardWidth = 320;
        const cardHeight = 280;

        // Card background
        const bg = this.add.graphics();
        bg.fillStyle(0x3e2723, 0.9);
        bg.fillRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            16
        );
        bg.lineStyle(4, 0x8b7355, 0.9);
        bg.strokeRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            16
        );

        // Artifact icon (larger)
        const artifactIcon = this.add
            .image(0, -80, artifact.spell.icon)
            .setOrigin(0.5)
            .setScale(2.0);

        // Artifact name
        const artifactName = this.add
            .text(0, -10, artifact.name, {
                fontFamily: "serif",
                fontSize: "22px",
                color: "#d4af37",
                fontStyle: "bold",
                align: "center",
            })
            .setOrigin(0.5);

        // Spell name
        const spellInfo = this.add
            .text(0, 20, `Grants: ${artifact.spell.name}`, {
                fontFamily: "serif",
                fontSize: "16px",
                color: "#f5deb3",
                align: "center",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Spell details
        const spellDetails = this.add
            .text(
                0,
                50,
                `${artifact.spell.description}\nAP: ${artifact.spell.apCost} | Range: ${artifact.spell.range} | Damage: ${artifact.spell.damage}`,
                {
                    fontFamily: "serif",
                    fontSize: "14px",
                    color: "#cd853f",
                    align: "center",
                    wordWrap: { width: cardWidth - 40 },
                    lineSpacing: 4,
                }
            )
            .setOrigin(0.5);

        // Artifact description
        const description = this.add
            .text(0, 110, artifact.description, {
                fontFamily: "serif",
                fontSize: "13px",
                color: "#a0522d",
                align: "center",
                wordWrap: { width: cardWidth - 40 },
                fontStyle: "italic",
            })
            .setOrigin(0.5);

        container.add([
            bg,
            artifactIcon,
            artifactName,
            spellInfo,
            spellDetails,
            description,
        ]);
        container.setSize(cardWidth, cardHeight);
        container.setInteractive();
        container.setData("artifact", artifact);

        // Hover effects
        container.on("pointerover", () => {
            if (this.selectedArtifact !== artifact) {
                bg.clear();
                bg.fillStyle(0x4a3728, 0.9);
                bg.fillRoundedRect(
                    -cardWidth / 2,
                    -cardHeight / 2,
                    cardWidth,
                    cardHeight,
                    16
                );
                bg.lineStyle(4, 0xd4af37, 0.9);
                bg.strokeRoundedRect(
                    -cardWidth / 2,
                    -cardHeight / 2,
                    cardWidth,
                    cardHeight,
                    16
                );
                container.setScale(1.05);
            }
            this.input.setDefaultCursor("pointer");
        });

        container.on("pointerout", () => {
            if (this.selectedArtifact !== artifact) {
                bg.clear();
                bg.fillStyle(0x3e2723, 0.9);
                bg.fillRoundedRect(
                    -cardWidth / 2,
                    -cardHeight / 2,
                    cardWidth,
                    cardHeight,
                    16
                );
                bg.lineStyle(4, 0x8b7355, 0.9);
                bg.strokeRoundedRect(
                    -cardWidth / 2,
                    -cardHeight / 2,
                    cardWidth,
                    cardHeight,
                    16
                );
                container.setScale(1);
            }
            this.input.setDefaultCursor("default");
        });

        container.on("pointerdown", () => {
            this.selectArtifact(artifact);
        });

        return container;
    }

    private selectArtifact(artifact: Artifact): void {
        console.log("[ArtifactSelection] Selected artifact:", artifact.name);
        this.selectedArtifact = artifact;

        // Update card visuals
        this.artifactCards.forEach((card) => {
            const cardArtifact = card.getData("artifact") as Artifact;
            const cardType = card.getData("type") as string;
            const bg = card.getAt(0) as GameObjects.Graphics;

            if (this.isReplacementMode) {
                // Handle replacement mode visuals
                if (cardType === "new") {
                    const cardWidth = 280;
                    const cardHeight = 80;

                    if (cardArtifact === artifact) {
                        // Selected new artifact
                        bg.clear();
                        bg.fillStyle(0x4a5f2f, 0.9);
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
                    } else {
                        // Deselected new artifact
                        bg.clear();
                        bg.fillStyle(0x2f4f2f, 0.9);
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
                    }
                }
            } else {
                // Handle regular mode visuals
                const cardWidth = 320;
                const cardHeight = 280;

                if (cardArtifact === artifact) {
                    // Selected - gold border
                    bg.clear();
                    bg.fillStyle(0x4a3728, 0.9);
                    bg.fillRoundedRect(
                        -cardWidth / 2,
                        -cardHeight / 2,
                        cardWidth,
                        cardHeight,
                        16
                    );
                    bg.lineStyle(6, 0xffd700, 1);
                    bg.strokeRoundedRect(
                        -cardWidth / 2,
                        -cardHeight / 2,
                        cardWidth,
                        cardHeight,
                        16
                    );
                    bg.lineStyle(2, 0xffffff, 0.8);
                    bg.strokeRoundedRect(
                        -cardWidth / 2 + 4,
                        -cardHeight / 2 + 4,
                        cardWidth - 8,
                        cardHeight - 8,
                        12
                    );
                    card.setScale(1.1);
                } else {
                    // Deselected
                    bg.clear();
                    bg.fillStyle(0x3e2723, 0.9);
                    bg.fillRoundedRect(
                        -cardWidth / 2,
                        -cardHeight / 2,
                        cardWidth,
                        cardHeight,
                        16
                    );
                    bg.lineStyle(4, 0x8b7355, 0.9);
                    bg.strokeRoundedRect(
                        -cardWidth / 2,
                        -cardHeight / 2,
                        cardWidth,
                        cardHeight,
                        16
                    );
                    card.setScale(1);
                }
            }
        });

        if (this.isReplacementMode) {
            // Update replace button state
            this.updateReplaceButton();
        } else {
            // Enable continue button for regular mode
            const continueButton = this.children
                .getChildren()
                .find(
                    (child) =>
                        child.getData && child.getData("type") === "continue"
                ) as GameObjects.Container;

            if (continueButton) {
                continueButton.setAlpha(1);
                continueButton.setData("enabled", true);
            }
        }
    }

    private createContinueButton(x: number, y: number): GameObjects.Container {
        const container = this.add.container(x, y);
        const buttonWidth = 250;
        const buttonHeight = 60;

        const bg = this.add.graphics();
        bg.fillStyle(0x2f4f2f);
        bg.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            12
        );
        bg.lineStyle(4, 0x8b7355);
        bg.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            12
        );

        const text = this.add
            .text(0, 0, "CLAIM ARTIFACT", {
                fontFamily: "serif",
                fontSize: "20px",
                color: "#f5deb3",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        container.add([bg, text]);
        container.setSize(buttonWidth, buttonHeight);
        container.setInteractive();
        container.setData("type", "continue");
        container.setAlpha(0.5);
        container.setData("enabled", false);

        container.on("pointerdown", () => {
            if (container.getData("enabled") && this.selectedArtifact) {
                console.log(
                    "[ArtifactSelection] Claiming artifact:",
                    this.selectedArtifact.id
                );

                // Save the artifact
                const progress = GameProgress.getInstance();
                console.log(
                    "[ArtifactSelection] Before adding artifact, acquired artifacts:",
                    progress.getAcquiredArtifacts()
                );
                progress.addArtifact(this.selectedArtifact.id);
                console.log(
                    "[ArtifactSelection] After adding artifact, acquired artifacts:",
                    progress.getAcquiredArtifacts()
                );

                // Rebuild the complete equipped spells list (class spells + all artifact spells)
                const selectedClassId = progress.getSelectedClass();
                const playerClass =
                    PLAYER_CLASSES.find((c) => c.id === selectedClassId) ||
                    PLAYER_CLASSES[0];

                // Get all class spells (limit to first 2)
                const classSpellIds = playerClass.spells
                    .slice(0, 2)
                    .map((s) => s.id);

                // Get all artifact spells (including the one we just added)
                const allAcquiredArtifacts = progress.getAcquiredArtifacts();
                const artifactSpellIds = allAcquiredArtifacts
                    .map((artifactId) =>
                        ALL_ARTIFACTS.find((a) => a.id === artifactId)
                    )
                    .filter((artifact) => artifact !== undefined)
                    .map((artifact) => artifact!.spell.id);

                // Combine class spells + artifact spells (up to 5 total)
                const newEquipped = [
                    ...classSpellIds,
                    ...artifactSpellIds,
                ].slice(0, 5);

                progress.setEquippedSpells(newEquipped);
                console.log(
                    "[ArtifactSelection] Updated equipped spells with class + artifact spells:",
                    newEquipped
                );
                console.log("[ArtifactSelection] Artifact saved to progress");

                // Return to game
                this.scene.start("TacticalBattle");
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

    private createReplacementCards(centerX: number, centerY: number): void {
        this.isReplacementMode = true;

        // Get current artifacts
        const progress = GameProgress.getInstance();
        const acquiredArtifactIds = progress.getAcquiredArtifacts();
        const currentArtifacts = acquiredArtifactIds
            .map((id) => ALL_ARTIFACTS.find((a) => a.id === id))
            .filter((artifact) => artifact !== undefined) as Artifact[];

        // Get new artifact options
        const playerClassId = progress.getSelectedClass();
        const newArtifacts = getRandomArtifacts(playerClassId, 2);

        console.log("[ArtifactSelection] Current artifacts:", currentArtifacts);
        console.log("[ArtifactSelection] New artifact options:", newArtifacts);

        // Left side: Current artifacts
        this.add
            .text(centerX - 300, centerY - 120, "CURRENT ARTIFACTS", {
                fontFamily: "serif",
                fontSize: "24px",
                color: "#d4af37",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        currentArtifacts.forEach((artifact, index) => {
            const cardX = centerX - 300;
            const cardY = centerY - 60 + index * 100;
            const card = this.createCurrentArtifactCard(artifact, cardX, cardY);
            this.artifactCards.push(card);
        });

        // VS indicator
        this.add
            .text(centerX, centerY, "VS", {
                fontFamily: "serif",
                fontSize: "32px",
                color: "#cd853f",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Right side: New artifacts
        this.add
            .text(centerX + 300, centerY - 120, "NEW OPTIONS", {
                fontFamily: "serif",
                fontSize: "24px",
                color: "#d4af37",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        newArtifacts.forEach((artifact, index) => {
            const cardX = centerX + 300;
            const cardY = centerY - 60 + index * 100;
            const card = this.createNewArtifactCard(artifact, cardX, cardY);
            this.artifactCards.push(card);
        });

        // Replace button (initially disabled)
        this.createReplaceButton(centerX, this.scale.height - 120);

        // Skip button
        this.createSkipButton(centerX, this.scale.height - 60);
    }

    private createCurrentArtifactCard(
        artifact: Artifact,
        x: number,
        y: number
    ): GameObjects.Container {
        const container = this.add.container(x, y);
        const cardWidth = 280;
        const cardHeight = 80;

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
        bg.lineStyle(3, 0x8b7355, 0.9);
        bg.strokeRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            12
        );

        // Artifact info
        const name = this.add.text(-cardWidth / 2 + 10, -20, artifact.name, {
            fontFamily: "serif",
            fontSize: "16px",
            color: "#d4af37",
            fontStyle: "bold",
        });

        const spellInfo = this.add.text(
            -cardWidth / 2 + 10,
            0,
            `Spell: ${artifact.spell.name}`,
            {
                fontFamily: "serif",
                fontSize: "14px",
                color: "#f5deb3",
            }
        );

        const spellIcon = this.add
            .image(cardWidth / 2 - 30, 0, artifact.spell.icon)
            .setScale(0.8);

        container.add([bg, name, spellInfo, spellIcon]);
        container.setSize(cardWidth, cardHeight);
        container.setInteractive();
        container.setData("artifact", artifact);
        container.setData("type", "current");

        // Click handler
        container.on("pointerdown", () => {
            this.selectCurrentArtifact(artifact);
        });

        // Hover effects
        container.on("pointerover", () => {
            if (this.selectedCurrentArtifact !== artifact) {
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
            }
            this.input.setDefaultCursor("pointer");
        });

        container.on("pointerout", () => {
            if (this.selectedCurrentArtifact !== artifact) {
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
            }
            this.input.setDefaultCursor("default");
        });

        return container;
    }

    private createNewArtifactCard(
        artifact: Artifact,
        x: number,
        y: number
    ): GameObjects.Container {
        const container = this.add.container(x, y);
        const cardWidth = 280;
        const cardHeight = 80;

        // Card background
        const bg = this.add.graphics();
        bg.fillStyle(0x2f4f2f, 0.9);
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

        // Artifact info
        const name = this.add.text(-cardWidth / 2 + 10, -20, artifact.name, {
            fontFamily: "serif",
            fontSize: "16px",
            color: "#d4af37",
            fontStyle: "bold",
        });

        const spellInfo = this.add.text(
            -cardWidth / 2 + 10,
            0,
            `Spell: ${artifact.spell.name}`,
            {
                fontFamily: "serif",
                fontSize: "14px",
                color: "#f5deb3",
            }
        );

        const spellIcon = this.add
            .image(cardWidth / 2 - 30, 0, artifact.spell.icon)
            .setScale(0.8);

        container.add([bg, name, spellInfo, spellIcon]);
        container.setSize(cardWidth, cardHeight);
        container.setInteractive();
        container.setData("artifact", artifact);
        container.setData("type", "new");

        // Click handler
        container.on("pointerdown", () => {
            this.selectArtifact(artifact);
        });

        // Hover effects
        container.on("pointerover", () => {
            if (this.selectedArtifact !== artifact) {
                bg.clear();
                bg.fillStyle(0x4a5f2f, 0.9);
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
            }
            this.input.setDefaultCursor("pointer");
        });

        container.on("pointerout", () => {
            if (this.selectedArtifact !== artifact) {
                bg.clear();
                bg.fillStyle(0x2f4f2f, 0.9);
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
            }
            this.input.setDefaultCursor("default");
        });

        return container;
    }

    private selectCurrentArtifact(artifact: Artifact): void {
        console.log(
            "[ArtifactSelection] Selected current artifact:",
            artifact.name
        );
        this.selectedCurrentArtifact = artifact;

        // Update visual states for current artifacts
        this.artifactCards.forEach((card) => {
            if (card.getData("type") === "current") {
                const cardArtifact = card.getData("artifact") as Artifact;
                const bg = card.getAt(0) as GameObjects.Graphics;
                const cardWidth = 280;
                const cardHeight = 80;

                if (cardArtifact === artifact) {
                    // Selected
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
                } else {
                    // Deselected
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
                }
            }
        });

        this.updateReplaceButton();
    }

    private updateReplaceButton(): void {
        const replaceButton = this.children
            .getChildren()
            .find(
                (child) => child.getData && child.getData("type") === "replace"
            ) as GameObjects.Container;

        if (replaceButton) {
            const canReplace =
                this.selectedCurrentArtifact && this.selectedArtifact;
            replaceButton.setAlpha(canReplace ? 1 : 0.5);
            replaceButton.setData("enabled", canReplace);
        }
    }

    private createReplaceButton(x: number, y: number): GameObjects.Container {
        const container = this.add.container(x, y);
        const buttonWidth = 200;
        const buttonHeight = 50;

        const bg = this.add.graphics();
        bg.fillStyle(0x8b4513);
        bg.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            12
        );
        bg.lineStyle(4, 0x8b7355);
        bg.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            12
        );

        const text = this.add
            .text(0, 0, "REPLACE", {
                fontFamily: "serif",
                fontSize: "18px",
                color: "#f5deb3",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        container.add([bg, text]);
        container.setSize(buttonWidth, buttonHeight);
        container.setInteractive();
        container.setData("type", "replace");
        container.setAlpha(0.5);
        container.setData("enabled", false);

        container.on("pointerdown", () => {
            if (
                container.getData("enabled") &&
                this.selectedCurrentArtifact &&
                this.selectedArtifact
            ) {
                this.performReplacement();
            }
        });

        return container;
    }

    private createSkipButton(x: number, y: number): GameObjects.Container {
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
            12
        );
        bg.lineStyle(4, 0x8b7355);
        bg.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            12
        );

        const text = this.add
            .text(0, 0, "SKIP", {
                fontFamily: "serif",
                fontSize: "18px",
                color: "#f5deb3",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        container.add([bg, text]);
        container.setSize(buttonWidth, buttonHeight);
        container.setInteractive();
        container.setData("type", "skip");

        container.on("pointerdown", () => {
            console.log("[ArtifactSelection] Skipping artifact selection");
            this.scene.start("TacticalBattle");
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

    private performReplacement(): void {
        if (!this.selectedCurrentArtifact || !this.selectedArtifact) return;

        console.log(
            `[ArtifactSelection] Replacing ${this.selectedCurrentArtifact.name} with ${this.selectedArtifact.name}`
        );

        const progress = GameProgress.getInstance();

        // Remove old artifact
        const currentArtifacts = progress.getAcquiredArtifacts();
        const updatedArtifacts = currentArtifacts.filter(
            (id) => id !== this.selectedCurrentArtifact!.id
        );

        // Add new artifact
        updatedArtifacts.push(this.selectedArtifact.id);

        // Save updated artifacts
        progress.setAcquiredArtifacts(updatedArtifacts);

        // Rebuild the complete equipped spells list (class spells + all artifact spells)
        const selectedClassId = progress.getSelectedClass();
        const playerClass =
            PLAYER_CLASSES.find((c) => c.id === selectedClassId) ||
            PLAYER_CLASSES[0];

        // Get all class spells (limit to first 2)
        const classSpellIds = playerClass.spells.slice(0, 2).map((s) => s.id);

        // Get all artifact spells (with the replacement)
        const artifactSpellIds = updatedArtifacts
            .map((artifactId) => ALL_ARTIFACTS.find((a) => a.id === artifactId))
            .filter((artifact) => artifact !== undefined)
            .map((artifact) => artifact!.spell.id);

        // Combine class spells + artifact spells (up to 5 total)
        const updatedEquipped = [...classSpellIds, ...artifactSpellIds].slice(
            0,
            5
        );
        progress.setEquippedSpells(updatedEquipped);

        console.log("[ArtifactSelection] Replacement complete");
        this.scene.start("TacticalBattle");
    }
}

