/**
 * RenderSystem - Handles visual rendering for entities
 *
 * Manages sprite creation, positioning, animations, and visual updates
 */

import { System } from "../Entity";
import {
    PositionComponent,
    RenderComponent,
    StatsComponent,
    TeamComponent,
    UIComponent,
} from "../Component";
import { Scene } from "phaser";

export class RenderSystem extends System {
    private scene: Scene;
    private gridSize: number = 10;
    private tileSize: number = 64;

    constructor(scene: Scene) {
        super();
        this.scene = scene;
    }

    public update(deltaTime: number): void {
        // Update sprite positions for entities that need it
        const renderableEntities = this.getEntitiesWithComponents(
            "position",
            "render"
        );

        for (const entity of renderableEntities) {
            const position =
                entity.getComponent<PositionComponent>("position")!;
            const render = entity.getComponent<RenderComponent>("render")!;

            // Update world position if grid position changed
            const newWorldPos = this.gridToWorld(
                position.gridX,
                position.gridY
            );

            if (
                position.worldX !== newWorldPos.x ||
                position.worldY !== newWorldPos.y
            ) {
                position.worldX = newWorldPos.x;
                position.worldY = newWorldPos.y;

                // Update sprite position
                if (render.sprite) {
                    render.sprite.x = position.worldX;
                    render.sprite.y = position.worldY;
                }

                if (render.labelText) {
                    render.labelText.x = position.worldX;
                    render.labelText.y = position.worldY;
                }

                // Update health bar position for UI component
                const ui = entity.getComponent<UIComponent>("ui");
                if (ui?.healthBar) {
                    this.updateHealthBarPosition(
                        ui.healthBar,
                        position.worldX,
                        position.worldY
                    );
                }
            }
        }
    }

    /**
     * Create sprite for an entity
     */
    public createSprite(entityId: string): void {
        const entity = this.world.getEntity(entityId);
        if (!entity) return;

        const render = entity.getComponent<RenderComponent>("render");
        const position = entity.getComponent<PositionComponent>("position");
        const team = entity.getComponent<TeamComponent>("team");

        if (!render || !position) return;

        // Destroy existing sprite if any
        this.destroySprite(entityId);

        if (team?.team === "player") {
            this.createPlayerSprite(render, position);
        } else {
            this.createEnemySprite(render, position, entity.id);
        }

        // Set depth
        if (render.sprite) {
            render.sprite.setDepth(render.depth || 2);
            render.sprite.setData("entityId", entityId);
        }

        // Create label text if needed
        if (render.labelText) {
            render.labelText.setDepth((render.depth || 2) + 1);
        }
    }

    /**
     * Create player sprite
     */
    private createPlayerSprite(
        render: RenderComponent,
        position: PositionComponent
    ): void {
        const spriteName = render.spriteName || "hero_warrior";

        render.sprite = this.scene.add.sprite(
            position.worldX,
            position.worldY,
            spriteName
        );
        render.sprite.setInteractive();

        // Scale the sprite to fit the tile size
        const tileSize = 64;
        const scaleX = tileSize / render.sprite.width;
        const scaleY = tileSize / render.sprite.height;
        const baseScale = Math.min(scaleX, scaleY);

        // Make player sprite 20% larger
        render.sprite.setScale(baseScale * 1.2 * (render.scale || 1));

        // Create empty label text (players don't need visible labels)
        render.labelText = this.scene.add
            .text(position.worldX, position.worldY, "", { fontSize: "1px" })
            .setOrigin(0.5);
    }

    /**
     * Create enemy sprite
     */
    private createEnemySprite(
        render: RenderComponent,
        position: PositionComponent,
        entityId: string
    ): void {
        const unitGraphics = this.scene.add.graphics();

        // Enemy: Circle shape with type-specific colors
        const color = render.color || 0xff6666;
        const outlineColor = render.outlineColor || 0xaa4444;

        unitGraphics.fillStyle(color);
        unitGraphics.lineStyle(3, outlineColor);
        unitGraphics.fillCircle(0, 0, 20);
        unitGraphics.strokeCircle(0, 0, 20);

        // Generate unique texture
        const textureKey = `enemy_${entityId}`;
        unitGraphics.generateTexture(textureKey, 40, 40);
        unitGraphics.destroy();

        render.sprite = this.scene.add.sprite(
            position.worldX,
            position.worldY,
            textureKey
        );
        render.sprite.setInteractive();
        render.sprite.setScale(render.scale || 1);

        // Create label text for enemy
        const labelText = this.getEnemyLabel(entityId);
        render.labelText = this.scene.add
            .text(position.worldX, position.worldY, labelText, {
                fontSize: "16px",
                color: "#ffffff",
                fontStyle: "bold",
            })
            .setOrigin(0.5);
    }

    /**
     * Get label text for enemy based on entity components
     */
    private getEnemyLabel(entityId: string): string {
        const entity = this.world.getEntity(entityId);
        if (!entity) return "?";

        // Try to get AI component for enemy type
        const ai = entity.getComponent("ai");
        if (ai && (ai as any).enemyType) {
            const enemyType = (ai as any).enemyType;
            // Return first letter of enemy type
            return enemyType.charAt(0).toUpperCase();
        }

        return "E";
    }

    /**
     * Destroy sprite for an entity
     */
    public destroySprite(entityId: string): void {
        const entity = this.world.getEntity(entityId);
        if (!entity) return;

        const render = entity.getComponent<RenderComponent>("render");
        if (!render) return;

        if (render.sprite) {
            render.sprite.destroy();
            render.sprite = undefined;
        }

        if (render.graphics) {
            render.graphics.destroy();
            render.graphics = undefined;
        }

        if (render.labelText) {
            render.labelText.destroy();
            render.labelText = undefined;
        }
    }

    /**
     * Update sprite visual state (for damage effects, etc.)
     */
    public updateSpriteState(
        entityId: string,
        state: "normal" | "damaged" | "highlighted"
    ): void {
        const entity = this.world.getEntity(entityId);
        if (!entity) return;

        const render = entity.getComponent<RenderComponent>("render");
        if (!render?.sprite) return;

        switch (state) {
            case "damaged":
                // Flash red and scale briefly
                this.scene.tweens.add({
                    targets: render.sprite,
                    scaleX: (render.scale || 1) * 1.2,
                    scaleY: (render.scale || 1) * 1.2,
                    tint: 0xff0000,
                    duration: 150,
                    yoyo: true,
                    onComplete: () => {
                        if (render.sprite) {
                            render.sprite.clearTint();
                        }
                    },
                });
                break;

            case "highlighted":
                render.sprite.setTint(0xffff00); // Yellow highlight
                break;

            case "normal":
                render.sprite.clearTint();
                break;
        }
    }

    /**
     * Animate movement along a path
     */
    public animateMovement(
        entityId: string,
        path: { x: number; y: number }[],
        onComplete?: () => void
    ): void {
        const entity = this.world.getEntity(entityId);
        if (!entity || !path.length) {
            if (onComplete) onComplete();
            return;
        }

        const render = entity.getComponent<RenderComponent>("render");
        const position = entity.getComponent<PositionComponent>("position");

        if (!render?.sprite || !position) {
            if (onComplete) onComplete();
            return;
        }

        let stepIndex = 0;
        const moveToNextStep = () => {
            if (stepIndex >= path.length) {
                if (onComplete) onComplete();
                return;
            }

            const step = path[stepIndex];
            const worldPos = this.gridToWorld(step.x, step.y);

            this.scene.tweens.add({
                targets: render.sprite,
                x: worldPos.x,
                y: worldPos.y,
                duration: 200,
                ease: "Linear",
                onUpdate: () => {
                    if (render.labelText) {
                        render.labelText.x = render.sprite!.x;
                        render.labelText.y = render.sprite!.y;
                    }
                },
                onComplete: () => {
                    // Update position component
                    position.gridX = step.x;
                    position.gridY = step.y;
                    position.worldX = worldPos.x;
                    position.worldY = worldPos.y;

                    stepIndex++;
                    this.scene.time.delayedCall(10, moveToNextStep);
                },
            });
        };

        moveToNextStep();
    }

    /**
     * Convert grid coordinates to world coordinates
     */
    private gridToWorld(
        gridX: number,
        gridY: number
    ): { x: number; y: number } {
        const startX =
            (this.scene.scale.width - this.gridSize * this.tileSize) / 2;
        const startY =
            (this.scene.scale.height - this.gridSize * this.tileSize) / 2 - 50;

        return {
            x: startX + gridX * this.tileSize + this.tileSize / 2,
            y: startY + gridY * this.tileSize + this.tileSize / 2,
        };
    }

    /**
     * Update health bar position
     */
    private updateHealthBarPosition(
        healthBar: Phaser.GameObjects.Graphics,
        x: number,
        y: number
    ): void {
        // Health bars are handled by UISystem, but we update position here
        // This is called from the main update loop when positions change
    }
}

