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

export interface BossDifficultyModifiers {
    healthMultiplier: number;
    damageMultiplier: number;
    armorBonus: number;
    magicResistBonus: number;
    minionHealthMultiplier: number;
}

export class DifficultyScaling {
    public static getDifficultyModifiers(): DifficultyModifiers {
        const progress = GameProgress.getInstance();
        const wins = progress.getWins();

        // Scale difficulty based on wins
        // Slightly reduced to compensate for smarter enemy AI
        if (wins === 0) {
            // First game - tutorial
            return {
                enemyHealthMultiplier: 0.65,
                enemyDamageMultiplier: 0.65,
                enemyArmorBonus: 0,
                enemyCount: 3,
                enemyMoveRangeBonus: 0,
                enemyAPBonus: 0,
                enemyMPBonus: 0,
            };
        }

        // Progressive scaling with slightly gentler ramp-up
        let scaleFactor = wins;

        // Slightly reduced scaling rates to compensate for smarter enemy spell usage
        const healthScale =
            wins <= 5 ? 0.045 : wins <= 10 ? 0.055 : wins <= 15 ? 0.05 : 0.045;
        const damageScale =
            wins <= 5 ? 0.035 : wins <= 10 ? 0.045 : wins <= 15 ? 0.04 : 0.035;

        return {
            enemyHealthMultiplier: 0.95 + scaleFactor * healthScale,
            enemyDamageMultiplier: 0.9 + scaleFactor * damageScale,
            enemyArmorBonus: Math.floor(scaleFactor / 7), // +1 armor every 7 wins
            enemyCount: Math.min(3 + Math.floor(scaleFactor / 4), 7), // Max 7 enemies
            enemyMoveRangeBonus: Math.floor(scaleFactor / 8), // +1 move range every 8 wins
            enemyAPBonus: Math.floor(scaleFactor / 10), // +1 AP every 10 wins
            enemyMPBonus: Math.floor(scaleFactor / 12), // +1 MP every 12 wins
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

    /**
     * Get difficulty modifiers for boss battles.
     * Scaling is based on which boss encounter it is (1st, 2nd, 3rd, etc.)
     * All bosses are equally balanced, scaling applies uniformly.
     * 
     * Damage scales slowly to avoid one-shotting players.
     * 
     * | Encounter | HP Mult | Dmg Mult | Armor | MR |
     * |-----------|---------|----------|-------|-----|
     * | 1st       | 1.0x    | 1.0x     | +0    | +0  |
     * | 2nd       | 1.15x   | 1.05x    | +0    | +0  |
     * | 3rd       | 1.30x   | 1.10x    | +1    | +1  |
     * | 4th       | 1.45x   | 1.15x    | +1    | +1  |
     * | 5th       | 1.60x   | 1.20x    | +2    | +2  |
     */
    public static getBossDifficultyModifiers(encounterNumber?: number): BossDifficultyModifiers {
        const progress = GameProgress.getInstance();
        const encounter = encounterNumber ?? progress.getBossEncounterNumber();

        return {
            healthMultiplier: 1.0 + (encounter - 1) * 0.15,
            damageMultiplier: 1.0 + (encounter - 1) * 0.05,
            armorBonus: Math.floor((encounter - 1) / 2),
            magicResistBonus: Math.floor((encounter - 1) / 2),
            minionHealthMultiplier: 1.0 + (encounter - 1) * 0.10,
        };
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
        shadowAssassin: number;
        shaman: number;
        berserker: number;
        frostMage: number;
        darkKnight: number;
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
                shadowAssassin: 0,
                shaman: 0,
                berserker: 0,
                frostMage: 0,
                darkKnight: 0,
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
                shadowAssassin: 0,
                shaman: 0,
                berserker: 0,
                frostMage: 0,
                darkKnight: 0,
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
                shadowAssassin: 0,
                shaman: 0,
                berserker: 0,
                frostMage: 0,
                darkKnight: 0,
            };
        } else if (wins <= 5) {
            // Normal - introduce magicians and Shadow Assassin
            return {
                warrior: 1,
                archer: 1,
                tank: 1,
                magician: 1,
                gobelin: 1,
                necromancer: 0,
                ogre: 0,
                troll: 0,
                shadowAssassin: 1,
                shaman: 0,
                berserker: 0,
                frostMage: 0,
                darkKnight: 0,
            };
        } else if (wins <= 7) {
            // Challenging - introduce ogres and Shaman
            return {
                warrior: 1,
                archer: 1,
                tank: 1,
                magician: 1,
                gobelin: 1,
                necromancer: 0,
                ogre: 1,
                troll: 0,
                shadowAssassin: 1,
                shaman: 1,
                berserker: 0,
                frostMage: 0,
                darkKnight: 0,
            };
        } else if (wins <= 10) {
            // Hard - introduce necromancers, trolls, and Berserker
            return {
                warrior: 1,
                archer: 1,
                tank: 1,
                magician: 1,
                gobelin: 1,
                necromancer: 1,
                ogre: 1,
                troll: 1,
                shadowAssassin: 1,
                shaman: 1,
                berserker: 1,
                frostMage: 0,
                darkKnight: 0,
            };
        } else if (wins <= 14) {
            // Very Hard - introduce Frost Mage
            return {
                warrior: 1,
                archer: 1,
                tank: 1,
                magician: 1,
                gobelin: 2,
                necromancer: 1,
                ogre: 1,
                troll: 1,
                shadowAssassin: 1,
                shaman: 1,
                berserker: 1,
                frostMage: 1,
                darkKnight: 0,
            };
        } else if (wins <= 18) {
            // Extreme - introduce Dark Knight
            return {
                warrior: 1,
                archer: 1,
                tank: 1,
                magician: 2,
                gobelin: 2,
                necromancer: 1,
                ogre: 1,
                troll: 1,
                shadowAssassin: 1,
                shaman: 1,
                berserker: 1,
                frostMage: 1,
                darkKnight: 1,
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
                shadowAssassin: 2,
                shaman: 1,
                berserker: 1,
                frostMage: 1,
                darkKnight: 1,
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
                shadowAssassin: 2,
                shaman: 2,
                berserker: 2,
                frostMage: 1,
                darkKnight: 1,
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
                shadowAssassin: 2,
                shaman: 2,
                berserker: 2,
                frostMage: 2,
                darkKnight: 2,
            };
        } else {
            // Legendary - endgame composition
            return {
                warrior: 1,
                archer: 2,
                tank: 2,
                magician: 3,
                gobelin: 3,
                necromancer: 2,
                ogre: 2,
                troll: 2,
                shadowAssassin: 3,
                shaman: 2,
                berserker: 2,
                frostMage: 2,
                darkKnight: 2,
            };
        }
    }
}

