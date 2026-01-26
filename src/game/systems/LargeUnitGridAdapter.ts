/**
 * LargeUnitGridAdapter - Handles 2x2 (and larger) unit grid operations.
 * 
 * This adapter wraps the existing Grid class to provide:
 * - Multi-tile collision detection
 * - Pathfinding for large units
 * - Distance calculations from unit edges
 * - Adjacency checks for melee attacks
 * 
 * Keeps Grid.ts unchanged while supporting boss 2x2 sprites.
 */

import { Grid } from "../classes/Grid";
import { GridPosition } from "../core/types";

export class LargeUnitGridAdapter {
    constructor(private grid: Grid) {}

    // =========================================================================
    // Tile Occupancy
    // =========================================================================

    /**
     * Get all tiles occupied by a unit at position (top-left origin).
     * Returns 1 tile for size=1, 4 tiles for size=2, etc.
     */
    public getOccupiedTiles(x: number, y: number, size: number): GridPosition[] {
        const tiles: GridPosition[] = [];
        for (let dx = 0; dx < size; dx++) {
            for (let dy = 0; dy < size; dy++) {
                tiles.push({ x: x + dx, y: y + dy });
            }
        }
        return tiles;
    }

    /**
     * Check if a unit of given size can occupy position.
     * All tiles must be valid, not walls, and not occupied.
     */
    public canFitAt(
        x: number,
        y: number,
        size: number,
        isOccupied: (x: number, y: number) => boolean
    ): boolean {
        const tiles = this.getOccupiedTiles(x, y, size);
        return tiles.every(t =>
            this.grid.isValidPosition(t.x, t.y) &&
            !this.grid.isWall(t.x, t.y) &&
            !isOccupied(t.x, t.y)
        );
    }

    /**
     * Check if a position is within any of the tiles occupied by a large unit.
     */
    public isPositionInUnit(
        unitX: number,
        unitY: number,
        size: number,
        checkX: number,
        checkY: number
    ): boolean {
        return (
            checkX >= unitX &&
            checkX < unitX + size &&
            checkY >= unitY &&
            checkY < unitY + size
        );
    }

    // =========================================================================
    // Distance Calculations
    // =========================================================================

    /**
     * Calculate distance from any edge of a large unit to a target.
     * Returns minimum Manhattan distance from any occupied tile to target.
     * Used for attack range calculations.
     */
    public getDistanceFromLargeUnit(
        unitX: number,
        unitY: number,
        size: number,
        targetX: number,
        targetY: number
    ): number {
        const tiles = this.getOccupiedTiles(unitX, unitY, size);
        return Math.min(...tiles.map(t =>
            this.grid.getDistance(t.x, t.y, targetX, targetY)
        ));
    }

    /**
     * Check if a target position is adjacent to any tile of a large unit.
     * Used for melee attack validation.
     */
    public isAdjacentToLargeUnit(
        unitX: number,
        unitY: number,
        size: number,
        targetX: number,
        targetY: number
    ): boolean {
        return this.getDistanceFromLargeUnit(unitX, unitY, size, targetX, targetY) === 1;
    }

    /**
     * Get all tiles adjacent to a large unit (for area effects like Heat Aura).
     */
    public getAdjacentTiles(
        unitX: number,
        unitY: number,
        size: number
    ): GridPosition[] {
        const occupied = this.getOccupiedTiles(unitX, unitY, size);
        const occupiedSet = new Set(occupied.map(t => `${t.x},${t.y}`));
        const adjacent: GridPosition[] = [];
        const adjacentSet = new Set<string>();

        const directions = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0],          [1, 0],
            [-1, 1],  [0, 1],  [1, 1]
        ];

        for (const tile of occupied) {
            for (const [dx, dy] of directions) {
                const nx = tile.x + dx;
                const ny = tile.y + dy;
                const key = `${nx},${ny}`;

                if (
                    !occupiedSet.has(key) &&
                    !adjacentSet.has(key) &&
                    this.grid.isValidPosition(nx, ny) &&
                    !this.grid.isWall(nx, ny)
                ) {
                    adjacentSet.add(key);
                    adjacent.push({ x: nx, y: ny });
                }
            }
        }

        return adjacent;
    }

    // =========================================================================
    // Pathfinding for Large Units
    // =========================================================================

    /**
     * Find path for a large unit using modified A*.
     * Checks if ALL tiles can fit at each step.
     */
    public findPathForLargeUnit(
        from: GridPosition,
        to: GridPosition,
        size: number,
        isOccupied: (x: number, y: number) => boolean,
        excludeSelf?: (x: number, y: number) => boolean
    ): GridPosition[] | null {
        // If start and end are the same, return empty path
        if (from.x === to.x && from.y === to.y) {
            return [];
        }

        // Check if destination is valid for large unit
        if (!this.canFitAtWithExclusion(to.x, to.y, size, isOccupied, excludeSelf)) {
            return null;
        }

        const gridSize = this.grid.size;
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
            f: this.grid.getDistance(from.x, from.y, to.x, to.y),
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

                // Skip if in closed set
                if (closedSet.has(newKey)) continue;

                // Check if large unit can fit at new position
                if (!this.canFitAtWithExclusion(newX, newY, size, isOccupied, excludeSelf)) {
                    continue;
                }

                const g = current.g + 1;
                const h = this.grid.getDistance(newX, newY, to.x, to.y);
                const f = g + h;

                // Check if already in open set
                const existingIndex = openSet.findIndex(
                    (node) => node.x === newX && node.y === newY
                );

                if (existingIndex === -1) {
                    openSet.push({
                        x: newX,
                        y: newY,
                        g,
                        f,
                        parent: current,
                    });
                } else if (g < openSet[existingIndex].g) {
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
     * Get reachable tiles for a large unit using BFS.
     */
    public getReachableTilesForLargeUnit(
        from: GridPosition,
        maxRange: number,
        size: number,
        isOccupied: (x: number, y: number) => boolean,
        excludeSelf?: (x: number, y: number) => boolean
    ): GridPosition[] {
        if (maxRange <= 0) {
            return [];
        }

        const reachable: GridPosition[] = [];
        const visited = new Set<string>();
        const directions = [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
        ];

        // BFS
        const queue: [number, number, number][] = [[from.x, from.y, 0]];
        visited.add(`${from.x},${from.y}`);

        while (queue.length > 0) {
            const [currentX, currentY, currentDist] = queue.shift()!;

            // Add to reachable (except starting position)
            if (currentDist > 0 && currentDist <= maxRange) {
                reachable.push({ x: currentX, y: currentY });
            }

            // Check adjacent tiles
            for (const [dx, dy] of directions) {
                const newX = currentX + dx;
                const newY = currentY + dy;
                const newKey = `${newX},${newY}`;
                const newDist = currentDist + 1;

                if (
                    !visited.has(newKey) &&
                    newDist <= maxRange &&
                    this.canFitAtWithExclusion(newX, newY, size, isOccupied, excludeSelf)
                ) {
                    visited.add(newKey);
                    queue.push([newX, newY, newDist]);
                }
            }
        }

        return reachable;
    }

    // =========================================================================
    // Line of Sight for Large Units
    // =========================================================================

    /**
     * Check if there's line of sight from any tile of large unit to target.
     */
    public hasLineOfSightFromLargeUnit(
        unitX: number,
        unitY: number,
        size: number,
        targetX: number,
        targetY: number
    ): boolean {
        const tiles = this.getOccupiedTiles(unitX, unitY, size);
        return tiles.some(t => this.grid.hasLineOfSight(t.x, t.y, targetX, targetY));
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    /**
     * Check if large unit can fit, optionally excluding certain positions (self).
     */
    private canFitAtWithExclusion(
        x: number,
        y: number,
        size: number,
        isOccupied: (x: number, y: number) => boolean,
        excludeSelf?: (x: number, y: number) => boolean
    ): boolean {
        const tiles = this.getOccupiedTiles(x, y, size);
        return tiles.every(t => {
            if (!this.grid.isValidPosition(t.x, t.y)) return false;
            if (this.grid.isWall(t.x, t.y)) return false;
            
            // If this is our own tile, don't count it as occupied
            if (excludeSelf && excludeSelf(t.x, t.y)) return true;
            
            return !isOccupied(t.x, t.y);
        });
    }

    /**
     * Reconstruct path from end node.
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
}

// Path node for A* algorithm
interface PathNode {
    x: number;
    y: number;
    g: number;
    f: number;
    parent: PathNode | null;
}
