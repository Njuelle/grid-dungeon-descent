/**
 * CombatSystem - Handles all combat-related logic.
 * 
 * Responsibilities:
 * - Attack execution
 * - AoE handling
 * - Damage application
 * - Line of sight checking
 * - Combat event emission
 */

import {
    UnitState,
    SpellDefinition,
    GridPosition,
} from "../core/types";
import {
    calculateAttackDamage,
    calculateDamageRange,
    calculateEnemyDamage,
    getDamageType,
    getEnemyDamageType,
    calculateDamageTaken,
    calculateOnHitHealing,
    calculateOnHitMovement,
    shouldRefundAP,
    calculateThornsDamage,
    shouldBlockWithSpellShield,
    calculateMovementOnDamage,
    shouldExecute,
    getManhattanDistance,
} from "../core/CombatCalculator";
import { isAlive } from "../core/UnitState";
import { BonusSystem } from "./BonusSystem";

// =============================================================================
// Combat Event Types
// =============================================================================

export type CombatEventType =
    | "attack_start"
    | "attack_hit"
    | "attack_miss"
    | "damage_dealt"
    | "damage_blocked"
    | "healing_applied"
    | "unit_killed"
    | "thorns_damage"
    | "critical_hit"
    | "execute_triggered";

export interface CombatEvent {
    type: CombatEventType;
    attackerId: string;
    targetId: string;
    damage?: number;
    healing?: number;
    spellId?: string;
    isCritical?: boolean;
    position?: GridPosition;
}

export type CombatEventCallback = (event: CombatEvent) => void;

// =============================================================================
// Attack Result Types
// =============================================================================

export interface AttackResult {
    success: boolean;
    damage: number;
    isCritical: boolean;
    isExecute: boolean;
    healing: number;
    movementGained: number;
    thornsDamage: number;
    apRefunded: boolean;
    blocked: boolean;
    targetKilled: boolean;
    aoeTargets: Array<{ targetId: string; damage: number; killed: boolean }>;
}

// =============================================================================
// CombatSystem Class
// =============================================================================

export class CombatSystem {
    private bonusSystem: BonusSystem;
    private eventCallbacks: CombatEventCallback[] = [];

    constructor(bonusSystem: BonusSystem) {
        this.bonusSystem = bonusSystem;
    }

    // =========================================================================
    // Event Registration
    // =========================================================================

    /**
     * Register a callback for combat events.
     */
    public onCombatEvent(callback: CombatEventCallback): void {
        this.eventCallbacks.push(callback);
    }

    /**
     * Remove a callback.
     */
    public offCombatEvent(callback: CombatEventCallback): void {
        const index = this.eventCallbacks.indexOf(callback);
        if (index !== -1) {
            this.eventCallbacks.splice(index, 1);
        }
    }

    // =========================================================================
    // Attack Validation
    // =========================================================================

    /**
     * Checks if an attack is valid.
     */
    public canAttack(
        attacker: UnitState,
        target: UnitState,
        spell: SpellDefinition,
        hasLineOfSight: boolean
    ): { valid: boolean; reason?: string } {
        // Check if attacker has enough AP
        if (
            attacker.stats.actionPoints === undefined ||
            attacker.stats.actionPoints < spell.apCost
        ) {
            return {
                valid: false,
                reason: `Not enough AP for ${spell.name}! Need ${spell.apCost}, have ${attacker.stats.actionPoints || 0}`,
            };
        }

        // Check range
        const distance = getManhattanDistance(
            attacker.position.x,
            attacker.position.y,
            target.position.x,
            target.position.y
        );

        // Check minimum range
        if (spell.minRange && distance < spell.minRange) {
            return {
                valid: false,
                reason: `${spell.name} requires minimum range of ${spell.minRange}! Current distance: ${distance}`,
            };
        }

        // Check maximum range
        if (distance > spell.range) {
            return {
                valid: false,
                reason: `Target is out of range for ${spell.name}!`,
            };
        }

        // Check line of sight
        if (!hasLineOfSight) {
            return {
                valid: false,
                reason: "Cannot attack: Line of sight blocked!",
            };
        }

        return { valid: true };
    }

    /**
     * Gets the damage preview for UI display.
     */
    public getDamagePreview(
        attacker: UnitState,
        target: UnitState,
        spell: SpellDefinition,
        appliedBonuses: string[]
    ): { min: number; max: number; resistance: number } {
        const distance = getManhattanDistance(
            attacker.position.x,
            attacker.position.y,
            target.position.x,
            target.position.y
        );

        return calculateDamageRange(
            spell,
            attacker.stats,
            target.stats,
            distance,
            appliedBonuses
        );
    }

    // =========================================================================
    // Attack Execution
    // =========================================================================

    /**
     * Executes an attack and returns the result.
     */
    public executeAttack(
        attacker: UnitState,
        target: UnitState,
        spell: SpellDefinition,
        appliedBonuses: string[],
        spellShieldUsed: boolean = false
    ): AttackResult {
        const result: AttackResult = {
            success: true,
            damage: 0,
            isCritical: false,
            isExecute: false,
            healing: 0,
            movementGained: 0,
            thornsDamage: 0,
            apRefunded: false,
            blocked: false,
            targetKilled: false,
            aoeTargets: [],
        };

        this.emitEvent({
            type: "attack_start",
            attackerId: attacker.id,
            targetId: target.id,
            spellId: spell.id,
        });

        // Calculate distance
        const distance = getManhattanDistance(
            attacker.position.x,
            attacker.position.y,
            target.position.x,
            target.position.y
        );

        // Check for execute condition
        if (shouldExecute(spell.id, target.stats.health, target.stats.maxHealth, appliedBonuses)) {
            result.isExecute = true;
            result.damage = target.stats.health; // Kill instantly
            result.targetKilled = true;

            this.emitEvent({
                type: "execute_triggered",
                attackerId: attacker.id,
                targetId: target.id,
                damage: result.damage,
            });

            return result;
        }

        // Calculate damage
        const damageCalc = calculateAttackDamage(
            spell,
            attacker.stats,
            target.stats,
            distance,
            appliedBonuses,
            this.bonusSystem
        );

        result.damage = damageCalc.finalDamage;
        result.isCritical = damageCalc.isCritical;

        if (result.isCritical) {
            this.emitEvent({
                type: "critical_hit",
                attackerId: attacker.id,
                targetId: target.id,
                damage: result.damage,
            });
        }

        // Check spell shield
        const damageType = getDamageType(spell);
        if (shouldBlockWithSpellShield(damageType, spellShieldUsed, appliedBonuses, this.bonusSystem)) {
            result.blocked = true;
            result.damage = 0;

            this.emitEvent({
                type: "damage_blocked",
                attackerId: attacker.id,
                targetId: target.id,
            });

            return result;
        }

        // Apply damage to target
        const newHealth = target.stats.health - result.damage;
        result.targetKilled = newHealth <= 0;

        this.emitEvent({
            type: "damage_dealt",
            attackerId: attacker.id,
            targetId: target.id,
            damage: result.damage,
            isCritical: result.isCritical,
        });

        // Calculate on-hit healing
        result.healing = calculateOnHitHealing(spell, appliedBonuses, this.bonusSystem);
        if (result.healing > 0) {
            this.emitEvent({
                type: "healing_applied",
                attackerId: attacker.id,
                targetId: attacker.id,
                healing: result.healing,
            });
        }

        // Calculate on-hit movement (hit and run, etc.)
        result.movementGained = calculateOnHitMovement(appliedBonuses, this.bonusSystem);

        // Check for AP refund (spell echo)
        result.apRefunded = shouldRefundAP(spell, appliedBonuses, this.bonusSystem);

        // Calculate thorns damage
        result.thornsDamage = calculateThornsDamage(
            attacker.position.x,
            attacker.position.y,
            target.position.x,
            target.position.y,
            appliedBonuses,
            this.bonusSystem
        );

        if (result.thornsDamage > 0) {
            this.emitEvent({
                type: "thorns_damage",
                attackerId: target.id,
                targetId: attacker.id,
                damage: result.thornsDamage,
            });
        }

        // Emit unit killed event if applicable
        if (result.targetKilled) {
            this.emitEvent({
                type: "unit_killed",
                attackerId: attacker.id,
                targetId: target.id,
            });
        }

        return result;
    }

    // =========================================================================
    // AoE Handling
    // =========================================================================

    /**
     * Gets all tiles affected by an AoE spell.
     */
    public getAoeTiles(
        spell: SpellDefinition,
        casterPos: GridPosition,
        targetPos: GridPosition,
        gridSize: number,
        isWall: (x: number, y: number) => boolean
    ): GridPosition[] {
        if (!spell.aoeShape || !spell.aoeRadius) {
            return [targetPos];
        }

        switch (spell.aoeShape) {
            case "circle":
                return this.getCircleAoeTiles(targetPos, spell.aoeRadius, gridSize, isWall);
            case "line":
                return this.getLineAoeTiles(casterPos, targetPos, spell.aoeRadius, gridSize, isWall);
            case "cone":
                return this.getConeAoeTiles(casterPos, targetPos, spell.aoeRadius, gridSize, isWall);
            default:
                return [targetPos];
        }
    }

    /**
     * Gets tiles in a circular AoE.
     */
    private getCircleAoeTiles(
        center: GridPosition,
        radius: number,
        gridSize: number,
        isWall: (x: number, y: number) => boolean
    ): GridPosition[] {
        const tiles: GridPosition[] = [];

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (isWall(x, y)) continue;

                const distance = getManhattanDistance(center.x, center.y, x, y);
                if (distance <= radius) {
                    tiles.push({ x, y });
                }
            }
        }

        return tiles;
    }

    /**
     * Gets tiles in a line AoE.
     */
    private getLineAoeTiles(
        caster: GridPosition,
        target: GridPosition,
        length: number,
        gridSize: number,
        isWall: (x: number, y: number) => boolean
    ): GridPosition[] {
        const tiles: GridPosition[] = [];

        // Calculate direction
        const dx = target.x - caster.x;
        const dy = target.y - caster.y;
        const sx = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const sy = dy === 0 ? 0 : dy > 0 ? 1 : -1;

        let currentX = caster.x;
        let currentY = caster.y;

        for (let i = 0; i < length; i++) {
            // Move to next tile
            currentX += sx;
            currentY += sy;

            // Check bounds
            if (currentX < 0 || currentX >= gridSize || currentY < 0 || currentY >= gridSize) {
                break;
            }

            // Check wall
            if (isWall(currentX, currentY)) {
                break;
            }

            tiles.push({ x: currentX, y: currentY });
        }

        return tiles;
    }

    /**
     * Gets tiles in a cone AoE.
     */
    private getConeAoeTiles(
        caster: GridPosition,
        target: GridPosition,
        radius: number,
        gridSize: number,
        isWall: (x: number, y: number) => boolean
    ): GridPosition[] {
        const tiles: GridPosition[] = [];
        const coneAngle = Math.PI / 2; // 90-degree cone
        const halfAngle = coneAngle / 2;

        // Calculate direction
        const dirX = target.x - caster.x;
        const dirY = target.y - caster.y;

        if (dirX === 0 && dirY === 0) {
            // No direction, return small area
            return this.getCircleAoeTiles(caster, 1, gridSize, isWall);
        }

        const mainAngle = Math.atan2(dirY, dirX);

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (isWall(x, y)) continue;
                if (x === caster.x && y === caster.y) continue;

                const distance = getManhattanDistance(caster.x, caster.y, x, y);
                if (distance > radius) continue;

                const angleToTile = Math.atan2(y - caster.y, x - caster.x);
                let angleDiff = Math.abs(mainAngle - angleToTile);

                if (angleDiff > Math.PI) {
                    angleDiff = 2 * Math.PI - angleDiff;
                }

                if (angleDiff <= halfAngle) {
                    tiles.push({ x, y });
                }
            }
        }

        return tiles;
    }

    /**
     * Executes an AoE attack on multiple targets.
     */
    public executeAoeAttack(
        attacker: UnitState,
        primaryTarget: UnitState,
        allTargets: UnitState[],
        spell: SpellDefinition,
        appliedBonuses: string[]
    ): AttackResult {
        // Execute attack on primary target
        const result = this.executeAttack(
            attacker,
            primaryTarget,
            spell,
            appliedBonuses
        );

        // Execute on secondary targets (excluding primary)
        for (const target of allTargets) {
            if (target.id === primaryTarget.id) continue;
            if (!isAlive(target)) continue;
            if (target.team === attacker.team) continue;

            const distance = getManhattanDistance(
                attacker.position.x,
                attacker.position.y,
                target.position.x,
                target.position.y
            );

            const damageCalc = calculateAttackDamage(
                spell,
                attacker.stats,
                target.stats,
                distance,
                appliedBonuses,
                this.bonusSystem
            );

            const newHealth = target.stats.health - damageCalc.finalDamage;
            const killed = newHealth <= 0;

            result.aoeTargets.push({
                targetId: target.id,
                damage: damageCalc.finalDamage,
                killed,
            });

            this.emitEvent({
                type: "damage_dealt",
                attackerId: attacker.id,
                targetId: target.id,
                damage: damageCalc.finalDamage,
                isCritical: damageCalc.isCritical,
            });

            if (killed) {
                this.emitEvent({
                    type: "unit_killed",
                    attackerId: attacker.id,
                    targetId: target.id,
                });
            }
        }

        return result;
    }

    // =========================================================================
    // Enemy Attack
    // =========================================================================

    /**
     * Executes an enemy attack (simpler, no spell system).
     */
    public executeEnemyAttack(
        attacker: UnitState,
        target: UnitState,
        appliedBonuses: string[],
        spellShieldUsed: boolean = false
    ): { damage: number; blocked: boolean; movementGained: number } {
        this.emitEvent({
            type: "attack_start",
            attackerId: attacker.id,
            targetId: target.id,
        });

        // Determine damage type
        const damageType = getEnemyDamageType(
            attacker.stats.attackRange,
            attacker.enemyType
        );

        // Check spell shield
        if (shouldBlockWithSpellShield(damageType, spellShieldUsed, appliedBonuses, this.bonusSystem)) {
            this.emitEvent({
                type: "damage_blocked",
                attackerId: attacker.id,
                targetId: target.id,
            });

            return { damage: 0, blocked: true, movementGained: 0 };
        }

        // Calculate damage
        const rawDamage = calculateEnemyDamage(
            attacker.stats,
            attacker.stats.attackRange
        );

        // Apply resistance
        const actualDamage = calculateDamageTaken(
            rawDamage,
            target.stats,
            damageType,
            target.hasMovedThisTurn,
            appliedBonuses,
            this.bonusSystem
        );

        this.emitEvent({
            type: "damage_dealt",
            attackerId: attacker.id,
            targetId: target.id,
            damage: actualDamage,
        });

        // Calculate movement gained from taking damage
        const movementGained = calculateMovementOnDamage(appliedBonuses, this.bonusSystem);

        return { damage: actualDamage, blocked: false, movementGained };
    }

    // =========================================================================
    // Line of Sight
    // =========================================================================

    /**
     * Checks line of sight between two positions, considering walls and units.
     */
    public hasLineOfSight(
        from: GridPosition,
        to: GridPosition,
        isWall: (x: number, y: number) => boolean,
        isOccupiedByUnit?: (x: number, y: number) => boolean
    ): boolean {
        // Use Bresenham's line algorithm
        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        const sx = from.x < to.x ? 1 : -1;
        const sy = from.y < to.y ? 1 : -1;
        let err = dx - dy;
        let x = from.x;
        let y = from.y;
        let prevX = from.x;
        let prevY = from.y;

        while (true) {
            // Check if current position is blocked (not start or end)
            if ((x !== from.x || y !== from.y) && (x !== to.x || y !== to.y)) {
                if (isWall(x, y)) {
                    return false;
                }
                if (isOccupiedByUnit && isOccupiedByUnit(x, y)) {
                    return false;
                }
            }

            // Check diagonal movement through corners
            if (x !== prevX && y !== prevY) {
                if (isWall(prevX, y) && isWall(x, prevY)) {
                    return false;
                }
            }

            if (x === to.x && y === to.y) {
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

    // =========================================================================
    // Private Helpers
    // =========================================================================

    private emitEvent(event: CombatEvent): void {
        for (const callback of this.eventCallbacks) {
            callback(event);
        }
    }
}
