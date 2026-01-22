import { Scene, GameObjects } from "phaser";

export class Preloader extends Scene {
    background: GameObjects.Image;

    constructor() {
        super("Preloader");
    }

    init() {
        // Get screen dimensions like main menu
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Create medieval parchment-like background overlay (same as main menu)
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x2d1b0e, 0x2d1b0e, 0x4a3019, 0x6b4423, 1);
        bgGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
        bgGraphics.setDepth(0);

        // Original background image with sepia tone (same as main menu)
        this.background = this.add.image(centerX, centerY, "background");
        this.background.setScale(
            Math.max(
                this.scale.width / this.background.width,
                this.scale.height / this.background.height
            )
        );
        this.background.setAlpha(0.4);
        this.background.setTint(0xd4af37); // Golden tint
        this.background.setDepth(1);

        // Add medieval atmospheric effects (same as main menu)
        this.createMedievalParticleEffects();

        // Game Title (same style as main menu)
        const mainTitle = this.add
            .text(centerX, centerY - 240, "GRID", {
                fontFamily: "serif",
                fontSize: "100px",
                color: "#d4af37", // Gold
                stroke: "#8b4513", // Saddle brown
                strokeThickness: 12,
                align: "center",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(100);

        const middleTitle = this.add
            .text(centerX, centerY - 160, "DUNGEON", {
                fontFamily: "serif",
                fontSize: "84px",
                color: "#cd853f", // Peru gold
                stroke: "#8b4513",
                strokeThickness: 8,
                align: "center",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(100);

        const subTitle = this.add
            .text(centerX, centerY - 90, "DESCENT", {
                fontFamily: "serif",
                fontSize: "84px",
                color: "#cd853f", // Peru gold
                stroke: "#8b4513",
                strokeThickness: 8,
                align: "center",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(100);

        // Add medieval glow effect to titles
        this.addMedievalGlowEffect(mainTitle);
        this.addMedievalGlowEffect(middleTitle);
        this.addMedievalGlowEffect(subTitle);

        // Loading text
        const loadingText = this.add
            .text(centerX, centerY + 20, "Assembling the Battlefield...", {
                fontSize: "24px",
                color: "#f5deb3",
                fontFamily: "serif",
                fontStyle: "italic",
            })
            .setOrigin(0.5)
            .setDepth(100);

        // Progress panel background (same style as main menu progress panel)
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x3e2723, 0.9); // Dark brown
        panelBg.fillRoundedRect(centerX - 300, centerY + 80, 600, 120, 12);

        // Ornate border (same as main menu)
        panelBg.lineStyle(3, 0x8b7355, 0.9); // Bronze border
        panelBg.strokeRoundedRect(centerX - 300, centerY + 80, 600, 120, 12);
        panelBg.lineStyle(1, 0xd4af37, 0.7); // Gold inner line
        panelBg.strokeRoundedRect(centerX - 297, centerY + 83, 594, 114, 10);
        panelBg.setDepth(100);

        // Medieval scroll decorations (corner flourishes) - same as main menu
        this.add
            .text(centerX - 285, centerY + 95, "⚜️", {
                fontSize: "24px",
                color: "#d4af37",
            })
            .setDepth(100);

        this.add
            .text(centerX + 261, centerY + 95, "⚜️", {
                fontSize: "24px",
                color: "#d4af37",
            })
            .setDepth(100);

        // Progress bar background (inner area)
        const progressInner = this.add.graphics();
        progressInner.fillStyle(0x1a1a1a, 1);
        progressInner.fillRoundedRect(centerX - 250, centerY + 130, 500, 30, 8);
        progressInner.lineStyle(2, 0x654321, 1);
        progressInner.strokeRoundedRect(
            centerX - 250,
            centerY + 130,
            500,
            30,
            8
        );
        progressInner.setDepth(100);

        // Progress bar fill (starts empty)
        const progressBar = this.add.graphics();
        progressBar.setDepth(100);

        // Progress percentage text (same style as main menu)
        const progressText = this.add
            .text(centerX, centerY + 175, "0%", {
                fontSize: "18px",
                color: "#f5deb3",
                fontFamily: "serif",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(100);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on("progress", (progress: number) => {
            //  Update the progress bar
            progressBar.clear();
            if (progress > 0) {
                const barWidth = 496 * progress;
                progressBar.fillStyle(0xd4af37, 1); // Gold fill
                progressBar.fillRoundedRect(
                    centerX - 248,
                    centerY + 132,
                    barWidth,
                    26,
                    6
                );

                // Add gold highlight
                progressBar.fillStyle(0xffd700, 0.6);
                progressBar.fillRoundedRect(
                    centerX - 248,
                    centerY + 132,
                    barWidth,
                    8,
                    6
                );
            }

            // Update percentage text
            progressText.setText(`${Math.round(progress * 100)}%`);

            // Update loading text based on progress
            if (progress < 0.3) {
                loadingText.setText("Forging weapons and armor...");
            } else if (progress < 0.6) {
                loadingText.setText("Recruiting heroes and enemies...");
            } else if (progress < 0.9) {
                loadingText.setText("Preparing the battlefield...");
            } else {
                loadingText.setText("Ready for battle!");
            }
        });

        // Add file loading progress
        this.load.on("fileprogress", (_file: any) => {
            // You could add specific file loading feedback here if needed
        });
    }

    private createMedievalParticleEffects(): void {
        // Create floating embers/sparks (same as main menu)
        const emberParticles = this.add.particles(0, 0, "star", {
            x: { min: 0, max: this.scale.width },
            y: { min: 0, max: this.scale.height },
            scale: { min: 0.05, max: 0.2 },
            alpha: { min: 0.2, max: 0.6 },
            speed: { min: 5, max: 20 },
            lifespan: 12000,
            frequency: 300,
            tint: [0xd4af37, 0xffd700, 0xff8c00, 0xdc143c], // Gold, orange, red embers
        });
        emberParticles.setDepth(50);

        // Create dust motes (same as main menu)
        const dustParticles = this.add.particles(0, 0, "star", {
            x: { min: 0, max: this.scale.width },
            y: { min: 0, max: this.scale.height },
            scale: { min: 0.03, max: 0.1 },
            alpha: { min: 0.1, max: 0.3 },
            speed: { min: 2, max: 8 },
            lifespan: 15000,
            frequency: 400,
            tint: [0x8b7355, 0xa0522d, 0xcd853f], // Earthy browns
        });
        dustParticles.setDepth(45);
    }

    private addMedievalGlowEffect(textObject: GameObjects.Text): void {
        // Create a warm, flickering glow animation like candlelight (same as main menu)
        this.tweens.add({
            targets: textObject,
            alpha: 0.7,
            duration: 1500 + Math.random() * 1000, // Irregular timing like flames
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath("assets");

        this.load.image("logo", "logo.png");
        this.load.image("star", "star.png");

        // Load wall sprite
        this.load.image("column", "walls/block.png");

        // Load border wall sprites
        this.load.image("border_wall_top", "walls/borders/border_wall_top.png");
        this.load.image(
            "border_wall_bottom",
            "walls/borders/border_wall_bottom.png"
        );
        this.load.image(
            "border_wall_left",
            "walls/borders/border_wall_left.png"
        );
        this.load.image(
            "border_wall_right",
            "walls/borders/border_wall_right.png"
        );
        this.load.image(
            "border_wall_corner_top_left",
            "walls/borders/border_wall_corner_top_left.png"
        );
        this.load.image(
            "border_wall_corner_top_right",
            "walls/borders/border_wall_worner_top_right.png"
        );
        this.load.image(
            "border_wall_corner_bottom_left",
            "walls/borders/border_wall_corner_bottom_left.png"
        );
        this.load.image(
            "border_wall_corner_bottom_right",
            "walls/borders/border_wall_corner_bottom_right.png"
        );

        // Load floor sprites
        this.load.image("floor1", "floor/floor1.png");
        this.load.image("floor2", "floor/floor2.png");
        this.load.image("floor3", "floor/floor3.png");

        // Load enemy sprites
        this.load.image(
            "skeleton_archer",
            "mobs/archer/skeleton_archer_idle.png"
        );
        this.load.image(
            "skeleton_warrior",
            "mobs/warrior/skeleton_warrior_idle.png"
        );
        this.load.image("skeleton_tank", "mobs/tank/skeleton_tank_idle.png");
        this.load.image(
            "skeleton_magician_idle",
            "mobs/magician/skeleton_magician_idle.png"
        );
        this.load.image("gobelin_idle", "mobs/gobelin/gobelin_idle.png");
        this.load.image(
            "necromancer_idle",
            "mobs/necromancer/necromancer_idle.png"
        );
        this.load.image("ogre_idle", "mobs/ogre/ogre_idle.png");
        this.load.image("troll_idle", "mobs/troll/troll_idle.png");

        // Load player sprites for all classes
        this.load.image("hero_warrior", "heros/warrior/hero_warrior_idle.png");
        this.load.image("hero_ranger", "heros/ranger/hero_ranger_idle.png");
        this.load.image("hero_magician", "heros/magician/hero_magician_idle.png");

        // Load spell icons
        this.load.image("icon_slash", "icons/spells/icon_slash.png");
        this.load.image(
            "icon_power_strike",
            "icons/spells/icon_power_strike.png"
        );
        this.load.image("icon_arrow_shot", "icons/spells/icon_arrow_shot.png");
        this.load.image(
            "icon_magic_missile",
            "icons/spells/icon_magic_missile.png"
        );
        this.load.image("icon_fire_ball", "icons/spells/icon_fire_ball.png");
        this.load.image(
            "icon_bone_piercer",
            "icons/spells/icon_bone_piercer.png"
        );

        // Load background music
        this.load.audio("battle_music", "music/battle-of-the-dragons-8037.mp3");

        // Load attack sounds
        this.load.audio("melee_attack", "sound/melee_attack.wav");
        this.load.audio("ranged_attack", "sound/ranged_attack.wav");
        this.load.audio("magic_attack", "sound/magic_attack.wav");
        this.load.audio("walk", "sound/walk.wav");
        this.load.audio("victory", "sound/victory.wav");
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start("MainMenu");
    }
}

