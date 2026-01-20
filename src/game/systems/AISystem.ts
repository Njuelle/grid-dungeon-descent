/**
 * AISystem - Handles enemy AI decision making.
 * 
 * Responsibilities:
 * - Enemy turn decision making
 * - Target selection
 * - Movement planning
 * - Attack decisions
 */

import { UnitState, GridPosition } from "../core/types";
import { isAlive } from "../core/UnitState";
import { getManhattanDistance } from "../core/CombatCalculator";
import { MovementSystem } from "./MovementSystem";
import { CombatSystem } from "./CombatSystem";

// =============================================================================
// AI Action Types
// =============================================================================

export type AIActionType = "move" | "attack" | "wait";

export interface AIAction {
    type: AIActionType;
    unitId: string;
    targetPosition?: GridPosition;
    targetUnitId?: string;
    path?: GridPosition[];
}

export interface AITurnPlan {
    unitId: string;
    actions: AIAction[];
}

// =============================================================================
// AI Decision Types
// =============================================================================

export interface TargetEvaluation {
    targetId: string;
    distance: number;
    canAttack: boolean;
    canReachForAttack: boolean;
    priority: number;
    attackPosition?: GridPosition;
}

// =============================================================================
// AISystem Class
// =============================================================================

export class AISystem {
    private movementSystem: MovementSystem;
    private combatSystem: CombatSystem;

    constructor(movementSystem: MovementSystem, combatSystem: CombatSystem) {
        this.movementSystem = movementSystem;
        this.combatSystem = combatSystem;
    }

    // =========================================================================
    // Turn Planning
    // =========================================================================

    /**
     * Plans a turn for an enemy unit.
     */
    public planTurn(
        enemy: UnitState,
        targets: UnitState[],
        allUnits: UnitState[],
        gridSize: number,
        isWall: (x: number, y: number) => boolean
    ): AITurnPlan {
        const actions: AIAction[] = [];

        // Filter to alive targets only
        const aliveTargets = targets.filter(isAlive);
        if (aliveTargets.length === 0) {
            return { unitId: enemy.id, actions: [] };
        }

        // Create occupied check function
        const isOccupied = (x: number, y: number): boolean => {
            return allUnits.some(
                (u) =>
                    isAlive(u) &&
                    u.position.x === x &&
                    u.position.y === y &&
                    u.id !== enemy.id
            );
        };

        // Evaluate all targets
        const evaluations = this.evaluateTargets(
            enemy,
            aliveTargets,
            gridSize,
            isWall,
            isOccupied
        );

        // Sort by priority (highest first)
        evaluations.sort((a, b) => b.priority - a.priority);

        // Get the best target
        const bestTarget = evaluations[0];

        if (!bestTarget) {
            return { unitId: enemy.id, actions: [] };
        }

        // Check if we can attack current target from current position
        if (bestTarget.canAttack) {
            // Check line of sight
            const hasLOS = this.combatSystem.hasLineOfSight(
                enemy.position,
                { x: targets.find(t => t.id === bestTarget.targetId)!.position.x, y: targets.find(t => t.id === bestTarget.targetId)!.position.y },
                isWall,
                (x, y) => {
                    const unit = allUnits.find(u => u.position.x === x && u.position.y === y && isAlive(u) && u.id !== enemy.id);
                    return unit !== undefined && unit.id !== bestTarget.targetId;
                }
            );

            if (hasLOS) {
                // Attack immediately
                actions.push({
                    type: "attack",
                    unitId: enemy.id,
                    targetUnitId: bestTarget.targetId,
                });
                return { unitId: enemy.id, actions };
            }
        }

        // Need to move first
        if (bestTarget.attackPosition) {
            // Find path to attack position
            const path = this.movementSystem.findPath(
                enemy.position,
                bestTarget.attackPosition,
                gridSize,
                isWall,
                isOccupied
            );

            if (path && path.length > 0) {
                // Limit path to move range
                const maxPath = path.slice(0, enemy.stats.moveRange);

                if (maxPath.length > 0) {
                    actions.push({
                        type: "move",
                        unitId: enemy.id,
                        targetPosition: maxPath[maxPath.length - 1],
                        path: maxPath,
                    });
                }

                // Check if we can attack after moving
                const finalPosition = maxPath.length > 0 
                    ? maxPath[maxPath.length - 1] 
                    : enemy.position;

                const target = aliveTargets.find((t) => t.id === bestTarget.targetId);
                if (target) {
                    const newDistance = getManhattanDistance(
                        finalPosition.x,
                        finalPosition.y,
                        target.position.x,
                        target.position.y
                    );

                    if (newDistance <= enemy.stats.attackRange) {
                        const hasLOSAfterMove = this.combatSystem.hasLineOfSight(
                            finalPosition,
                            target.position,
                            isWall,
                            (x, y) => {
                                const unit = allUnits.find(u => u.position.x === x && u.position.y === y && isAlive(u) && u.id !== enemy.id);
                                return unit !== undefined && unit.id !== bestTarget.targetId;
                            }
                        );

                        if (hasLOSAfterMove) {
                            actions.push({
                                type: "attack",
                                unitId: enemy.id,
                                targetUnitId: bestTarget.targetId,
                            });
                        }
                    }
                }
            }
        } else {
            // No attack position found, just move towards target
            const target = aliveTargets.find((t) => t.id === bestTarget.targetId);
            if (target) {
                const path = this.movementSystem.findPath(
                    enemy.position,
                    target.position,
                    gridSize,
                    isWall,
                    (x, y) => isOccupied(x, y) && !(x === target.position.x && y === target.position.y)
                );

                if (path && path.length > 0) {
                    // Move as close as possible
                    const maxPath = path.slice(0, enemy.stats.moveRange);
                    
                    // Don't move into the target's tile
                    const safePath = maxPath.filter(
                        (p) => p.x !== target.position.x || p.y !== target.position.y
                    );

                    if (safePath.length > 0) {
                        actions.push({
                            type: "move",
                            unitId: enemy.id,
                            targetPosition: safePath[safePath.length - 1],
                            path: safePath,
                        });
                    }
                }
            }
        }

        return { unitId: enemy.id, actions };
    }

    // =========================================================================
    // Target Evaluation
    // =========================================================================

    /**
     * Evaluates all potential targets for an enemy.
     */
    private evaluateTargets(
        enemy: UnitState,
        targets: UnitState[],
        gridSize: number,
        isWall: (x: number, y: number) => boolean,
        isOccupied: (x: number, y: number) => boolean
    ): TargetEvaluation[] {
        const evaluations: TargetEvaluation[] = [];

        for (const target of targets) {
            const distance = getManhattanDistance(
                enemy.position.x,
                enemy.position.y,
                target.position.x,
                target.position.y
            );

            const canAttack = distance <= enemy.stats.attackRange;

            // Find best attack position if can't attack from current position
            let attackPosition: GridPosition | undefined;
            let canReachForAttack = false;

            if (!canAttack) {
                attackPosition = this.findBestAttackPosition(
                    enemy,
                    target,
                    gridSize,
                    isWall,
                    isOccupied
                );
                canReachForAttack = attackPosition !== undefined;
            }

            // Calculate priority based on various factors
            const priority = this.calculateTargetPriority(
                enemy,
                target,
                distance,
                canAttack,
                canReachForAttack
            );

            evaluations.push({
                targetId: target.id,
                distance,
                canAttack,
                canReachForAttack,
                priority,
                attackPosition,
            });
        }

        return evaluations;
    }

    /**
     * Calculates priority score for a target.
     */
    private calculateTargetPriority(
        enemy: UnitState,
        target: UnitState,
        distance: number,
        canAttack: boolean,
        canReachForAttack: boolean
    ): number {
        let priority = 0;

        // High priority if can attack immediately
        if (canAttack) {
            priority += 100;
        }

        // Medium priority if can reach for attack this turn
        if (canReachForAttack) {
            priority += 50;
        }

        // Prioritize low health targets
        const healthPercent = target.stats.health / target.stats.maxHealth;
        priority += (1 - healthPercent) * 30;

        // Slightly prefer closer targets
        priority -= distance * 2;

        // Add some randomness to avoid predictable behavior
        priority += Math.random() * 10;

        return priority;
    }

    /**
     * Finds the best position to attack a target from.
     */
    private findBestAttackPosition(
        enemy: UnitState,
        target: UnitState,
        gridSize: number,
        isWall: (x: number, y: number) => boolean,
        isOccupied: (x: number, y: number) => boolean
    ): GridPosition | undefined {
        const attackRange = enemy.stats.attackRange;
        const moveRange = enemy.stats.moveRange;

        // Get all tiles within attack range of target
        const attackTiles = this.movementSystem.getTilesInRange(
            target.position,
            attackRange,
            0,
            gridSize,
            isWall
        );

        // Filter to tiles we can reach
        const reachableTiles = this.movementSystem.getReachableTiles(
            enemy.position,
            moveRange,
            gridSize,
            isWall,
            isOccupied
        );

        // Find tiles that are both attackable and reachable
        const validTiles = attackTiles.filter((attackTile) =>
            reachableTiles.some(
                (reachTile) =>
                    reachTile.x === attackTile.x && reachTile.y === attackTile.y
            )
        );

        if (validTiles.length === 0) {
            return undefined;
        }

        // Find the closest valid tile
        let bestTile: GridPosition | undefined;
        let bestDistance = Infinity;

        for (const tile of validTiles) {
            const distance = getManhattanDistance(
                enemy.position.x,
                enemy.position.y,
                tile.x,
                tile.y
            );
            if (distance < bestDistance) {
                bestDistance = distance;
                bestTile = tile;
            }
        }

        return bestTile;
    }

    // =========================================================================
    // Utility Methods
    // =========================================================================

    /**
     * Gets the nearest target to an enemy.
     */
    public getNearestTarget(
        enemy: UnitState,
        targets: UnitState[]
    ): UnitState | undefined {
        const aliveTargets = targets.filter(isAlive);
        if (aliveTargets.length === 0) return undefined;

        let nearest: UnitState | undefined;
        let nearestDistance = Infinity;

        for (const target of aliveTargets) {
            const distance = getManhattanDistance(
                enemy.position.x,
                enemy.position.y,
                target.position.x,
                target.position.y
            );
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = target;
            }
        }

        return nearest;
    }

    /**
     * Checks if an enemy should retreat (low health, etc.).
     */
    public shouldRetreat(enemy: UnitState): boolean {
        const healthPercent = enemy.stats.health / enemy.stats.maxHealth;
        
        // Basic retreat logic - retreat if below 25% health
        // Can be enhanced with more sophisticated logic
        return healthPercent < 0.25 && Math.random() < 0.3;
    }

    /**
     * Finds a retreat position away from threats.
     */
    public findRetreatPosition(
        enemy: UnitState,
        threats: UnitState[],
        gridSize: number,
        isWall: (x: number, y: number) => boolean,
        isOccupied: (x: number, y: number) => boolean
    ): GridPosition | undefined {
        const reachable = this.movementSystem.getReachableTiles(
            enemy.position,
            enemy.stats.moveRange,
            gridSize,
            isWall,
            isOccupied
        );

        if (reachable.length === 0) return undefined;

        // Find tile furthest from all threats
        let bestTile: GridPosition | undefined;
        let bestMinDistance = -1;

        for (const tile of reachable) {
            let minDistanceToThreat = Infinity;
            for (const threat of threats) {
                const distance = getManhattanDistance(
                    tile.x,
                    tile.y,
                    threat.position.x,
                    threat.position.y
                );
                minDistanceToThreat = Math.min(minDistanceToThreat, distance);
            }

            if (minDistanceToThreat > bestMinDistance) {
                bestMinDistance = minDistanceToThreat;
                bestTile = tile;
            }
        }

        return bestTile;
    }
}
