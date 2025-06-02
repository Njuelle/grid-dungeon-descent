import { GameProgress } from "./GameProgress";

export interface DifficultyModifiers {
    enemyHealthMultiplier: number;
    enemyDamageMultiplier: number;
    enemyArmorBonus: number;
    enemyCount: number;
    enemyMoveRangeBonus: number;
}

export class DifficultyScaling {
    public static getDifficultyModifiers(): DifficultyModifiers {
        const progress = GameProgress.getInstance();
        const wins = progress.getWins();

        // Base difficulty
        const baseModifiers: DifficultyModifiers = {
            enemyHealthMultiplier: 1.0,
            enemyDamageMultiplier: 1.0,
            enemyArmorBonus: 0,
            enemyCount: 5,
            enemyMoveRangeBonus: 0,
        };

        // Scale difficulty based on wins
        if (wins === 0) {
            // First game - tutorial
            return {
                enemyHealthMultiplier: 0.7,
                enemyDamageMultiplier: 0.7,
                enemyArmorBonus: 0,
                enemyCount: 3,
                enemyMoveRangeBonus: 0,
            };
        }

        // Progressive scaling with slower ramp-up and extended progression
        let scaleFactor = wins;

        // Different scaling rates for different aspects - REDUCED FOR BETTER BALANCE
        const healthScale =
            wins <= 5 ? 0.06 : wins <= 10 ? 0.08 : wins <= 15 ? 0.07 : 0.06; // Was: 0.08, 0.12, 0.10, 0.08
        const damageScale =
            wins <= 5 ? 0.05 : wins <= 10 ? 0.06 : wins <= 15 ? 0.055 : 0.05; // Was: 0.06, 0.08, 0.07, 0.06

        return {
            enemyHealthMultiplier: 1.0 + scaleFactor * healthScale,
            enemyDamageMultiplier: 1.0 + scaleFactor * damageScale,
            enemyArmorBonus: Math.floor(scaleFactor / 5), // +1 armor every 5 wins (was 4)
            enemyCount: Math.min(3 + Math.floor(scaleFactor / 3), 8), // Max 8 enemies (was 10)
            enemyMoveRangeBonus: Math.floor(scaleFactor / 6), // +1 move range every 6 wins (was 5)
        };
    }

    public static getDifficultyDescription(): string {
        const progress = GameProgress.getInstance();
        const wins = progress.getWins();

        if (wins === 0) return "Tutorial";
        if (wins === 1) return "Beginner";
        if (wins <= 3) return "Easy";
        if (wins <= 5) return "Normal";
        if (wins <= 7) return "Challenging";
        if (wins <= 9) return "Hard";
        if (wins <= 12) return "Very Hard";
        if (wins <= 15) return "Extreme";
        if (wins <= 18) return "Nightmare";
        if (wins <= 21) return "Inferno";
        if (wins <= 25) return "Apocalypse";
        return "Legendary";
    }

    public static getEnemyTypeDistribution(wins: number): {
        warrior: number;
        archer: number;
        tank: number;
        magician: number;
        gobelin: number;
        necromancer: number;
        ogre: number;
        troll: number;
    } {
        // More gradual enemy composition progression
        if (wins === 0) {
            // Tutorial - simple enemies only
            return {
                warrior: 2,
                archer: 1,
                tank: 0,
                magician: 0,
                gobelin: 0,
                necromancer: 0,
                ogre: 0,
                troll: 0,
            };
        } else if (wins === 1) {
            // Beginner - introduce goblins
            return {
                warrior: 2,
                archer: 1,
                tank: 0,
                magician: 0,
                gobelin: 1,
                necromancer: 0,
                ogre: 0,
                troll: 0,
            };
        } else if (wins <= 3) {
            // Easy - introduce tanks
            return {
                warrior: 2,
                archer: 1,
                tank: 1,
                magician: 0,
                gobelin: 1,
                necromancer: 0,
                ogre: 0,
                troll: 0,
            };
        } else if (wins <= 5) {
            // Normal - introduce magicians
            return {
                warrior: 1,
                archer: 1,
                tank: 1,
                magician: 1,
                gobelin: 1,
                necromancer: 0,
                ogre: 0,
                troll: 0,
            };
        } else if (wins <= 7) {
            // Challenging - introduce ogres and trolls
            return {
                warrior: 1,
                archer: 1,
                tank: 1,
                magician: 1,
                gobelin: 1,
                necromancer: 0,
                ogre: 1,
                troll: 1,
            };
        } else if (wins <= 9) {
            // Hard - introduce necromancers BUT KEEP SOME WARRIORS
            return {
                warrior: 1, // Keep 1 warrior for balance (was 0)
                archer: 1,
                tank: 1,
                magician: 1,
                gobelin: 2,
                necromancer: 1,
                ogre: 1,
                troll: 0, // Reduced troll count (was 1)
            };
        } else if (wins <= 12) {
            // Very Hard - more specialized units BUT KEEP SOME WEAKER ONES
            return {
                warrior: 1, // Keep 1 warrior (was 0)
                archer: 1,
                tank: 1, // Reduced from 2
                magician: 2,
                gobelin: 2,
                necromancer: 1,
                ogre: 1,
                troll: 1,
            };
        } else if (wins <= 15) {
            // Extreme - heavy magic composition
            return {
                warrior: 1, // Keep 1 warrior (was 0)
                archer: 1,
                tank: 1,
                magician: 2,
                gobelin: 2, // Reduced from 3
                necromancer: 1, // Reduced from 2
                ogre: 1,
                troll: 1,
            };
        } else if (wins <= 18) {
            // Nightmare - brutal combinations
            return {
                warrior: 0,
                archer: 1,
                tank: 2,
                magician: 2,
                gobelin: 2, // Reduced from 3
                necromancer: 2,
                ogre: 1, // Reduced from 2
                troll: 1, // Reduced from 2
            };
        } else if (wins <= 21) {
            // Inferno - overwhelming force
            return {
                warrior: 0,
                archer: 1,
                tank: 2,
                magician: 2, // Reduced from 3
                gobelin: 3, // Reduced from 4
                necromancer: 2, // Reduced from 3
                ogre: 2,
                troll: 1, // Reduced from 2
            };
        } else if (wins <= 25) {
            // Apocalypse - maximum variety
            return {
                warrior: 0,
                archer: 2,
                tank: 2, // Reduced from 3
                magician: 3,
                gobelin: 3, // Reduced from 4
                necromancer: 2, // Reduced from 3
                ogre: 2, // Reduced from 3
                troll: 2, // Reduced from 3
            };
        } else {
            // Legendary - endgame composition
            return {
                warrior: 0,
                archer: 2,
                tank: 3,
                magician: 3, // Reduced from 4
                gobelin: 4, // Reduced from 5
                necromancer: 3, // Reduced from 4
                ogre: 2, // Reduced from 3
                troll: 2, // Reduced from 3
            };
        }
    }
}

