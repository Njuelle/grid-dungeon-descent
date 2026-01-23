import { Scene } from "phaser";
import { Enemy } from "../Enemy";
import { UnitStats } from "../Unit";

export class Magician extends Enemy {
    // enemyType is set in the Enemy constructor if not passed, or can be overridden here if needed
    // public enemyType = "Magician";

    constructor(scene: Scene, gridX: number, gridY: number) {
        const baseStats: UnitStats = {
            health: 8,
            maxHealth: 8,
            moveRange: 3,
            attackRange: 4,
            force: 1,
            dexterity: 1,
            intelligence: 2, // This will be used by the getter in Enemy class
            armor: 0,
            actionPoints: 2,
            maxActionPoints: 2,
            movementPoints: 3,
            maxMovementPoints: 3,
        };
        super(scene, gridX, gridY, baseStats, "Magician"); // Pass "Magician" as enemyType
    }

    protected createSprite(): void {
        this.sprite = this.scene.add.sprite(0, 0, "skeleton_magician_idle");
        this.sprite.setInteractive();
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2); // Ensure it's above floor/walls

        // Scale the sprite if necessary (assuming 64x64 tile size)
        const tileSize = 64;
        const scale =
            tileSize / Math.max(this.sprite.width, this.sprite.height);
        this.sprite.setScale(scale * 0.9); // Slightly smaller than full tile
    }

    // getEnemyType is inherited and correctly set by the constructor in Enemy.ts

    // Override to use intelligence for damage
    public getAttackDamage(): number {
        const baseDamage = 2; // Base magic damage
        const statBonus = this.intelligence; // Use the getter

        // Add some randomness
        const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
        return Math.round((baseDamage + statBonus) * randomFactor);
    }

    // Implement abstract methods from Enemy base class
    protected getColor(): number {
        return 0x8a2be2; // Example: BlueViolet for magician
    }

    protected getOutlineColor(): number {
        return 0x4b0082; // Example: Indigo for outline
    }

    protected getLabel(): string {
        return "M"; // Label for magician if its sprite doesn't load
    }

    // Optionally, if Magicians have a different attack type string for logging/display
    // public getAttackTypeString(): "melee" | "ranged" | "magic" {
    //     return "magic";
    // }
}

