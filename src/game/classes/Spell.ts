import { BuffEffect, SpellCategory, BuffType, StatusEffectDefinition } from "../core/types";

export type { BuffType, SpellCategory, BuffEffect };

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
    /** Category of spell: attack (default) or buff */
    spellCategory?: SpellCategory;
    /** Buff effect configuration (for buff spells) */
    buffEffect?: BuffEffect;
    /** Status effect to apply on hit */
    statusEffect?: StatusEffectDefinition;
    /** VFX animation key to play when spell is cast */
    animation?: string;
}

export const PLAYER_SPELLS: Spell[] = [
    {
        id: "slash",
        name: "Slash",
        icon: "icon_slash",
        apCost: 1,
        range: 1,
        damage: 3,
        description: "Basic melee attack",
        type: "melee",
    },
    {
        id: "power_strike",
        name: "Power Strike",
        icon: "icon_power_strike",
        apCost: 2,
        range: 1,
        damage: 5,
        description: "Powerful melee attack",
        type: "melee",
    },
    {
        id: "arrow_shot",
        name: "Arrow Shot",
        icon: "icon_arrow_shot",
        apCost: 1,
        range: 3,
        minRange: 2,
        damage: 2,
        description: "Basic ranged attack",
        type: "ranged",
    },
    {
        id: "bone_piercer",
        name: "Bone Piercer",
        icon: "icon_bone_piercer",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 3,
        description: "Fires a sharp bone that pierces foes.",
        type: "ranged",
    },
    {
        id: "magic_missile",
        name: "Magic Missile",
        icon: "icon_magic_missile",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 4,
        description: "Magical ranged attack",
        type: "magic",
    },
    {
        id: "fireball",
        name: "Fireball",
        icon: "icon_fire_ball",
        apCost: 3,
        range: 3,
        minRange: 2,
        damage: 6,
        description: "Powerful fire spell",
        type: "magic",
    },
];

