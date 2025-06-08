/**
 * ECS Module Exports
 *
 * Central export point for all ECS components, systems, and utilities
 */

// Core ECS
export { Entity, World, System, EntityBuilder } from "./Entity";
export type { EntityId } from "./Component";

// Components
export * from "./Component";

// Systems
export { RenderSystem } from "./systems/RenderSystem";
export { MovementSystem } from "./systems/MovementSystem";
export { CombatSystem } from "./systems/CombatSystem";
export type { AttackResult } from "./systems/CombatSystem";

// Entity Factories
export * from "./EntityFactory";

