import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class Warrior extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 4,
            maxHealth: 4,
            moveRange: 3,
            attackRange: 1, // Melee only
            force: 2, // Strong melee
            dexterity: 0, // No ranged
            armor: 0, // No armor
            actionPoints: 2,
            maxActionPoints: 2,
            movementPoints: 3,
            maxMovementPoints: 3,
        };

        super(scene, gridX, gridY, stats, "Warrior");
    }

    protected createSprite(): void {
        // Use the skeleton warrior sprite
        this.sprite = this.scene.add.sprite(0, 0, "skeleton_warrior");
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
        return 0xff4444; // Red
    }

    protected getOutlineColor(): number {
        return 0xaa2222; // Dark red
    }

    protected getLabel(): string {
        return "W";
    }
}

