/**
 * MovementSystem - Handles entity movement and pathfinding
 *
 * Manages movement validation, pathfinding, and movement state
 */

import { System } from "../Entity";
import {
    PositionComponent,
    MovementComponent,
    TeamComponent,
} from "../Component";
import { eventBus, GameEvent } from "../../events/EventBus";
import { RenderSystem } from "./RenderSystem";

export class MovementSystem extends System {
    private renderSystem?: RenderSystem;
    private gridSize: number = 10;

    public setRenderSystem(renderSystem: RenderSystem): void {
        this.renderSystem = renderSystem;
    }

    public update(deltaTime: number): void {
        // Process movement animations and state updates
        const movingEntities = this.getEntitiesWithComponents(
            "position",
            "movement"
        );

        for (const entity of movingEntities) {
            const movement =
                entity.getComponent<MovementComponent>("movement")!;

            // Handle movement completion
            if (movement.isMoving && !movement.movementPath?.length) {
                movement.isMoving = false;
                movement.targetPosition = undefined;

                // Emit movement complete event
                eventBus.emit(GameEvent.PLAYER_MOVED, {
                    entityId: entity.id,
                    position:
                        entity.getComponent<PositionComponent>("position"),
                });
            }
        }
    }

    /**
     * Check if an entity can move to a target position
     */
    public canMoveTo(
        entityId: string,
        targetX: number,
        targetY: number,
        gridState?: boolean[][]
    ): boolean {
        const entity = this.world.getEntity(entityId);
        if (!entity) return false;

        const position = entity.getComponent<PositionComponent>("position");
        const movement = entity.getComponent<MovementComponent>("movement");

        if (!position || !movement) return false;

        // Check bounds
        if (
            targetX < 0 ||
            targetX >= this.gridSize ||
            targetY < 0 ||
            targetY >= this.gridSize
        ) {
            return false;
        }

        // Check if currently moving
        if (movement.isMoving) return false;

        // Calculate distance
        const distance =
            Math.abs(targetX - position.gridX) +
            Math.abs(targetY - position.gridY);

        // Check movement range
        if (distance > movement.movementPoints) return false;

        // Check if position is occupied (if grid state provided)
        if (gridState && gridState[targetY] && gridState[targetY][targetX]) {
            return false;
        }

        return true;
    }

    /**
     * Move entity to target position with pathfinding
     */
    public moveToPosition(
        entityId: string,
        targetX: number,
        targetY: number,
        gridState?: boolean[][],
        onComplete?: () => void
    ): boolean {
        const entity = this.world.getEntity(entityId);
        if (!entity) return false;

        if (!this.canMoveTo(entityId, targetX, targetY, gridState)) {
            return false;
        }

        const position = entity.getComponent<PositionComponent>("position")!;
        const movement = entity.getComponent<MovementComponent>("movement")!;

        // Calculate path
        const path = this.findPath(
            { x: position.gridX, y: position.gridY },
            { x: targetX, y: targetY },
            gridState
        );

        if (!path.length) return false;

        // Calculate movement cost
        const movementCost = path.length;
        if (movementCost > movement.movementPoints) return false;

        // Update movement state
        movement.isMoving = true;
        movement.hasMovedThisTurn = true;
        movement.movementPath = path;
        movement.targetPosition = { x: targetX, y: targetY };

        // Consume movement points
        movement.movementPoints = Math.max(
            0,
            movement.movementPoints - movementCost
        );

        // Start visual movement animation
        if (this.renderSystem) {
            this.renderSystem.animateMovement(entityId, path, () => {
                movement.isMoving = false;
                movement.movementPath = undefined;
                movement.targetPosition = undefined;

                if (onComplete) onComplete();
            });
        } else {
            // Fallback: Update position immediately
            position.gridX = targetX;
            position.gridY = targetY;
            movement.isMoving = false;

            if (onComplete) onComplete();
        }

        // Emit movement start event
        eventBus.emit(GameEvent.PLAYER_ACTION, {
            action: "move",
            entityId: entityId,
            target: { x: targetX, y: targetY },
        });

        return true;
    }

    /**
     * Simple A* pathfinding implementation
     */
    private findPath(
        start: { x: number; y: number },
        goal: { x: number; y: number },
        gridState?: boolean[][]
    ): { x: number; y: number }[] {
        // For now, use simple direct path if no obstacles
        // In a full implementation, this would be proper A* algorithm

        const path: { x: number; y: number }[] = [];
        let currentX = start.x;
        let currentY = start.y;

        while (currentX !== goal.x || currentY !== goal.y) {
            // Move towards goal (simple pathfinding)
            if (currentX < goal.x) currentX++;
            else if (currentX > goal.x) currentX--;
            else if (currentY < goal.y) currentY++;
            else if (currentY > goal.y) currentY--;

            path.push({ x: currentX, y: currentY });

            // Safety check to prevent infinite loops
            if (path.length > 50) break;
        }

        return path;
    }

    /**
     * Check if entity can move given distance
     */
    public canMoveDistance(entityId: string, distance: number): boolean {
        const entity = this.world.getEntity(entityId);
        if (!entity) return false;

        const movement = entity.getComponent<MovementComponent>("movement");
        if (!movement) return false;

        return movement.movementPoints >= distance && !movement.isMoving;
    }

    /**
     * Get valid movement positions for an entity
     */
    public getValidMovePositions(
        entityId: string,
        gridState?: boolean[][]
    ): { x: number; y: number }[] {
        const entity = this.world.getEntity(entityId);
        if (!entity) return [];

        const position = entity.getComponent<PositionComponent>("position");
        const movement = entity.getComponent<MovementComponent>("movement");

        if (!position || !movement) return [];

        const validPositions: { x: number; y: number }[] = [];
        const range = movement.movementPoints;

        for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
                const distance = Math.abs(dx) + Math.abs(dy);
                if (distance === 0 || distance > range) continue;

                const x = position.gridX + dx;
                const y = position.gridY + dy;

                if (this.canMoveTo(entityId, x, y, gridState)) {
                    validPositions.push({ x, y });
                }
            }
        }

        return validPositions;
    }

    /**
     * Reset movement for new turn
     */
    public resetMovementForTurn(entityId: string): void {
        const entity = this.world.getEntity(entityId);
        if (!entity) return;

        const movement = entity.getComponent<MovementComponent>("movement");
        if (!movement) return;

        movement.movementPoints = movement.maxMovementPoints;
        movement.hasMovedThisTurn = false;
        movement.isMoving = false;
        movement.targetPosition = undefined;
        movement.movementPath = undefined;
    }

    /**
     * Add movement points to entity
     */
    public addMovementPoints(entityId: string, points: number): void {
        const entity = this.world.getEntity(entityId);
        if (!entity) return;

        const movement = entity.getComponent<MovementComponent>("movement");
        if (!movement) return;

        movement.movementPoints = Math.min(
            movement.maxMovementPoints,
            movement.movementPoints + points
        );
    }

    /**
     * Check if entity has moved this turn
     */
    public hasMovedThisTurn(entityId: string): boolean {
        const entity = this.world.getEntity(entityId);
        if (!entity) return false;

        const movement = entity.getComponent<MovementComponent>("movement");
        return movement?.hasMovedThisTurn || false;
    }
}
