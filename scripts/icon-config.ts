/**
 * Icon Generation Configuration
 * Style prompts and category mappings for DALL-E 3 icon generation.
 */

// =============================================================================
// Types
// =============================================================================

export type IconCategory = "spells" | "bonuses" | "artifacts";
export type SpellType = "melee" | "ranged" | "magic";
export type BonusCategory = "stat" | "spell" | "passive";

export interface IconItem {
    id: string;
    name: string;
    description: string;
    /** Visual description for AI icon generation */
    iconDescription?: string;
    category: IconCategory;
    subCategory?: SpellType | BonusCategory;
}

// =============================================================================
// Style Configuration
// =============================================================================

/**
 * Style suffix for all icons (appended after subject).
 * Clean game UI icon style.
 */
export const STYLE_SUFFIX = `
game UI icon, video game icon style, Diablo inventory icon, clean flat icon, simple shapes, solid colors, no outlines, glossy, 3D rendered icon, isometric item, single object, centered, transparent background, high contrast
`.trim().replace(/\n/g, " ");

/**
 * Negative prompt to avoid unwanted elements in generated icons.
 */
export const NEGATIVE_PROMPT = `
drawn, sketch, illustration, painting, artistic, hand drawn, lineart, cartoon, anime, abstract, energy effects, aura, swirls, multiple objects, text, letters, numbers, watermark, background, blurry, photorealistic photo
`.trim().replace(/\n/g, " ");

/**
 * Category-specific style modifiers to add context.
 */
export const CATEGORY_MODIFIERS: Record<IconCategory, string> = {
    spells: "RPG game ability icon",
    bonuses: "RPG game buff icon",
    artifacts: "RPG game item icon",
};

/**
 * Spell type-specific modifiers for concrete visuals.
 */
export const SPELL_TYPE_MODIFIERS: Record<SpellType, string> = {
    melee: "sword weapon icon",
    ranged: "bow arrow icon",
    magic: "magic orb staff icon",
};

/**
 * Bonus category-specific modifiers (minimal to maintain consistency).
 */
export const BONUS_CATEGORY_MODIFIERS: Record<BonusCategory, string> = {
    stat: "stat boost themed",
    spell: "spell enhancement themed",
    passive: "passive ability themed",
};

// =============================================================================
// Prompt Builder
// =============================================================================

/**
 * Sanitize description to remove stats, numbers, and text that DALL-E might render.
 * Returns undefined if description is mostly stats (should be skipped).
 */
function sanitizeDescription(description: string, category: IconCategory): string | undefined {
    // For bonuses, descriptions are usually stats like "+2 Force" - skip them entirely
    if (category === "bonuses") {
        return undefined;
    }
    
    // For spells/artifacts, remove stat-like patterns but keep descriptive text
    let cleaned = description
        .replace(/[+-]?\d+/g, "") // Remove numbers
        .replace(/\s+/g, " ") // Normalize spaces
        .replace(/,\s*,/g, ",") // Remove double commas
        .replace(/^\s*,\s*/, "") // Remove leading comma
        .replace(/\s*,\s*$/, "") // Remove trailing comma
        .trim();
    
    // If too short after cleaning, skip it
    if (cleaned.length < 10) {
        return undefined;
    }
    
    return cleaned;
}

/**
 * Builds a complete prompt for Stable Diffusion icon generation.
 * IMPORTANT: Subject comes FIRST for maximum weight, then style instructions follow.
 * Uses iconDescription if available, otherwise falls back to sanitized description.
 */
export function buildIconPrompt(item: IconItem): string {
    // Determine the subject description (what to generate)
    let subject: string;
    
    if (item.iconDescription) {
        // Use dedicated visual description
        subject = item.iconDescription;
    } else {
        // Fall back to sanitized description or just name
        const sanitizedDesc = sanitizeDescription(item.description, item.category);
        subject = sanitizedDesc ? `${item.name}, ${sanitizedDesc}` : item.name;
    }
    
    // Add category context for better results
    const categoryContext = CATEGORY_MODIFIERS[item.category];
    
    // Add spell type context if applicable
    let typeContext = "";
    if (item.category === "spells" && item.subCategory) {
        typeContext = `, ${SPELL_TYPE_MODIFIERS[item.subCategory as SpellType]}`;
    }
    
    // Build prompt: SUBJECT FIRST, category context, then style
    return `${subject}, ${categoryContext}${typeContext}, ${STYLE_SUFFIX}`;
}

// =============================================================================
// Output Configuration
// =============================================================================

export const OUTPUT_CONFIG = {
    /** Base directory for generated icons */
    baseDir: "public/assets/icons",
    
    /** Icon dimensions (resized from SDXL's 1024x1024) */
    size: 128,
    
    /** Image format */
    format: "png" as const,
    
    /** Stability AI API endpoint for SDXL 1.0 */
    apiEndpoint: "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
    
    /** SDXL image dimensions (1024x1024 is optimal for SDXL) */
    width: 1024,
    height: 1024,
    
    /** Number of diffusion steps (25-30 for quality detailed icons) */
    steps: 28,
    
    /** CFG scale (7-8 for clean game icons) */
    cfgScale: 7.5,
    
    /** Sampler (DPM++ 2M Karras recommended for clean single objects) */
    sampler: "K_DPMPP_2M" as const,
    
    /** Rate limit delay between API calls (ms) */
    rateLimitDelay: 500,
    
    /** Max retries on failure */
    maxRetries: 3,
    
    /** Retry delay multiplier for exponential backoff */
    retryDelayMultiplier: 2,
};

/**
 * Get the output path for an icon.
 */
export function getIconPath(category: IconCategory, id: string): string {
    return `${OUTPUT_CONFIG.baseDir}/${category}/icon_${id}.png`;
}

/**
 * Get the icon key (used in game data files).
 */
export function getIconKey(id: string): string {
    return `icon_${id}`;
}
