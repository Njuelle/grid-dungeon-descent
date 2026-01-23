import { GameProgress } from "./GameProgress";

export interface DifficultyModifiers {
    enemyHealthMultiplier: number;
    enemyDamageMultiplier: number;
    enemyArmorBonus: number;
    enemyCount: number;
    enemyMoveRangeBonus: number;
    enemyAPBonus: number;
    enemyMPBonus: number;
}

export class DifficultyScaling {
    public static getDifficultyModifiers(): DifficultyModifiers {
        const progress = GameProgress.getInstance();
        const wins = progress.getWins();

        // Scale difficulty based on wins
        if (wins === 0) {
            // First game - tutorial
            return {
                enemyHealthMultiplier: 0.7,
                enemyDamageMultiplier: 0.7,
                enemyArmorBonus: 0,
                enemyCount: 3,
                enemyMoveRangeBonus: 0,
                enemyAPBonus: 0,
                enemyMPBonus: 0,
            };
        }

        // Progressive scaling with balanced ramp-up
        let scaleFactor = wins;

        // Different scaling rates - balanced between easy and hard
        const healthScale =
            wins <= 5 ? 0.05 : wins <= 10 ? 0.065 : wins <= 15 ? 0.055 : 0.05;
        const damageScale =
            wins <= 5 ? 0.04 : wins <= 10 ? 0.05 : wins <= 15 ? 0.045 : 0.04;

        return {
            enemyHealthMultiplier: 1.0 + scaleFactor * healthScale,
            enemyDamageMultiplier: 1.0 + scaleFactor * damageScale,
            enemyArmorBonus: Math.floor(scaleFactor / 6), // +1 armor every 6 wins
            enemyCount: Math.min(3 + Math.floor(scaleFactor / 4), 7), // Max 7 enemies
            enemyMoveRangeBonus: Math.floor(scaleFactor / 7), // +1 move range every 7 wins
            enemyAPBonus: Math.floor(scaleFactor / 8), // +1 AP every 8 wins
            enemyMPBonus: Math.floor(scaleFactor / 10), // +1 MP every 10 wins
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
        if (wins <= 10) return "Hard";
        if (wins <= 14) return "Very Hard";
        if (wins <= 18) return "Extreme";
        if (wins <= 22) return "Nightmare";
        if (wins <= 26) return "Inferno";
        if (wins <= 30) return "Apocalypse";
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
            // Challenging - introduce ogres (no trolls yet)
            return {
                warrior: 1,
                archer: 1,
                tank: 1,
                magician: 1,
                gobelin: 1,
                necromancer: 0,
                ogre: 1,
                troll: 0, // Delay trolls
            };
        } else if (wins <= 10) {
            // Hard - introduce necromancers and trolls
            return {
                warrior: 1, // Keep weaker enemies
                archer: 1,
                tank: 1,
                magician: 1,
                gobelin: 1,
                necromancer: 1,
                ogre: 1,
                troll: 1,
            };
        } else if (wins <= 14) {
            // Very Hard - more specialized units
            return {
                warrior: 1,
                archer: 1,
                tank: 1,
                magician: 1,
                gobelin: 2,
                necromancer: 1,
                ogre: 1,
                troll: 1,
            };
        } else if (wins <= 18) {
            // Extreme - heavier composition
            return {
                warrior: 1,
                archer: 1,
                tank: 1,
                magician: 2,
                gobelin: 2,
                necromancer: 1,
                ogre: 1,
                troll: 1,
            };
        } else if (wins <= 22) {
            // Nightmare - tough combinations
            return {
                warrior: 1,
                archer: 1,
                tank: 2,
                magician: 2,
                gobelin: 2,
                necromancer: 1,
                ogre: 1,
                troll: 1,
            };
        } else if (wins <= 26) {
            // Inferno - strong force
            return {
                warrior: 1,
                archer: 1,
                tank: 2,
                magician: 2,
                gobelin: 2,
                necromancer: 2,
                ogre: 2,
                troll: 1,
            };
        } else if (wins <= 30) {
            // Apocalypse - heavy variety
            return {
                warrior: 1,
                archer: 2,
                tank: 2,
                magician: 2,
                gobelin: 3,
                necromancer: 2,
                ogre: 2,
                troll: 2,
            };
        } else {
            // Legendary - endgame composition
            return {
                warrior: 1, // Keep some weaker enemies even at endgame
                archer: 2,
                tank: 2,
                magician: 3,
                gobelin: 3,
                necromancer: 2,
                ogre: 2,
                troll: 2,
            };
        }
    }
}

