import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class Necromancer extends Enemy {
    constructor(scene: Scene, gridX: number, gridY: number) {
        const stats: UnitStats = {
            health: 6, // Medium health (between Magician's 8 and Warrior's 4)
            maxHealth: 6,
            moveRange: 2, // Slower than Magician (3) but faster than Tank
            attackRange: 5, // Long range magic (more than Magician's 4)
            force: 0, // No melee
            dexterity: 0, // No ranged physical
            intelligence: 5, // High magic damage (more than Magician's 3)
            armor: 0, // No physical armor
            magicResistance: 2, // Good magic resistance (unique trait)
        };

        super(scene, gridX, gridY, stats, "Necromancer");
    }

    protected createSprite(): void {
        // Use the necromancer sprite
        this.sprite = this.scene.add.sprite(0, 0, "necromancer_idle");
        this.sprite.setInteractive();
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2);

        // Scale the sprite to fit the full tile size (64x64)
        const tileSize = 64;
        const scaleX = tileSize / this.sprite.width;
        const scaleY = tileSize / this.sprite.height;
        this.sprite.setScale(Math.min(scaleX, scaleY) * 1.1); // Slightly larger to emphasize magical power

        // No label text needed since we have a proper sprite
        this.labelText = this.scene.add
            .text(0, 0, "", { fontSize: "1px" })
            .setOrigin(0.5)
            .setDepth(3);
    }

    protected getColor(): number {
        return 0x4b0082; // Indigo for necromancer
    }

    protected getOutlineColor(): number {
        return 0x2d004b; // Dark purple
    }

    protected getLabel(): string {
        return "N";
    }

    // Override to use intelligence for damage
    public getAttackDamage(): number {
        const baseDamage = 3; // Higher base magic damage than Magician
        const statBonus = this.intelligence || 0; // Use intelligence

        // Add some randomness
        const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
        return Math.round((baseDamage + statBonus) * randomFactor);
    }

    // Getter for intelligence (if needed)
    public get intelligence(): number {
        return this.stats.intelligence || 0;
    }
}

