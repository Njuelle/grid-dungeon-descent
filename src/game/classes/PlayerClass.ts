import { Spell } from "./Spell";
import { WARRIOR_SPELLS } from "../content/spells/WarriorSpells";
import { RANGER_SPELLS } from "../content/spells/RangerSpells";
import { MAGE_SPELLS } from "../content/spells/MageSpells";

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

// Get the basic spells for each class from their dedicated files
const getWarriorBasicSpells = (): Spell[] => {
    return WARRIOR_SPELLS.filter(
        (spell) =>
            spell.id === "warrior_basic_attack" ||
            spell.id === "warrior_power_attack"
    );
};

const getRangerBasicSpells = (): Spell[] => {
    return RANGER_SPELLS.filter(
        (spell) =>
            spell.id === "ranger_basic_attack" ||
            spell.id === "ranger_power_attack"
    );
};

const getMageBasicSpells = (): Spell[] => {
    return MAGE_SPELLS.filter(
        (spell) =>
            spell.id === "mage_basic_attack" || spell.id === "mage_power_attack"
    );
};

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
        spells: getWarriorBasicSpells(),
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
        spells: getRangerBasicSpells(),
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
        spells: getMageBasicSpells(),
    },
];

