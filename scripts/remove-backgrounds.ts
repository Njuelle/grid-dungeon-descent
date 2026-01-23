/**
 * Background Removal Script
 * Removes solid backgrounds from generated icons by making them transparent.
 * 
 * Usage:
 *   npx ts-node scripts/remove-backgrounds.ts
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const ICONS_DIR = "public/assets/icons";
const CATEGORIES = ["spells", "bonuses", "artifacts"];

// Tolerance for color matching (0-255)
const COLOR_TOLERANCE = 30;

/**
 * Check if two colors are similar within tolerance
 */
function colorsAreSimilar(
    c1: { r: number; g: number; b: number },
    c2: { r: number; g: number; b: number },
    tolerance: number
): boolean {
    return (
        Math.abs(c1.r - c2.r) <= tolerance &&
        Math.abs(c1.g - c2.g) <= tolerance &&
        Math.abs(c1.b - c2.b) <= tolerance
    );
}

/**
 * Remove background from an image by making corner colors transparent
 */
async function removeBackground(inputPath: string): Promise<void> {
    try {
        const image = sharp(inputPath);
        const { data, info } = await image
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height, channels } = info;
        
        if (channels < 3) {
            console.log(`  Skipping ${inputPath} - not enough channels`);
            return;
        }

        // Sample corner colors to detect background
        const getPixel = (x: number, y: number) => {
            const idx = (y * width + x) * channels;
            return {
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2],
            };
        };

        // Get colors from corners
        const corners = [
            getPixel(0, 0),
            getPixel(width - 1, 0),
            getPixel(0, height - 1),
            getPixel(width - 1, height - 1),
        ];

        // Find most common corner color (likely background)
        let bgColor = corners[0];
        let maxCount = 0;
        for (const c of corners) {
            const count = corners.filter((other) =>
                colorsAreSimilar(c, other, COLOR_TOLERANCE)
            ).length;
            if (count > maxCount) {
                maxCount = count;
                bgColor = c;
            }
        }

        // Create new buffer with alpha channel
        const newData = Buffer.alloc(width * height * 4);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcIdx = (y * width + x) * channels;
                const dstIdx = (y * width + x) * 4;

                const pixel = {
                    r: data[srcIdx],
                    g: data[srcIdx + 1],
                    b: data[srcIdx + 2],
                };

                newData[dstIdx] = pixel.r;
                newData[dstIdx + 1] = pixel.g;
                newData[dstIdx + 2] = pixel.b;

                // Make background transparent
                if (colorsAreSimilar(pixel, bgColor, COLOR_TOLERANCE)) {
                    newData[dstIdx + 3] = 0; // Transparent
                } else {
                    newData[dstIdx + 3] = 255; // Opaque
                }
            }
        }

        // Save with transparency
        await sharp(newData, {
            raw: {
                width,
                height,
                channels: 4,
            },
        })
            .png()
            .toFile(inputPath + ".tmp");

        // Replace original
        fs.renameSync(inputPath + ".tmp", inputPath);
        console.log(`  ✓ Processed ${path.basename(inputPath)}`);
    } catch (error) {
        console.error(`  ✗ Error processing ${inputPath}:`, error);
    }
}

async function main(): Promise<void> {
    console.log("=".repeat(50));
    console.log("BACKGROUND REMOVAL");
    console.log("=".repeat(50));

    let totalProcessed = 0;

    for (const category of CATEGORIES) {
        const dir = path.join(ICONS_DIR, category);
        
        if (!fs.existsSync(dir)) {
            console.log(`Skipping ${category} - directory not found`);
            continue;
        }

        const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png"));
        console.log(`\nProcessing ${category} (${files.length} files)...`);

        for (const file of files) {
            await removeBackground(path.join(dir, file));
            totalProcessed++;
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`Processed ${totalProcessed} icons`);
    console.log("=".repeat(50));
}

main().catch(console.error);
