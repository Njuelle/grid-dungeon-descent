/**
 * CombatSystem - Handles combat mechanics and damage calculation
 *
 * Manages attack validation, damage calculation, and combat state
 */

import { System, Entity } from "../Entity";
import {
    PositionComponent,
    CombatComponent,
    StatsComponent,
    SpellComponent,
    BonusComponent,
    TeamComponent,
} from "../Component";
import { eventBus, GameEvent } from "../../events/EventBus";
import { Spell } from "../../../game/classes/Spell";
import { RenderSystem } from "./RenderSystem";

export interface AttackResult {
    success: boolean;
    damage: number;
    damageType: "physical" | "magic";
    killed: boolean;
    message?: string;
}

export class CombatSystem extends System {
    private renderSystem?: RenderSystem;

    public setRenderSystem(renderSystem: RenderSystem): void {
        this.renderSystem = renderSystem;
    }

    public update(deltaTime: number): void {
        // Handle ongoing combat animations or effects
        // Most combat is event-driven rather than frame-based
    }

    /**
     * Check if entity can attack target
     */
    public canAttack(
        attackerId: string,
        targetId: string,
        spell?: Spell
    ): boolean {
        const attacker = this.world.getEntity(attackerId);
        const target = this.world.getEntity(targetId);

        if (!attacker || !target) return false;

        const attackerCombat = attacker.getComponent<CombatComponent>("combat");
        const attackerPos =
            attacker.getComponent<PositionComponent>("position");
        const targetPos = target.getComponent<PositionComponent>("position");
        const attackerTeam = attacker.getComponent<TeamComponent>("team");
        const targetTeam = target.getComponent<TeamComponent>("team");

        if (
            !attackerCombat ||
            !attackerPos ||
            !targetPos ||
            !attackerTeam ||
            !targetTeam
        ) {
            return false;
        }

        // Can't attack same team
        if (attackerTeam.team === targetTeam.team) return false;

        // Check if attacker has already acted
        if (attackerCombat.hasActed) return false;

        // Check action points
        const spellCost = spell?.apCost || 1;
        if (attackerCombat.actionPoints < spellCost) return false;

        // Check range
        const distance =
            Math.abs(targetPos.gridX - attackerPos.gridX) +
            Math.abs(targetPos.gridY - attackerPos.gridY);

        const attackRange = spell?.range || attackerCombat.attackRange;
        const minRange = spell?.minRange || 0;

        return distance >= minRange && distance <= attackRange;
    }

    /**
     * Execute attack between entities
     */
    public executeAttack(
        attackerId: string,
        targetId: string,
        spell?: Spell
    ): AttackResult {
        const attacker = this.world.getEntity(attackerId);
        const target = this.world.getEntity(targetId);

        if (!attacker || !target) {
            return {
                success: false,
                damage: 0,
                damageType: "physical",
                killed: false,
            };
        }

        if (!this.canAttack(attackerId, targetId, spell)) {
            return {
                success: false,
                damage: 0,
                damageType: "physical",
                killed: false,
            };
        }

        const attackerCombat =
            attacker.getComponent<CombatComponent>("combat")!;
        const attackerStats = attacker.getComponent<StatsComponent>("stats")!;
        const attackerPos =
            attacker.getComponent<PositionComponent>("position")!;
        const targetStats = target.getComponent<StatsComponent>("stats")!;
        const targetPos = target.getComponent<PositionComponent>("position")!;

        // Calculate damage
        const distance =
            Math.abs(targetPos.gridX - attackerPos.gridX) +
            Math.abs(targetPos.gridY - attackerPos.gridY);

        const damageResult = this.calculateDamage(
            attacker,
            target,
            spell,
            distance
        );

        // Apply damage
        const targetWasAlive = targetStats.stats.health > 0;
        this.applyDamage(
            targetId,
            damageResult.damage,
            damageResult.damageType,
            attackerId
        );
        const targetKilled = targetWasAlive && targetStats.stats.health <= 0;

        // Consume action points
        const spellCost = spell?.apCost || 1;
        attackerCombat.actionPoints = Math.max(
            0,
            attackerCombat.actionPoints - spellCost
        );
        attackerCombat.hasActed = true;

        // Visual feedback
        if (this.renderSystem) {
            this.renderSystem.updateSpriteState(targetId, "damaged");
        }

        // Emit combat events
        eventBus.emit(GameEvent.COMBAT_DAMAGE_DEALT, {
            attackerId,
            targetId,
            damage: damageResult.damage,
            damageType: damageResult.damageType,
            spell: spell?.name,
        });

        if (targetKilled) {
            eventBus.emit(GameEvent.COMBAT_ENTITY_KILLED, {
                killedId: targetId,
                killerId: attackerId,
            });
        }

        return {
            success: true,
            damage: damageResult.damage,
            damageType: damageResult.damageType,
            killed: targetKilled,
        };
    }

    /**
     * Calculate damage for an attack
     */
    private calculateDamage(
        attacker: Entity,
        target: Entity,
        spell?: Spell,
        distance?: number
    ): { damage: number; damageType: "physical" | "magic" } {
        const attackerStats = attacker.getComponent<StatsComponent>("stats")!;
        const attackerCombat =
            attacker.getComponent<CombatComponent>("combat")!;

        let baseDamage = spell?.damage || 0;
        let damageType: "physical" | "magic" =
            spell?.type === "magic" ? "magic" : "physical";

        // Add stat bonus
        let statBonus = 0;
        if (
            spell?.type === "melee" ||
            (!spell && attackerCombat.attackType === "melee")
        ) {
            statBonus = attackerStats.stats.force;
        } else if (
            spell?.type === "ranged" ||
            (!spell && attackerCombat.attackType === "ranged")
        ) {
            statBonus = attackerStats.stats.dexterity;
        } else if (spell?.type === "magic") {
            statBonus = attackerStats.stats.intelligence || 0;
        }

        // Apply bonus modifiers from components
        const bonus = attacker.getComponent<BonusComponent>("bonus");
        if (bonus) {
            statBonus += this.calculateBonusModifiers(
                attacker,
                target,
                spell,
                distance,
                bonus
            );
        }

        // Apply damage modifiers
        let damageModifier = 1;
        Object.values(attackerCombat.damageModifiers).forEach(
            (modifier: number) => {
                damageModifier *= modifier;
            }
        );

        // Calculate final damage with randomness (0.8x to 1.2x)
        const rawDamage = (baseDamage + statBonus) * damageModifier;
        const randomMultiplier = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const finalDamage = Math.round(rawDamage * randomMultiplier);

        return { damage: Math.max(1, finalDamage), damageType };
    }

    /**
     * Calculate bonus damage modifiers
     */
    private calculateBonusModifiers(
        attacker: Entity,
        target: Entity,
        spell?: Spell,
        distance?: number,
        bonus?: BonusComponent
    ): number {
        if (!bonus) return 0;

        let bonusDamage = 0;
        const attackerStats = attacker.getComponent<StatsComponent>("stats")!;
        const targetStats = target.getComponent<StatsComponent>("stats")!;

        // Apply various bonus effects
        // Power through pain: +damage for missing health
        if (bonus.appliedBonuses.includes("power_through_pain")) {
            const missingHP =
                attackerStats.stats.maxHealth - attackerStats.stats.health;
            bonusDamage += Math.min(3, missingHP);
        }

        // Last stand: +2 damage when at 25% health or less
        if (bonus.appliedBonuses.includes("last_stand")) {
            const healthPercent =
                attackerStats.stats.health / attackerStats.stats.maxHealth;
            if (healthPercent <= 0.25) {
                bonusDamage += 2;
            }
        }

        // Giant slayer: +3 damage vs enemies with more health
        if (bonus.appliedBonuses.includes("giant_slayer")) {
            if (targetStats.stats.maxHealth > attackerStats.stats.maxHealth) {
                bonusDamage += 3;
            }
        }

        // Guerrilla tactics: +2 damage at max range
        if (bonus.appliedBonuses.includes("guerrilla_tactics") && distance) {
            const attackRange =
                spell?.range ||
                attacker.getComponent<CombatComponent>("combat")?.attackRange ||
                1;
            if (distance === attackRange) {
                bonusDamage += 2;
            }
        }

        // Overload: +1 damage (already accounted for in AP cost increase)
        if (bonus.appliedBonuses.includes("overload")) {
            bonusDamage += 1;
        }

        return bonusDamage;
    }

    /**
     * Apply damage to entity
     */
    public applyDamage(
        targetId: string,
        damage: number,
        damageType: "physical" | "magic",
        attackerId?: string
    ): void {
        const target = this.world.getEntity(targetId);
        if (!target) return;

        const targetStats = target.getComponent<StatsComponent>("stats")!;
        const targetCombat = target.getComponent<CombatComponent>("combat");

        // Apply resistance
        const resistance =
            damageType === "magic"
                ? targetStats.stats.magicResistance || 0
                : targetStats.stats.armor;

        const actualDamage = Math.max(1, damage - resistance);

        // Update last damage type for adaptive armor
        if (targetCombat) {
            targetCombat.lastDamageType = damageType;
        }

        // Apply damage
        targetStats.stats.health = Math.max(
            0,
            targetStats.stats.health - actualDamage
        );

        // Emit damage event
        eventBus.emit(GameEvent.COMBAT_DAMAGE_TAKEN, {
            targetId,
            damage: actualDamage,
            damageType,
            attackerId,
        });
    }

    /**
     * Check if entity can cast specific spell
     */
    public canCastSpell(entityId: string, spell: Spell): boolean {
        const entity = this.world.getEntity(entityId);
        if (!entity) return false;

        const combat = entity.getComponent<CombatComponent>("combat");
        if (!combat) return false;

        return combat.actionPoints >= spell.apCost && !combat.hasActed;
    }

    /**
     * Get entities in attack range
     */
    public getEntitiesInRange(attackerId: string, spell?: Spell): string[] {
        const attacker = this.world.getEntity(attackerId);
        if (!attacker) return [];

        const attackerPos =
            attacker.getComponent<PositionComponent>("position");
        const attackerTeam = attacker.getComponent<TeamComponent>("team");

        if (!attackerPos || !attackerTeam) return [];

        const range =
            spell?.range ||
            attacker.getComponent<CombatComponent>("combat")?.attackRange ||
            1;
        const minRange = spell?.minRange || 0;

        const entitiesInRange: string[] = [];

        // Check all entities with position and team components
        const potentialTargets = this.getEntitiesWithComponents(
            "position",
            "team"
        );

        for (const target of potentialTargets) {
            const targetPos =
                target.getComponent<PositionComponent>("position")!;
            const targetTeam = target.getComponent<TeamComponent>("team")!;

            // Skip same team
            if (targetTeam.team === attackerTeam.team) continue;

            const distance =
                Math.abs(targetPos.gridX - attackerPos.gridX) +
                Math.abs(targetPos.gridY - attackerPos.gridY);

            if (distance >= minRange && distance <= range) {
                entitiesInRange.push(target.id);
            }
        }

        return entitiesInRange;
    }

    /**
     * Reset combat state for new turn
     */
    public resetCombatForTurn(entityId: string): void {
        const entity = this.world.getEntity(entityId);
        if (!entity) return;

        const combat = entity.getComponent<CombatComponent>("combat");
        if (!combat) return;

        combat.hasActed = false;
        combat.actionPoints = combat.maxActionPoints;
    }
}

