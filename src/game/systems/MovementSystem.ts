/**
 * MovementSystem - Handles all movement-related logic.
 * 
 * Responsibilities:
 * - Movement validation
 * - Pathfinding integration
 * - Movement point consumption
 * - Movement event emission
 */

import { UnitState, GridPosition } from "../core/types";
import { getManhattanDistance } from "../core/CombatCalculator";

// =============================================================================
// Movement Event Types
// =============================================================================

export type MovementEventType =
    | "movement_start"
    | "movement_step"
    | "movement_complete"
    | "movement_blocked";

export interface MovementEvent {
    type: MovementEventType;
    unitId: string;
    from: GridPosition;
    to: GridPosition;
    path?: GridPosition[];
    cost?: number;
}

export type MovementEventCallback = (event: MovementEvent) => void;

// =============================================================================
// Path Types
// =============================================================================

export interface PathNode {
    x: number;
    y: number;
    g: number; // Cost from start
    f: number; // Total cost (g + heuristic)
    parent: PathNode | null;
}

// =============================================================================
// MovementSystem Class
// =============================================================================

export class MovementSystem {
    private eventCallbacks: MovementEventCallback[] = [];

    // =========================================================================
    // Event Registration
    // =========================================================================

    /**
     * Register a callback for movement events.
     */
    public onMovementEvent(callback: MovementEventCallback): void {
        this.eventCallbacks.push(callback);
    }

    /**
     * Remove a callback.
     */
    public offMovementEvent(callback: MovementEventCallback): void {
        const index = this.eventCallbacks.indexOf(callback);
        if (index !== -1) {
            this.eventCallbacks.splice(index, 1);
        }
    }

    // =========================================================================
    // Movement Validation
    // =========================================================================

    /**
     * Checks if a unit can move to a position.
     */
    public canMoveTo(
        unit: UnitState,
        targetPos: GridPosition,
        gridSize: number,
        isWall: (x: number, y: number) => boolean,
        isOccupied: (x: number, y: number) => boolean
    ): { valid: boolean; reason?: string; cost?: number } {
        // Check if target is within grid bounds
        if (
            targetPos.x < 0 ||
            targetPos.x >= gridSize ||
            targetPos.y < 0 ||
            targetPos.y >= gridSize
        ) {
            return { valid: false, reason: "Target is out of bounds" };
        }

        // Check if target is a wall
        if (isWall(targetPos.x, targetPos.y)) {
            return { valid: false, reason: "Cannot move to a wall" };
        }

        // Check if target is occupied
        if (isOccupied(targetPos.x, targetPos.y)) {
            return { valid: false, reason: "Position is occupied" };
        }

        // Find path and check cost
        const path = this.findPath(
            unit.position,
            targetPos,
            gridSize,
            isWall,
            isOccupied
        );

        if (!path || path.length === 0) {
            return { valid: false, reason: "No valid path to target" };
        }

        const cost = path.length;

        // Check movement points
        if (
            unit.stats.movementPoints === undefined ||
            unit.stats.movementPoints < cost
        ) {
            return {
                valid: false,
                reason: `Not enough movement points (need ${cost}, have ${unit.stats.movementPoints || 0})`,
                cost,
            };
        }

        return { valid: true, cost };
    }

    /**
     * Gets the movement cost to a position.
     */
    public getMovementCost(
        unit: UnitState,
        targetPos: GridPosition,
        gridSize: number,
        isWall: (x: number, y: number) => boolean,
        isOccupied: (x: number, y: number) => boolean
    ): number {
        const path = this.findPath(
            unit.position,
            targetPos,
            gridSize,
            isWall,
            isOccupied
        );
        return path ? path.length : Infinity;
    }

    // =========================================================================
    // Pathfinding
    // =========================================================================

    /**
     * Finds a path between two positions using A* algorithm.
     */
    public findPath(
        from: GridPosition,
        to: GridPosition,
        gridSize: number,
        isWall: (x: number, y: number) => boolean,
        isOccupied: (x: number, y: number) => boolean
    ): GridPosition[] | null {
        // If start and end are the same, return empty path
        if (from.x === to.x && from.y === to.y) {
            return [];
        }

        // If start or end is invalid
        if (
            from.x < 0 || from.x >= gridSize ||
            from.y < 0 || from.y >= gridSize ||
            to.x < 0 || to.x >= gridSize ||
            to.y < 0 || to.y >= gridSize
        ) {
            return null;
        }

        // If end is a wall
        if (isWall(to.x, to.y)) {
            return null;
        }

        const openSet: PathNode[] = [];
        const closedSet: Map<string, PathNode> = new Map();
        const directions = [
            [0, -1], // Up
            [1, 0],  // Right
            [0, 1],  // Down
            [-1, 0], // Left
        ];

        // Add start node
        openSet.push({
            x: from.x,
            y: from.y,
            g: 0,
            f: getManhattanDistance(from.x, from.y, to.x, to.y),
            parent: null,
        });

        while (openSet.length > 0) {
            // Find node with lowest f score
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < openSet[currentIndex].f) {
                    currentIndex = i;
                }
            }

            const current = openSet.splice(currentIndex, 1)[0];
            const currentKey = `${current.x},${current.y}`;

            // Check if we reached the goal
            if (current.x === to.x && current.y === to.y) {
                return this.reconstructPath(current);
            }

            closedSet.set(currentKey, current);

            // Check neighbors
            for (const [dx, dy] of directions) {
                const newX = current.x + dx;
                const newY = current.y + dy;
                const newKey = `${newX},${newY}`;

                // Skip invalid positions
                if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
                    continue;
                }

                // Skip walls
                if (isWall(newX, newY)) continue;

                // Skip closed nodes
                if (closedSet.has(newKey)) continue;

                // Skip occupied (unless it's the destination)
                if (isOccupied(newX, newY) && !(newX === to.x && newY === to.y)) {
                    continue;
                }

                const g = current.g + 1;
                const h = getManhattanDistance(newX, newY, to.x, to.y);
                const f = g + h;

                // Check if already in open set
                const existingIndex = openSet.findIndex(
                    (node) => node.x === newX && node.y === newY
                );

                if (existingIndex === -1) {
                    // Add new node
                    openSet.push({
                        x: newX,
                        y: newY,
                        g,
                        f,
                        parent: current,
                    });
                } else if (g < openSet[existingIndex].g) {
                    // Update existing node if this path is better
                    openSet[existingIndex].g = g;
                    openSet[existingIndex].f = f;
                    openSet[existingIndex].parent = current;
                }
            }
        }

        // No path found
        return null;
    }

    /**
     * Reconstructs path from end node.
     */
    private reconstructPath(endNode: PathNode): GridPosition[] {
        const path: GridPosition[] = [];
        let current: PathNode | null = endNode;

        while (current && current.parent) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }

        return path;
    }

    /**
     * Gets all reachable tiles from a position within a range.
     */
    public getReachableTiles(
        from: GridPosition,
        maxRange: number,
        gridSize: number,
        isWall: (x: number, y: number) => boolean,
        isOccupied: (x: number, y: number) => boolean
    ): GridPosition[] {
        const reachable: GridPosition[] = [];
        const visited: boolean[][] = [];
        const distances: number[][] = [];
        const directions = [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
        ];

        // Initialize arrays
        for (let x = 0; x < gridSize; x++) {
            visited[x] = [];
            distances[x] = [];
            for (let y = 0; y < gridSize; y++) {
                visited[x][y] = false;
                distances[x][y] = Infinity;
            }
        }

        // BFS
        const queue: [number, number, number][] = [[from.x, from.y, 0]];
        distances[from.x][from.y] = 0;
        visited[from.x][from.y] = true;

        while (queue.length > 0) {
            const [currentX, currentY, currentDist] = queue.shift()!;

            // Add to reachable (except starting position)
            if (currentDist > 0 && currentDist <= maxRange && !isOccupied(currentX, currentY)) {
                reachable.push({ x: currentX, y: currentY });
            }

            // Check adjacent tiles
            for (const [dx, dy] of directions) {
                const newX = currentX + dx;
                const newY = currentY + dy;
                const newDist = currentDist + 1;

                if (
                    newX >= 0 &&
                    newX < gridSize &&
                    newY >= 0 &&
                    newY < gridSize &&
                    !visited[newX][newY] &&
                    !isWall(newX, newY) &&
                    newDist <= maxRange
                ) {
                    visited[newX][newY] = true;
                    distances[newX][newY] = newDist;

                    // Continue from non-occupied tiles
                    if (!isOccupied(newX, newY)) {
                        queue.push([newX, newY, newDist]);
                    }
                }
            }
        }

        return reachable;
    }

    /**
     * Gets tiles in attack range from a position.
     */
    public getTilesInRange(
        from: GridPosition,
        range: number,
        minRange: number,
        gridSize: number,
        isWall: (x: number, y: number) => boolean
    ): GridPosition[] {
        const tiles: GridPosition[] = [];

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (isWall(x, y)) continue;
                if (x === from.x && y === from.y) continue;

                const distance = getManhattanDistance(from.x, from.y, x, y);
                if (distance >= minRange && distance <= range) {
                    tiles.push({ x, y });
                }
            }
        }

        return tiles;
    }

    // =========================================================================
    // Movement Execution
    // =========================================================================

    /**
     * Emits movement events for a path.
     * Note: Actual unit state updates are handled by the caller.
     */
    public emitMovementAlongPath(
        unitId: string,
        startPos: GridPosition,
        path: GridPosition[]
    ): void {
        if (path.length === 0) return;

        this.emitEvent({
            type: "movement_start",
            unitId,
            from: startPos,
            to: path[path.length - 1],
            path,
            cost: path.length,
        });

        // Emit step events
        let currentPos = startPos;
        for (const step of path) {
            this.emitEvent({
                type: "movement_step",
                unitId,
                from: currentPos,
                to: step,
            });
            currentPos = step;
        }

        this.emitEvent({
            type: "movement_complete",
            unitId,
            from: startPos,
            to: path[path.length - 1],
            cost: path.length,
        });
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    private emitEvent(event: MovementEvent): void {
        for (const callback of this.eventCallbacks) {
            callback(event);
        }
    }
}
