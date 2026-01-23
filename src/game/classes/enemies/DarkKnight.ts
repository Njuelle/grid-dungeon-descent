import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class DarkKnight extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 9,
            maxHealth: 9,
            moveRange: 2, // Moderate
            attackRange: 1, // Melee
            force: 2, // Decent damage
            dexterity: 0,
            armor: 2, // Heavy armor
            magicResistance: 1, // Some magic defense
            actionPoints: 2,
            maxActionPoints: 2,
            movementPoints: 2,
            maxMovementPoints: 2,
        };

        super(scene, gridX, gridY, stats, "DarkKnight");
    }

    protected createSprite(): void {
        // Use the dark knight sprite
        this.sprite = this.scene.add.sprite(0, 0, "dark_knight_idle");
        this.sprite.setInteractive();
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2);

        // Scale the sprite to fit the full tile size (64x64)
        const tileSize = 64;
        const scaleX = tileSize / this.sprite.width;
        const scaleY = tileSize / this.sprite.height;
        // Make dark knight slightly larger to emphasize its bulk
        this.sprite.setScale(Math.min(scaleX, scaleY) * 1.15);

        // No label text needed since we have a proper sprite
        this.labelText = this.scene.add
            .text(0, 0, "", { fontSize: "1px" })
            .setOrigin(0.5)
            .setDepth(3);
    }

    protected getColor(): number {
        return 0x2f1f3f; // Dark purple for dark knight
    }

    protected getOutlineColor(): number {
        return 0x1a0f2a; // Very dark purple
    }

    protected getLabel(): string {
        return "DK";
    }
}
