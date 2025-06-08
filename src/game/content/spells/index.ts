/**
 * Spell Content Index - Organized spell categories and utilities
 *
 * All spells are now organized by class and function for better maintainability:
 * - BasicSpells: Universal foundation spells available to all classes
 * - WarriorSpells: Melee combat and physical prowess focused
 * - RangerSpells: Ranged combat and mobility focused
 * - MageSpells: Magic and elemental power focused
 * - UtilitySpells: Cross-class and special purpose spells
 */

import { Spell } from "../../classes/Spell";
import { BASIC_SPELLS } from "./BasicSpells";
import { WARRIOR_SPELLS } from "./WarriorSpells";
import { RANGER_SPELLS } from "./RangerSpells";
import { MAGE_SPELLS } from "./MageSpells";
import { UTILITY_SPELLS } from "./UtilitySpells";

// Export organized categories
export { BASIC_SPELLS } from "./BasicSpells";
export { WARRIOR_SPELLS } from "./WarriorSpells";
export { RANGER_SPELLS } from "./RangerSpells";
export { MAGE_SPELLS } from "./MageSpells";
export { UTILITY_SPELLS } from "./UtilitySpells";

// Combined collection for backward compatibility
export const PLAYER_SPELLS: Spell[] = [
    ...BASIC_SPELLS,
    ...WARRIOR_SPELLS,
    ...RANGER_SPELLS,
    ...MAGE_SPELLS,
    ...UTILITY_SPELLS,
];

// Remove duplicates (basic spells appear in multiple categories)
export const ALL_SPELLS: Spell[] = PLAYER_SPELLS.filter(
    (spell, index, self) => index === self.findIndex((s) => s.id === spell.id)
);

// ===== SPELL UTILITIES =====

/**
 * Get spells by type
 */
export function getSpellsByType(type: "melee" | "ranged" | "magic"): Spell[] {
    return ALL_SPELLS.filter((spell) => spell.type === type);
}

/**
 * Get spells by category for more granular filtering
 */
export function getSpellsByCategory(
    category: "basic" | "warrior" | "ranger" | "mage" | "utility"
): Spell[] {
    switch (category) {
        case "basic":
            return BASIC_SPELLS;
        case "warrior":
            return WARRIOR_SPELLS;
        case "ranger":
            return RANGER_SPELLS;
        case "mage":
            return MAGE_SPELLS;
        case "utility":
            return UTILITY_SPELLS;
        default:
            return [];
    }
}

/**
 * Get spells that belong to a specific class
 */
export function getSpellsForClass(
    classId: "warrior" | "ranger" | "mage"
): Spell[] {
    const classBasicSpells = BASIC_SPELLS.filter((spell) =>
        spell.id.startsWith(`${classId}_`)
    );

    switch (classId) {
        case "warrior":
            return [
                ...classBasicSpells,
                ...WARRIOR_SPELLS.filter((s) => !s.id.startsWith("warrior_")),
            ];
        case "ranger":
            return [
                ...classBasicSpells,
                ...RANGER_SPELLS.filter((s) => !s.id.startsWith("ranger_")),
            ];
        case "mage":
            return [
                ...classBasicSpells,
                ...MAGE_SPELLS.filter((s) => !s.id.startsWith("mage_")),
            ];
        default:
            return [];
    }
}

/**
 * Get spells with specific effects
 */
export function getSpellsWithEffect(
    effectType: "healing" | "damage" | "utility" | "aoe" | "buff" | "debuff"
): Spell[] {
    switch (effectType) {
        case "healing":
            return ALL_SPELLS.filter((spell) => spell.damage < 0);
        case "damage":
            return ALL_SPELLS.filter((spell) => spell.damage > 0);
        case "utility":
            return ALL_SPELLS.filter(
                (spell) => spell.damage === 0 && !spell.effect?.includes("heal")
            );
        case "aoe":
            return ALL_SPELLS.filter((spell) => spell.aoeShape);
        case "buff":
            return ALL_SPELLS.filter(
                (spell) =>
                    spell.effect &&
                    ["shield", "boost", "enhance", "buff", "restore"].some(
                        (term) => spell.effect!.includes(term)
                    )
            );
        case "debuff":
            return ALL_SPELLS.filter(
                (spell) =>
                    spell.effect &&
                    ["slow", "weaken", "stun", "charm", "vulnerability"].some(
                        (term) => spell.effect!.includes(term)
                    )
            );
        default:
            return [];
    }
}

/**
 * Get spells by AP cost range
 */
export function getSpellsByAPCost(minCost: number, maxCost: number): Spell[] {
    return ALL_SPELLS.filter(
        (spell) => spell.apCost >= minCost && spell.apCost <= maxCost
    );
}

/**
 * Get spells by range
 */
export function getSpellsByRange(minRange: number, maxRange: number): Spell[] {
    return ALL_SPELLS.filter(
        (spell) => spell.range >= minRange && spell.range <= maxRange
    );
}

/**
 * Get a spell by its ID from any category
 */
export function getSpellById(spellId: string): Spell | undefined {
    return ALL_SPELLS.find((spell) => spell.id === spellId);
}

/**
 * Check if a spell belongs to a specific class
 */
export function isClassSpell(
    spellId: string,
    classId: "warrior" | "ranger" | "mage"
): boolean {
    // Check if it's a basic class spell
    if (spellId.startsWith(`${classId}_`)) {
        return true;
    }

    // Check if it's in the class-specific spell list
    const classSpells = getSpellsForClass(classId);
    return classSpells.some((spell) => spell.id === spellId);
}

/**
 * Get random spells with smart filtering
 */
export function getRandomSpells(
    count: number,
    filters: {
        type?: "melee" | "ranged" | "magic";
        class?: "warrior" | "ranger" | "mage";
        maxAPCost?: number;
        excludeIds?: string[];
    } = {}
): Spell[] {
    let availableSpells = [...ALL_SPELLS];

    // Apply filters
    if (filters.type) {
        availableSpells = availableSpells.filter(
            (spell) => spell.type === filters.type
        );
    }

    if (filters.class) {
        availableSpells = getSpellsForClass(filters.class);
    }

    if (filters.maxAPCost !== undefined) {
        availableSpells = availableSpells.filter(
            (spell) => spell.apCost <= filters.maxAPCost!
        );
    }

    if (filters.excludeIds) {
        availableSpells = availableSpells.filter(
            (spell) => !filters.excludeIds!.includes(spell.id)
        );
    }

    // Shuffle and return requested count
    const shuffled = [...availableSpells].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Validate spell requirements and compatibility
 */
export function validateSpell(spell: Spell): {
    valid: boolean;
    issues: string[];
} {
    const issues: string[] = [];

    // Basic validations
    if (!spell.id || spell.id.trim() === "") {
        issues.push("Spell must have a valid ID");
    }

    if (!spell.name || spell.name.trim() === "") {
        issues.push("Spell must have a name");
    }

    if (spell.apCost < 0) {
        issues.push("AP cost cannot be negative");
    }

    if (spell.range < 0) {
        issues.push("Range cannot be negative");
    }

    if (spell.minRange && spell.minRange > spell.range) {
        issues.push("Minimum range cannot be greater than maximum range");
    }

    if (spell.aoeShape && !spell.aoeRadius) {
        issues.push("AoE spells must have a radius");
    }

    if (spell.aoeRadius && spell.aoeRadius <= 0) {
        issues.push("AoE radius must be positive");
    }

    return {
        valid: issues.length === 0,
        issues,
    };
}

/**
 * Get spell statistics for balancing and analysis
 */
export function getSpellStatistics() {
    const stats = {
        totalSpells: ALL_SPELLS.length,
        byType: {
            melee: getSpellsByType("melee").length,
            ranged: getSpellsByType("ranged").length,
            magic: getSpellsByType("magic").length,
        },
        byCategory: {
            basic: BASIC_SPELLS.length,
            warrior: WARRIOR_SPELLS.length,
            ranger: RANGER_SPELLS.length,
            mage: MAGE_SPELLS.length,
            utility: UTILITY_SPELLS.length,
        },
        averageAPCost:
            ALL_SPELLS.reduce((sum, spell) => sum + spell.apCost, 0) /
            ALL_SPELLS.length,
        averageRange:
            ALL_SPELLS.reduce((sum, spell) => sum + spell.range, 0) /
            ALL_SPELLS.length,
        averageDamage:
            ALL_SPELLS.filter((s) => s.damage > 0).reduce(
                (sum, spell) => sum + spell.damage,
                0
            ) / ALL_SPELLS.filter((s) => s.damage > 0).length,
        aoeSpells: getSpellsWithEffect("aoe").length,
        healingSpells: getSpellsWithEffect("healing").length,
        utilitySpells: getSpellsWithEffect("utility").length,
    };

    return stats;
}
