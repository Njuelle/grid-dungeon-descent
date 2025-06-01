import { Scene } from "phaser";
import { Unit } from "./Unit";

export class Grid {
    private scene: Scene;
    private graphics: Phaser.GameObjects.Graphics;
    public readonly size: number = 10;
    public readonly tileSize: number = 64;
    private startX: number;
    private startY: number;
    private walls: boolean[][];
    private wallSprites: Phaser.GameObjects.Sprite[];
    private floorSprites: Phaser.GameObjects.Sprite[];
    private borderSprites: Phaser.GameObjects.Sprite[];

    constructor(scene: Scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.startX =
            (scene.scale.width - (this.size + 2) * this.tileSize) / 2 +
            this.tileSize;
        this.startY =
            (scene.scale.height - (this.size + 2) * this.tileSize) / 2 -
            50 +
            this.tileSize;
        this.walls = [];
        this.wallSprites = [];
        this.floorSprites = [];
        this.borderSprites = [];

        // Initialize walls array
        for (let x = 0; x < this.size; x++) {
            this.walls[x] = [];
            for (let y = 0; y < this.size; y++) {
                this.walls[x][y] = false;
            }
        }

        this.generateRandomWalls();
        this.draw();
    }

    private generateRandomWalls(): void {
        // Number of wall clusters to generate
        const minClusters = 3;
        const maxClusters = 6;
        const clusterCount =
            Math.floor(Math.random() * (maxClusters - minClusters + 1)) +
            minClusters;

        console.log(`Generating ${clusterCount} wall clusters`);

        // Generate wall clusters
        for (let i = 0; i < clusterCount; i++) {
            this.generateWallCluster();
        }

        // Remove isolated walls (walls with no adjacent walls)
        this.removeIsolatedWalls();

        // Count total walls
        let totalWalls = 0;
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.walls[x][y]) totalWalls++;
            }
        }

        console.log(
            `Generated ${totalWalls} walls in ${clusterCount} clusters`
        );
    }

    private generateWallCluster(): void {
        const maxAttempts = 20;
        let attempts = 0;

        while (attempts < maxAttempts) {
            attempts++;

            // Random starting position for cluster
            const centerX = Math.floor(Math.random() * this.size);
            const centerY = Math.floor(Math.random() * this.size);

            // Don't place walls on the edges (where units spawn)
            if (
                centerX === 0 ||
                centerX === this.size - 1 ||
                centerX === this.size - 2
            ) {
                continue;
            }

            // Don't start a cluster on an existing wall
            if (this.walls[centerX][centerY]) {
                continue;
            }

            // Choose a random cluster pattern
            const patterns = [
                // L-shape
                [
                    [0, 0],
                    [1, 0],
                    [0, 1],
                ],
                [
                    [0, 0],
                    [-1, 0],
                    [0, 1],
                ],
                [
                    [0, 0],
                    [1, 0],
                    [0, -1],
                ],
                [
                    [0, 0],
                    [-1, 0],
                    [0, -1],
                ],
                // T-shape
                [
                    [0, 0],
                    [-1, 0],
                    [1, 0],
                    [0, 1],
                ],
                [
                    [0, 0],
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                ],
                [
                    [0, 0],
                    [0, -1],
                    [0, 1],
                    [1, 0],
                ],
                [
                    [0, 0],
                    [0, -1],
                    [0, 1],
                    [-1, 0],
                ],
                // Line (2-3 tiles)
                [
                    [0, 0],
                    [1, 0],
                ],
                [
                    [0, 0],
                    [0, 1],
                ],
                [
                    [0, 0],
                    [1, 0],
                    [2, 0],
                ],
                [
                    [0, 0],
                    [0, 1],
                    [0, 2],
                ],
                // Small square
                [
                    [0, 0],
                    [1, 0],
                    [0, 1],
                    [1, 1],
                ],
                // Plus shape
                [
                    [0, 0],
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1],
                ],
            ];

            const pattern =
                patterns[Math.floor(Math.random() * patterns.length)];

            // Check if we can place this pattern
            let canPlace = true;
            const positions: { x: number; y: number }[] = [];

            for (const [dx, dy] of pattern) {
                const x = centerX + dx;
                const y = centerY + dy;

                // Check boundaries
                if (!this.isValidPosition(x, y)) {
                    canPlace = false;
                    break;
                }

                // Don't place on edges
                if (x === 0 || x === this.size - 1 || x === this.size - 2) {
                    canPlace = false;
                    break;
                }

                // Don't overlap existing walls
                if (this.walls[x][y]) {
                    canPlace = false;
                    break;
                }

                positions.push({ x, y });
            }

            // Check if this would block paths
            if (canPlace) {
                // Temporarily place walls
                for (const pos of positions) {
                    this.walls[pos.x][pos.y] = true;
                }

                // Check if it blocks critical paths
                if (this.wouldBlockCriticalPath()) {
                    // Remove walls
                    for (const pos of positions) {
                        this.walls[pos.x][pos.y] = false;
                    }
                    canPlace = false;
                }
            }

            if (canPlace) {
                // Successfully placed a cluster
                return;
            }
        }
    }

    private removeIsolatedWalls(): void {
        const toRemove: { x: number; y: number }[] = [];

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.walls[x][y]) {
                    // Count adjacent walls
                    let adjacentWalls = 0;
                    const directions = [
                        [-1, 0],
                        [1, 0],
                        [0, -1],
                        [0, 1],
                        [-1, -1],
                        [-1, 1],
                        [1, -1],
                        [1, 1], // Include diagonals
                    ];

                    for (const [dx, dy] of directions) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (
                            this.isValidPosition(nx, ny) &&
                            this.walls[nx][ny]
                        ) {
                            adjacentWalls++;
                        }
                    }

                    // Remove walls with no adjacent walls
                    if (adjacentWalls === 0) {
                        toRemove.push({ x, y });
                    }
                }
            }
        }

        // Remove isolated walls
        for (const pos of toRemove) {
            this.walls[pos.x][pos.y] = false;
        }

        if (toRemove.length > 0) {
            console.log(`Removed ${toRemove.length} isolated walls`);
        }
    }

    private wouldBlockCriticalPath(): boolean {
        // Check if there's a path from left side to right side
        // This ensures the battlefield remains traversable

        // Try multiple starting points on the left
        const leftPoints = [2, 4, 6, 8];
        const rightPoints = [7, 8, 9];

        for (const ly of leftPoints) {
            for (const ry of rightPoints) {
                const path = this.findPath(0, ly, this.size - 1, ry);
                if (path !== null) {
                    // Found at least one valid path
                    return false;
                }
            }
        }

        // No path found - this would block critical movement
        return true;
    }

    private wouldBlockPath(wallX: number, wallY: number): boolean {
        // This method is now deprecated but kept for compatibility
        // The new system uses wouldBlockCriticalPath instead
        return false;
    }

    private draw(): void {
        // Draw floor tiles first
        this.drawFloor();

        this.graphics.lineStyle(2, 0x444444);

        // Draw grid lines
        for (let i = 0; i <= this.size; i++) {
            // Horizontal lines
            this.graphics.moveTo(this.startX, this.startY + i * this.tileSize);
            this.graphics.lineTo(
                this.startX + this.size * this.tileSize,
                this.startY + i * this.tileSize
            );

            // Vertical lines
            this.graphics.moveTo(this.startX + i * this.tileSize, this.startY);
            this.graphics.lineTo(
                this.startX + i * this.tileSize,
                this.startY + this.size * this.tileSize
            );
        }

        this.graphics.strokePath();

        // Draw walls
        this.drawWalls();

        // Draw borders
        this.drawBorders();
    }

    private drawFloor(): void {
        // Clear existing floor sprites
        this.floorSprites.forEach((floor) => floor.destroy());
        this.floorSprites = [];

        // Decide how many floor2 tiles we'll have (3 or 4)
        const maxFloor2Tiles = Math.random() < 0.5 ? 3 : 4;
        let floor2Count = 0;

        // Create floor sprites for all tiles
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const worldPos = this.gridToWorld(x, y);

                let floorTexture: string;

                // If we haven't placed all floor2 tiles yet, there's a chance to place one
                if (floor2Count < maxFloor2Tiles && Math.random() < 0.1) {
                    floorTexture = "floor2";
                    floor2Count++;
                } else {
                    // Otherwise, choose between floor1 and floor3 (50/50)
                    floorTexture = Math.random() < 0.5 ? "floor1" : "floor3";
                }

                // Create floor sprite
                const floorSprite = this.scene.add.sprite(
                    worldPos.x,
                    worldPos.y,
                    floorTexture
                );

                // Scale the sprite to fit exactly 64x64 (the tile size)
                const scaleX = this.tileSize / floorSprite.width;
                const scaleY = this.tileSize / floorSprite.height;
                floorSprite.setScale(scaleX, scaleY);

                // Set depth to 0 so it appears below everything
                floorSprite.setDepth(0);

                // Store reference for cleanup
                this.floorSprites.push(floorSprite);
            }
        }

        // If we didn't place enough floor2 tiles, randomly replace some tiles
        while (floor2Count < maxFloor2Tiles) {
            const randomIndex = Math.floor(
                Math.random() * this.floorSprites.length
            );
            const sprite = this.floorSprites[randomIndex];

            // Only replace if it's not already a floor2
            if (sprite.texture.key !== "floor2") {
                sprite.setTexture("floor2");
                floor2Count++;
            }
        }
    }

    private drawWalls(): void {
        // Clear existing wall sprites
        this.wallSprites.forEach((wall) => wall.destroy());
        this.wallSprites = [];

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.walls[x][y]) {
                    const worldPos = this.gridToWorld(x, y);

                    // Create wall sprite using the columns texture
                    const wallSprite = this.scene.add.sprite(
                        worldPos.x,
                        worldPos.y,
                        "column"
                    );

                    // Scale the sprite to fit exactly 64x64 (the tile size)
                    const scaleX = this.tileSize / wallSprite.width;
                    const scaleY = this.tileSize / wallSprite.height;
                    wallSprite.setScale(scaleX, scaleY);

                    // Set depth to ensure walls appear above grid but below units
                    wallSprite.setDepth(0.5);

                    // Store reference for cleanup
                    this.wallSprites.push(wallSprite);
                }
            }
        }
    }

    public gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
        return {
            x: this.startX + gridX * this.tileSize + this.tileSize / 2,
            y: this.startY + gridY * this.tileSize + this.tileSize / 2,
        };
    }

    public worldToGrid(
        worldX: number,
        worldY: number
    ): { x: number; y: number } | null {
        const gridX = Math.floor((worldX - this.startX) / this.tileSize);
        const gridY = Math.floor((worldY - this.startY) / this.tileSize);

        if (
            gridX >= 0 &&
            gridX < this.size &&
            gridY >= 0 &&
            gridY < this.size
        ) {
            return { x: gridX, y: gridY };
        }

        return null;
    }

    public isValidPosition(gridX: number, gridY: number): boolean {
        return (
            gridX >= 0 && gridX < this.size && gridY >= 0 && gridY < this.size
        );
    }

    public isWall(gridX: number, gridY: number): boolean {
        if (!this.isValidPosition(gridX, gridY)) {
            return true; // Treat out of bounds as walls
        }
        return this.walls[gridX][gridY];
    }

    public isBlocked(gridX: number, gridY: number): boolean {
        return this.isWall(gridX, gridY);
    }

    public getDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    public hasLineOfSight(
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ): boolean {
        // Use Bresenham's line algorithm to check if there's a clear line of sight
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        let x = x1;
        let y = y1;
        let prevX = x1;
        let prevY = y1;

        while (true) {
            // Check if current position is a wall (but not the start or end position)
            if (
                (x !== x1 || y !== y1) &&
                (x !== x2 || y !== y2) &&
                this.isWall(x, y)
            ) {
                return false;
            }

            // Check for diagonal movement through corners
            if (x !== prevX && y !== prevY) {
                // We moved diagonally - check if we're passing through a corner
                // Check the two adjacent cells that form the corner
                if (this.isWall(prevX, y) && this.isWall(x, prevY)) {
                    // Both corners are walls - can't pass through diagonally
                    return false;
                }
            }

            if (x === x2 && y === y2) {
                break;
            }

            prevX = x;
            prevY = y;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }

        return true;
    }

    // Find all tiles reachable within a given movement range using BFS
    public getReachableTiles(
        startX: number,
        startY: number,
        maxRange: number,
        excludeOccupied: (x: number, y: number) => boolean
    ): { x: number; y: number }[] {
        const reachable: { x: number; y: number }[] = [];
        const visited: boolean[][] = [];
        const distances: number[][] = [];

        // Initialize arrays
        for (let x = 0; x < this.size; x++) {
            visited[x] = [];
            distances[x] = [];
            for (let y = 0; y < this.size; y++) {
                visited[x][y] = false;
                distances[x][y] = Infinity;
            }
        }

        // BFS queue: [x, y, distance]
        const queue: [number, number, number][] = [[startX, startY, 0]];
        distances[startX][startY] = 0;
        visited[startX][startY] = true;

        // Directions: up, right, down, left
        const directions = [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
        ];

        while (queue.length > 0) {
            const [currentX, currentY, currentDist] = queue.shift()!;

            // Add current tile to reachable (except starting position)
            if (
                currentDist > 0 &&
                currentDist <= maxRange &&
                !excludeOccupied(currentX, currentY)
            ) {
                reachable.push({ x: currentX, y: currentY });
            }

            // Check all adjacent tiles
            for (const [dx, dy] of directions) {
                const newX = currentX + dx;
                const newY = currentY + dy;
                const newDist = currentDist + 1;

                // Check if new position is valid
                if (
                    this.isValidPosition(newX, newY) &&
                    !visited[newX][newY] &&
                    !this.isWall(newX, newY) &&
                    newDist <= maxRange
                ) {
                    // Check if occupied (but still allow pathfinding through)
                    const isOccupied = excludeOccupied(newX, newY);

                    visited[newX][newY] = true;
                    distances[newX][newY] = newDist;

                    // Only continue pathfinding from non-occupied tiles
                    if (!isOccupied || (newX === startX && newY === startY)) {
                        queue.push([newX, newY, newDist]);
                    }
                }
            }
        }

        return reachable;
    }

    // Find shortest path between two points avoiding walls (A* algorithm)
    public findPath(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        excludeOccupied?: (x: number, y: number) => boolean
    ): { x: number; y: number }[] | null {
        // If start and end are the same, return empty path
        if (startX === endX && startY === endY) {
            return [];
        }

        // If start or end is invalid, return null
        if (
            !this.isValidPosition(startX, startY) ||
            !this.isValidPosition(endX, endY)
        ) {
            return null;
        }

        // If end is a wall, return null
        if (this.isWall(endX, endY)) {
            return null;
        }

        const openSet: {
            x: number;
            y: number;
            f: number;
            g: number;
            parent: { x: number; y: number } | null;
        }[] = [];
        const closedSet: Map<
            string,
            { x: number; y: number; parent: { x: number; y: number } | null }
        > = new Map();

        // Add start node
        openSet.push({
            x: startX,
            y: startY,
            g: 0,
            f: this.getDistance(startX, startY, endX, endY),
            parent: null,
        });

        const directions = [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
        ];

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
            if (current.x === endX && current.y === endY) {
                // Reconstruct path
                const path: { x: number; y: number }[] = [];
                let currentNode: {
                    x: number;
                    y: number;
                    parent: { x: number; y: number } | null;
                } | null = current;

                // Build path from end to start
                const pathNodes: { x: number; y: number }[] = [];

                while (currentNode) {
                    pathNodes.push({ x: currentNode.x, y: currentNode.y });

                    if (currentNode.parent) {
                        const parentKey: string = `${currentNode.parent.x},${currentNode.parent.y}`;
                        currentNode = closedSet.get(parentKey) || {
                            x: currentNode.parent.x,
                            y: currentNode.parent.y,
                            parent: null,
                        };
                    } else {
                        break;
                    }
                }

                // Reverse to get path from start to end (excluding the start position)
                for (let i = pathNodes.length - 2; i >= 0; i--) {
                    path.push(pathNodes[i]);
                }

                console.log(
                    `Path from (${startX},${startY}) to (${endX},${endY}):`,
                    path
                );
                return path;
            }

            closedSet.set(currentKey, {
                x: current.x,
                y: current.y,
                parent: current.parent,
            });

            // Check neighbors
            for (const [dx, dy] of directions) {
                const newX = current.x + dx;
                const newY = current.y + dy;
                const newKey = `${newX},${newY}`;

                // Skip if invalid position
                if (!this.isValidPosition(newX, newY)) continue;

                // Skip if wall
                if (this.isWall(newX, newY)) continue;

                // Skip if in closed set
                if (closedSet.has(newKey)) continue;

                // Skip if occupied (unless it's the destination)
                if (
                    excludeOccupied &&
                    excludeOccupied(newX, newY) &&
                    !(newX === endX && newY === endY)
                )
                    continue;

                const g = current.g + 1;
                const h = this.getDistance(newX, newY, endX, endY);
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
                        g: g,
                        f: f,
                        parent: { x: current.x, y: current.y },
                    });
                } else if (g < openSet[existingIndex].g) {
                    // Update existing node if this path is better
                    openSet[existingIndex].g = g;
                    openSet[existingIndex].f = f;
                    openSet[existingIndex].parent = {
                        x: current.x,
                        y: current.y,
                    };
                }
            }
        }

        // No path found
        return null;
    }

    // Get the movement cost to reach a tile (returns Infinity if unreachable)
    public getMovementCost(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        excludeOccupied?: (x: number, y: number) => boolean
    ): number {
        const path = this.findPath(startX, startY, endX, endY, excludeOccupied);
        return path ? path.length : Infinity;
    }

    private drawBorders(): void {
        // Clear existing border sprites
        this.borderSprites.forEach((border) => border.destroy());
        this.borderSprites = [];

        // Draw corners
        // Top-left corner
        this.addBorderSprite(
            this.startX - this.tileSize / 2,
            this.startY - this.tileSize / 2,
            "border_wall_corner_top_left"
        );

        // Top-right corner
        this.addBorderSprite(
            this.startX + this.size * this.tileSize + this.tileSize / 2,
            this.startY - this.tileSize / 2,
            "border_wall_corner_top_right"
        );

        // Bottom-left corner
        this.addBorderSprite(
            this.startX - this.tileSize / 2,
            this.startY + this.size * this.tileSize + this.tileSize / 2,
            "border_wall_corner_bottom_left"
        );

        // Bottom-right corner
        this.addBorderSprite(
            this.startX + this.size * this.tileSize + this.tileSize / 2,
            this.startY + this.size * this.tileSize + this.tileSize / 2,
            "border_wall_corner_bottom_right"
        );

        // Draw edges
        for (let i = 0; i < this.size; i++) {
            // Top edge
            this.addBorderSprite(
                this.startX + i * this.tileSize + this.tileSize / 2,
                this.startY - this.tileSize / 2,
                "border_wall_top"
            );

            // Bottom edge
            this.addBorderSprite(
                this.startX + i * this.tileSize + this.tileSize / 2,
                this.startY + this.size * this.tileSize + this.tileSize / 2,
                "border_wall_bottom"
            );

            // Left edge
            this.addBorderSprite(
                this.startX - this.tileSize / 2,
                this.startY + i * this.tileSize + this.tileSize / 2,
                "border_wall_left"
            );

            // Right edge
            this.addBorderSprite(
                this.startX + this.size * this.tileSize + this.tileSize / 2,
                this.startY + i * this.tileSize + this.tileSize / 2,
                "border_wall_right"
            );
        }
    }

    private addBorderSprite(x: number, y: number, texture: string): void {
        const borderSprite = this.scene.add.sprite(x, y, texture);

        // Scale the sprite to fit exactly 64x64 (the tile size)
        const scaleX = this.tileSize / borderSprite.width;
        const scaleY = this.tileSize / borderSprite.height;
        borderSprite.setScale(scaleX, scaleY);

        // Set depth to ensure borders appear above floor but below units
        borderSprite.setDepth(1);

        // Store reference for cleanup
        this.borderSprites.push(borderSprite);
    }

    public getTilesInArea(
        shape: "circle" | "line" | "cone",
        radius: number,
        p1x: number, // centerX for circle, casterX for line/cone
        p1y: number, // centerY for circle, casterY for line/cone
        p2x?: number, // Optional: targetX for line/cone
        p2y?: number // Optional: targetY for line/cone
    ): { x: number; y: number }[] {
        const affectedTiles: { x: number; y: number }[] = [];

        if (shape === "circle") {
            const centerX = p1x;
            const centerY = p1y;
            for (let x = 0; x < this.size; x++) {
                for (let y = 0; y < this.size; y++) {
                    if (this.isWall(x, y)) continue;
                    const distance = this.getDistance(centerX, centerY, x, y);
                    if (distance <= radius) {
                        affectedTiles.push({ x, y });
                    }
                }
            }
        } else if (
            (shape === "line" || shape === "cone") &&
            p2x !== undefined &&
            p2y !== undefined
        ) {
            const casterX = p1x;
            const casterY = p1y;
            const targetX = p2x;
            const targetY = p2y;

            if (shape === "line") {
                // Line extends from caster towards target for 'radius' (length)
                // Uses Bresenham's algorithm to trace the line
                let dx = Math.abs(targetX - casterX);
                let dy = Math.abs(targetY - casterY);
                let sx = casterX < targetX ? 1 : -1;
                let sy = casterY < targetY ? 1 : -1;
                let err = dx - dy;
                let currentX = casterX;
                let currentY = casterY;
                let lengthCovered = 0;

                // Iterate for the length of the line or until grid boundary/wall
                for (let i = 0; i < radius; i++) {
                    // Add current tile (if valid and not a wall)
                    // The first tile (caster's tile) is usually not part of the damaging line effect itself
                    if (
                        i > 0 ||
                        (currentX === targetX && currentY === targetY)
                    ) {
                        // start from tile after caster or if target is caster itself
                        if (
                            this.isValidPosition(currentX, currentY) &&
                            !this.isWall(currentX, currentY)
                        ) {
                            if (
                                !affectedTiles.some(
                                    (t) => t.x === currentX && t.y === currentY
                                )
                            ) {
                                affectedTiles.push({
                                    x: currentX,
                                    y: currentY,
                                });
                            }
                        }
                    }

                    if (
                        currentX === targetX &&
                        currentY === targetY &&
                        i < radius - 1 &&
                        (dx > 0 || dy > 0)
                    ) {
                        // If we've hit the primary target but the line is longer,
                        // continue in the same direction from the target.
                        // This makes the primary target one of the N tiles, not necessarily the last.
                        // To do this, we effectively "project" a new target further along the line.
                        let lastStepX = currentX;
                        let lastStepY = currentY;
                        let e2 = 2 * err;
                        if (e2 > -dy) {
                            err -= dy;
                            lastStepX += sx;
                        }
                        if (e2 < dx) {
                            err += dx;
                            lastStepY += sy;
                        }
                        // If we can't move further (stuck), break
                        if (
                            lastStepX === currentX &&
                            lastStepY === currentY &&
                            (dx > 0 || dy > 0)
                        )
                            break;
                        currentX = lastStepX;
                        currentY = lastStepY;
                    } else if (
                        currentX === targetX &&
                        currentY === targetY &&
                        !(dx > 0 || dy > 0)
                    ) {
                        // Caster and target are same, line of length 1 hits this tile.
                        // (already handled by the first tile logic if radius > 0)
                        if (
                            radius === 1 &&
                            this.isValidPosition(currentX, currentY) &&
                            !this.isWall(currentX, currentY)
                        ) {
                            if (
                                !affectedTiles.some(
                                    (t) => t.x === currentX && t.y === currentY
                                )
                            ) {
                                affectedTiles.push({
                                    x: currentX,
                                    y: currentY,
                                });
                            }
                        }
                        break; // Line ends if caster is target or no direction
                    } else {
                        let e2 = 2 * err;
                        let nextX = currentX;
                        let nextY = currentY;
                        if (e2 > -dy) {
                            err -= dy;
                            nextX += sx;
                        }
                        if (e2 < dx) {
                            err += dx;
                            nextY += sy;
                        }
                        // Break if cannot move further or stuck (Bresenham's ends)
                        if (
                            nextX === currentX &&
                            nextY === currentY &&
                            (dx > 0 || dy > 0)
                        )
                            break;
                        currentX = nextX;
                        currentY = nextY;
                    }

                    if (
                        !this.isValidPosition(currentX, currentY) ||
                        this.isWall(currentX, currentY)
                    ) {
                        // Stop if we go off grid or hit a wall, unless it's the first tile (target itself)
                        if (
                            !(
                                i === 0 &&
                                currentX === targetX &&
                                currentY === targetY
                            )
                        ) {
                            break;
                        }
                    }
                }
            } else if (shape === "cone") {
                // Cone AoE: originates at caster, aims towards target, fans out.
                const coneAngle = Math.PI / 2; // 90-degree cone (Pi/2 radians)
                const halfAngle = coneAngle / 2;

                // Vector from caster to target (direction of the cone's centerline)
                let dirX = targetX - casterX;
                let dirY = targetY - casterY;

                // If caster IS the target, cone has no direction. Default to a small area or specific rule.
                // For now, let's make it a small circle if no direction.
                if (dirX === 0 && dirY === 0) {
                    for (let x_ = casterX - 1; x_ <= casterX + 1; x_++) {
                        for (let y_ = casterY - 1; y_ <= casterY + 1; y_++) {
                            if (
                                this.isValidPosition(x_, y_) &&
                                !this.isWall(x_, y_) &&
                                this.getDistance(casterX, casterY, x_, y_) <= 1
                            ) {
                                if (
                                    !affectedTiles.some(
                                        (t) => t.x === x_ && t.y === y_
                                    )
                                ) {
                                    affectedTiles.push({ x: x_, y: y_ });
                                }
                            }
                        }
                    }
                    return affectedTiles; // Return early for this special case
                }

                const mainAngle = Math.atan2(dirY, dirX);

                for (let x = 0; x < this.size; x++) {
                    for (let y = 0; y < this.size; y++) {
                        if (this.isWall(x, y)) continue;
                        if (x === casterX && y === casterY) continue; // Don't include caster's own tile

                        const distToCaster = this.getDistance(
                            casterX,
                            casterY,
                            x,
                            y
                        );

                        if (distToCaster <= radius) {
                            const angleToTile = Math.atan2(
                                y - casterY,
                                x - casterX
                            );
                            let angleDiff = Math.abs(mainAngle - angleToTile);

                            // Normalize angle difference to be between 0 and PI
                            if (angleDiff > Math.PI) {
                                angleDiff = 2 * Math.PI - angleDiff;
                            }

                            if (angleDiff <= halfAngle) {
                                if (
                                    !affectedTiles.some(
                                        (t) => t.x === x && t.y === y
                                    )
                                ) {
                                    affectedTiles.push({ x, y });
                                }
                            }
                        }
                    }
                }
            }
        }
        return affectedTiles;
    }

    public getUnitsInArea(
        shape: "circle" | "line" | "cone",
        radius: number, // For circle/cone, radius; for line, length
        p1x: number, // centerX for circle, casterX for line/cone
        p1y: number, // centerY for circle, casterY for line/cone
        allUnits: Unit[],
        p2x?: number, // Optional: targetX for line/cone
        p2y?: number // Optional: targetY for line/cone
    ): Unit[] {
        const affectedTiles = this.getTilesInArea(
            shape,
            radius,
            p1x,
            p1y,
            p2x,
            p2y
        );
        const affectedUnits: Unit[] = [];
        for (const unit of allUnits) {
            if (
                affectedTiles.some(
                    (tile) => tile.x === unit.gridX && tile.y === unit.gridY
                )
            ) {
                affectedUnits.push(unit);
            }
        }
        return affectedUnits;
    }
}

