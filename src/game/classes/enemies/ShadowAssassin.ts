import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class ShadowAssassin extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 4,
            maxHealth: 4,
            moveRange: 4, // High mobility
            attackRange: 1, // Melee only
            force: 3, // High damage
            dexterity: 0,
            armor: 0, // Vulnerable
            actionPoints: 2,
            maxActionPoints: 2,
            movementPoints: 4,
            maxMovementPoints: 4,
        };

        super(scene, gridX, gridY, stats, "ShadowAssassin");
    }

    protected createSprite(): void {
        // Use the assassin sprite
        this.sprite = this.scene.add.sprite(0, 0, "assassin_idle");
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
        return 0x2f2f2f; // Dark gray for shadow assassin
    }

    protected getOutlineColor(): number {
        return 0x1a1a1a; // Very dark gray
    }

    protected getLabel(): string {
        return "SA";
    }
}
