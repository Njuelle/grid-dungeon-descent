import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class FrostMage extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 5,
            maxHealth: 5,
            moveRange: 2, // Slow
            attackRange: 4, // Long range
            force: 0,
            dexterity: 0,
            intelligence: 3, // Strong magic
            armor: 0,
            magicResistance: 1, // Some magic defense
            actionPoints: 2,
            maxActionPoints: 2,
            movementPoints: 2,
            maxMovementPoints: 2,
        };

        super(scene, gridX, gridY, stats, "FrostMage");
    }

    protected createSprite(): void {
        // Use the frost mage sprite
        this.sprite = this.scene.add.sprite(0, 0, "frost_mage_idle");
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

    // Override to use intelligence for damage
    public getAttackDamage(): number {
        const baseDamage = 2; // Base frost damage
        const statBonus = this.intelligence;

        // Add some randomness
        const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
        return Math.round((baseDamage + statBonus) * randomFactor);
    }

    protected getColor(): number {
        return 0x87ceeb; // Sky blue for frost mage
    }

    protected getOutlineColor(): number {
        return 0x4682b4; // Steel blue
    }

    protected getLabel(): string {
        return "FM";
    }
}
