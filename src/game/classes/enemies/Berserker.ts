import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class Berserker extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 7,
            maxHealth: 7,
            moveRange: 3, // Moderate
            attackRange: 1, // Melee
            force: 2, // Base damage
            dexterity: 0,
            armor: 0, // No defense
            actionPoints: 2,
            maxActionPoints: 2,
            movementPoints: 3,
            maxMovementPoints: 3,
        };

        super(scene, gridX, gridY, stats, "Berserker");
    }

    protected createSprite(): void {
        // Use the berserker sprite
        this.sprite = this.scene.add.sprite(0, 0, "berserker_idle");
        this.sprite.setInteractive();
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2);

        // Scale the sprite to fit the full tile size (64x64)
        const tileSize = 64;
        const scaleX = tileSize / this.sprite.width;
        const scaleY = tileSize / this.sprite.height;
        // Make berserker slightly larger to emphasize its bulk
        this.sprite.setScale(Math.min(scaleX, scaleY) * 1.1);

        // No label text needed since we have a proper sprite
        this.labelText = this.scene.add
            .text(0, 0, "", { fontSize: "1px" })
            .setOrigin(0.5)
            .setDepth(3);
    }

    protected getColor(): number {
        return 0x8b0000; // Dark red for berserker
    }

    protected getOutlineColor(): number {
        return 0x5c0000; // Very dark red
    }

    protected getLabel(): string {
        return "BK";
    }
}
