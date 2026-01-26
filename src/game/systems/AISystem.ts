/**
 * AISystem - Handles enemy AI decision making.
 * 
 * Responsibilities:
 * - Enemy turn decision making
 * - Target selection
 * - Movement planning
 * - Spell selection and casting
 */

import { UnitState, GridPosition, SpellDefinition } from "../core/types";
import { isAlive } from "../core/UnitState";
import { getManhattanDistance } from "../core/CombatCalculator";
import { MovementSystem } from "./MovementSystem";
import { CombatSystem } from "./CombatSystem";
import { getEnemySpellsByType } from "../data/spells/enemy-spells";
import { getBossSpellsByType, BOSS_SPELLS_BY_TYPE } from "../data/spells/boss-spells";
import { BossType } from "../classes/GameProgress";

// =============================================================================
// AI Action Types
// =============================================================================

export type AIActionType = "move" | "attack" | "cast_spell" | "self_buff" | "wait";

export interface AIAction {
    type: AIActionType;
    unitId: string;
    targetPosition?: GridPosition;
    targetUnitId?: string;
    path?: GridPosition[];
    spellId?: string;
    spell?: SpellDefinition;
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
    bestSpell?: SpellDefinition;
}

export interface SpellEvaluation {
    spell: SpellDefinition;
    canCast: boolean;
    inRange: boolean;
    estimatedDamage: number;
    priority: number;
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
     * Plans a turn for an enemy unit using spells.
     */
    public planTurn(
        enemy: UnitState,
        targets: UnitState[],
        allUnits: UnitState[],
        gridSize: number,
        isWall: (x: number, y: number) => boolean
    ): AITurnPlan {
        const actions: AIAction[] = [];

        // Get enemy's available spells (check if boss type first)
        const isBoss = enemy.enemyType && enemy.enemyType in BOSS_SPELLS_BY_TYPE;
        const enemySpells = isBoss 
            ? getBossSpellsByType(enemy.enemyType as BossType)
            : getEnemySpellsByType(enemy.enemyType || "Warrior");
        const currentAP = enemy.stats.actionPoints || 0;

        // Filter to alive targets only
        const aliveTargets = targets.filter(isAlive);
        if (aliveTargets.length === 0) {
            // No targets - consider self-buff spells
            const selfBuffAction = this.evaluateSelfBuffs(enemy, enemySpells, currentAP);
            if (selfBuffAction) {
                actions.push(selfBuffAction);
            }
            return { unitId: enemy.id, actions };
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

        // Evaluate all targets with spell considerations
        const evaluations = this.evaluateTargetsWithSpells(
            enemy,
            aliveTargets,
            enemySpells,
            currentAP,
            gridSize,
            isWall,
            isOccupied
        );

        // Sort by priority (highest first)
        evaluations.sort((a, b) => b.priority - a.priority);

        // Get the best target
        const bestTarget = evaluations[0];

        if (!bestTarget) {
            // No valid targets - consider self-buff spells
            const selfBuffAction = this.evaluateSelfBuffs(enemy, enemySpells, currentAP);
            if (selfBuffAction) {
                actions.push(selfBuffAction);
            }
            return { unitId: enemy.id, actions };
        }

        // Check if we can cast a spell on the target from current position
        if (bestTarget.canAttack && bestTarget.bestSpell) {
            // Check line of sight
            const targetUnit = targets.find(t => t.id === bestTarget.targetId)!;
            const hasLOS = this.combatSystem.hasLineOfSight(
                enemy.position,
                targetUnit.position,
                isWall,
                (x, y) => {
                    const unit = allUnits.find(u => u.position.x === x && u.position.y === y && isAlive(u) && u.id !== enemy.id);
                    return unit !== undefined && unit.id !== bestTarget.targetId;
                }
            );

            if (hasLOS) {
                // Cast spell immediately
                actions.push({
                    type: "cast_spell",
                    unitId: enemy.id,
                    targetUnitId: bestTarget.targetId,
                    spellId: bestTarget.bestSpell.id,
                    spell: bestTarget.bestSpell,
                });
                return { unitId: enemy.id, actions };
            }
        }

        // Need to move first - use movement points if available
        const moveRange = enemy.stats.movementPoints || enemy.stats.moveRange;

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
                // Limit path to move range (MP)
                const maxPath = path.slice(0, moveRange);

                if (maxPath.length > 0) {
                    actions.push({
                        type: "move",
                        unitId: enemy.id,
                        targetPosition: maxPath[maxPath.length - 1],
                        path: maxPath,
                    });
                }

                // Check if we can cast spell after moving
                const finalPosition = maxPath.length > 0 
                    ? maxPath[maxPath.length - 1] 
                    : enemy.position;

                const target = aliveTargets.find((t) => t.id === bestTarget.targetId);
                if (target && bestTarget.bestSpell) {
                    const newDistance = getManhattanDistance(
                        finalPosition.x,
                        finalPosition.y,
                        target.position.x,
                        target.position.y
                    );

                    const spell = bestTarget.bestSpell;
                    const minRange = spell.minRange || 0;

                    if (newDistance >= minRange && newDistance <= spell.range) {
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
                                type: "cast_spell",
                                unitId: enemy.id,
                                targetUnitId: bestTarget.targetId,
                                spellId: spell.id,
                                spell: spell,
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
                    const maxPath = path.slice(0, moveRange);
                    
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

        // If we couldn't attack, consider self-buff spells
        if (!actions.some(a => a.type === "cast_spell")) {
            const selfBuffAction = this.evaluateSelfBuffs(enemy, enemySpells, currentAP);
            if (selfBuffAction) {
                actions.push(selfBuffAction);
            }
        }

        return { unitId: enemy.id, actions };
    }

    /**
     * Evaluate self-buff spells (like Troll's regenerate or Tank's fortify).
     */
    private evaluateSelfBuffs(
        enemy: UnitState,
        spells: SpellDefinition[],
        currentAP: number
    ): AIAction | null {
        // Filter to buff spells we can afford
        const buffSpells = spells.filter(spell => 
            spell.spellCategory === "buff" &&
            spell.buffEffect?.targetSelf &&
            spell.apCost <= currentAP
        );

        if (buffSpells.length === 0) return null;

        // Prioritize healing if low health
        const healthPercent = enemy.stats.health / enemy.stats.maxHealth;
        
        for (const spell of buffSpells) {
            // Healing spells - use when below 70% health
            if (spell.buffEffect?.stat === "health" && healthPercent < 0.7) {
                return {
                    type: "self_buff",
                    unitId: enemy.id,
                    spellId: spell.id,
                    spell: spell,
                };
            }
            
            // Defensive buffs - use when below 50% health
            if (spell.buffEffect?.stat === "armor" && healthPercent < 0.5) {
                return {
                    type: "self_buff",
                    unitId: enemy.id,
                    spellId: spell.id,
                    spell: spell,
                };
            }
        }

        return null;
    }

    // =========================================================================
    // Target Evaluation
    // =========================================================================

    /**
     * Evaluates all potential targets for an enemy, considering available spells.
     */
    private evaluateTargetsWithSpells(
        enemy: UnitState,
        targets: UnitState[],
        spells: SpellDefinition[],
        currentAP: number,
        gridSize: number,
        isWall: (x: number, y: number) => boolean,
        isOccupied: (x: number, y: number) => boolean
    ): TargetEvaluation[] {
        const evaluations: TargetEvaluation[] = [];

        // Get attack spells we can afford (not self-buffs), including debuff spells
        const attackSpells = spells.filter(spell => 
            spell.apCost <= currentAP && 
            (!spell.buffEffect?.targetSelf) &&
            (spell.damage > 0 || (spell.buffEffect && !spell.buffEffect.targetSelf))
        );

        for (const target of targets) {
            const distance = getManhattanDistance(
                enemy.position.x,
                enemy.position.y,
                target.position.x,
                target.position.y
            );

            // Find the best spell for this distance
            const bestSpell = this.findBestSpellForTarget(
                enemy,
                attackSpells,
                distance
            );

            const canAttack = bestSpell !== undefined && 
                this.isSpellInRange(bestSpell, distance);

            // Find best attack position if can't attack from current position
            let attackPosition: GridPosition | undefined;
            let canReachForAttack = false;

            if (!canAttack && attackSpells.length > 0) {
                // Use the spell with the longest range for positioning
                const longestRangeSpell = attackSpells.reduce((a, b) => 
                    a.range > b.range ? a : b
                );
                
                attackPosition = this.findBestAttackPositionForSpell(
                    enemy,
                    target,
                    longestRangeSpell,
                    gridSize,
                    isWall,
                    isOccupied
                );
                canReachForAttack = attackPosition !== undefined;
            }

            // Calculate priority based on various factors
            const priority = this.calculateTargetPriorityWithSpell(
                enemy,
                target,
                distance,
                canAttack,
                canReachForAttack,
                bestSpell
            );

            evaluations.push({
                targetId: target.id,
                distance,
                canAttack,
                canReachForAttack,
                priority,
                attackPosition,
                bestSpell,
            });
        }

        return evaluations;
    }

    /**
     * Find the best spell for a given distance.
     */
    private findBestSpellForTarget(
        enemy: UnitState,
        spells: SpellDefinition[],
        distance: number
    ): SpellDefinition | undefined {
        // Filter spells that can reach the target
        const usableSpells = spells.filter(spell => 
            this.isSpellInRange(spell, distance)
        );

        if (usableSpells.length === 0) return undefined;

        // Sort by estimated damage (higher is better)
        return usableSpells.sort((a, b) => {
            const damageA = this.estimateSpellDamage(enemy, a);
            const damageB = this.estimateSpellDamage(enemy, b);
            return damageB - damageA;
        })[0];
    }

    /**
     * Check if a spell can reach a given distance.
     */
    private isSpellInRange(spell: SpellDefinition, distance: number): boolean {
        const minRange = spell.minRange || 0;
        return distance >= minRange && distance <= spell.range;
    }

    /**
     * Estimate damage a spell would deal.
     */
    private estimateSpellDamage(enemy: UnitState, spell: SpellDefinition): number {
        let statBonus = 0;
        if (spell.type === "melee") {
            statBonus = enemy.stats.force;
        } else if (spell.type === "ranged") {
            statBonus = enemy.stats.dexterity;
        } else if (spell.type === "magic") {
            statBonus = enemy.stats.intelligence || 0;
        }
        return spell.damage + statBonus;
    }

    /**
     * Calculates priority score for a target with spell consideration.
     */
    private calculateTargetPriorityWithSpell(
        _enemy: UnitState,
        target: UnitState,
        distance: number,
        canAttack: boolean,
        canReachForAttack: boolean,
        bestSpell?: SpellDefinition
    ): number {
        let priority = 0;

        // High priority if can attack immediately
        if (canAttack) {
            priority += 100;
            
            // Bonus for high damage spells
            if (bestSpell) {
                priority += bestSpell.damage * 5;
            }
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
     * Finds the best position to cast a spell on a target from.
     */
    private findBestAttackPositionForSpell(
        enemy: UnitState,
        target: UnitState,
        spell: SpellDefinition,
        gridSize: number,
        isWall: (x: number, y: number) => boolean,
        isOccupied: (x: number, y: number) => boolean
    ): GridPosition | undefined {
        const spellRange = spell.range;
        const minRange = spell.minRange || 0;
        const moveRange = enemy.stats.movementPoints || enemy.stats.moveRange;

        // Get all tiles within spell range of target (excluding min range)
        const attackTiles = this.movementSystem.getTilesInRange(
            target.position,
            spellRange,
            minRange,
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
