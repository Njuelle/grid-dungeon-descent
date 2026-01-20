/**
 * BonusSystem - Handles all bonus-related logic.
 * This is a pure TypeScript class with no Phaser dependencies.
 * 
 * Responsibilities:
 * - Registry: Look up bonuses by ID, category, tags
 * - Applicator: Apply bonuses to player stats and spells
 * - Effect Resolver: Handle conditional effects and triggers
 * - Selection: Generate random bonus choices for victory screen
 */

import {
    BonusDefinition,
    BonusEffect,
    UnitStats,
    SpellDefinition,
    TriggerCondition,
    StatName,
    AttackType,
} from "../core/types";
import {
    ALL_BONUSES,
    BONUS_REGISTRY,
    getBonusById,
    getBonusesByCategory,
    getBonusesForSpell,
} from "../data/bonuses";

// =============================================================================
// Spell Base Costs (for AP reduction validation)
// =============================================================================

const SPELL_BASE_COSTS: Record<string, number> = {
    slash: 1,
    arrow_shot: 1,
    power_strike: 2,
    bone_piercer: 2,
    magic_missile: 2,
    fireball: 3,
};

// =============================================================================
// BonusSystem Class
// =============================================================================

export class BonusSystem {
    // =========================================================================
    // Registry Methods
    // =========================================================================

    /**
     * Get a bonus by ID.
     */
    public getBonus(id: string): BonusDefinition | undefined {
        return getBonusById(id);
    }

    /**
     * Get all bonuses.
     */
    public getAllBonuses(): BonusDefinition[] {
        return ALL_BONUSES;
    }

    /**
     * Check if a bonus exists.
     */
    public hasBonus(id: string): boolean {
        return BONUS_REGISTRY.has(id);
    }

    // =========================================================================
    // Stat Application
    // =========================================================================

    /**
     * Apply all stat bonuses to base stats.
     */
    public applyStatBonuses(
        baseStats: UnitStats,
        appliedBonusIds: string[]
    ): UnitStats {
        const stats = { ...baseStats };

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "stat_modifier" && effect.statModifier) {
                    this.applyStatModifier(stats, effect.statModifier.stat, effect.statModifier.value);
                }
            }
        }

        // Apply special passive bonuses that affect stats
        this.applySpecialStatBonuses(stats, appliedBonusIds);

        // Enforce minimums
        this.enforceStatMinimums(stats);

        return stats;
    }

    /**
     * Apply a single stat modifier.
     */
    private applyStatModifier(stats: UnitStats, stat: StatName, value: number): void {
        switch (stat) {
            case "health":
                stats.health += value;
                break;
            case "maxHealth":
                stats.maxHealth += value;
                break;
            case "force":
                stats.force += value;
                break;
            case "dexterity":
                stats.dexterity += value;
                break;
            case "intelligence":
                stats.intelligence = (stats.intelligence || 0) + value;
                break;
            case "armor":
                stats.armor += value;
                break;
            case "magicResistance":
                stats.magicResistance = (stats.magicResistance || 0) + value;
                break;
            case "movementPoints":
                if (stats.movementPoints !== undefined) {
                    stats.movementPoints += value;
                }
                break;
            case "maxMovementPoints":
                if (stats.maxMovementPoints !== undefined) {
                    stats.maxMovementPoints += value;
                }
                break;
            case "actionPoints":
                if (stats.actionPoints !== undefined) {
                    stats.actionPoints += value;
                }
                break;
            case "maxActionPoints":
                if (stats.maxActionPoints !== undefined) {
                    stats.maxActionPoints += value;
                }
                break;
            case "moveRange":
                stats.moveRange += value;
                break;
            case "attackRange":
                stats.attackRange += value;
                break;
        }
    }

    /**
     * Apply special passive bonuses that have complex stat calculations.
     */
    private applySpecialStatBonuses(stats: UnitStats, appliedBonusIds: string[]): void {
        // Perfect Balance: All combat stats minimum 3
        if (appliedBonusIds.includes("perfect_balance")) {
            stats.force = Math.max(3, stats.force);
            stats.dexterity = Math.max(3, stats.dexterity);
            stats.intelligence = Math.max(3, stats.intelligence || 0);
            stats.armor = Math.max(3, stats.armor);
            stats.magicResistance = Math.max(3, stats.magicResistance || 0);
        }

        // Mage Armor: 50% of intelligence adds to armor
        if (appliedBonusIds.includes("mage_armor")) {
            const intBonus = Math.floor((stats.intelligence || 0) * 0.5);
            stats.armor += intBonus;
        }
    }

    /**
     * Enforce minimum values for stats.
     */
    private enforceStatMinimums(stats: UnitStats): void {
        stats.maxHealth = Math.max(1, stats.maxHealth);
        stats.health = Math.max(1, Math.min(stats.health, stats.maxHealth));
        stats.force = Math.max(0, stats.force);
        stats.dexterity = Math.max(0, stats.dexterity);
        stats.intelligence = Math.max(0, stats.intelligence || 0);
        stats.armor = Math.max(0, stats.armor);
        stats.magicResistance = Math.max(0, stats.magicResistance || 0);
        stats.moveRange = Math.max(1, stats.moveRange);
        
        if (stats.maxMovementPoints !== undefined) {
            stats.maxMovementPoints = Math.max(1, stats.maxMovementPoints);
            stats.movementPoints = Math.max(0, Math.min(stats.movementPoints || 0, stats.maxMovementPoints));
        }
        
        if (stats.maxActionPoints !== undefined) {
            stats.maxActionPoints = Math.max(1, stats.maxActionPoints);
            stats.actionPoints = Math.max(0, Math.min(stats.actionPoints || 0, stats.maxActionPoints));
        }
    }

    // =========================================================================
    // Spell Application
    // =========================================================================

    /**
     * Apply all spell bonuses to a set of spells.
     */
    public applySpellBonuses(
        baseSpells: SpellDefinition[],
        appliedBonusIds: string[]
    ): SpellDefinition[] {
        // Deep copy spells
        const spells = baseSpells.map((spell) => ({ ...spell }));

        // Apply individual spell bonuses
        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "spell_modifier" && effect.spellModifier) {
                    // Check conditions
                    if (effect.condition && !this.checkSpellCondition(effect.condition, spells, effect.target)) {
                        continue;
                    }

                    if (effect.target) {
                        // Apply to specific spell
                        const spell = spells.find((s) => s.id === effect.target);
                        if (spell) {
                            this.applySpellModifier(spell, effect.spellModifier.property, effect.spellModifier.value);
                        }
                    }
                }
            }
        }

        // Apply special passive bonuses that affect all spells
        this.applySpecialSpellBonuses(spells, appliedBonusIds);

        return spells;
    }

    /**
     * Apply a single spell modifier.
     */
    private applySpellModifier(
        spell: SpellDefinition,
        property: string,
        value: number | string
    ): void {
        switch (property) {
            case "damage":
                if (typeof value === "number") {
                    spell.damage = Math.max(0, spell.damage + value);
                }
                break;
            case "range":
                if (typeof value === "number") {
                    spell.range = Math.max(1, spell.range + value);
                    // Ensure minRange is not greater than range
                    if (spell.minRange && spell.minRange > spell.range) {
                        spell.minRange = spell.range;
                    }
                }
                break;
            case "minRange":
                if (typeof value === "number") {
                    spell.minRange = Math.max(0, (spell.minRange || 0) + value);
                }
                break;
            case "apCost":
                if (typeof value === "number") {
                    spell.apCost = Math.max(0, spell.apCost + value);
                }
                break;
            case "aoeShape":
                if (typeof value === "string") {
                    spell.aoeShape = value as "circle" | "line" | "cone";
                }
                break;
            case "aoeRadius":
                if (typeof value === "number") {
                    spell.aoeRadius = Math.max(1, (spell.aoeRadius || 0) + value);
                }
                break;
        }
    }

    /**
     * Apply special passive bonuses that affect multiple spells.
     */
    private applySpecialSpellBonuses(
        spells: SpellDefinition[],
        appliedBonusIds: string[]
    ): void {
        // Spell Sniper: +1 range to ranged/magic spells
        if (appliedBonusIds.includes("spell_sniper")) {
            for (const spell of spells) {
                if (spell.type === "ranged" || spell.type === "magic") {
                    spell.range += 1;
                }
            }
        }

        // Magic Mastery: -1 AP cost to magic spells (min 1)
        if (appliedBonusIds.includes("magic_mastery")) {
            for (const spell of spells) {
                if (spell.type === "magic") {
                    spell.apCost = Math.max(1, spell.apCost - 1);
                }
            }
        }

        // Glass AoE: +1 AoE radius to all spells with AoE
        if (appliedBonusIds.includes("glass_aoe")) {
            for (const spell of spells) {
                if (spell.aoeShape && spell.aoeRadius) {
                    spell.aoeRadius += 1;
                }
            }
        }

        // Overload: +1 damage and +1 AP cost to all spells
        if (appliedBonusIds.includes("overload")) {
            for (const spell of spells) {
                spell.damage += 1;
                spell.apCost += 1;
            }
        }
    }

    /**
     * Check a spell-related condition.
     */
    private checkSpellCondition(
        condition: TriggerCondition,
        spells: SpellDefinition[],
        targetSpellId?: string
    ): boolean {
        switch (condition.type) {
            case "has_aoe":
                if (targetSpellId || condition.targetSpell) {
                    const spell = spells.find((s) => s.id === (targetSpellId || condition.targetSpell));
                    return spell?.aoeShape !== undefined && spell?.aoeRadius !== undefined;
                }
                return false;
            case "is_magic_spell":
                if (targetSpellId) {
                    const spell = spells.find((s) => s.id === targetSpellId);
                    return spell?.type === "magic";
                }
                return false;
            case "is_ranged_spell":
                if (targetSpellId) {
                    const spell = spells.find((s) => s.id === targetSpellId);
                    return spell?.type === "ranged";
                }
                return false;
            default:
                return true;
        }
    }

    // =========================================================================
    // Bonus Selection (Victory Screen)
    // =========================================================================

    /**
     * Get random bonuses for selection, excluding already applied ones appropriately.
     */
    public getRandomBonuses(count: number, appliedBonusIds: string[]): BonusDefinition[] {
        // Filter valid bonuses
        const validBonuses = ALL_BONUSES.filter((bonus) => {
            // Check if already applied (non-stackable)
            if (!bonus.stackable && appliedBonusIds.includes(bonus.id)) {
                return false;
            }

            // Check if would reduce AP below minimum
            if (this.wouldReduceAPBelowMinimum(bonus, appliedBonusIds)) {
                return false;
            }

            // Check if requires AoE but spell doesn't have it
            if (this.requiresAoeButMissing(bonus, appliedBonusIds)) {
                return false;
            }

            // Check if AoE bonus is irrelevant
            if (this.isAoeBonusIrrelevant(bonus, appliedBonusIds)) {
                return false;
            }

            return true;
        });

        // Separate into already-picked stackable stat bonuses and others
        const alreadyPickedStackable = validBonuses.filter(
            (b) => appliedBonusIds.includes(b.id) && b.stackable && b.category === "stat"
        );
        const notPicked = validBonuses.filter((b) => !appliedBonusIds.includes(b.id));

        // Reduce probability of already-picked stackable bonuses
        const reducedProbabilityBonuses = alreadyPickedStackable.filter(
            () => Math.random() < 0.4
        );

        // Combine available bonuses
        const available = [...notPicked, ...reducedProbabilityBonuses];

        // Shuffle and return
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, available.length));
    }

    /**
     * Check if a bonus would reduce a spell's AP cost below 1.
     */
    private wouldReduceAPBelowMinimum(
        bonus: BonusDefinition,
        appliedBonusIds: string[]
    ): boolean {
        // Check if this bonus reduces AP cost
        const apReductionEffects = bonus.effects.filter(
            (effect) =>
                effect.type === "spell_modifier" &&
                effect.spellModifier?.property === "apCost" &&
                typeof effect.spellModifier.value === "number" &&
                effect.spellModifier.value < 0
        );

        if (apReductionEffects.length === 0) {
            return false;
        }

        for (const effect of apReductionEffects) {
            const targetSpellId = effect.target;
            if (!targetSpellId) continue;

            const baseAPCost = SPELL_BASE_COSTS[targetSpellId];
            if (baseAPCost === undefined) continue;

            // Calculate current AP cost after applied bonuses
            let currentAPCost = baseAPCost;
            for (const appliedId of appliedBonusIds) {
                const appliedBonus = this.getBonus(appliedId);
                if (!appliedBonus) continue;

                for (const appliedEffect of appliedBonus.effects) {
                    if (
                        appliedEffect.type === "spell_modifier" &&
                        appliedEffect.target === targetSpellId &&
                        appliedEffect.spellModifier?.property === "apCost" &&
                        typeof appliedEffect.spellModifier.value === "number"
                    ) {
                        currentAPCost = Math.max(1, currentAPCost + appliedEffect.spellModifier.value);
                    }
                }
            }

            // Check if applying this bonus would reduce below 1
            const reduction = effect.spellModifier?.value as number;
            if (currentAPCost === 1 && reduction < 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a bonus requires AoE but the target spell doesn't have it.
     */
    private requiresAoeButMissing(
        bonus: BonusDefinition,
        appliedBonusIds: string[]
    ): boolean {
        for (const effect of bonus.effects) {
            if (effect.condition?.type === "has_aoe") {
                const targetSpellId = effect.target || effect.condition.targetSpell;
                if (!targetSpellId) continue;

                // Check if the spell has AoE from applied bonuses
                const hasAoe = appliedBonusIds.some((appliedId) => {
                    const appliedBonus = this.getBonus(appliedId);
                    if (!appliedBonus) return false;

                    return appliedBonus.effects.some(
                        (e) =>
                            e.target === targetSpellId &&
                            e.spellModifier?.property === "aoeShape"
                    );
                });

                if (!hasAoe) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if an AoE bonus is irrelevant (no AoE spells).
     */
    private isAoeBonusIrrelevant(
        bonus: BonusDefinition,
        appliedBonusIds: string[]
    ): boolean {
        // Check if this bonus increases AoE radius without requiring AoE
        const increasesAoeRadius = bonus.effects.some(
            (effect) =>
                effect.spellModifier?.property === "aoeRadius" &&
                typeof effect.spellModifier.value === "number" &&
                effect.spellModifier.value > 0 &&
                !effect.condition?.type
        );

        if (increasesAoeRadius) {
            // Check if target spell has AoE
            for (const effect of bonus.effects) {
                if (effect.spellModifier?.property === "aoeRadius" && effect.target) {
                    const hasAoe = appliedBonusIds.some((appliedId) => {
                        const appliedBonus = this.getBonus(appliedId);
                        if (!appliedBonus) return false;

                        return appliedBonus.effects.some(
                            (e) =>
                                e.target === effect.target &&
                                e.spellModifier?.property === "aoeShape"
                        );
                    });

                    if (!hasAoe) {
                        return true;
                    }
                }
            }
        }

        // Check glass_aoe specifically
        if (bonus.id === "glass_aoe") {
            // Check if player has any AoE spells
            const hasAnyAoe = appliedBonusIds.some((appliedId) => {
                const appliedBonus = this.getBonus(appliedId);
                if (!appliedBonus) return false;

                return appliedBonus.effects.some(
                    (e) => e.spellModifier?.property === "aoeShape"
                );
            });

            if (!hasAnyAoe) {
                return true;
            }
        }

        return false;
    }

    // =========================================================================
    // Combat Effect Resolution
    // =========================================================================

    /**
     * Calculate bonus damage for an attack.
     */
    public calculateBonusDamage(
        baseDamage: number,
        spellType: AttackType,
        appliedBonusIds: string[],
        context: {
            attackerStats: UnitStats;
            targetStats: UnitStats;
            distance: number;
            attackRange: number;
        }
    ): { bonusDamage: number; isCritical: boolean } {
        let bonusDamage = 0;
        let isCritical = false;

        // Power Through Pain: +1 Force per missing HP (max +3)
        if (appliedBonusIds.includes("power_through_pain")) {
            const missingHP = context.attackerStats.maxHealth - context.attackerStats.health;
            bonusDamage += Math.min(3, missingHP);
        }

        // Last Stand: +2 damage when below 25% HP
        if (appliedBonusIds.includes("last_stand")) {
            const healthPercent = context.attackerStats.health / context.attackerStats.maxHealth;
            if (healthPercent <= 0.25) {
                bonusDamage += 2;
            }
        }

        // Giant Slayer: +3 damage vs high HP enemies
        if (appliedBonusIds.includes("giant_slayer")) {
            if (context.targetStats.maxHealth > context.attackerStats.maxHealth) {
                bonusDamage += 3;
            }
        }

        // Guerrilla Tactics: +2 damage at max range
        if (appliedBonusIds.includes("guerrilla_tactics")) {
            if (context.distance === context.attackRange) {
                bonusDamage += 2;
            }
        }

        // Overload: +1 damage to all spells (already applied in spell modifiers, but for verification)
        // This is now handled in applySpecialSpellBonuses

        // Critical Striker: 10% chance for double damage
        if (appliedBonusIds.includes("critical_striker") && Math.random() < 0.1) {
            isCritical = true;
        }

        return { bonusDamage, isCritical };
    }

    /**
     * Check if spell echo should refund AP (25% chance for magic spells).
     */
    public shouldRefundAP(
        spellType: AttackType,
        appliedBonusIds: string[]
    ): boolean {
        if (
            appliedBonusIds.includes("spell_echo") &&
            spellType === "magic" &&
            Math.random() < 0.25
        ) {
            return true;
        }
        return false;
    }

    /**
     * Get healing amount on hit (vampiric strikes, etc.).
     */
    public getOnHitHealing(
        spellType: AttackType,
        spellId: string,
        appliedBonusIds: string[]
    ): number {
        let healing = 0;

        // Vampiric Strikes: Melee attacks heal 1 HP
        if (appliedBonusIds.includes("vampiric_strikes") && spellType === "melee") {
            healing += 1;
        }

        // Slash Lifesteal: Slash heals 1 HP per hit
        if (appliedBonusIds.includes("slash_lifesteal") && spellId === "slash") {
            healing += 1;
        }

        return healing;
    }

    /**
     * Check if execute condition is met (Power Strike vs low HP enemies).
     */
    public shouldExecute(
        spellId: string,
        targetHealthPercent: number,
        appliedBonusIds: string[]
    ): boolean {
        if (
            appliedBonusIds.includes("execute") &&
            spellId === "power_strike" &&
            targetHealthPercent <= 0.2
        ) {
            return true;
        }
        return false;
    }

    /**
     * Get thorns damage when hit by melee.
     */
    public getThornsDamage(
        isMeleeAttack: boolean,
        appliedBonusIds: string[]
    ): number {
        if (appliedBonusIds.includes("thorns") && isMeleeAttack) {
            return 1;
        }
        return 0;
    }

    /**
     * Check if spell shield should block magic damage.
     */
    public shouldBlockMagicDamage(
        isMagicDamage: boolean,
        spellShieldUsed: boolean,
        appliedBonusIds: string[]
    ): boolean {
        return (
            appliedBonusIds.includes("spell_shield") &&
            isMagicDamage &&
            !spellShieldUsed
        );
    }

    /**
     * Get movement points to add after taking damage.
     */
    public getMovementOnDamage(appliedBonusIds: string[]): number {
        let mp = 0;

        // Tactical Retreat: +2 MP after taking damage
        if (appliedBonusIds.includes("tactical_retreat")) {
            mp += 2;
        }

        // Nimble Fighter: 25% chance for +1 MP
        if (appliedBonusIds.includes("nimble_fighter") && Math.random() < 0.25) {
            mp += 1;
        }

        return mp;
    }

    /**
     * Get effective armor including conditional bonuses.
     */
    public getEffectiveArmor(
        baseArmor: number,
        hasMovedThisTurn: boolean,
        appliedBonusIds: string[]
    ): number {
        let armor = baseArmor;

        // Fortified Position: +3 armor if not moved
        if (appliedBonusIds.includes("fortified_position") && !hasMovedThisTurn) {
            armor += 3;
        }

        return armor;
    }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const bonusSystem = new BonusSystem();
