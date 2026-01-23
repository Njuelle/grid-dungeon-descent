import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class Troll extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 8, // High health like tank
            maxHealth: 8,
            moveRange: 2, // Moderate movement
            attackRange: 1, // Melee only
            force: 2, // Decent physical damage
            dexterity: 0, // No ranged
            armor: 1, // Some physical protection
            magicResistance: 3, // Very high magic resistance (higher than necromancer's 2)
            actionPoints: 2,
            maxActionPoints: 2,
            movementPoints: 2,
            maxMovementPoints: 2,
        };

        super(scene, gridX, gridY, stats, "Troll");
    }

    protected createSprite(): void {
        // Use the troll sprite
        this.sprite = this.scene.add.sprite(0, 0, "troll_idle");
        this.sprite.setInteractive();
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2);

        // Scale the sprite to fit the full tile size (64x64)
        const tileSize = 64;
        const scaleX = tileSize / this.sprite.width;
        const scaleY = tileSize / this.sprite.height;
        // Make troll larger to emphasize its bulk and intimidating presence
        this.sprite.setScale(Math.min(scaleX, scaleY) * 1.3);

        // No label text needed since we have a proper sprite
        this.labelText = this.scene.add
            .text(0, 0, "", { fontSize: "1px" })
            .setOrigin(0.5)
            .setDepth(3);
    }

    protected getColor(): number {
        return 0x556b2f; // Dark olive green for troll
    }

    protected getOutlineColor(): number {
        return 0x2f4f2f; // Dark sea green
    }

    protected getLabel(): string {
        return "T";
    }
}

