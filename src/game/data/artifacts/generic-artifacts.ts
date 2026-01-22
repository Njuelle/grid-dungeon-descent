/**
 * Generic Artifacts - Available to all classes.
 * Each artifact grants a specific spell when equipped.
 */

import { ArtifactDefinition } from "../../core/types";

export const GENERIC_ARTIFACTS: ArtifactDefinition[] = [
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
    {
        id: "artifact_alchemist_flask",
        name: "Alchemist's Flask",
        description: "Flask containing a powerful healing elixir",
        icon: "⚗️",
        grantedSpellId: "elixir",
    },
    {
        id: "artifact_war_drum",
        name: "War Drum",
        description: "Drum that rallies warriors to battle",
        icon: "🥁",
        grantedSpellId: "rally",
    },
    {
        id: "artifact_ancient_relic",
        name: "Ancient Relic",
        description: "Mysterious relic that empowers the wielder",
        icon: "🏺",
        grantedSpellId: "empower",
    },
    {
        id: "artifact_cursed_blade",
        name: "Cursed Blade",
        description: "Dark blade that feeds on souls",
        icon: "🗡️",
        grantedSpellId: "soul_rip",
    },
    {
        id: "artifact_time_crystal",
        name: "Time Crystal",
        description: "Crystal that manipulates the flow of time",
        icon: "💎",
        grantedSpellId: "quicken",
    },
];
