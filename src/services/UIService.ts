/**
 * UIService - Modern UI management with state synchronization
 *
 * Provides event-driven UI updates, state management integration,
 * and reactive UI patterns for a clean separation of concerns
 */

import { Service } from "../data/types";
import { Result } from "../utils/Result";
import { success, failure, eventBus, GameEvent, stateManager } from "../core";
import { Scene } from "phaser";

export interface UIServiceDependencies {
    stateManager: typeof stateManager;
}

export interface UIElement {
    id: string;
    type: "button" | "text" | "image" | "container" | "healthbar" | "tooltip";
    gameObject?: Phaser.GameObjects.GameObject;
    visible: boolean;
    interactive: boolean;
    data?: any;
}

export interface UILayout {
    name: string;
    elements: UIElement[];
    active: boolean;
}

export class UIService implements Service {
    public readonly name = "UIService";
    private scene?: Scene;
    private layouts = new Map<string, UILayout>();
    private elements = new Map<string, UIElement>();
    private eventListeners: (() => void)[] = [];
    private initialized = false;

    constructor() {
        // UI will be initialized with scene
    }

    async initialize(): Promise<void> {
        try {
            this.setupEventListeners();
            this.initialized = true;
        } catch (error) {
            throw new Error(`Failed to initialize UIService: ${error}`);
        }
    }

    async destroy(): Promise<void> {
        await this.cleanup();
    }

    async cleanup(): Promise<void> {
        this.cleanupEventListeners();
        this.clearAllLayouts();
        this.scene = undefined;
        this.initialized = false;
    }

    /**
     * Set the Phaser scene for UI management
     */
    public setScene(scene: Scene): void {
        this.scene = scene;
        this.setupSceneEventHandlers();
    }

    /**
     * Create a new UI layout
     */
    public createLayout(name: string): Result<UILayout, string> {
        try {
            if (this.layouts.has(name)) {
                return failure(`Layout "${name}" already exists`);
            }

            const layout: UILayout = {
                name,
                elements: [],
                active: false,
            };

            this.layouts.set(name, layout);
            return success(layout);
        } catch (error) {
            return failure(`Failed to create layout: ${error}`);
        }
    }

    /**
     * Add element to layout
     */
    public addElementToLayout(
        layoutName: string,
        element: Omit<UIElement, "id">,
        id?: string
    ): Result<string, string> {
        try {
            const layout = this.layouts.get(layoutName);
            if (!layout) {
                return failure(`Layout "${layoutName}" not found`);
            }

            const elementId =
                id || `${layoutName}_${element.type}_${Date.now()}`;
            const uiElement: UIElement = {
                ...element,
                id: elementId,
            };

            layout.elements.push(uiElement);
            this.elements.set(elementId, uiElement);

            return success(elementId);
        } catch (error) {
            return failure(`Failed to add element: ${error}`);
        }
    }

    /**
     * Activate a layout (show its elements)
     */
    public activateLayout(name: string): Result<void, string> {
        try {
            const layout = this.layouts.get(name);
            if (!layout) {
                return failure(`Layout "${name}" not found`);
            }

            // Deactivate other layouts first
            for (const [_, otherLayout] of this.layouts) {
                if (otherLayout.active && otherLayout.name !== name) {
                    this.deactivateLayout(otherLayout.name);
                }
            }

            layout.active = true;
            this.showLayoutElements(layout);

            eventBus.emit(GameEvent.UI_LAYOUT_CHANGED, {
                layoutName: name,
                active: true,
            });
            return success(undefined);
        } catch (error) {
            return failure(`Failed to activate layout: ${error}`);
        }
    }

    /**
     * Deactivate a layout (hide its elements)
     */
    public deactivateLayout(name: string): Result<void, string> {
        try {
            const layout = this.layouts.get(name);
            if (!layout) {
                return failure(`Layout "${name}" not found`);
            }

            layout.active = false;
            this.hideLayoutElements(layout);

            eventBus.emit(GameEvent.UI_LAYOUT_CHANGED, {
                layoutName: name,
                active: false,
            });
            return success(undefined);
        } catch (error) {
            return failure(`Failed to deactivate layout: ${error}`);
        }
    }

    /**
     * Update element properties
     */
    public updateElement(
        elementId: string,
        updates: Partial<Pick<UIElement, "visible" | "interactive" | "data">>
    ): Result<void, string> {
        try {
            const element = this.elements.get(elementId);
            if (!element) {
                return failure(`Element "${elementId}" not found`);
            }

            // Apply updates
            Object.assign(element, updates);

            // Update game object if exists
            if (element.gameObject) {
                if (updates.visible !== undefined) {
                    element.gameObject.setVisible(updates.visible);
                }
                if (updates.interactive !== undefined) {
                    if (element.gameObject.input) {
                        element.gameObject.input.enabled = updates.interactive;
                    }
                }
            }

            eventBus.emit(GameEvent.UI_ELEMENT_UPDATED, { elementId, updates });
            return success(undefined);
        } catch (error) {
            return failure(`Failed to update element: ${error}`);
        }
    }

    /**
     * Create player stats UI
     */
    public createPlayerStatsUI(): Result<string, string> {
        if (!this.scene) {
            return failure("Scene not set");
        }

        try {
            // Get current game state
            const gameState = stateManager.getState();
            const playerStats = gameState.player?.stats;

            if (!playerStats) {
                return failure("No player stats available");
            }

            // Create stats layout
            const layoutResult = this.createLayout("playerStats");
            if (layoutResult.isFailure()) {
                return failure(layoutResult.error);
            }

            // Health display
            const healthText = this.scene.add
                .text(
                    16,
                    16,
                    `Health: ${playerStats.health}/${playerStats.maxHealth}`,
                    {
                        fontSize: "18px",
                        color: "#ffffff",
                        stroke: "#000000",
                        strokeThickness: 2,
                    }
                )
                .setDepth(1000);

            this.addElementToLayout(
                "playerStats",
                {
                    type: "text",
                    gameObject: healthText,
                    visible: true,
                    interactive: false,
                    data: { statType: "health" },
                },
                "playerHealth"
            );

            // Movement points display
            const movementText = this.scene.add
                .text(
                    16,
                    44,
                    `Movement: ${playerStats.movementPoints || 0}/${
                        playerStats.maxMovementPoints || 0
                    }`,
                    {
                        fontSize: "16px",
                        color: "#00ff00",
                        stroke: "#000000",
                        strokeThickness: 2,
                    }
                )
                .setDepth(1000);

            this.addElementToLayout(
                "playerStats",
                {
                    type: "text",
                    gameObject: movementText,
                    visible: true,
                    interactive: false,
                    data: { statType: "movement" },
                },
                "playerMovement"
            );

            // Action points display
            const actionText = this.scene.add
                .text(
                    16,
                    70,
                    `Actions: ${playerStats.actionPoints || 0}/${
                        playerStats.maxActionPoints || 0
                    }`,
                    {
                        fontSize: "16px",
                        color: "#ffff00",
                        stroke: "#000000",
                        strokeThickness: 2,
                    }
                )
                .setDepth(1000);

            this.addElementToLayout(
                "playerStats",
                {
                    type: "text",
                    gameObject: actionText,
                    visible: true,
                    interactive: false,
                    data: { statType: "action" },
                },
                "playerActions"
            );

            // Activate the layout
            this.activateLayout("playerStats");

            return success("playerStats");
        } catch (error) {
            return failure(`Failed to create player stats UI: ${error}`);
        }
    }

    /**
     * Update player stats display
     */
    public updatePlayerStatsUI(stats: any): void {
        const healthElement = this.elements.get("playerHealth");
        const movementElement = this.elements.get("playerMovement");
        const actionElement = this.elements.get("playerActions");

        if (
            healthElement?.gameObject &&
            healthElement.gameObject instanceof Phaser.GameObjects.Text
        ) {
            healthElement.gameObject.setText(
                `Health: ${stats.health}/${stats.maxHealth}`
            );
        }

        if (
            movementElement?.gameObject &&
            movementElement.gameObject instanceof Phaser.GameObjects.Text
        ) {
            movementElement.gameObject.setText(
                `Movement: ${stats.movementPoints || 0}/${
                    stats.maxMovementPoints || 0
                }`
            );
        }

        if (
            actionElement?.gameObject &&
            actionElement.gameObject instanceof Phaser.GameObjects.Text
        ) {
            actionElement.gameObject.setText(
                `Actions: ${stats.actionPoints || 0}/${
                    stats.maxActionPoints || 0
                }`
            );
        }
    }

    /**
     * Create spell selection UI
     */
    public createSpellSelectionUI(spells: any[]): Result<string, string> {
        if (!this.scene) {
            return failure("Scene not set");
        }

        try {
            const layoutResult = this.createLayout("spellSelection");
            if (layoutResult.isFailure()) {
                return failure(layoutResult.error);
            }

            const startY = this.scene.scale.height - 120;
            const spellWidth = 80;
            const spellSpacing = 90;

            for (let i = 0; i < Math.min(spells.length, 5); i++) {
                const spell = spells[i];
                const x = 20 + i * spellSpacing;

                // Spell button background
                const spellBg = this.scene.add
                    .rectangle(x, startY, spellWidth, 60, 0x333333)
                    .setStrokeStyle(2, 0x666666)
                    .setDepth(999)
                    .setInteractive()
                    .on("pointerdown", () => {
                        eventBus.emit(GameEvent.PLAYER_SPELL_CHANGED, {
                            spellIndex: i,
                            spell: spell,
                        });
                    });

                // Spell name text
                const spellText = this.scene.add
                    .text(x, startY - 10, spell.name, {
                        fontSize: "12px",
                        color: "#ffffff",
                        align: "center",
                    })
                    .setOrigin(0.5)
                    .setDepth(1000);

                // Spell cost text
                const costText = this.scene.add
                    .text(x, startY + 10, `${spell.apCost} AP`, {
                        fontSize: "10px",
                        color: "#ffff00",
                        align: "center",
                    })
                    .setOrigin(0.5)
                    .setDepth(1000);

                this.addElementToLayout(
                    "spellSelection",
                    {
                        type: "button",
                        gameObject: spellBg,
                        visible: true,
                        interactive: true,
                        data: { spellIndex: i, spell: spell },
                    },
                    `spell_${i}_bg`
                );

                this.addElementToLayout(
                    "spellSelection",
                    {
                        type: "text",
                        gameObject: spellText,
                        visible: true,
                        interactive: false,
                        data: { spellIndex: i },
                    },
                    `spell_${i}_name`
                );

                this.addElementToLayout(
                    "spellSelection",
                    {
                        type: "text",
                        gameObject: costText,
                        visible: true,
                        interactive: false,
                        data: { spellIndex: i },
                    },
                    `spell_${i}_cost`
                );
            }

            this.activateLayout("spellSelection");
            return success("spellSelection");
        } catch (error) {
            return failure(`Failed to create spell selection UI: ${error}`);
        }
    }

    /**
     * Show damage number animation
     */
    public showDamageNumber(
        x: number,
        y: number,
        damage: number,
        damageType: "physical" | "magic"
    ): void {
        if (!this.scene) return;

        const color = damageType === "magic" ? "#ff00ff" : "#ff0000";
        const damageText = this.scene.add
            .text(x, y - 40, `-${damage}`, {
                fontSize: "20px",
                color: color,
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(1001);

        this.scene.tweens.add({
            targets: damageText,
            y: y - 80,
            alpha: 0,
            duration: 1500,
            ease: "Power2",
            onComplete: () => {
                damageText.destroy();
            },
        });
    }

    /**
     * Show floating text
     */
    public showFloatingText(
        x: number,
        y: number,
        text: string,
        color: string = "#ffffff"
    ): void {
        if (!this.scene) return;

        const floatingText = this.scene.add
            .text(x, y, text, {
                fontSize: "16px",
                color: color,
                stroke: "#000000",
                strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setDepth(1001);

        this.scene.tweens.add({
            targets: floatingText,
            y: y - 50,
            alpha: 0,
            duration: 2000,
            ease: "Power2",
            onComplete: () => {
                floatingText.destroy();
            },
        });
    }

    /**
     * Get element by ID
     */
    public getElement(elementId: string): UIElement | undefined {
        return this.elements.get(elementId);
    }

    /**
     * Get layout by name
     */
    public getLayout(name: string): UILayout | undefined {
        return this.layouts.get(name);
    }

    /**
     * Clear all layouts and elements
     */
    public clearAllLayouts(): void {
        for (const layout of this.layouts.values()) {
            this.hideLayoutElements(layout);
        }
        this.layouts.clear();
        this.elements.clear();
    }

    private setupEventListeners(): void {
        // Listen for state changes
        const unsubscribePlayer = stateManager.subscribe(
            "player",
            (playerState) => {
                if (playerState?.stats) {
                    this.updatePlayerStatsUI(playerState.stats);
                }
            }
        );

        // Listen for damage events
        const unsubscribeDamage = eventBus.on(
            GameEvent.COMBAT_DAMAGE_DEALT,
            (data) => {
                // UI will show damage numbers based on entity positions
                // This would be implemented with entity position lookup
            }
        );

        this.eventListeners.push(unsubscribePlayer, unsubscribeDamage);
    }

    private cleanupEventListeners(): void {
        this.eventListeners.forEach((unsubscribe) => unsubscribe());
        this.eventListeners = [];
    }

    private setupSceneEventHandlers(): void {
        if (!this.scene) return;

        // Handle scene shutdown
        this.scene.events.once("shutdown", () => {
            this.clearAllLayouts();
        });
    }

    private showLayoutElements(layout: UILayout): void {
        for (const element of layout.elements) {
            if (element.gameObject && element.visible) {
                element.gameObject.setVisible(true);
                if (element.interactive && element.gameObject.input) {
                    element.gameObject.input.enabled = true;
                }
            }
        }
    }

    private hideLayoutElements(layout: UILayout): void {
        for (const element of layout.elements) {
            if (element.gameObject) {
                element.gameObject.setVisible(false);
                if (element.gameObject.input) {
                    element.gameObject.input.enabled = false;
                }
            }
        }
    }
}

