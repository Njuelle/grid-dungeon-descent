/**
 * Core foundation exports
 * This file provides easy access to all foundational components
 */

// Events
export * from "./events/EventBus";
export * from "./events/GameEvents";

// Systems
export * from "./systems/SpellSystem";

// State Management
export * from "./state/StateManager";

// ECS (Entity-Component-System)
export * from "./ecs";

// Types and Enums (re-exported for convenience)
export * from "../data/types";
export * from "../data/enums";

// Utilities
export * from "../utils";

// Core exports for common patterns
export { eventBus } from "./events/EventBus";
export { GameEvent } from "./events/GameEvents";
export { spellManager } from "./systems/SpellSystem";
export { stateManager } from "./state/StateManager";
export { success, failure, type Result } from "../utils/Result";

