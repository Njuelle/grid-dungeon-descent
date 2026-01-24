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
    UnitStats,
    SpellDefinition,
    TriggerCondition,
    StatName,
    AttackType,
    PlayerClass,
} from "../core/types";
import {
    ALL_BONUSES,
    BONUS_REGISTRY,
    getBonusById,
    getBonusesForClass,
} from "../data/bonuses/index";
import { getClassById } from "../data/classes";
import { GameProgress } from "../classes/GameProgress";
import { ArtifactSystem } from "./ArtifactSystem";

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
     * Only returns bonuses available to the specified player class.
     */
    public getRandomBonuses(
        count: number, 
        appliedBonusIds: string[], 
        playerClass: PlayerClass
    ): BonusDefinition[] {
        // Get bonuses available to this class (common + class-specific)
        const classAvailableBonuses = getBonusesForClass(playerClass);

        // Get player's available spell IDs (starting spells + artifact spells)
        const playerSpellIds = this.getPlayerAvailableSpellIds(playerClass);

        // Filter valid bonuses
        const validBonuses = classAvailableBonuses.filter((bonus) => {
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

            // Check if spell upgrade bonus targets a spell the player doesn't have
            if (this.targetsUnavailableSpell(bonus, playerSpellIds)) {
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

    /**
     * Get the player's available spell IDs (starting spells + artifact spells).
     */
    private getPlayerAvailableSpellIds(playerClass: PlayerClass): string[] {
        const spellIds: string[] = [];

        // Get starting spells from class definition
        const classDefinition = getClassById(playerClass);
        if (classDefinition) {
            spellIds.push(...classDefinition.startingSpellIds);
        }

        // Get spells from equipped artifacts
        const progress = GameProgress.getInstance();
        const equippedArtifacts = progress.getEquippedArtifacts();
        const artifactSystem = new ArtifactSystem();
        const artifactSpells = artifactSystem.getSpellsFromArtifacts(equippedArtifacts);
        
        for (const spell of artifactSpells) {
            spellIds.push(spell.id);
        }

        return spellIds;
    }

    /**
     * Check if a spell upgrade bonus targets a spell the player doesn't have.
     */
    private targetsUnavailableSpell(
        bonus: BonusDefinition,
        playerSpellIds: string[]
    ): boolean {
        // Only check spell upgrade bonuses
        if (bonus.category !== "spell") {
            return false;
        }

        // Check each effect that targets a specific spell
        for (const effect of bonus.effects) {
            if (effect.type === "spell_modifier" && effect.target) {
                // If the target spell is not in the player's available spells, skip this bonus
                if (!playerSpellIds.includes(effect.target)) {
                    return true;
                }
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
        _baseDamage: number,
        _spellType: AttackType,
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
     * Get movement points gained on hit (hit and run, etc.).
     */
    public getOnHitMovement(appliedBonusIds: string[]): number {
        let movement = 0;

        // Process all on_hit bonuses with add_mp effect
        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (
                    effect.type === "on_hit" &&
                    effect.trigger?.effect === "add_mp" &&
                    typeof effect.trigger.value === "number"
                ) {
                    // Check condition if present
                    if (effect.condition) {
                        // Handle random chance condition
                        if (effect.condition.type === "random_chance" && effect.condition.value) {
                            if (Math.random() * 100 >= effect.condition.value) {
                                continue; // Condition not met
                            }
                        }
                    }
                    movement += effect.trigger.value;
                }
            }
        }

        return movement;
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
     * Get effects to apply when killing an enemy.
     */
    public getOnKillEffects(
        appliedBonusIds: string[],
        spellType?: AttackType
    ): {
        apGained: number;
        mpGained: number;
        statGains: Array<{ stat: StatName; value: number }>;
    } {
        const result = {
            apGained: 0,
            mpGained: 0,
            statGains: [] as Array<{ stat: StatName; value: number }>,
        };

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type !== "on_kill" || !effect.trigger) continue;

                // Check condition if present
                if (effect.condition) {
                    // Handle is_magic_spell condition
                    if (effect.condition.type === "is_magic_spell") {
                        if (spellType !== "magic") {
                            continue; // Condition not met
                        }
                    }
                    // Handle random chance condition
                    if (effect.condition.type === "random_chance" && effect.condition.value) {
                        if (Math.random() * 100 >= effect.condition.value) {
                            continue; // Condition not met
                        }
                    }
                }

                // Apply the effect
                switch (effect.trigger.effect) {
                    case "add_ap":
                        result.apGained += effect.trigger.value;
                        break;
                    case "add_mp":
                        result.mpGained += effect.trigger.value;
                        break;
                    case "add_stat":
                        if (effect.trigger.stat) {
                            result.statGains.push({
                                stat: effect.trigger.stat,
                                value: effect.trigger.value,
                            });
                        }
                        break;
                }
            }
        }

        return result;
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

    // =========================================================================
    // Risk/Reward Bonus Effects - Scaling
    // =========================================================================

    /**
     * Get scaling damage bonus based on kills this battle.
     */
    public getScalingKillDamage(
        appliedBonusIds: string[],
        killsThisBattle: number
    ): number {
        let bonusDamage = 0;

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "scaling_per_kill" && effect.trigger) {
                    if (effect.trigger.effect === "damage") {
                        const maxValue = effect.trigger.maxValue || 999;
                        const scaledDamage = Math.min(maxValue, killsThisBattle * effect.trigger.value);
                        bonusDamage += scaledDamage;
                    }
                }
            }
        }

        return bonusDamage;
    }

    /**
     * Get scaling stat bonus based on damage taken this battle.
     */
    public getScalingDamageTakenBonus(
        appliedBonusIds: string[],
        damageInstancesThisBattle: number
    ): Map<StatName, number> {
        const statBonuses = new Map<StatName, number>();

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "scaling_per_damage" && effect.trigger) {
                    if (effect.trigger.effect === "add_stat" && effect.trigger.stat) {
                        const maxValue = effect.trigger.maxValue || 999;
                        const scaledValue = Math.min(maxValue, damageInstancesThisBattle * effect.trigger.value);
                        const current = statBonuses.get(effect.trigger.stat) || 0;
                        statBonuses.set(effect.trigger.stat, current + scaledValue);
                    }
                }
            }
        }

        return statBonuses;
    }

    /**
     * Get momentum/consecutive attack damage bonus.
     */
    public getConsecutiveAttackBonus(
        appliedBonusIds: string[],
        consecutiveAttacks: number
    ): number {
        let bonusDamage = 0;

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (
                    effect.type === "on_hit" &&
                    effect.condition?.type === "consecutive_attacks" &&
                    effect.trigger
                ) {
                    if (effect.trigger.effect === "damage") {
                        const threshold = effect.condition.value || 1;
                        if (consecutiveAttacks >= threshold) {
                            const maxValue = effect.trigger.maxValue || 999;
                            const bonusValue = Math.min(maxValue, consecutiveAttacks * effect.trigger.value);
                            bonusDamage += bonusValue;
                        }
                    }
                }
            }
        }

        return bonusDamage;
    }

    /**
     * Get rage accumulator bonus (damage stored when not attacking).
     */
    public getRageAccumulatorBonus(
        appliedBonusIds: string[],
        turnsWithoutAttack: number
    ): number {
        let bonusDamage = 0;

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "scaling_no_attack" && effect.trigger) {
                    if (effect.trigger.effect === "damage") {
                        const maxValue = effect.trigger.maxValue || 999;
                        const scaledDamage = Math.min(maxValue, turnsWithoutAttack * effect.trigger.value);
                        bonusDamage += scaledDamage;
                    }
                }
            }
        }

        return bonusDamage;
    }

    // =========================================================================
    // Risk/Reward Bonus Effects - Chance-Based
    // =========================================================================

    /**
     * Roll chance-based effects on hit and return damage multiplier.
     */
    public rollChanceOnHitDamageMultiplier(
        appliedBonusIds: string[],
        spellType?: AttackType
    ): number {
        let multiplier = 1.0;

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "chance_on_hit" && effect.trigger) {
                    // Check spell type condition
                    if (effect.condition?.type === "is_magic_spell" && spellType !== "magic") {
                        continue;
                    }
                    if (effect.condition?.type === "is_ranged_spell" && spellType !== "ranged") {
                        continue;
                    }
                    if (effect.condition?.type === "is_melee_attack" && spellType !== "melee") {
                        continue;
                    }

                    // Roll the chance
                    const chance = effect.trigger.chance || 0;
                    if (Math.random() * 100 < chance) {
                        if (effect.trigger.effect === "damage_multiplier") {
                            multiplier *= effect.trigger.value;
                        }
                    }
                }
            }
        }

        return multiplier;
    }

    /**
     * Roll chance-based AP refund on cast.
     */
    public rollChanceOnCastAPRefund(appliedBonusIds: string[]): number {
        let apRefund = 0;

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "chance_on_cast" && effect.trigger) {
                    const chance = effect.trigger.chance || 0;
                    if (Math.random() * 100 < chance) {
                        if (effect.trigger.effect === "refund_ap") {
                            apRefund += effect.trigger.value;
                        }
                    }
                }
            }
        }

        return apRefund;
    }

    /**
     * Roll chance-based damage negation when taking damage.
     */
    public rollChanceOnDamageNegate(appliedBonusIds: string[]): boolean {
        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "chance_on_damage" && effect.trigger) {
                    const chance = effect.trigger.chance || 0;
                    if (Math.random() * 100 < chance) {
                        if (effect.trigger.effect === "negate_damage") {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * Roll chance-based effects at battle start.
     * Returns effects to apply: AP gain, HP loss, etc.
     */
    public rollChanceOnBattleStart(appliedBonusIds: string[]): {
        apGained: number;
        damageToSelf: number;
    } {
        const result = { apGained: 0, damageToSelf: 0 };

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "chance_on_battle_start" && effect.trigger) {
                    const chance = effect.trigger.chance || 0;
                    if (Math.random() * 100 < chance) {
                        switch (effect.trigger.effect) {
                            case "add_ap":
                                result.apGained += effect.trigger.value;
                                break;
                            case "damage":
                                result.damageToSelf += effect.trigger.value;
                                break;
                        }
                    }
                }
            }
        }

        return result;
    }

    // =========================================================================
    // Risk/Reward Bonus Effects - First Attack
    // =========================================================================

    /**
     * Get first attack bonus damage.
     */
    public getFirstAttackBonus(
        appliedBonusIds: string[],
        isFirstAttackOfTurn: boolean,
        isFirstAttackOfBattle: boolean
    ): number {
        let bonusDamage = 0;

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "on_first_attack" && effect.trigger) {
                    // Check if this is for battle or turn
                    if (effect.condition?.type === "is_first_attack_battle") {
                        if (isFirstAttackOfBattle && effect.trigger.effect === "damage") {
                            bonusDamage += effect.trigger.value;
                        }
                    } else if (isFirstAttackOfTurn && effect.trigger.effect === "damage") {
                        bonusDamage += effect.trigger.value;
                    }
                }
            }
        }

        return bonusDamage;
    }

    // =========================================================================
    // Risk/Reward Bonus Effects - Conditional Stats
    // =========================================================================

    /**
     * Get conditional stat bonuses based on current situation.
     */
    public getConditionalStatBonuses(
        appliedBonusIds: string[],
        context: {
            healthPercent: number;
            adjacentEnemies: number;
            distanceFromStart: number;
            hasMovedThisTurn: boolean;
        }
    ): Map<StatName, number> {
        const statBonuses = new Map<StatName, number>();

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "conditional" && effect.statModifier) {
                    let conditionMet = false;

                    if (effect.condition) {
                        switch (effect.condition.type) {
                            case "health_below":
                                conditionMet = context.healthPercent * 100 <= (effect.condition.value || 0);
                                break;
                            case "health_above":
                                conditionMet = context.healthPercent * 100 >= (effect.condition.value || 0);
                                break;
                            case "adjacent_enemies":
                                conditionMet = context.adjacentEnemies >= (effect.condition.value || 0);
                                break;
                            case "distance_from_start":
                                conditionMet = context.distanceFromStart >= (effect.condition.value || 0);
                                break;
                            case "has_not_moved":
                                conditionMet = !context.hasMovedThisTurn;
                                break;
                            default:
                                conditionMet = true;
                        }
                    } else {
                        conditionMet = true;
                    }

                    if (conditionMet) {
                        const current = statBonuses.get(effect.statModifier.stat) || 0;
                        statBonuses.set(effect.statModifier.stat, current + effect.statModifier.value);
                    }
                }
            }
        }

        return statBonuses;
    }

    /**
     * Get conditional damage bonuses based on target state.
     */
    public getConditionalDamageBonus(
        appliedBonusIds: string[],
        targetHealthPercent: number
    ): { flatBonus: number; multiplier: number } {
        let flatBonus = 0;
        let multiplier = 1.0;

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "conditional" && effect.condition && effect.trigger) {
                    let conditionMet = false;

                    switch (effect.condition.type) {
                        case "target_health_below":
                            conditionMet = targetHealthPercent * 100 <= (effect.condition.value || 0);
                            break;
                        case "target_health_above":
                            conditionMet = targetHealthPercent * 100 >= (effect.condition.value || 0);
                            break;
                        default:
                            conditionMet = false;
                    }

                    if (conditionMet) {
                        if (effect.trigger.effect === "damage") {
                            flatBonus += effect.trigger.value;
                        } else if (effect.trigger.effect === "damage_multiplier") {
                            multiplier *= effect.trigger.value;
                        }
                    }
                }
            }
        }

        return { flatBonus, multiplier };
    }

    // =========================================================================
    // Risk/Reward - Battle Start Damage (Bloodlust, etc.)
    // =========================================================================

    /**
     * Get damage to apply to self at battle start (for bonuses like Bloodlust).
     */
    public getBattleStartSelfDamage(appliedBonusIds: string[]): number {
        let damage = 0;

        for (const bonusId of appliedBonusIds) {
            const bonus = this.getBonus(bonusId);
            if (!bonus) continue;

            for (const effect of bonus.effects) {
                if (effect.type === "on_battle_start" && effect.trigger) {
                    if (effect.trigger.effect === "damage") {
                        damage += effect.trigger.value;
                    }
                }
            }
        }

        return damage;
    }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const bonusSystem = new BonusSystem();
