/**
 * Boss exports
 */

export { Boss } from "./Boss";
export type { BossPhaseConfig } from "./Boss";
export { DreadWarlord } from "./DreadWarlord";
export { LichKing } from "./LichKing";
export { StormTitan } from "./StormTitan";
export { VoidReaver } from "./VoidReaver";
export { InfernalDragon } from "./InfernalDragon";

import { BossType } from "../../GameProgress";
import { Boss } from "./Boss";
import { DreadWarlord } from "./DreadWarlord";
import { LichKing } from "./LichKing";
import { StormTitan } from "./StormTitan";
import { VoidReaver } from "./VoidReaver";
import { InfernalDragon } from "./InfernalDragon";
import { Scene } from "phaser";

/**
 * Factory function to create a boss by type.
 */
export function createBoss(
    scene: Scene,
    bossType: BossType,
    gridX: number,
    gridY: number
): Boss {
    switch (bossType) {
        case "DreadWarlord":
            return new DreadWarlord(scene, gridX, gridY);
        case "LichKing":
            return new LichKing(scene, gridX, gridY);
        case "StormTitan":
            return new StormTitan(scene, gridX, gridY);
        case "VoidReaver":
            return new VoidReaver(scene, gridX, gridY);
        case "InfernalDragon":
            return new InfernalDragon(scene, gridX, gridY);
        default:
            console.warn(`Unknown boss type: ${bossType}, defaulting to DreadWarlord`);
            return new DreadWarlord(scene, gridX, gridY);
    }
}
