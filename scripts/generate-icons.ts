/**
 * AI Icon Generation Script
 * Uses Stability AI's Stable Diffusion XL to generate fantasy-style icons.
 * 
 * Usage:
 *   npm run generate-icons           # Generate all missing icons
 *   npm run generate-icons:dry       # Dry run (show what would be generated)
 *   npm run generate-icons -- --category=spells  # Generate only spells
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import sharp from "sharp";

import {
    IconCategory,
    IconItem,
    NEGATIVE_PROMPT,
    OUTPUT_CONFIG,
    buildIconPrompt,
    getIconPath,
} from "./icon-config";

// Import game data
import { PLAYER_SPELLS } from "../src/game/data/spells";
import { ALL_BONUSES } from "../src/game/data/bonuses";
import { ALL_ARTIFACTS } from "../src/game/data/artifacts";

// =============================================================================
// Types
// =============================================================================

interface GenerationResult {
    id: string;
    category: IconCategory;
    success: boolean;
    error?: string;
    path?: string;
}

interface GenerationStats {
    total: number;
    skipped: number;
    generated: number;
    failed: number;
    results: GenerationResult[];
}

interface StabilityArtifact {
    base64: string;
    finishReason: string;
    seed: number;
}

interface StabilityResponse {
    artifacts: StabilityArtifact[];
}

// =============================================================================
// CLI Arguments
// =============================================================================

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const categoryArg = args.find((arg) => arg.startsWith("--category="));
const filterCategory = categoryArg?.split("=")[1] as IconCategory | undefined;

// =============================================================================
// Data Collection
// =============================================================================

/**
 * Collect all items that need icons.
 */
function collectIconItems(): IconItem[] {
    const items: IconItem[] = [];

    // Collect spells
    for (const spell of PLAYER_SPELLS) {
        items.push({
            id: spell.id,
            name: spell.name,
            description: spell.description,
            iconDescription: spell.iconDescription,
            category: "spells",
            subCategory: spell.type,
        });
    }

    // Collect bonuses
    for (const bonus of ALL_BONUSES) {
        items.push({
            id: bonus.id,
            name: bonus.name,
            description: bonus.description,
            iconDescription: bonus.iconDescription,
            category: "bonuses",
            subCategory: bonus.category,
        });
    }

    // Collect artifacts
    for (const artifact of ALL_ARTIFACTS) {
        items.push({
            id: artifact.id,
            name: artifact.name,
            description: artifact.description,
            iconDescription: artifact.iconDescription,
            category: "artifacts",
        });
    }

    return items;
}

/**
 * Check if an icon already exists.
 */
function iconExists(category: IconCategory, id: string): boolean {
    const iconPath = getIconPath(category, id);
    return fs.existsSync(iconPath);
}

/**
 * Filter items to only those that need generation.
 */
function filterMissingIcons(items: IconItem[]): {
    toGenerate: IconItem[];
    existing: IconItem[];
} {
    const toGenerate: IconItem[] = [];
    const existing: IconItem[] = [];

    for (const item of items) {
        if (filterCategory && item.category !== filterCategory) {
            continue;
        }

        if (iconExists(item.category, item.id)) {
            existing.push(item);
        } else {
            toGenerate.push(item);
        }
    }

    return { toGenerate, existing };
}

// =============================================================================
// Icon Generation
// =============================================================================

/**
 * Ensure output directory exists.
 */
function ensureOutputDir(category: IconCategory): void {
    const dir = path.join(OUTPUT_CONFIG.baseDir, category);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Sleep for a specified duration.
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a single icon using Stability AI's SDXL.
 */
async function generateIcon(
    item: IconItem,
    retryCount = 0
): Promise<GenerationResult> {
    const outputPath = getIconPath(item.category, item.id);

    try {
        // Build prompt
        const prompt = buildIconPrompt(item);

        console.log(`  Generating: ${item.name} (${item.id})`);
        if (isDryRun) {
            console.log(`    Prompt: ${prompt.substring(0, 100)}...`);
            return {
                id: item.id,
                category: item.category,
                success: true,
                path: outputPath,
            };
        }

        // Call Stability AI API
        const response = await fetch(OUTPUT_CONFIG.apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${process.env.STABILITY_API_KEY}`,
            },
            body: JSON.stringify({
                text_prompts: [
                    {
                        text: prompt,
                        weight: 1,
                    },
                    {
                        text: NEGATIVE_PROMPT,
                        weight: -1,
                    },
                ],
                cfg_scale: OUTPUT_CONFIG.cfgScale,
                width: OUTPUT_CONFIG.width,
                height: OUTPUT_CONFIG.height,
                steps: OUTPUT_CONFIG.steps,
                sampler: OUTPUT_CONFIG.sampler,
                samples: 1,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as StabilityResponse;
        const artifact = data.artifacts?.[0];

        if (!artifact?.base64) {
            throw new Error("No image data in response");
        }

        if (artifact.finishReason === "CONTENT_FILTERED") {
            throw new Error("Content filtered by safety system");
        }

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(artifact.base64, "base64");

        // Resize and save
        ensureOutputDir(item.category);
        await sharp(imageBuffer)
            .resize(OUTPUT_CONFIG.size, OUTPUT_CONFIG.size, {
                fit: "cover",
                kernel: sharp.kernel.lanczos3,
            })
            .png()
            .toFile(outputPath);

        console.log(`    ✓ Saved to ${outputPath}`);

        return {
            id: item.id,
            category: item.category,
            success: true,
            path: outputPath,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        // Check if this is a content filter rejection - don't retry these
        const isContentFiltered = errorMessage.includes("CONTENT_FILTERED") || 
                                   errorMessage.includes("content filtered");
        
        if (isContentFiltered) {
            console.log(`    ✗ Skipped (content filter): ${item.name}`);
            return {
                id: item.id,
                category: item.category,
                success: false,
                error: `Content filter: ${errorMessage}`,
            };
        }

        // Retry logic with exponential backoff for other errors
        if (retryCount < OUTPUT_CONFIG.maxRetries) {
            const delay =
                OUTPUT_CONFIG.rateLimitDelay *
                Math.pow(OUTPUT_CONFIG.retryDelayMultiplier, retryCount);
            console.log(
                `    ⚠ Error: ${errorMessage}. Retrying in ${delay}ms...`
            );
            await sleep(delay);
            return generateIcon(item, retryCount + 1);
        }

        console.log(`    ✗ Failed: ${errorMessage}`);
        return {
            id: item.id,
            category: item.category,
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Generate all missing icons.
 */
async function generateAllIcons(items: IconItem[]): Promise<GenerationStats> {
    const stats: GenerationStats = {
        total: items.length,
        skipped: 0,
        generated: 0,
        failed: 0,
        results: [],
    };

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`[${i + 1}/${items.length}] ${item.category}/${item.id}`);

        const result = await generateIcon(item);
        stats.results.push(result);

        if (result.success) {
            stats.generated++;
        } else {
            stats.failed++;
        }

        // Rate limiting
        if (!isDryRun && i < items.length - 1) {
            await sleep(OUTPUT_CONFIG.rateLimitDelay);
        }
    }

    return stats;
}

// =============================================================================
// Reporting
// =============================================================================

/**
 * Save error log for failed generations.
 */
function saveErrorLog(stats: GenerationStats): void {
    const failures = stats.results.filter((r) => !r.success);
    if (failures.length === 0) return;

    const logPath = "icon-generation-errors.json";
    fs.writeFileSync(
        logPath,
        JSON.stringify(
            {
                timestamp: new Date().toISOString(),
                failures,
            },
            null,
            2
        )
    );
    console.log(`\nError log saved to ${logPath}`);
}

/**
 * Print summary statistics.
 */
function printSummary(
    stats: GenerationStats,
    existingCount: number
): void {
    const contentFiltered = stats.results.filter(r => 
        !r.success && r.error?.includes("Content filter")
    ).length;
    const otherFailed = stats.failed - contentFiltered;

    console.log("\n" + "=".repeat(50));
    console.log("GENERATION SUMMARY");
    console.log("=".repeat(50));
    console.log(`Total items:     ${stats.total + existingCount}`);
    console.log(`Already exist:   ${existingCount} (skipped)`);
    console.log(`To generate:     ${stats.total}`);
    if (!isDryRun) {
        console.log(`Generated:       ${stats.generated}`);
        if (contentFiltered > 0) {
            console.log(`Content filtered: ${contentFiltered} (logged for manual handling)`);
        }
        if (otherFailed > 0) {
            console.log(`Other failures:  ${otherFailed}`);
        }
    }
    console.log("=".repeat(50));
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
    console.log("=".repeat(50));
    console.log("AI ICON GENERATOR (Stable Diffusion XL)");
    console.log("=".repeat(50));

    if (isDryRun) {
        console.log("MODE: Dry run (no images will be generated)\n");
    }

    if (filterCategory) {
        console.log(`FILTER: Only ${filterCategory}\n`);
    }

    // Check API key (not required for dry run)
    if (!isDryRun && (!process.env.STABILITY_API_KEY || process.env.STABILITY_API_KEY === "your_api_key_here")) {
        console.error("ERROR: Please set your STABILITY_API_KEY in the .env file");
        console.error("Get your API key from https://platform.stability.ai/account/keys");
        process.exit(1);
    }

    // Collect and filter items
    const allItems = collectIconItems();
    const { toGenerate, existing } = filterMissingIcons(allItems);

    console.log(`Found ${allItems.length} total items`);
    console.log(`  - ${existing.length} already have icons (will skip)`);
    console.log(`  - ${toGenerate.length} need icons\n`);

    if (toGenerate.length === 0) {
        console.log("Nothing to generate. All icons already exist!");
        return;
    }

    // Estimate cost (SDXL is ~$0.002-0.004 per image on Stability AI)
    const estimatedCost = toGenerate.length * 0.003;
    console.log(
        `Estimated cost: ~$${estimatedCost.toFixed(2)} (${toGenerate.length} images @ ~$0.003/image)\n`
    );

    if (isDryRun) {
        console.log("Items that would be generated:");
        for (const item of toGenerate) {
            console.log(`  - [${item.category}] ${item.name} (${item.id})`);
        }
        console.log("\nRun without --dry-run to generate icons.");
        return;
    }

    // Generate icons
    console.log("Starting generation...\n");
    const stats = await generateAllIcons(toGenerate);

    // Save error log if needed
    saveErrorLog(stats);

    // Print summary
    printSummary(stats, existing.length);
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
