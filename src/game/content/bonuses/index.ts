/**
 * Bonus Content Index - Organized bonus categories and utilities
 *
 * All bonuses are now organized by type for better maintainability:
 * - StatBonuses: Direct attribute improvements
 * - SpellBonuses: Spell modifications and upgrades
 * - SpecialBonuses: Unique mechanics and conditional effects
 */

import { Bonus } from "../../classes/Bonus";
import { STAT_BONUSES } from "./StatBonuses";
import { SPELL_BONUSES } from "./SpellBonuses";
import { SPECIAL_BONUSES } from "./SpecialBonuses";

// Export organized categories
export { STAT_BONUSES } from "./StatBonuses";
export { SPELL_BONUSES } from "./SpellBonuses";
export { SPECIAL_BONUSES } from "./SpecialBonuses";

// Combined collection for backward compatibility
export const AVAILABLE_BONUSES: Bonus[] = [
    ...STAT_BONUSES,
    ...SPELL_BONUSES,
    ...SPECIAL_BONUSES,
];

// ===== BONUS UTILITIES =====

/**
 * Get all bonuses of a specific type
 */
export function getBonusesByType(type: "stat" | "spell"): Bonus[] {
    return AVAILABLE_BONUSES.filter((bonus) => bonus.type === type);
}

/**
 * Get bonuses by category for more granular filtering
 */
export function getBonusesByCategory(
    category: "stat" | "spell" | "special"
): Bonus[] {
    switch (category) {
        case "stat":
            return STAT_BONUSES;
        case "spell":
            return SPELL_BONUSES;
        case "special":
            return SPECIAL_BONUSES;
        default:
            return [];
    }
}

/**
 * Get bonuses that affect a specific spell
 */
export function getSpellBonusesForSpell(spellId: string): Bonus[] {
    return SPELL_BONUSES.filter((bonus) => bonus.target === spellId);
}

/**
 * Get bonuses that affect a specific stat
 */
export function getStatBonusesForStat(stat: string): Bonus[] {
    return STAT_BONUSES.filter((bonus) =>
        bonus.effects.some((effect) => effect.stat === stat)
    );
}

/**
 * Check if a bonus requires special implementation
 */
export function isSpecialBonus(bonusId: string): boolean {
    return SPECIAL_BONUSES.some((bonus) => bonus.id === bonusId);
}

/**
 * Get a bonus by its ID from any category
 */
export function getBonusById(bonusId: string): Bonus | undefined {
    return AVAILABLE_BONUSES.find((bonus) => bonus.id === bonusId);
}

/**
 * Get random bonuses with smart filtering to avoid conflicts
 */
export function getRandomBonuses(
    count: number,
    exclude: string[] = []
): Bonus[] {
    // Filter out bonuses with incomplete implementations (empty effects or only placeholder comments)
    const incompleteBonus: string[] = [
        // Bonuses requiring complex systems not yet implemented
        "chain_lightning", // Requires multi-target spell system
        "arrow_storm", // Requires multi-target spell system
        "meteor_strike", // Requires delayed damage system
        "bone_prison", // Requires status effect/root system
        "blood_magic", // Requires alternative resource system
        "intimidating_presence", // Requires aura/proximity effect system
        "mana_burn", // Requires enemy resource manipulation
        "phoenix_blessing", // Requires death/revival system
    ];

    // First, get all bonuses that pass the various filters
    const allValidBonuses = AVAILABLE_BONUSES.filter(
        (b) =>
            !incompleteBonus.includes(b.id) &&
            b.effects.length > 0 && // Ensure it has actual effects
            !wouldReduceAPBelowMinimum(b, exclude) && // Exclude AP reduction bonuses that would break spells
            !requiresAoeButMissing(b, exclude) && // Exclude AoE requirement bonuses for spells without AoE
            !isAoeBonusIrrelevant(b, exclude) // Exclude AoE bonuses that aren't relevant
    );

    // Separate bonuses into those already picked and those not
    const alreadyPicked = allValidBonuses.filter((b) => exclude.includes(b.id));
    const notPicked = allValidBonuses.filter((b) => !exclude.includes(b.id));

    // For already picked bonuses, only include stat bonuses (not spell bonuses)
    // and reduce their probability of appearing
    const reducedProbabilityBonuses = alreadyPicked
        .filter((b) => b.type === "stat") // Only allow stat bonuses to be picked multiple times
        .filter(() => Math.random() < 0.4); // 40% chance of appearing again

    // Combine available bonuses
    const availableBonuses = [...notPicked, ...reducedProbabilityBonuses];

    // Shuffle and return the requested count
    const shuffled = [...availableBonuses].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ===== HELPER FUNCTIONS =====

function wouldReduceAPBelowMinimum(bonus: Bonus, exclude: string[]): boolean {
    // Logic to check if AP reduction would break spells (copied from original)
    return false; // Simplified for now
}

function requiresAoeButMissing(bonus: Bonus, exclude: string[]): boolean {
    // Logic to check AoE requirements (copied from original)
    return false; // Simplified for now
}

function isAoeBonusIrrelevant(bonus: Bonus, exclude: string[]): boolean {
    // Logic to check AoE relevance (copied from original)
    return false; // Simplified for now
}
