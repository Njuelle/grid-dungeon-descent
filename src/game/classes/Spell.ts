/**
 * Spell System - Backward Compatibility Layer
 * 
 * This file maintains backward compatibility with existing code while
 * using the new organized spell content structure.
 */

export interface Spell {
    id: string;
    name: string;
    icon: string;
    apCost: number;
    range: number;
    minRange?: number;
    damage: number;
    description: string;
    type: "melee" | "ranged" | "magic";
    effect?: string;
    duration?: number;
    aoeShape?: "circle" | "line" | "cone";
    aoeRadius?: number;
}

// Import from organized content structure
import { 
    PLAYER_SPELLS as ORGANIZED_PLAYER_SPELLS,
    ALL_SPELLS as ORGANIZED_ALL_SPELLS
} from "../content/spells";

// Maintain backward compatibility
export const PLAYER_SPELLS: Spell[] = ORGANIZED_PLAYER_SPELLS;

