/**
 * Update Icon References Script
 * Updates game data files to replace emoji icons with generated icon references.
 * 
 * Usage:
 *   npm run update-icon-refs           # Update all data files
 *   npm run update-icon-refs -- --dry-run  # Show what would change
 */

import fs from "fs";
import path from "path";

import { IconCategory, OUTPUT_CONFIG, getIconKey } from "./icon-config";

// Import game data to get IDs
import { PLAYER_SPELLS } from "../src/game/data/spells";
import { ALL_BONUSES } from "../src/game/data/bonuses";
import { ALL_ARTIFACTS } from "../src/game/data/artifacts";

// =============================================================================
// Types
// =============================================================================

interface UpdateResult {
    file: string;
    changes: number;
    items: string[];
}

// =============================================================================
// CLI Arguments
// =============================================================================

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

// =============================================================================
// File Paths
// =============================================================================

const DATA_FILES = {
    spells: [
        "src/game/data/spells/warrior-spells.ts",
        "src/game/data/spells/ranger-spells.ts",
        "src/game/data/spells/magician-spells.ts",
        "src/game/data/spells/generic-spells.ts",
    ],
    bonuses: [
        "src/game/data/bonuses/common-bonuses.ts",
        "src/game/data/bonuses/warrior-bonuses.ts",
        "src/game/data/bonuses/ranger-bonuses.ts",
        "src/game/data/bonuses/magician-bonuses.ts",
    ],
    artifacts: [
        "src/game/data/artifacts/warrior-artifacts.ts",
        "src/game/data/artifacts/ranger-artifacts.ts",
        "src/game/data/artifacts/magician-artifacts.ts",
        "src/game/data/artifacts/generic-artifacts.ts",
    ],
};

// =============================================================================
// Icon Detection
// =============================================================================

/**
 * Check if an icon file exists for a given ID and category.
 */
function iconFileExists(category: IconCategory, id: string): boolean {
    const iconPath = path.join(
        OUTPUT_CONFIG.baseDir,
        category,
        `icon_${id}.png`
    );
    return fs.existsSync(iconPath);
}

/**
 * Get all IDs that have generated icons.
 */
function getGeneratedIconIds(): Map<string, IconCategory> {
    const iconMap = new Map<string, IconCategory>();

    // Check spells
    for (const spell of PLAYER_SPELLS) {
        if (iconFileExists("spells", spell.id)) {
            iconMap.set(spell.id, "spells");
        }
    }

    // Check bonuses
    for (const bonus of ALL_BONUSES) {
        if (iconFileExists("bonuses", bonus.id)) {
            iconMap.set(bonus.id, "bonuses");
        }
    }

    // Check artifacts
    for (const artifact of ALL_ARTIFACTS) {
        if (iconFileExists("artifacts", artifact.id)) {
            iconMap.set(artifact.id, "artifacts");
        }
    }

    return iconMap;
}

// =============================================================================
// File Updates
// =============================================================================

/**
 * Check if a string is an emoji (starts with an emoji character).
 */
function isEmoji(str: string): boolean {
    // Emoji regex pattern for common emoji ranges
    const emojiPattern = /^[\u{1F300}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{1F600}-\u{1F64F}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}|\u{2300}-\u{23FF}|\u{2B50}|\u{2B55}|\u{231A}-\u{231B}|\u{23E9}-\u{23F3}|\u{23F8}-\u{23FA}|\u{25AA}-\u{25AB}|\u{25B6}|\u{25C0}|\u{25FB}-\u{25FE}|\u{2614}-\u{2615}|\u{2648}-\u{2653}|\u{267F}|\u{2693}|\u{26A1}|\u{26AA}-\u{26AB}|\u{26BD}-\u{26BE}|\u{26C4}-\u{26C5}|\u{26CE}|\u{26D4}|\u{26EA}|\u{26F2}-\u{26F3}|\u{26F5}|\u{26FA}|\u{26FD}|\u{2702}|\u{2705}|\u{2708}-\u{270D}|\u{270F}|\u{2712}|\u{2714}|\u{2716}|\u{271D}|\u{2721}|\u{2728}|\u{2733}-\u{2734}|\u{2744}|\u{2747}|\u{274C}|\u{274E}|\u{2753}-\u{2755}|\u{2757}|\u{2763}-\u{2764}|\u{2795}-\u{2797}|\u{27A1}|\u{27B0}|\u{27BF}|\u{2934}-\u{2935}|\u{2B05}-\u{2B07}|\u{2B1B}-\u{2B1C}|\u{3030}|\u{303D}|\u{3297}|\u{3299}|\u{FE0F}]/u;
    return emojiPattern.test(str);
}

/**
 * Update a single file, replacing emoji icons with icon references.
 */
function updateFile(
    filePath: string,
    iconMap: Map<string, IconCategory>
): UpdateResult {
    const result: UpdateResult = {
        file: filePath,
        changes: 0,
        items: [],
    };

    if (!fs.existsSync(filePath)) {
        console.log(`  ⚠ File not found: ${filePath}`);
        return result;
    }

    let content = fs.readFileSync(filePath, "utf-8");
    let modified = content;

    // Find all id: "xxx" followed by icon: "yyy" patterns
    // This regex matches the pattern in the data files
    const idIconPattern = /id:\s*["']([^"']+)["'][^}]*?icon:\s*["']([^"']+)["']/gs;

    let match;
    while ((match = idIconPattern.exec(content)) !== null) {
        const id = match[1];
        const currentIcon = match[2];

        // Check if this ID has a generated icon
        if (iconMap.has(id)) {
            const newIconKey = getIconKey(id);

            // Only update if current icon is an emoji (not already an icon_ reference)
            if (!currentIcon.startsWith("icon_") && isEmoji(currentIcon)) {
                const oldPattern = `icon: "${currentIcon}"`;
                const newPattern = `icon: "${newIconKey}"`;

                if (modified.includes(oldPattern)) {
                    modified = modified.replace(oldPattern, newPattern);
                    result.changes++;
                    result.items.push(`${id}: ${currentIcon} → ${newIconKey}`);
                }
            }
        }
    }

    // Also handle single-quoted icons
    const idIconPatternSingle = /id:\s*['"]([^'"]+)['"][^}]*?icon:\s*['"]([^'"]+)['"]/gs;
    while ((match = idIconPatternSingle.exec(content)) !== null) {
        const id = match[1];
        const currentIcon = match[2];

        if (iconMap.has(id)) {
            const newIconKey = getIconKey(id);

            if (!currentIcon.startsWith("icon_") && isEmoji(currentIcon)) {
                const oldPattern = `icon: '${currentIcon}'`;
                const newPattern = `icon: '${newIconKey}'`;

                if (modified.includes(oldPattern)) {
                    modified = modified.replace(oldPattern, newPattern);
                    result.changes++;
                    result.items.push(`${id}: ${currentIcon} → ${newIconKey}`);
                }
            }
        }
    }

    // Write changes if not dry run
    if (result.changes > 0 && !isDryRun) {
        fs.writeFileSync(filePath, modified);
    }

    return result;
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
    console.log("=".repeat(50));
    console.log("UPDATE ICON REFERENCES");
    console.log("=".repeat(50));

    if (isDryRun) {
        console.log("MODE: Dry run (no files will be modified)\n");
    }

    // Get all IDs with generated icons
    const iconMap = getGeneratedIconIds();
    console.log(`Found ${iconMap.size} generated icons\n`);

    if (iconMap.size === 0) {
        console.log("No generated icons found. Run 'npm run generate-icons' first.");
        return;
    }

    // Update all data files
    const allResults: UpdateResult[] = [];
    let totalChanges = 0;

    for (const [category, files] of Object.entries(DATA_FILES)) {
        console.log(`\n[${category.toUpperCase()}]`);

        for (const file of files) {
            const result = updateFile(file, iconMap);
            allResults.push(result);
            totalChanges += result.changes;

            if (result.changes > 0) {
                console.log(`  ${file}: ${result.changes} changes`);
                for (const item of result.items) {
                    console.log(`    - ${item}`);
                }
            } else {
                console.log(`  ${file}: no changes needed`);
            }
        }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("SUMMARY");
    console.log("=".repeat(50));
    console.log(`Total files processed: ${allResults.length}`);
    console.log(`Total icon references updated: ${totalChanges}`);

    if (isDryRun && totalChanges > 0) {
        console.log("\nRun without --dry-run to apply changes.");
    }

    console.log("=".repeat(50));
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
