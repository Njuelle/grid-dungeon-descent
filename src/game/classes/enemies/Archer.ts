import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class Archer extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 3,
            maxHealth: 3,
            moveRange: 2,
            attackRange: 3, // Ranged
            force: 0, // Weak melee
            dexterity: 2, // Good ranged
            armor: 0, // No armor
            actionPoints: 2,
            maxActionPoints: 2,
            movementPoints: 2,
            maxMovementPoints: 2,
        };

        super(scene, gridX, gridY, stats, "Archer");
    }

    protected createSprite(): void {
        // Use the skeleton archer sprite
        this.sprite = this.scene.add.sprite(0, 0, "skeleton_archer");
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
        return 0xff8844; // Orange
    }

    protected getOutlineColor(): number {
        return 0xcc6622; // Dark orange
    }

    protected getLabel(): string {
        return "A";
    }
}

