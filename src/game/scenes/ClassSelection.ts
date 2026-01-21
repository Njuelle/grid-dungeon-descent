import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { GameProgress } from "../classes/GameProgress";
import { ClassSelectionUI } from "../ui/ClassSelectionUI";
import { PlayerClass } from "../core/types";

export class ClassSelection extends Scene {
    private classSelectionUI: ClassSelectionUI;

    constructor() {
        super("ClassSelection");
    }

    create() {
        // Create class selection UI
        this.classSelectionUI = new ClassSelectionUI(this);

        // Show class selection
        this.classSelectionUI.show({
            onClassSelected: (playerClass: PlayerClass) => {
                this.handleClassSelected(playerClass);
            },
        });

        EventBus.emit("current-scene-ready", this);
    }

    private handleClassSelected(playerClass: PlayerClass): void {
        console.log(`[ClassSelection] Selected class: ${playerClass}`);

        // Save selected class to GameProgress
        const progress = GameProgress.getInstance();
        progress.setClass(playerClass);

        // Hide UI with animation and transition to battle
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("TacticalBattle");
        });
    }

    shutdown() {
        if (this.classSelectionUI) {
            this.classSelectionUI.destroy();
        }
    }
}
