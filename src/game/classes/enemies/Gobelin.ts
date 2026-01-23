import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class Gobelin extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 2, // Very weak (weaker than Archer's 3)
            maxHealth: 2,
            moveRange: 5, // High mobility (higher than all others)
            attackRange: 1, // Melee only (like Warrior)
            force: 1, // Weak attack (weaker than Warrior's 2)
            dexterity: 1, // Some agility
            armor: 0, // No armor (glass cannon)
            actionPoints: 2,
            maxActionPoints: 2,
            movementPoints: 5,
            maxMovementPoints: 5,
        };

        super(scene, gridX, gridY, stats, "Gobelin");
    }

    protected createSprite(): void {
        // Use the gobelin sprite
        this.sprite = this.scene.add.sprite(0, 0, "gobelin_idle");
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
        return 0x44ff44; // Green for goblin
    }

    protected getOutlineColor(): number {
        return 0x228822; // Dark green
    }

    protected getLabel(): string {
        return "G";
    }
}
