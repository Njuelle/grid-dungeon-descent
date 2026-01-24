/**
 * ArtifactBagUI - Displays equipped artifacts during battle.
 *
 * This is a Phaser-dependent UI component that renders:
 * - Small artifact icons in the corner/bottom of the screen
 * - Hover to see artifact details and granted spell
 * - Shows up to 3 artifact slots
 */

import { Scene } from "phaser";
import { ArtifactDefinition } from "../core/types";
import { artifactSystem } from "../systems/ArtifactSystem";
import { getSpellById } from "../data/spells/index";
import { GameProgress } from "../classes/GameProgress";
import { CurseSystem } from "../systems/CurseSystem";

// =============================================================================
// ArtifactBagUI Class
// =============================================================================

export class ArtifactBagUI {
    private scene: Scene;
    private container: Phaser.GameObjects.Container;
    private artifactSlots: Phaser.GameObjects.Container[] = [];
    private tooltip?: Phaser.GameObjects.Container;

    constructor(scene: Scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        this.container.setDepth(50);
        this.container.setVisible(false);
    }

    // =========================================================================
    // Show/Hide
    // =========================================================================

    /**
     * Shows the artifact bag UI.
     */
    public show(): void {
        this.container.setVisible(true);
        this.refresh();
    }

    /**
     * Hides the artifact bag UI.
     */
    public hide(): void {
        this.container.setVisible(false);
        this.hideTooltip();
    }

    /**
     * Refreshes the artifact display.
     */
    public refresh(): void {
        // Clear existing slots
        this.artifactSlots.forEach((slot) => slot.destroy());
        this.artifactSlots = [];
        this.container.removeAll(true);

        const progress = GameProgress.getInstance();
        const maxArtifacts = progress.getMaxArtifacts();
        const equippedArtifacts = artifactSystem.getEquippedArtifacts();

        // Position in bottom-left corner, above the spell bar (bottom bar is 100px)
        const startX = 20;
        const startY = this.scene.scale.height - 180;
        const slotSize = 50;
        const spacing = 10;

        // Background panel
        const panelWidth = maxArtifacts * (slotSize + spacing) + spacing;
        const panelHeight = slotSize + 50; // Extra padding at bottom

        const panelBg = this.scene.add.graphics();
        panelBg.fillStyle(0x2a1d16, 0.9);
        panelBg.fillRoundedRect(startX - spacing, startY - 25, panelWidth, panelHeight, 8);
        panelBg.lineStyle(2, 0x8b7355, 0.8);
        panelBg.strokeRoundedRect(startX - spacing, startY - 25, panelWidth, panelHeight, 8);
        this.container.add(panelBg);

        // Title
        const title = this.scene.add
            .text(startX + panelWidth / 2 - spacing, startY - 15, "Artifacts", {
                fontSize: "14px",
                color: "#d4af37",
                fontFamily: "serif",
            })
            .setOrigin(0.5);
        this.container.add(title);

        // Create slots
        for (let i = 0; i < maxArtifacts; i++) {
            const x = startX + i * (slotSize + spacing);
            const y = startY + 15;
            const artifact = equippedArtifacts[i];

            const slot = this.createArtifactSlot(x, y, slotSize, artifact, i);
            this.artifactSlots.push(slot);
            this.container.add(slot);
        }
    }

    // =========================================================================
    // UI Creation
    // =========================================================================

    private createArtifactSlot(
        x: number,
        y: number,
        size: number,
        artifact: ArtifactDefinition | undefined,
        _index: number
    ): Phaser.GameObjects.Container {
        const slot = this.scene.add.container(x + size / 2, y + size / 2);
        const isCursed = artifact ? CurseSystem.isCursedArtifact(artifact) : false;

        // Slot background - purple for cursed artifacts
        const slotBg = this.scene.add.graphics();
        if (artifact) {
            slotBg.fillStyle(isCursed ? 0x2d1f3d : 0x3e2723, 1);
        } else {
            slotBg.fillStyle(0x1a1a1a, 0.8);
        }
        slotBg.fillRoundedRect(-size / 2, -size / 2, size, size, 6);
        // Purple border for cursed, gold for normal, gray for empty
        const borderColor = artifact ? (isCursed ? 0x9932cc : 0xd4af37) : 0x4a4a4a;
        slotBg.lineStyle(2, borderColor, 0.8);
        slotBg.strokeRoundedRect(-size / 2, -size / 2, size, size, 6);
        slot.add(slotBg);

        if (artifact) {
            // Artifact icon
            let iconDisplay: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
            if (artifact.icon.startsWith("icon_")) {
                iconDisplay = this.scene.add.image(0, 0, artifact.icon);
                iconDisplay.setOrigin(0.5);
                iconDisplay.setDisplaySize(28, 28);
                // Add purple tint for cursed artifacts
                if (isCursed) {
                    iconDisplay.setTint(0xcc88ff);
                }
            } else {
                iconDisplay = this.scene.add
                    .text(0, 0, artifact.icon, { fontSize: "28px" })
                    .setOrigin(0.5);
            }
            slot.add(iconDisplay);

            // Hit area for tooltip
            const hitArea = this.scene.add.rectangle(0, 0, size, size, 0x000000, 0);
            hitArea.setInteractive();
            slot.add(hitArea);

            hitArea.on("pointerover", () => {
                slotBg.clear();
                slotBg.fillStyle(isCursed ? 0x3d2a4d : 0x4a332a, 1);
                slotBg.fillRoundedRect(-size / 2, -size / 2, size, size, 6);
                slotBg.lineStyle(2, isCursed ? 0xda70d6 : 0xffd700, 1);
                slotBg.strokeRoundedRect(-size / 2, -size / 2, size, size, 6);
                this.showTooltip(artifact, x + size / 2, y - 10);
            });

            hitArea.on("pointerout", () => {
                slotBg.clear();
                slotBg.fillStyle(isCursed ? 0x2d1f3d : 0x3e2723, 1);
                slotBg.fillRoundedRect(-size / 2, -size / 2, size, size, 6);
                slotBg.lineStyle(2, isCursed ? 0x9932cc : 0xd4af37, 0.8);
                slotBg.strokeRoundedRect(-size / 2, -size / 2, size, size, 6);
                this.hideTooltip();
            });
        } else {
            // Empty slot indicator
            const emptyText = this.scene.add
                .text(0, 0, "?", {
                    fontSize: "24px",
                    color: "#4a4a4a",
                })
                .setOrigin(0.5);
            slot.add(emptyText);
        }

        return slot;
    }

    // =========================================================================
    // Tooltip
    // =========================================================================

    private showTooltip(artifact: ArtifactDefinition, x: number, y: number): void {
        this.hideTooltip();

        const tooltipWidth = 250;
        const spell = getSpellById(artifact.grantedSpellId);
        const padding = 15;
        const isCursed = CurseSystem.isCursedArtifact(artifact);

        // Measure description text height
        const tempDescText = this.scene.add
            .text(0, 0, artifact.description, {
                fontSize: "12px",
                fontFamily: "serif",
                wordWrap: { width: tooltipWidth - padding * 2 },
            })
            .setVisible(false);
        const descHeight = tempDescText.height;
        tempDescText.destroy();

        // Calculate total tooltip height
        let tooltipHeight = padding + 22 + 8 + descHeight + padding; // padding + name + gap + desc + padding
        if (spell) {
            tooltipHeight += 10 + 20 + 18; // separator gap + spell name + spell stats
        }
        // Add space for curse description
        if (isCursed && artifact.curse) {
            tooltipHeight += 25; // curse text height
        }

        // Calculate position - ensure tooltip stays on screen
        let tooltipX = x;
        let tooltipY = y - tooltipHeight - 20;

        // Clamp to screen bounds
        const minX = tooltipWidth / 2 + 10;
        const maxX = this.scene.scale.width - tooltipWidth / 2 - 10;
        const minY = 10;

        if (tooltipX < minX) tooltipX = minX;
        if (tooltipX > maxX) tooltipX = maxX;
        if (tooltipY < minY) tooltipY = minY;

        this.tooltip = this.scene.add.container(tooltipX, tooltipY);
        this.tooltip.setDepth(100);

        // Background - purple border for cursed
        const bg = this.scene.add.graphics();
        bg.fillStyle(isCursed ? 0x1a1a2a : 0x1a1a1a, 0.95);
        bg.fillRoundedRect(-tooltipWidth / 2, 0, tooltipWidth, tooltipHeight, 8);
        bg.lineStyle(2, isCursed ? 0x9932cc : 0xd4af37, 0.9);
        bg.strokeRoundedRect(-tooltipWidth / 2, 0, tooltipWidth, tooltipHeight, 8);

        // Name - purple for cursed
        const nameText = this.scene.add
            .text(0, padding, artifact.name, {
                fontSize: "16px",
                color: isCursed ? "#cc88ff" : "#d4af37",
                fontStyle: "bold",
                fontFamily: "serif",
            })
            .setOrigin(0.5, 0);

        // Description
        const descText = this.scene.add
            .text(0, padding + 22 + 8, artifact.description, {
                fontSize: "12px",
                color: "#f5deb3",
                fontFamily: "serif",
                wordWrap: { width: tooltipWidth - padding * 2 },
                align: "center",
            })
            .setOrigin(0.5, 0);

        this.tooltip.add([bg, nameText, descText]);

        // Spell info
        let spellEndY = padding + 22 + 8 + descHeight;
        if (spell) {
            const spellY = padding + 22 + 8 + descHeight + 10;

            // Spell icon as image
            let spellIcon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
            if (spell.icon.startsWith("icon_")) {
                spellIcon = this.scene.add.image(-50, spellY + 10, spell.icon);
                spellIcon.setOrigin(0.5);
                spellIcon.setDisplaySize(20, 20);
            } else {
                spellIcon = this.scene.add
                    .text(-50, spellY + 10, spell.icon, { fontSize: "18px" })
                    .setOrigin(0.5);
            }

            const spellTitle = this.scene.add
                .text(10, spellY, spell.name, {
                    fontSize: "14px",
                    color: "#90ee90",
                    fontFamily: "serif",
                })
                .setOrigin(0.5, 0);

            const spellStats = this.scene.add
                .text(
                    0,
                    spellY + 20,
                    `AP: ${spell.apCost} | Range: ${spell.range} | Dmg: ${spell.damage}`,
                    {
                        fontSize: "11px",
                        color: "#c0c0c0",
                        fontFamily: "serif",
                    }
                )
                .setOrigin(0.5, 0);

            this.tooltip.add([spellIcon, spellTitle, spellStats]);
            spellEndY = spellY + 40;
        }

        // Curse info for cursed artifacts
        if (isCursed && artifact.curse) {
            const curseText = this.scene.add
                .text(0, spellEndY + 5, `⚠ ${artifact.curse.description}`, {
                    fontSize: "11px",
                    color: "#ff6666",
                    fontFamily: "serif",
                    fontStyle: "bold",
                    wordWrap: { width: tooltipWidth - padding * 2 },
                    align: "center",
                })
                .setOrigin(0.5, 0);
            this.tooltip.add(curseText);
        }

        // Add tooltip directly to scene, not container (to avoid clipping)
        this.tooltip.setDepth(200);
    }

    private hideTooltip(): void {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = undefined;
        }
    }

    // =========================================================================
    // Cleanup
    // =========================================================================

    public destroy(): void {
        this.hide();
        this.container.destroy();
    }
}
