import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class Ogre extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 10, // Very high health (highest of all enemies)
            maxHealth: 10,
            moveRange: 2, // Slower than warrior (3) but faster than tank (1)
            attackRange: 1, // Melee only
            force: 3, // Stronger than warrior (2)
            dexterity: 0, // No ranged
            armor: 1, // Some armor (less than tank's 2)
        };

        super(scene, gridX, gridY, stats, "Ogre");
    }

    protected createSprite(): void {
        // Use the ogre sprite
        this.sprite = this.scene.add.sprite(0, 0, "ogre_idle");
        this.sprite.setInteractive();
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2);

        // Scale the sprite to fit the full tile size (64x64)
        const tileSize = 64;
        const scaleX = tileSize / this.sprite.width;
        const scaleY = tileSize / this.sprite.height;
        // Make ogre larger to emphasize its bulk and intimidating presence
        this.sprite.setScale(Math.min(scaleX, scaleY) * 1.3);

        // No label text needed since we have a proper sprite
        this.labelText = this.scene.add
            .text(0, 0, "", { fontSize: "1px" })
            .setOrigin(0.5)
            .setDepth(3);
    }

    protected getColor(): number {
        return 0x8b4513; // Saddle brown for ogre
    }

    protected getOutlineColor(): number {
        return 0x654321; // Dark brown
    }

    protected getLabel(): string {
        return "O";
    }
}

