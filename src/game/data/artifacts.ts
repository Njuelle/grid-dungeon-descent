/**
 * Artifact Definitions - All artifacts in the game.
 * Each artifact grants a specific spell when equipped.
 * This is a data-only file with no game logic.
 */

import { ArtifactDefinition, PlayerClass } from "../core/types";

// =============================================================================
// Warrior Artifacts (10)
// =============================================================================

const WARRIOR_ARTIFACTS: ArtifactDefinition[] = [
    {
        id: "artifact_power_gauntlet",
        name: "Power Gauntlet",
        description: "Ancient gauntlet that channels devastating strikes",
        icon: "🥊",
        classRestriction: "warrior",
        grantedSpellId: "power_strike",
    },
    {
        id: "artifact_whirlwind_blade",
        name: "Whirlwind Blade",
        description: "Enchanted blade that spins with deadly force",
        icon: "🗡️",
        classRestriction: "warrior",
        grantedSpellId: "whirlwind",
    },
    {
        id: "artifact_horn_of_terror",
        name: "Horn of Terror",
        description: "War horn that strikes fear into enemies",
        icon: "📯",
        classRestriction: "warrior",
        grantedSpellId: "intimidating_shout",
    },
    {
        id: "artifact_tower_shield",
        name: "Tower Shield",
        description: "Massive shield that creates an impenetrable wall",
        icon: "🛡️",
        classRestriction: "warrior",
        grantedSpellId: "shield_wall",
    },
    {
        id: "artifact_berserker_helm",
        name: "Berserker Helm",
        description: "Helm that unleashes primal fury",
        icon: "⛑️",
        classRestriction: "warrior",
        grantedSpellId: "berserker_rage",
    },
    {
        id: "artifact_executioner_axe",
        name: "Executioner's Axe",
        description: "Heavy axe designed for cleaving through armor",
        icon: "🪓",
        classRestriction: "warrior",
        grantedSpellId: "cleave",
    },
    {
        id: "artifact_headsmans_sword",
        name: "Headsman's Sword",
        description: "Blade that delivers fatal blows",
        icon: "⚔️",
        classRestriction: "warrior",
        grantedSpellId: "execute",
    },
    {
        id: "artifact_bull_medallion",
        name: "Bull Medallion",
        description: "Medallion imbued with charging power",
        icon: "🎖️",
        classRestriction: "warrior",
        grantedSpellId: "charge",
    },
    {
        id: "artifact_provoking_banner",
        name: "Provoking Banner",
        description: "Battle standard that draws enemy attention",
        icon: "🚩",
        classRestriction: "warrior",
        grantedSpellId: "taunt",
    },
    {
        id: "artifact_phoenix_feather",
        name: "Phoenix Feather",
        description: "Mystical feather that grants second chances",
        icon: "🪶",
        classRestriction: "warrior",
        grantedSpellId: "second_wind",
    },
];

// =============================================================================
// Ranger Artifacts (10)
// =============================================================================

const RANGER_ARTIFACTS: ArtifactDefinition[] = [
    {
        id: "artifact_bone_quiver",
        name: "Bone Quiver",
        description: "Quiver holding arrows that pierce any armor",
        icon: "🦴",
        classRestriction: "ranger",
        grantedSpellId: "bone_piercer",
    },
    {
        id: "artifact_storm_bow",
        name: "Storm Bow",
        description: "Bow that fires multiple arrows at once",
        icon: "🏹",
        classRestriction: "ranger",
        grantedSpellId: "multi_shot",
    },
    {
        id: "artifact_venom_vial",
        name: "Venom Vial",
        description: "Deadly poison to coat your arrows",
        icon: "🧴",
        classRestriction: "ranger",
        grantedSpellId: "poison_arrow",
    },
    {
        id: "artifact_hunters_trap",
        name: "Hunter's Trap",
        description: "Mechanical trap that ensnares prey",
        icon: "🪤",
        classRestriction: "ranger",
        grantedSpellId: "trap",
    },
    {
        id: "artifact_shadow_cloak",
        name: "Shadow Cloak",
        description: "Cloak woven from shadows themselves",
        icon: "🧥",
        classRestriction: "ranger",
        grantedSpellId: "camouflage",
    },
    {
        id: "artifact_eagle_eye",
        name: "Eagle Eye Scope",
        description: "Magical scope for impossible shots",
        icon: "🔭",
        classRestriction: "ranger",
        grantedSpellId: "snipe",
    },
    {
        id: "artifact_rain_caller",
        name: "Rain Caller",
        description: "Whistle that summons a storm of arrows",
        icon: "🎵",
        classRestriction: "ranger",
        grantedSpellId: "volley",
    },
    {
        id: "artifact_death_mark",
        name: "Mark of Death",
        description: "Cursed mark that seals an enemy's fate",
        icon: "💀",
        classRestriction: "ranger",
        grantedSpellId: "marked_for_death",
    },
    {
        id: "artifact_acrobat_boots",
        name: "Acrobat Boots",
        description: "Light boots for quick escapes",
        icon: "👢",
        classRestriction: "ranger",
        grantedSpellId: "evasive_roll",
    },
    {
        id: "artifact_spider_silk",
        name: "Spider Silk Net",
        description: "Sticky net that immobilizes targets",
        icon: "🕸️",
        classRestriction: "ranger",
        grantedSpellId: "net_shot",
    },
];

// =============================================================================
// Magician Artifacts (10)
// =============================================================================

const MAGICIAN_ARTIFACTS: ArtifactDefinition[] = [
    {
        id: "artifact_flame_orb",
        name: "Flame Orb",
        description: "Orb containing the essence of fire",
        icon: "🔮",
        classRestriction: "magician",
        grantedSpellId: "fireball",
    },
    {
        id: "artifact_frost_crystal",
        name: "Frost Crystal",
        description: "Crystal that channels freezing cold",
        icon: "💎",
        classRestriction: "magician",
        grantedSpellId: "ice_shard",
    },
    {
        id: "artifact_storm_rod",
        name: "Storm Rod",
        description: "Rod crackling with electrical energy",
        icon: "🪄",
        classRestriction: "magician",
        grantedSpellId: "lightning_bolt",
    },
    {
        id: "artifact_void_stone",
        name: "Void Stone",
        description: "Stone that bends space itself",
        icon: "⬛",
        classRestriction: "magician",
        grantedSpellId: "teleport",
    },
    {
        id: "artifact_ward_gem",
        name: "Ward Gem",
        description: "Protective gem that creates magical barriers",
        icon: "💠",
        classRestriction: "magician",
        grantedSpellId: "mana_shield",
    },
    {
        id: "artifact_thunder_chain",
        name: "Thunder Chain",
        description: "Chain that conducts devastating lightning",
        icon: "⛓️",
        classRestriction: "magician",
        grantedSpellId: "chain_lightning",
    },
    {
        id: "artifact_star_fragment",
        name: "Star Fragment",
        description: "Piece of a fallen star with cosmic power",
        icon: "⭐",
        classRestriction: "magician",
        grantedSpellId: "meteor",
    },
    {
        id: "artifact_ice_crown",
        name: "Ice Crown",
        description: "Crown that radiates freezing energy",
        icon: "👑",
        classRestriction: "magician",
        grantedSpellId: "frost_nova",
    },
    {
        id: "artifact_phase_ring",
        name: "Phase Ring",
        description: "Ring that allows short-range teleportation",
        icon: "💍",
        classRestriction: "magician",
        grantedSpellId: "blink",
    },
    {
        id: "artifact_mind_scepter",
        name: "Mind Scepter",
        description: "Scepter that dominates weak minds",
        icon: "🏛️",
        classRestriction: "magician",
        grantedSpellId: "mind_control",
    },
];

// =============================================================================
// Generic Artifacts (10)
// =============================================================================

const GENERIC_ARTIFACTS: ArtifactDefinition[] = [
    {
        id: "artifact_healing_chalice",
        name: "Healing Chalice",
        description: "Blessed chalice that restores vitality",
        icon: "🏆",
        grantedSpellId: "health_potion",
    },
    {
        id: "artifact_winged_boots",
        name: "Winged Boots",
        description: "Boots blessed by the wind spirits",
        icon: "👟",
        grantedSpellId: "speed_boost",
    },
    {
        id: "artifact_fury_amulet",
        name: "Fury Amulet",
        description: "Amulet that amplifies attack power",
        icon: "📿",
        grantedSpellId: "damage_aura",
    },
    {
        id: "artifact_thorn_bracers",
        name: "Thorn Bracers",
        description: "Bracers covered in magical thorns",
        icon: "🌹",
        grantedSpellId: "thorns_aura",
    },
    {
        id: "artifact_vampire_fang",
        name: "Vampire Fang",
        description: "Fang that drains life from enemies",
        icon: "🧛",
        grantedSpellId: "life_steal",
    },
    {
        id: "artifact_guardian_stone",
        name: "Guardian Stone",
        description: "Stone that creates protective barriers",
        icon: "🗿",
        grantedSpellId: "barrier",
    },
    {
        id: "artifact_time_hourglass",
        name: "Time Hourglass",
        description: "Hourglass that accelerates the user",
        icon: "⏳",
        grantedSpellId: "haste",
    },
    {
        id: "artifact_mind_lens",
        name: "Mind Lens",
        description: "Lens that sharpens concentration",
        icon: "🔍",
        grantedSpellId: "focus",
    },
    {
        id: "artifact_lifewood_branch",
        name: "Lifewood Branch",
        description: "Branch from the tree of life",
        icon: "🌿",
        grantedSpellId: "regeneration",
    },
    {
        id: "artifact_lucky_coin",
        name: "Lucky Coin",
        description: "Coin blessed by fortune itself",
        icon: "🪙",
        grantedSpellId: "lucky_strike",
    },
];

// =============================================================================
// Combined Registry
// =============================================================================

/**
 * All artifacts available in the game.
 */
export const ALL_ARTIFACTS: ArtifactDefinition[] = [
    ...WARRIOR_ARTIFACTS,
    ...RANGER_ARTIFACTS,
    ...MAGICIAN_ARTIFACTS,
    ...GENERIC_ARTIFACTS,
];

/**
 * Map of artifact ID to artifact definition for O(1) lookup.
 */
export const ARTIFACT_REGISTRY: Map<string, ArtifactDefinition> = new Map(
    ALL_ARTIFACTS.map((artifact) => [artifact.id, artifact])
);

// =============================================================================
// Lookup Functions
// =============================================================================

/**
 * Get an artifact by its ID.
 */
export function getArtifactById(id: string): ArtifactDefinition | undefined {
    return ARTIFACT_REGISTRY.get(id);
}

/**
 * Get all artifacts available for a specific class.
 * Returns class-specific artifacts + generic artifacts.
 */
export function getArtifactsForClass(playerClass: PlayerClass): ArtifactDefinition[] {
    return ALL_ARTIFACTS.filter(
        (artifact) =>
            artifact.classRestriction === playerClass ||
            artifact.classRestriction === undefined
    );
}

/**
 * Get only class-specific artifacts for a class.
 */
export function getClassSpecificArtifacts(playerClass: PlayerClass): ArtifactDefinition[] {
    return ALL_ARTIFACTS.filter(
        (artifact) => artifact.classRestriction === playerClass
    );
}

/**
 * Get only generic artifacts (available to all classes).
 */
export function getGenericArtifacts(): ArtifactDefinition[] {
    return ALL_ARTIFACTS.filter(
        (artifact) => artifact.classRestriction === undefined
    );
}

/**
 * Check if an artifact is valid for a specific class.
 */
export function isArtifactValidForClass(
    artifactId: string,
    playerClass: PlayerClass
): boolean {
    const artifact = ARTIFACT_REGISTRY.get(artifactId);
    if (!artifact) return false;
    return (
        artifact.classRestriction === undefined ||
        artifact.classRestriction === playerClass
    );
}

/**
 * Get the spell ID granted by an artifact.
 */
export function getArtifactSpellId(artifactId: string): string | undefined {
    return ARTIFACT_REGISTRY.get(artifactId)?.grantedSpellId;
}

// =============================================================================
// Category Exports
// =============================================================================

export { WARRIOR_ARTIFACTS, RANGER_ARTIFACTS, MAGICIAN_ARTIFACTS, GENERIC_ARTIFACTS };
