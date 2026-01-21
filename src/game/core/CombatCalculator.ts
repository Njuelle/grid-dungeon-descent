/**
 * CombatCalculator - Pure TypeScript damage and combat calculations.
 * No Phaser dependencies, suitable for server-side use.
 * 
 * Centralizes all damage calculations from Player.getAttackDamage() and Unit.takeDamage().
 */

import {
    UnitStats,
    SpellDefinition,
    DamageCalculation,
    AttackType,
    DamageType,
    AttackContext,
} from "./types";
import { BonusSystem } from "../systems/BonusSystem";

// =============================================================================
// Damage Calculation
// =============================================================================

/**
 * Calculates attack damage with all modifiers.
 */
export function calculateAttackDamage(
    spell: SpellDefinition,
    attackerStats: UnitStats,
    targetStats: UnitStats,
    distance: number,
    appliedBonuses: string[],
    bonusSystem: BonusSystem
): DamageCalculation {
    // Base damage from spell
    const baseDamage = spell.damage;

    // Stat bonus based on attack type
    let statBonus = 0;
    switch (spell.type) {
        case "melee":
            statBonus = attackerStats.force;
            break;
        case "ranged":
            statBonus = attackerStats.dexterity;
            break;
        case "magic":
            statBonus = attackerStats.intelligence || 0;
            break;
    }

    // Calculate bonus effects from passive bonuses
    const { bonusDamage, isCritical } = bonusSystem.calculateBonusDamage(
        baseDamage + statBonus,
        spell.type,
        appliedBonuses,
        {
            attackerStats,
            targetStats,
            distance,
            attackRange: spell.range,
        }
    );

    // Calculate raw damage before randomness
    const rawDamageBeforeRandom = baseDamage + statBonus + bonusDamage;

    // Apply randomness (80% to 120%)
    const randomFactor = 0.8 + Math.random() * 0.4;
    let totalRaw = Math.round(rawDamageBeforeRandom * randomFactor);

    // Apply critical hit (double damage)
    if (isCritical) {
        totalRaw *= 2;
    }

    // Determine resistance based on damage type
    const damageType: DamageType = spell.type === "magic" ? "magic" : "physical";
    const resistance =
        damageType === "magic"
            ? targetStats.magicResistance || 0
            : targetStats.armor;

    // Final damage (minimum 1)
    const finalDamage = Math.max(1, totalRaw - resistance);

    return {
        baseDamage,
        statBonus,
        bonusEffects: bonusDamage,
        randomFactor,
        totalRaw,
        resistance,
        finalDamage,
        isCritical,
    };
}

/**
 * Calculates damage range for UI display (no randomness applied).
 */
export function calculateDamageRange(
    spell: SpellDefinition,
    attackerStats: UnitStats,
    targetStats: UnitStats,
    distance: number,
    appliedBonuses: string[],
    bonusSystem: BonusSystem
): { min: number; max: number; resistance: number } {
    // Base damage from spell
    const baseDamage = spell.damage;

    // Stat bonus based on attack type
    let statBonus = 0;
    switch (spell.type) {
        case "melee":
            statBonus = attackerStats.force;
            break;
        case "ranged":
            statBonus = attackerStats.dexterity;
            break;
        case "magic":
            statBonus = attackerStats.intelligence || 0;
            break;
    }

    // Calculate bonus effects (without random chance bonuses)
    let bonusDamage = 0;

    // Power Through Pain: +1 Force per missing HP (max +3)
    if (appliedBonuses.includes("power_through_pain")) {
        const missingHP = attackerStats.maxHealth - attackerStats.health;
        bonusDamage += Math.min(3, missingHP);
    }

    // Last Stand: +2 damage when below 25% HP
    if (appliedBonuses.includes("last_stand")) {
        const healthPercent = attackerStats.health / attackerStats.maxHealth;
        if (healthPercent <= 0.25) {
            bonusDamage += 2;
        }
    }

    // Giant Slayer: +3 damage vs high HP enemies
    if (appliedBonuses.includes("giant_slayer")) {
        if (targetStats.maxHealth > attackerStats.maxHealth) {
            bonusDamage += 3;
        }
    }

    // Guerrilla Tactics: +2 damage at max range
    if (appliedBonuses.includes("guerrilla_tactics")) {
        if (distance === spell.range) {
            bonusDamage += 2;
        }
    }

    // Calculate raw damage range (0.8x to 1.2x)
    const rawDamageBase = baseDamage + statBonus + bonusDamage;
    const rawDamageMin = Math.round(rawDamageBase * 0.8);
    const rawDamageMax = Math.round(rawDamageBase * 1.2);

    // Determine resistance based on damage type
    const damageType: DamageType = spell.type === "magic" ? "magic" : "physical";
    const resistance =
        damageType === "magic"
            ? targetStats.magicResistance || 0
            : targetStats.armor;

    // Final damage range (minimum 1)
    return {
        min: Math.max(1, rawDamageMin - resistance),
        max: Math.max(1, rawDamageMax - resistance),
        resistance,
    };
}

/**
 * Calculates enemy attack damage (simpler, no spell system).
 */
export function calculateEnemyDamage(
    attackerStats: UnitStats,
    attackRange: number
): number {
    // Determine attack type based on range
    const attackType: AttackType = attackRange > 1 ? "ranged" : "melee";
    
    // Base damage based on type
    const baseDamage = attackType === "melee" ? 2 : 1;
    
    // Stat bonus
    const statBonus =
        attackType === "melee" ? attackerStats.force : attackerStats.dexterity;

    // Apply randomness
    const randomFactor = 0.8 + Math.random() * 0.4;

    return Math.round((baseDamage + statBonus) * randomFactor);
}

/**
 * Determines the damage type for a spell.
 */
export function getDamageType(spell: SpellDefinition): DamageType {
    return spell.type === "magic" ? "magic" : "physical";
}

/**
 * Determines the damage type for an enemy attack.
 */
export function getEnemyDamageType(attackRange: number, enemyType?: string): DamageType {
    // Magic enemies deal magic damage
    if (enemyType === "Magician" || enemyType === "Necromancer") {
        return "magic";
    }
    return "physical";
}

// =============================================================================
// Damage Application
// =============================================================================

/**
 * Calculates actual damage taken after resistances.
 */
export function calculateDamageTaken(
    incomingDamage: number,
    targetStats: UnitStats,
    damageType: DamageType,
    hasMovedThisTurn: boolean,
    appliedBonuses: string[],
    bonusSystem: BonusSystem
): number {
    // Get base resistance
    let resistance =
        damageType === "magic"
            ? targetStats.magicResistance || 0
            : targetStats.armor;

    // Apply Fortified Position bonus
    resistance = bonusSystem.getEffectiveArmor(
        resistance,
        hasMovedThisTurn,
        appliedBonuses
    );

    // Calculate final damage (minimum 1)
    return Math.max(1, incomingDamage - resistance);
}

// =============================================================================
// Combat Checks
// =============================================================================

/**
 * Checks if an attack is in range.
 */
export function isAttackInRange(
    attackerX: number,
    attackerY: number,
    targetX: number,
    targetY: number,
    spell: SpellDefinition
): boolean {
    const distance = getManhattanDistance(attackerX, attackerY, targetX, targetY);
    
    // Check minimum range
    if (spell.minRange && distance < spell.minRange) {
        return false;
    }

    // Check maximum range
    return distance <= spell.range;
}

/**
 * Calculates Manhattan distance between two points.
 */
export function getManhattanDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * Checks if execute condition is met.
 */
export function shouldExecute(
    spellId: string,
    targetCurrentHealth: number,
    targetMaxHealth: number,
    appliedBonuses: string[]
): boolean {
    if (!appliedBonuses.includes("execute")) {
        return false;
    }

    if (spellId !== "power_strike") {
        return false;
    }

    const healthPercent = targetCurrentHealth / targetMaxHealth;
    return healthPercent <= 0.2;
}

// =============================================================================
// On-Hit Effects
// =============================================================================

/**
 * Calculates healing from on-hit effects.
 */
export function calculateOnHitHealing(
    spell: SpellDefinition,
    appliedBonuses: string[],
    bonusSystem: BonusSystem
): number {
    return bonusSystem.getOnHitHealing(spell.type, spell.id, appliedBonuses);
}

/**
 * Checks if AP should be refunded (spell echo).
 */
export function shouldRefundAP(
    spell: SpellDefinition,
    appliedBonuses: string[],
    bonusSystem: BonusSystem
): boolean {
    return bonusSystem.shouldRefundAP(spell.type, appliedBonuses);
}

/**
 * Calculates thorns damage to attacker.
 */
export function calculateThornsDamage(
    attackerX: number,
    attackerY: number,
    targetX: number,
    targetY: number,
    appliedBonuses: string[],
    bonusSystem: BonusSystem
): number {
    const distance = getManhattanDistance(attackerX, attackerY, targetX, targetY);
    const isMelee = distance <= 1;
    return bonusSystem.getThornsDamage(isMelee, appliedBonuses);
}

/**
 * Checks if spell shield should block damage.
 */
export function shouldBlockWithSpellShield(
    damageType: DamageType,
    spellShieldUsed: boolean,
    appliedBonuses: string[],
    bonusSystem: BonusSystem
): boolean {
    return bonusSystem.shouldBlockMagicDamage(
        damageType === "magic",
        spellShieldUsed,
        appliedBonuses
    );
}

/**
 * Calculates movement points gained after taking damage.
 */
export function calculateMovementOnDamage(
    appliedBonuses: string[],
    bonusSystem: BonusSystem
): number {
    return bonusSystem.getMovementOnDamage(appliedBonuses);
}
