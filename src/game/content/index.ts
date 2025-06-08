/**
 * Game Content Index - Centralized export for all game content
 *
 * This file provides organized access to all bonuses, artifacts, and spells,
 * maintaining backward compatibility with existing imports while
 * offering new organized structures for better maintainability.
 */

// ===== BONUS EXPORTS =====
export * from "./bonuses";
export {
    STAT_BONUSES,
    SPELL_BONUSES,
    SPECIAL_BONUSES,
    AVAILABLE_BONUSES,
    getBonusesByType,
    getBonusesByCategory,
    getSpellBonusesForSpell,
    getStatBonusesForStat,
    isSpecialBonus,
    getBonusById,
    getRandomBonuses,
} from "./bonuses";

// ===== ARTIFACT EXPORTS =====
export * from "./artifacts";
export {
    WARRIOR_ARTIFACTS,
    RANGER_ARTIFACTS,
    MAGE_ARTIFACTS,
    ALL_ARTIFACTS,
    getArtifactsForClass,
    getArtifactsByCategory,
    getRandomArtifacts,
    getArtifactsByRarity,
    getArtifactsForClassByRarity,
    getArtifactById,
    getArtifactsBySpellType,
    getArtifactsByEffect,
    getWeightedRandomArtifacts,
} from "./artifacts";

// ===== SPELL EXPORTS =====
export * from "./spells";
export {
    BASIC_SPELLS,
    WARRIOR_SPELLS,
    RANGER_SPELLS,
    MAGE_SPELLS,
    UTILITY_SPELLS,
    PLAYER_SPELLS,
    ALL_SPELLS,
    getSpellsByType,
    getSpellsByCategory,
    getSpellsForClass,
    getSpellsWithEffect,
    getSpellsByAPCost,
    getSpellsByRange,
    getSpellById,
    isClassSpell,
    getRandomSpells,
    validateSpell,
    getSpellStatistics,
} from "./spells";

// ===== CONTENT ORGANIZATION UTILITIES =====

/**
 * Get all content organized by type
 */
export const GAME_CONTENT = {
    bonuses: {
        stat: () => import("./bonuses").then((m) => m.STAT_BONUSES),
        spell: () => import("./bonuses").then((m) => m.SPELL_BONUSES),
        special: () => import("./bonuses").then((m) => m.SPECIAL_BONUSES),
        all: () => import("./bonuses").then((m) => m.AVAILABLE_BONUSES),
    },
    artifacts: {
        warrior: () => import("./artifacts").then((m) => m.WARRIOR_ARTIFACTS),
        ranger: () => import("./artifacts").then((m) => m.RANGER_ARTIFACTS),
        mage: () => import("./artifacts").then((m) => m.MAGE_ARTIFACTS),
        all: () => import("./artifacts").then((m) => m.ALL_ARTIFACTS),
    },
    spells: {
        basic: () => import("./spells").then((m) => m.BASIC_SPELLS),
        warrior: () => import("./spells").then((m) => m.WARRIOR_SPELLS),
        ranger: () => import("./spells").then((m) => m.RANGER_SPELLS),
        mage: () => import("./spells").then((m) => m.MAGE_SPELLS),
        utility: () => import("./spells").then((m) => m.UTILITY_SPELLS),
        all: () => import("./spells").then((m) => m.ALL_SPELLS),
    },
};

/**
 * Content statistics for development and debugging
 */
export async function getContentStats() {
    const [bonuses, artifacts, spells] = await Promise.all([
        import("./bonuses").then((m) => m.AVAILABLE_BONUSES),
        import("./artifacts").then((m) => m.ALL_ARTIFACTS),
        import("./spells").then((m) => m.ALL_SPELLS),
    ]);

    return {
        bonuses: {
            total: bonuses.length,
            byType: {
                stat: bonuses.filter((b) => b.type === "stat").length,
                spell: bonuses.filter((b) => b.type === "spell").length,
            },
        },
        artifacts: {
            total: artifacts.length,
            byClass: {
                warrior: artifacts.filter((a) => a.classId === "warrior")
                    .length,
                ranger: artifacts.filter((a) => a.classId === "ranger").length,
                mage: artifacts.filter((a) => a.classId === "mage").length,
            },
            byRarity: {
                common: artifacts.filter((a) => a.rarity === "common").length,
                rare: artifacts.filter((a) => a.rarity === "rare").length,
                epic: artifacts.filter((a) => a.rarity === "epic").length,
                legendary: artifacts.filter((a) => a.rarity === "legendary")
                    .length,
            },
        },
        spells: {
            total: spells.length,
            byType: {
                melee: spells.filter((s) => s.type === "melee").length,
                ranged: spells.filter((s) => s.type === "ranged").length,
                magic: spells.filter((s) => s.type === "magic").length,
            },
            byCategory: {
                basic: spells.filter(
                    (s) =>
                        s.id.includes("basic") ||
                        s.id.includes("_basic_") ||
                        s.id.includes("_power_")
                ).length,
                artifact: spells.filter(
                    (s) =>
                        !s.id.includes("basic") &&
                        !s.id.includes("_basic_") &&
                        !s.id.includes("_power_")
                ).length,
            },
            averageAPCost:
                spells.reduce((sum, s) => sum + s.apCost, 0) / spells.length,
            averageRange:
                spells.reduce((sum, s) => sum + s.range, 0) / spells.length,
            aoeSpells: spells.filter((s) => s.aoeShape).length,
            healingSpells: spells.filter((s) => s.damage < 0).length,
        },
    };
}

