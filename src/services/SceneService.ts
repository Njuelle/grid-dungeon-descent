/**
 * SceneService - Scene lifecycle management and service coordination
 *
 * Manages Phaser scene transitions and ensures all services are properly
 * initialized, updated, and cleaned up during scene changes
 */

import { Service } from "../data/types";
import { Result } from "../utils/Result";
import { success, failure, eventBus, GameEvent } from "../core";
import { Scene } from "phaser";
import { entityService } from "./EntityService";
import { UIService } from "./UIService";

export interface SceneServiceDependencies {
    entityService: typeof entityService;
    uiService: UIService;
}

export interface SceneConfiguration {
    name: string;
    services: string[]; // List of service names to initialize for this scene
    setupCallback?: (scene: Scene) => Promise<void>;
    cleanupCallback?: (scene: Scene) => Promise<void>;
}

export class SceneService implements Service {
    public readonly name = "SceneService";
    private currentScene?: Scene;
    private sceneConfigurations = new Map<string, SceneConfiguration>();
    private dependencies?: SceneServiceDependencies;
    private initialized = false;

    constructor() {
        this.setupDefaultSceneConfigurations();
    }

    async initialize(): Promise<void> {
        try {
            // Dependencies will be injected via setDependencies method
            this.setupSceneEventHandlers();
            this.initialized = true;
        } catch (error) {
            throw new Error(`Failed to initialize SceneService: ${error}`);
        }
    }

    async destroy(): Promise<void> {
        await this.cleanup();
    }

    /**
     * Set dependencies after service initialization
     */
    public setDependencies(dependencies: SceneServiceDependencies): void {
        this.dependencies = dependencies;
    }

    async cleanup(): Promise<void> {
        if (this.currentScene) {
            await this.cleanupScene(this.currentScene);
        }
        this.currentScene = undefined;
        this.initialized = false;
    }

    /**
     * Register a scene configuration
     */
    public registerScene(config: SceneConfiguration): Result<void, string> {
        try {
            this.sceneConfigurations.set(config.name, config);
            return success(undefined);
        } catch (error) {
            return failure(`Failed to register scene: ${error}`);
        }
    }

    /**
     * Set the current active scene
     */
    public async setCurrentScene(scene: Scene): Promise<Result<void, string>> {
        try {
            // Cleanup previous scene if exists
            if (this.currentScene && this.currentScene !== scene) {
                await this.cleanupScene(this.currentScene);
            }

            this.currentScene = scene;
            await this.setupScene(scene);

            eventBus.emit(GameEvent.SCENE_CHANGED, {
                sceneName: scene.scene.key,
                sceneType: "game",
            });

            return success(undefined);
        } catch (error) {
            return failure(`Failed to set current scene: ${error}`);
        }
    }

    /**
     * Get the current active scene
     */
    public getCurrentScene(): Scene | undefined {
        return this.currentScene;
    }

    /**
     * Setup services for a scene
     */
    private async setupScene(scene: Scene): Promise<void> {
        if (!this.dependencies) return;

        console.log(`[SceneService] Setting up scene: ${scene.scene.key}`);

        // Get scene configuration
        const config = this.sceneConfigurations.get(scene.scene.key);

        // Setup EntityService
        if (!config || config.services.includes("entityService")) {
            this.dependencies.entityService.setScene(scene);
            console.log("[SceneService] EntityService configured for scene");
        }

        // Setup UIService
        if (!config || config.services.includes("uiService")) {
            this.dependencies.uiService.setScene(scene);
            console.log("[SceneService] UIService configured for scene");
        }

        // Run custom setup callback if provided
        if (config?.setupCallback) {
            await config.setupCallback(scene);
            console.log("[SceneService] Custom setup callback executed");
        }

        // Setup scene event handlers
        this.setupSceneSpecificHandlers(scene);

        console.log(`[SceneService] Scene setup completed: ${scene.scene.key}`);
    }

    /**
     * Cleanup services for a scene
     */
    private async cleanupScene(scene: Scene): Promise<void> {
        if (!this.dependencies) return;

        console.log(`[SceneService] Cleaning up scene: ${scene.scene.key}`);

        // Get scene configuration
        const config = this.sceneConfigurations.get(scene.scene.key);

        // Run custom cleanup callback if provided
        if (config?.cleanupCallback) {
            await config.cleanupCallback(scene);
            console.log("[SceneService] Custom cleanup callback executed");
        }

        // Cleanup UIService layouts
        this.dependencies.uiService.clearAllLayouts();

        // Note: EntityService cleanup handled by its own lifecycle

        console.log(
            `[SceneService] Scene cleanup completed: ${scene.scene.key}`
        );
    }

    /**
     * Setup default scene configurations
     */
    private setupDefaultSceneConfigurations(): void {
        // Game scene configuration
        this.sceneConfigurations.set("GameScene", {
            name: "GameScene",
            services: ["entityService", "uiService"],
            setupCallback: async (scene: Scene) => {
                // Initialize game-specific UI
                if (this.dependencies?.uiService) {
                    const statsResult =
                        this.dependencies.uiService.createPlayerStatsUI();
                    if (statsResult.isFailure()) {
                        console.warn(
                            "Failed to create player stats UI:",
                            statsResult.error
                        );
                    }
                }
            },
            cleanupCallback: async (scene: Scene) => {
                // Game-specific cleanup
                console.log("[SceneService] Game scene cleanup");
            },
        });

        // Menu scene configuration
        this.sceneConfigurations.set("MenuScene", {
            name: "MenuScene",
            services: ["uiService"], // Only UI needed for menu
            setupCallback: async (scene: Scene) => {
                console.log("[SceneService] Menu scene setup");
            },
        });

        // Loading scene configuration
        this.sceneConfigurations.set("LoadingScene", {
            name: "LoadingScene",
            services: [], // Minimal services for loading
        });
    }

    /**
     * Setup global scene event handlers
     */
    private setupSceneEventHandlers(): void {
        // Listen for scene changes from Phaser
        // This would typically be set up through Phaser's scene manager
        // For now, we'll rely on manual setCurrentScene calls
    }

    /**
     * Setup scene-specific event handlers
     */
    private setupSceneSpecificHandlers(scene: Scene): void {
        // Handle scene shutdown
        scene.events.once("shutdown", () => {
            console.log(
                `[SceneService] Scene shutting down: ${scene.scene.key}`
            );
            this.cleanupScene(scene);
        });

        // Handle scene pause/resume
        scene.events.on("pause", () => {
            console.log(`[SceneService] Scene paused: ${scene.scene.key}`);
            eventBus.emit(GameEvent.SCENE_PAUSED, {
                sceneName: scene.scene.key,
            });
        });

        scene.events.on("resume", () => {
            console.log(`[SceneService] Scene resumed: ${scene.scene.key}`);
            eventBus.emit(GameEvent.SCENE_RESUMED, {
                sceneName: scene.scene.key,
            });
        });

        // Handle scene ready
        scene.events.once("ready", () => {
            console.log(`[SceneService] Scene ready: ${scene.scene.key}`);
            eventBus.emit(GameEvent.SCENE_READY, {
                sceneName: scene.scene.key,
            });
        });
    }

    /**
     * Update all scene services (called from scene update loop)
     */
    public updateServices(deltaTime: number): void {
        if (!this.dependencies || !this.initialized) return;

        // Update EntityService systems
        this.dependencies.entityService.update(deltaTime);

        // UIService doesn't need frame-based updates (it's event-driven)
    }

    /**
     * Get scene configuration
     */
    public getSceneConfiguration(
        sceneName: string
    ): SceneConfiguration | undefined {
        return this.sceneConfigurations.get(sceneName);
    }

    /**
     * Check if scene has service enabled
     */
    public isServiceEnabledForScene(
        sceneName: string,
        serviceName: string
    ): boolean {
        const config = this.sceneConfigurations.get(sceneName);
        return !config || config.services.includes(serviceName);
    }

    /**
     * Manually trigger service setup for current scene
     */
    public async refreshCurrentScene(): Promise<Result<void, string>> {
        if (!this.currentScene) {
            return failure("No current scene to refresh");
        }

        try {
            await this.setupScene(this.currentScene);
            return success(undefined);
        } catch (error) {
            return failure(`Failed to refresh scene: ${error}`);
        }
    }

    /**
     * Add event listener for scene changes
     */
    public onSceneChanged(callback: (sceneName: string) => void): () => void {
        return eventBus.on(GameEvent.SCENE_CHANGED, (data) => {
            callback(data.sceneName);
        });
    }

    /**
     * Emergency cleanup - force cleanup of all services
     */
    public async emergencyCleanup(): Promise<void> {
        console.warn("[SceneService] Emergency cleanup initiated");

        if (this.dependencies) {
            try {
                this.dependencies.uiService.clearAllLayouts();
                // EntityService cleanup handled by ServiceManager
            } catch (error) {
                console.error(
                    "[SceneService] Error during emergency cleanup:",
                    error
                );
            }
        }

        this.currentScene = undefined;
    }
}

