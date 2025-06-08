import { Spell } from "./Spell";

export interface PlayerClass {
    id: string;
    name: string;
    description: string;
    icon: string;
    baseStats: {
        health: number;
        force: number;
        dexterity: number;
        intelligence: number;
        armor: number;
        magicResistance: number;
        moveRange: number;
        movementPoints: number;
        actionPoints: number;
    };
    spells: Spell[];
}

// Define the base spells for each class
const WARRIOR_SPELLS: Spell[] = [
    {
        id: "warrior_basic_attack",
        name: "Sword Strike",
        icon: "icon_slash",
        apCost: 1,
        range: 1,
        damage: 3,
        description: "Basic melee attack with sword",
        type: "melee",
    },
    {
        id: "warrior_power_attack",
        name: "Heavy Blow",
        icon: "icon_power_strike",
        apCost: 2,
        range: 1,
        damage: 6,
        description: "Powerful melee strike",
        type: "melee",
    },
];

const RANGER_SPELLS: Spell[] = [
    {
        id: "ranger_basic_attack",
        name: "Arrow Shot",
        icon: "icon_arrow_shot",
        apCost: 1,
        range: 3,
        minRange: 2,
        damage: 2,
        description: "Basic ranged attack with bow",
        type: "ranged",
    },
    {
        id: "ranger_power_attack",
        name: "Piercing Shot",
        icon: "icon_bone_piercer",
        apCost: 2,
        range: 4,
        minRange: 2,
        damage: 4,
        description: "Powerful ranged attack that pierces through armor",
        type: "ranged",
    },
];

const MAGE_SPELLS: Spell[] = [
    {
        id: "mage_basic_attack",
        name: "Magic Missile",
        icon: "icon_magic_missile",
        apCost: 1,
        range: 3,
        minRange: 1,
        damage: 2,
        description: "Basic magical projectile",
        type: "magic",
    },
    {
        id: "mage_power_attack",
        name: "Fireball",
        icon: "icon_fire_ball",
        apCost: 3,
        range: 3,
        minRange: 2,
        damage: 5,
        description: "Explosive magical attack",
        type: "magic",
        aoeShape: "circle",
        aoeRadius: 1,
    },
];

export const PLAYER_CLASSES: PlayerClass[] = [
    {
        id: "warrior",
        name: "Warrior",
        description:
            "A strong melee fighter with high health and armor. Excels in close combat.",
        icon: "hero_warrior",
        baseStats: {
            health: 12,
            force: 4,
            dexterity: 2,
            intelligence: 1,
            armor: 2,
            magicResistance: 1,
            moveRange: 4,
            movementPoints: 4,
            actionPoints: 3,
        },
        spells: WARRIOR_SPELLS,
    },
    {
        id: "ranger",
        name: "Ranger",
        description:
            "A skilled archer with high dexterity and mobility. Fights best at range.",
        icon: "hero_ranger",
        baseStats: {
            health: 10,
            force: 2,
            dexterity: 4,
            intelligence: 2,
            armor: 1,
            magicResistance: 1,
            moveRange: 5,
            movementPoints: 5,
            actionPoints: 3,
        },
        spells: RANGER_SPELLS,
    },
    {
        id: "mage",
        name: "Mage",
        description:
            "A powerful spellcaster with high intelligence and magical abilities.",
        icon: "hero_mage",
        baseStats: {
            health: 8,
            force: 1,
            dexterity: 2,
            intelligence: 4,
            armor: 0,
            magicResistance: 3,
            moveRange: 3,
            movementPoints: 3,
            actionPoints: 4,
        },
        spells: MAGE_SPELLS,
    },
];
