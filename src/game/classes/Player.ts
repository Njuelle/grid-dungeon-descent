import { Scene } from "phaser";
import { Unit, UnitStats } from "./Unit";
import { Spell, PLAYER_SPELLS } from "./Spell";
import { Bonus, AVAILABLE_BONUSES } from "./Bonus";
import { GameProgress } from "./GameProgress";

export type AttackType = "melee" | "ranged" | "magic";

export class Player extends Unit {
    private currentSpell: Spell;
    private spells: Spell[] = [];
    private static unitCount = 0;

    constructor(scene: Scene, gridX: number, gridY: number) {
        const baseStats: UnitStats = {
            health: 10,
            maxHealth: 10,
            moveRange: 4,
            attackRange: 3, // Will be overridden by spell range
            movementPoints: 4,
            maxMovementPoints: 4,
            actionPoints: 3,
            maxActionPoints: 3,
            // Combat stats
            force: 3, // Good at melee
            dexterity: 2, // Decent at ranged
            intelligence: 3, // Good at magic
            armor: 1, // Light armor
            magicResistance: 1, // Base magic resistance
        };

        // Apply bonuses before calling super
        const stats = Player.applyBonusesToStats(baseStats);

        super(scene, gridX, gridY, "player", stats);

        // Initialize spells with bonuses applied
        this.initializeSpells();

        // Set default spell
        this.currentSpell = this.spells[0];
        this.updateAttackRange();
    }

    private static applyBonusesToStats(baseStats: UnitStats): UnitStats {
        const stats = { ...baseStats };
        const progress = GameProgress.getInstance();
        const appliedBonuses = progress.getAppliedBonuses();

        for (const bonusId of appliedBonuses) {
            const bonus = AVAILABLE_BONUSES.find((b) => b.id === bonusId);
            if (bonus && bonus.type === "stat") {
                bonus.effects.forEach((effect) => {
                    if (effect.stat && effect.value !== undefined) {
                        switch (effect.stat) {
                            case "health":
                                stats.health += effect.value;
                                stats.maxHealth += effect.value;
                                break;
                            case "force":
                                stats.force += effect.value;
                                break;
                            case "dexterity":
                                stats.dexterity += effect.value;
                                break;
                            case "intelligence":
                                stats.intelligence =
                                    (stats.intelligence || 0) + effect.value;
                                break;
                            case "armor":
                                stats.armor += effect.value;
                                break;
                            case "magicResistance":
                                stats.magicResistance =
                                    (stats.magicResistance || 0) + effect.value;
                                break;
                            case "movementPoints":
                                stats.moveRange += effect.value;
                                stats.movementPoints! += effect.value;
                                stats.maxMovementPoints! += effect.value;
                                break;
                            case "actionPoints":
                                stats.actionPoints! += effect.value;
                                stats.maxActionPoints! += effect.value;
                                break;
                        }
                    }
                });
            }
        }
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
        // Deep copy spells
        this.spells = PLAYER_SPELLS.map((spell) => ({ ...spell }));

        // Apply spell bonuses
        const progress = GameProgress.getInstance();
        const appliedBonuses = progress.getAppliedBonuses();

        for (const bonusId of appliedBonuses) {
            const bonus = AVAILABLE_BONUSES.find((b) => b.id === bonusId);
            if (bonus && bonus.type === "spell" && bonus.target) {
                const spell = this.spells.find((s) => s.id === bonus.target);
                if (spell) {
                    bonus.effects.forEach((effect) => {
                        // Check conditions before applying effect
                        if (effect.condition && effect.condition.requiresAoe) {
                            if (!spell.aoeShape || !spell.aoeRadius) {
                                return; // Skip effect if spell doesn't have AoE
                            }
                        }

                        if (
                            effect.spellProperty &&
                            effect.spellValue !== undefined
                        ) {
                            switch (effect.spellProperty) {
                                case "damage":
                                    if (typeof effect.spellValue === "number") {
                                        spell.damage = Math.max(
                                            0,
                                            spell.damage + effect.spellValue
                                        );
                                    }
                                    break;
                                case "range":
                                    if (typeof effect.spellValue === "number") {
                                        spell.range = Math.max(
                                            1,
                                            spell.range + effect.spellValue
                                        );
                                        // Ensure minRange is not greater than range
                                        if (
                                            spell.minRange &&
                                            spell.minRange > spell.range
                                        ) {
                                            spell.minRange = spell.range;
                                        }
                                    }
                                    break;
                                case "apCost":
                                    if (typeof effect.spellValue === "number") {
                                        const oldCost = spell.apCost;
                                        spell.apCost = Math.max(
                                            0,
                                            spell.apCost + effect.spellValue
                                        );
                                        console.log(
                                            `[Player] Bonus "${bonus.name}" modified ${spell.name} AP cost: ${oldCost} -> ${spell.apCost}`
                                        );
                                    }
                                    break;
                                case "aoeShape":
                                    if (typeof effect.spellValue === "string") {
                                        spell.aoeShape = effect.spellValue as
                                            | "circle"
                                            | "line"
                                            | "cone";
                                    }
                                    break;
                                case "aoeRadius":
                                    if (typeof effect.spellValue === "number") {
                                        spell.aoeRadius = Math.max(
                                            1,
                                            (spell.aoeRadius || 0) +
                                                effect.spellValue
                                        );
                                    }
                                    break;
                            }
                        }
                    });
                }
            }
        }

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
        // Use the hero warrior sprite
        this.sprite = this.scene.add.sprite(0, 0, "hero_warrior");
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
        if (this.currentSpell.type === "melee") {
            statBonus = this.stats.force;
        } else if (this.currentSpell.type === "ranged") {
            statBonus = this.stats.dexterity;
        } else if (this.currentSpell.type === "magic") {
            statBonus = this.stats.intelligence || 0; // Use intelligence for magic
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
        let totalDamage = baseDamage + statBonus + overloadDamage;

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
}

