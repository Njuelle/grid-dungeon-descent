import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class Tank extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 6,
            maxHealth: 6,
            moveRange: 1,
            attackRange: 1, // Melee only
            force: 1, // Average melee
            dexterity: 0, // No ranged
            armor: 2, // Heavy armor
            actionPoints: 2,
            maxActionPoints: 2,
            movementPoints: 1,
            maxMovementPoints: 1,
        };

        super(scene, gridX, gridY, stats, "Tank");
    }

    protected createSprite(): void {
        // Use the skeleton tank sprite
        this.sprite = this.scene.add.sprite(0, 0, "skeleton_tank");
        this.sprite.setInteractive();
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2);

        // Scale the sprite to fit the full tile size (64x64)
        const tileSize = 64;
        const scaleX = tileSize / this.sprite.width;
        const scaleY = tileSize / this.sprite.height;
        this.sprite.setScale(Math.min(scaleX, scaleY));

        // No label text needed since we have a proper sprite
        this.labelText = this.scene.add
            .text(0, 0, "", { fontSize: "1px" })
            .setOrigin(0.5)
            .setDepth(3);
    }

    protected getColor(): number {
        return 0x884444; // Dark red
    }

    protected getOutlineColor(): number {
        return 0x662222; // Very dark red
    }

    protected getLabel(): string {
        return "T";
    }
}

