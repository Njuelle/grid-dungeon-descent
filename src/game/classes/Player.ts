import { Scene } from "phaser";
import { Unit, UnitStats } from "./Unit";
import { Spell, PLAYER_SPELLS } from "./Spell";
import { GameProgress } from "./GameProgress";
import { ActiveBuff, PlayerClass, SpellDefinition, BonusDefinition } from "../core/types";
import { getClassById, WARRIOR_CLASS } from "../data/classes";
import { getSpellsByIds } from "../data/spells";
import { getBonusById } from "../data/bonuses";
import { artifactSystem } from "../systems/ArtifactSystem";
import { buffSystem } from "../systems/BuffSystem";
import { bonusSystem } from "../systems/BonusSystem";

export type AttackType = "melee" | "ranged" | "magic";

export class Player extends Unit {
    private currentSpell: Spell;
    private spells: Spell[] = [];
    private static unitCount = 0;
    private playerClass: PlayerClass;
    private activeBuffs: ActiveBuff[] = [];

    // Static variable to pass class info to createSprite() before super() completes
    private static pendingPlayerClass: PlayerClass | null = null;

    constructor(scene: Scene, gridX: number, gridY: number) {
        // Get class from GameProgress, default to warrior if not set
        const progress = GameProgress.getInstance();
        const selectedClass = progress.getClass() || "warrior";
        const classDefinition = getClassById(selectedClass) || WARRIOR_CLASS;

        // Get base stats from class definition
        const baseStats: UnitStats = { ...classDefinition.baseStats };

        // Apply bonuses before calling super
        const stats = Player.applyBonusesToStats(baseStats);

        // Store the selected class in static variable BEFORE super() call
        // so createSprite() can access it (createSprite is called inside super())
        Player.pendingPlayerClass = selectedClass;

        super(scene, gridX, gridY, "player", stats);

        // Now set instance property and clear static
        this.playerClass = selectedClass;
        Player.pendingPlayerClass = null;

        // Initialize spells with bonuses applied
        this.initializeSpells();

        // Set default spell
        this.currentSpell = this.spells[0];
        this.updateAttackRange();
    }

    private static applyBonusesToStats(baseStats: UnitStats): UnitStats {
        const progress = GameProgress.getInstance();
        const appliedBonuses = progress.getAppliedBonuses();

        // Use bonusSystem to apply stat bonuses
        const stats = bonusSystem.applyStatBonuses(baseStats, appliedBonuses);

        // Ensure stats don't go below reasonable minimums (e.g., 1 health, 0 for others)
        stats.maxHealth = Math.max(1, stats.maxHealth);
        stats.health = Math.max(1, Math.min(stats.health, stats.maxHealth));
        stats.force = Math.max(0, stats.force);
        stats.dexterity = Math.max(0, stats.dexterity);
        stats.intelligence = Math.max(0, stats.intelligence || 0);
        stats.armor = Math.max(0, stats.armor);
        stats.magicResistance = Math.max(0, stats.magicResistance || 0);
        stats.moveRange = Math.max(1, stats.moveRange);
        stats.maxMovementPoints = Math.max(1, stats.maxMovementPoints!);
        stats.movementPoints = Math.max(
            0,
            Math.min(stats.movementPoints!, stats.maxMovementPoints)
        );
        stats.maxActionPoints = Math.max(1, stats.maxActionPoints!);
        stats.actionPoints = Math.max(
            0,
            Math.min(stats.actionPoints!, stats.maxActionPoints)
        );

        // Apply perfect balance bonus (minimum 3 in all combat stats)
        if (appliedBonuses.includes("perfect_balance")) {
            stats.force = Math.max(3, stats.force);
            stats.dexterity = Math.max(3, stats.dexterity);
            stats.intelligence = Math.max(3, stats.intelligence || 0);
            stats.armor = Math.max(3, stats.armor);
            stats.magicResistance = Math.max(3, stats.magicResistance || 0);
            console.log("[Player] Perfect Balance: All combat stats minimum 3");
        }

        // Apply mage armor bonus (50% of intelligence adds to armor)
        if (appliedBonuses.includes("mage_armor")) {
            const intBonus = Math.floor((stats.intelligence || 0) * 0.5);
            stats.armor += intBonus;
            console.log(
                `[Player] Mage Armor: +${intBonus} armor from intelligence`
            );
        }

        return stats;
    }

    private initializeSpells(): void {
        const progress = GameProgress.getInstance();
        const appliedBonuses = progress.getAppliedBonuses();

        // Get class definition for starting spells
        const classDefinition = getClassById(this.playerClass) || WARRIOR_CLASS;

        // Get starting spells from class
        const startingSpells = getSpellsByIds(classDefinition.startingSpellIds);

        // Get artifact spells from equipped artifacts
        const artifactSpells = artifactSystem.getSpellsFromArtifacts(
            progress.getEquippedArtifacts()
        );

        // Combine and deep copy all spells
        const allSpells = [...startingSpells, ...artifactSpells];
        this.spells = allSpells.map((spell) => ({ ...spell }));

        console.log(`[Player] Initialized ${this.spells.length} spells for ${this.playerClass}:`, 
            this.spells.map(s => s.name).join(", "));

        // Apply spell bonuses from bonuses system
        this.spells = bonusSystem.applySpellBonuses(this.spells, appliedBonuses);

        // Apply special bonuses that affect multiple spells
        this.applySpecialBonuses(appliedBonuses);
    }

    private applySpecialBonuses(appliedBonuses: string[]): void {
        const hasSpellSniper = appliedBonuses.includes("spell_sniper");
        const hasMagicMastery = appliedBonuses.includes("magic_mastery");
        const hasGlassAoe = appliedBonuses.includes("glass_aoe");
        const hasOverload = appliedBonuses.includes("overload");

        // Apply spell sniper: +1 range to ranged/magic spells
        if (hasSpellSniper) {
            this.spells.forEach((spell) => {
                if (spell.type === "ranged" || spell.type === "magic") {
                    spell.range += 1;
                    console.log(
                        `[Player] Spell Sniper: ${spell.name} range increased to ${spell.range}`
                    );
                }
            });
        }

        // Apply magic mastery: -1 AP cost to magic spells (min 1)
        if (hasMagicMastery) {
            this.spells.forEach((spell) => {
                if (spell.type === "magic") {
                    const oldCost = spell.apCost;
                    spell.apCost = Math.max(1, spell.apCost - 1);
                    console.log(
                        `[Player] Magic Mastery: ${spell.name} AP cost reduced from ${oldCost} to ${spell.apCost}`
                    );
                }
            });
        }

        // Apply glass aoe: +1 AoE radius to all spells with AoE
        if (hasGlassAoe) {
            this.spells.forEach((spell) => {
                if (spell.aoeShape && spell.aoeRadius) {
                    spell.aoeRadius += 1;
                    console.log(
                        `[Player] Glass AoE: ${spell.name} AoE radius increased to ${spell.aoeRadius}`
                    );
                }
            });
        }

        // Apply overload: +1 AP cost to all spells (already adds +1 damage in getAttackDamage)
        if (hasOverload) {
            this.spells.forEach((spell) => {
                const oldCost = spell.apCost;
                spell.apCost += 1;
                console.log(
                    `[Player] Overload: ${spell.name} AP cost increased from ${oldCost} to ${spell.apCost}`
                );
            });
        }
    }

    protected createSprite(): void {
        // Use class-specific sprite
        // Note: Use static pendingPlayerClass because this is called from super()
        // before this.playerClass is set
        const playerClass = Player.pendingPlayerClass || "warrior";
        const classDefinition = getClassById(playerClass) || WARRIOR_CLASS;
        const spriteKey = classDefinition.spriteKey;

        this.sprite = this.scene.add.sprite(0, 0, spriteKey);
        this.sprite.setInteractive();
        this.sprite.setData("unit", this);
        this.sprite.setDepth(2); // Above floors (0) and walls (0.5)

        // Scale the sprite to fit the full tile size (64x64)
        const tileSize = 64;
        const scaleX = tileSize / this.sprite.width;
        const scaleY = tileSize / this.sprite.height;
        const baseScale = Math.min(scaleX, scaleY);

        // Make the hero sprite 20% larger than the base scale
        this.sprite.setScale(baseScale * 1.2);

        // No label text needed since we have a proper sprite
        this.labelText = this.scene.add
            .text(0, 0, "", { fontSize: "1px" })
            .setOrigin(0.5)
            .setDepth(3); // Above units

        console.log(`[Player] Created sprite for class ${playerClass}: ${spriteKey}`);
    }

    public enableStatsTooltip(): void {
        // Tooltip functionality removed - stats are now shown in the UI bar
    }

    private statsTooltip?: Phaser.GameObjects.Container;

    private showStatsTooltip(): void {
        // Tooltip functionality removed - stats are now shown in the UI bar
    }

    private hideStatsTooltip(): void {
        // Tooltip functionality removed - stats are now shown in the UI bar
    }

    public getSpells(): Spell[] {
        return this.spells;
    }

    public getCurrentSpell(): Spell {
        return this.currentSpell;
    }

    public setCurrentSpell(spell: Spell): void {
        // Find the spell in our modified spell list to ensure we get the correct reference with bonuses applied
        const modifiedSpell = this.spells.find((s) => s.id === spell.id);
        if (modifiedSpell) {
            this.currentSpell = modifiedSpell;
            console.log(
                `[Player] setCurrentSpell: Set to ${modifiedSpell.name} with AP cost ${modifiedSpell.apCost}`
            );
        } else {
            // Fallback to the provided spell if not found (shouldn't happen)
            this.currentSpell = spell;
            console.log(
                `[Player] setCurrentSpell: Fallback to provided spell ${spell.name} with AP cost ${spell.apCost}`
            );
        }
        this.updateAttackRange();
    }

    private updateAttackRange(): void {
        this.stats.attackRange = this.currentSpell.range;
    }

    public canCastSpell(spell: Spell): boolean {
        return (
            this.stats.actionPoints !== undefined &&
            this.stats.actionPoints >= spell.apCost
        );
    }

    public getAttackDamage(target?: Unit, distance?: number): number {
        const baseDamage = this.currentSpell.damage;
        let statBonus = 0;

        // Use effective stat (includes buff modifiers)
        if (this.currentSpell.type === "melee") {
            statBonus = this.getEffectiveStat("force");
        } else if (this.currentSpell.type === "ranged") {
            statBonus = this.getEffectiveStat("dexterity");
        } else if (this.currentSpell.type === "magic") {
            statBonus = this.getEffectiveStat("intelligence");
        }

        // Apply buff damage boost
        let buffDamageBoost = this.getBuffDamageBoost();
        if (buffDamageBoost > 0) {
            console.log(`[Player] Buff damage boost: +${buffDamageBoost}`);
        }

        // Apply power through pain bonus if present
        const progress = GameProgress.getInstance();
        const appliedBonuses = progress.getAppliedBonuses();
        if (appliedBonuses.includes("power_through_pain")) {
            const missingHP = this.stats.maxHealth - this.stats.health;
            const powerThroughPainBonus = Math.min(3, missingHP); // Max +3 Force
            if (powerThroughPainBonus > 0) {
                statBonus += powerThroughPainBonus;
                console.log(
                    `[Player] Power Through Pain: +${powerThroughPainBonus} damage (${missingHP} missing HP)`
                );
            }
        }

        // Apply last stand bonus if present
        if (appliedBonuses.includes("last_stand")) {
            const healthPercent = this.stats.health / this.stats.maxHealth;
            if (healthPercent <= 0.25) {
                statBonus += 2;
                console.log(
                    `[Player] Last Stand: +2 damage (health below 25%)`
                );
            }
        }

        // Apply giant slayer bonus if present
        if (appliedBonuses.includes("giant_slayer") && target) {
            if (target.maxHealth > this.stats.maxHealth) {
                statBonus += 3;
                console.log(
                    `[Player] Giant Slayer: +3 damage vs high HP enemy`
                );
            }
        }

        // Apply guerrilla tactics bonus if present
        if (
            appliedBonuses.includes("guerrilla_tactics") &&
            distance !== undefined
        ) {
            if (distance === this.stats.attackRange) {
                statBonus += 2;
                console.log(
                    `[Player] Guerrilla Tactics: +2 damage from max range`
                );
            }
        }

        // Apply overload bonus if present (affects all spells)
        let overloadDamage = 0;
        if (appliedBonuses.includes("overload")) {
            overloadDamage = 1;
            console.log(`[Player] Overload: +1 damage to all spells`);
        }

        // Calculate base damage before randomness
        let totalDamage = baseDamage + statBonus + overloadDamage + buffDamageBoost;

        // Add some randomness
        const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
        totalDamage = Math.round(totalDamage * randomFactor);

        // Apply critical striker bonus after randomness
        if (
            appliedBonuses.includes("critical_striker") &&
            Math.random() < 0.1
        ) {
            totalDamage *= 2;
            console.log(`[Player] Critical Strike! Damage doubled`);
        }

        return totalDamage;
    }

    public consumeActionPoints(apCost: number): void {
        console.log(
            `[Player] consumeActionPoints called - Current AP: ${this.stats.actionPoints}, Cost to deduct: ${apCost}`
        );
        if (this.stats.actionPoints !== undefined) {
            // Ensure we don't go negative
            this.stats.actionPoints = Math.max(
                0,
                this.stats.actionPoints - apCost
            );
            console.log(
                `[Player] After deduction - Remaining AP: ${this.stats.actionPoints}`
            );
        }
    }

    // Legacy methods for compatibility
    public setAttackType(type: AttackType): void {
        // Find a spell of the given type
        const spell = this.spells.find((s) => s.type === type);
        if (spell) {
            this.setCurrentSpell(spell);
        }
    }

    public getAttackType(): AttackType {
        return this.currentSpell.type;
    }

    public canMove(distance: number): boolean {
        return (
            this.stats.movementPoints !== undefined &&
            this.stats.movementPoints >= distance
        );
    }

    public canAttack(): boolean {
        return this.canCastSpell(this.currentSpell);
    }

    public consumeMovementPoints(distance: number): void {
        if (this.stats.movementPoints !== undefined) {
            // Ensure we don't go negative
            this.stats.movementPoints = Math.max(
                0,
                this.stats.movementPoints - distance
            );
        }
    }

    public consumeActionPoint(): void {
        console.log(`[Player] consumeActionPoint called:`);
        console.log(`  - Current AP: ${this.stats.actionPoints}`);
        console.log(
            `  - Current Spell: ${this.currentSpell.name} (ID: ${this.currentSpell.id})`
        );
        console.log(`  - Spell AP Cost: ${this.currentSpell.apCost}`);

        // Check for spell echo bonus (25% chance to not consume AP on magic spells)
        const progress = GameProgress.getInstance();
        const appliedBonuses = progress.getAppliedBonuses();

        if (
            appliedBonuses.includes("spell_echo") &&
            this.currentSpell.type === "magic" &&
            Math.random() < 0.25
        ) {
            console.log("[Player] Spell Echo: Free cast! AP not consumed");
            // Don't consume AP, but still update hasActed state
            this.updateHasActed();
            return;
        }

        // Double-check that we're using the modified spell
        const modifiedSpell = this.spells.find(
            (s) => s.id === this.currentSpell.id
        );
        if (
            modifiedSpell &&
            modifiedSpell.apCost !== this.currentSpell.apCost
        ) {
            console.error(`[Player] ERROR: Current spell AP cost mismatch!`);
            console.error(
                `  - currentSpell.apCost: ${this.currentSpell.apCost}`
            );
            console.error(`  - modifiedSpell.apCost: ${modifiedSpell.apCost}`);
            console.error(`  - Using modified spell cost instead`);
            this.consumeActionPoints(modifiedSpell.apCost);
        } else {
            this.consumeActionPoints(this.currentSpell.apCost);
        }

        console.log(
            `  - After consuming - Remaining AP: ${this.stats.actionPoints}`
        );
    }

    public updateHasActed(): void {
        // Player has acted only when they have no movement points AND no action points
        this.hasActed =
            this.stats.movementPoints === 0 && this.stats.actionPoints === 0;
    }

    public isInAttackMode(): boolean {
        // Player is in attack mode if they have enough AP for current spell
        return this.canCastSpell(this.currentSpell);
    }

    public destroy(): void {
        // No need to hide tooltip anymore
        super.destroy();
    }

    // Stat getters
    public get health(): number {
        return this.stats.health;
    }
    public get maxHealth(): number {
        return this.stats.maxHealth;
    }
    public get movementPoints(): number {
        return this.stats.movementPoints || 0;
    }
    public get maxMovementPoints(): number {
        return this.stats.maxMovementPoints || 0;
    }
    public get actionPoints(): number {
        return this.stats.actionPoints || 0;
    }
    public get maxActionPoints(): number {
        return this.stats.maxActionPoints || 0;
    }
    public get force(): number {
        return this.stats.force;
    }
    public get dexterity(): number {
        return this.stats.dexterity;
    }
    public get intelligence(): number {
        return this.stats.intelligence || 0;
    }
    public get armor(): number {
        return this.stats.armor;
    }
    public get magicResistance(): number {
        return this.stats.magicResistance || 0;
    }

    public dealDamage(damage: number): void {
        // Implementation of dealDamage method
    }

    // Bonus-related methods
    public addMovementPoints(points: number): void {
        if (
            this.stats.movementPoints !== undefined &&
            this.stats.maxMovementPoints !== undefined
        ) {
            this.stats.movementPoints = Math.min(
                this.stats.maxMovementPoints,
                this.stats.movementPoints + points
            );
        }
    }

    public addActionPoints(points: number): void {
        if (this.stats.actionPoints !== undefined) {
            // Allow going over max for bonuses (like Adrenaline Rush)
            this.stats.actionPoints += points;
            console.log(
                `[Player] Added ${points} AP. Current: ${this.stats.actionPoints}`
            );
        }
    }

    public addForce(points: number): void {
        this.stats.force += points;
    }

    // =========================================================================
    // Class Methods
    // =========================================================================

    public getPlayerClass(): PlayerClass {
        return this.playerClass;
    }

    // =========================================================================
    // Buff Methods
    // =========================================================================

    /**
     * Get all active buffs on this player.
     */
    public getActiveBuffs(): ActiveBuff[] {
        return [...this.activeBuffs];
    }

    /**
     * Add a buff to this player.
     */
    public addBuff(buff: ActiveBuff): void {
        this.activeBuffs = buffSystem.addBuff(this.activeBuffs, buff);
        console.log(`[Player] Added buff: ${buff.buffType} (${buff.remainingTurns} turns)`);
    }

    /**
     * Remove a specific buff.
     */
    public removeBuff(buffId: string): void {
        this.activeBuffs = buffSystem.removeBuff(this.activeBuffs, buffId);
    }

    /**
     * Tick buffs at turn start (called by TurnManager).
     * Returns any tick effects that should be applied (like regeneration).
     */
    public tickBuffs(): { stat: string; value: number }[] {
        const result = buffSystem.tickBuffs(this.activeBuffs);
        this.activeBuffs = result.updatedBuffs;

        // Log expired buffs
        for (const expired of result.expiredBuffs) {
            console.log(`[Player] Buff expired: ${expired.buffType}`);
        }

        return result.tickEffects;
    }

    /**
     * Apply an instant buff effect (heal, gain AP/MP).
     */
    public applyInstantEffect(stat: string, value: number): void {
        switch (stat) {
            case "health":
                this.heal(value);
                break;
            case "movementPoints":
                this.addMovementPoints(value);
                break;
            case "actionPoints":
                this.addActionPoints(value);
                break;
            case "force":
                this.addForce(value);
                break;
            default:
                console.warn(`[Player] Unknown instant effect stat: ${stat}`);
        }
    }

    /**
     * Heal the player.
     */
    public heal(amount: number): void {
        const oldHealth = this.stats.health;
        this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
        console.log(`[Player] Healed ${this.stats.health - oldHealth} HP (${oldHealth} -> ${this.stats.health})`);
    }

    /**
     * Get stat modifier from active buffs.
     */
    public getBuffStatModifier(stat: string): number {
        return buffSystem.getStatModifier(this.activeBuffs, stat as any);
    }

    /**
     * Get damage boost from active buffs.
     */
    public getBuffDamageBoost(): number {
        return buffSystem.getDamageBoost(this.activeBuffs);
    }

    /**
     * Get effective stat value including buff modifiers.
     */
    public getEffectiveStat(stat: string): number {
        let baseValue = 0;
        switch (stat) {
            case "force":
                baseValue = this.stats.force;
                break;
            case "dexterity":
                baseValue = this.stats.dexterity;
                break;
            case "intelligence":
                baseValue = this.stats.intelligence || 0;
                break;
            case "armor":
                baseValue = this.stats.armor;
                break;
            case "magicResistance":
                baseValue = this.stats.magicResistance || 0;
                break;
            default:
                return 0;
        }
        return baseValue + this.getBuffStatModifier(stat);
    }

    /**
     * Check if player has a shield buff active.
     */
    public hasShield(): boolean {
        return buffSystem.hasBuffType(this.activeBuffs, "shield");
    }

    /**
     * Get shield value from active buffs.
     */
    public getShieldValue(): number {
        return buffSystem.getShieldValue(this.activeBuffs);
    }

    /**
     * Consume shield when taking damage.
     */
    public consumeShield(incomingDamage: number): number {
        const result = buffSystem.consumeShield(this.activeBuffs, incomingDamage);
        this.activeBuffs = result.updatedBuffs;
        return result.remainingDamage;
    }

    /**
     * Check if player is marked (takes extra damage).
     */
    public isMarked(): boolean {
        return buffSystem.hasBuffType(this.activeBuffs, "mark");
    }

    /**
     * Get mark damage bonus (extra damage taken).
     */
    public getMarkDamageBonus(): number {
        return buffSystem.getMarkDamageBonus(this.activeBuffs);
    }

    /**
     * Consume mark after being hit.
     */
    public consumeMark(): void {
        this.activeBuffs = buffSystem.consumeMark(this.activeBuffs);
    }

    /**
     * Clear all buffs (used when battle ends or player dies).
     */
    public clearAllBuffs(): void {
        this.activeBuffs = [];
    }

    /**
     * Get buff descriptions for UI.
     */
    public getBuffDescriptions(): string[] {
        return buffSystem.getBuffDescriptions(this.activeBuffs);
    }
}

