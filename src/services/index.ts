/**
 * Services Layer - Business logic and application services
 * Centralized export for all services with registration setup
 */

// Service exports
export * from "./SpellService";
export * from "./SaveService";
export * from "./ServiceManager";
export * from "./EntityService";
export * from "./UIService";
export * from "./SceneService";
export * from "./GameManagerBridge";

// Import services for registration
import { spellService } from "./SpellService";
import { saveService } from "./SaveService";
import { serviceManager } from "./ServiceManager";
import { stateManager } from "../core/state/StateManager";
import { EntityService } from "./EntityService";
import { UIService } from "./UIService";
import { SceneService } from "./SceneService";

// Create global service instances
const entityService = new EntityService();
const uiService = new UIService();
const sceneService = new SceneService();

// Service registration function
export async function initializeServices(): Promise<void> {
    console.log("[Services] Registering services...");

    // Register core services with dependencies and priorities
    serviceManager.registerService("StateManager", stateManager, [], 100); // Highest priority
    serviceManager.registerService(
        "SaveService",
        saveService,
        [{ service: "StateManager" }],
        80
    );
    serviceManager.registerService("SpellService", spellService, [], 60);
    serviceManager.registerService("EntityService", entityService, [], 50);
    serviceManager.registerService("UIService", uiService, [], 40);
    serviceManager.registerService("SceneService", sceneService, [], 30);

    // Initialize all services
    const result = await serviceManager.initializeAll();
    if (result.isFailure()) {
        throw new Error(`Failed to initialize services: ${result.error}`);
    }

    // Set up dependencies manually after initialization
    sceneService.setDependencies({
        entityService,
        uiService,
    });

    console.log("[Services] All services initialized successfully");
    serviceManager.logDependencyGraph();
}

export async function destroyServices(): Promise<void> {
    console.log("[Services] Destroying services...");

    const result = await serviceManager.destroyAll();
    if (result.isFailure()) {
        console.error(`Failed to destroy services: ${result.error}`);
    } else {
        console.log("[Services] All services destroyed successfully");
    }
}

// Re-export global instances for direct access
export {
    spellService,
    saveService,
    serviceManager,
    stateManager,
    entityService,
    uiService,
    sceneService,
};

