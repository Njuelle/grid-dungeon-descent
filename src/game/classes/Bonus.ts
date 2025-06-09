/**
 * Bonus System - Backward Compatibility Layer
 *
 * This file maintains backward compatibility with existing code while
 * using the new organized bonus content structure.
 */

export interface Bonus {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: "stat" | "spell";
    target?: string; // For spell upgrades, the spell id
    effects: Array<{
        stat?:
            | "health"
            | "force"
            | "dexterity"
            | "intelligence"
            | "armor"
            | "magicResistance"
            | "movementPoints"
            | "actionPoints";
        value?: number;
        spellProperty?:
            | "damage"
            | "range"
            | "minRange"
            | "apCost"
            | "aoeShape"
            | "aoeRadius";
        spellValue?: number | string; // string for aoeShape, number for others
        condition?: { requiresAoe?: boolean };
    }>;
}

// Import from organized content structure
import {
    AVAILABLE_BONUSES as ORGANIZED_BONUSES,
    getRandomBonuses as getOrganizedRandomBonuses,
} from "../content/bonuses";

// Maintain backward compatibility
export const AVAILABLE_BONUSES: Bonus[] = ORGANIZED_BONUSES;

// Re-export the organized getRandomBonuses function
export const getRandomBonuses = getOrganizedRandomBonuses;

