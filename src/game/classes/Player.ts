import { Scene } from "phaser";
import { Unit, UnitStats } from "./Unit";
import { Spell, PLAYER_SPELLS } from "./Spell";
import { Bonus, AVAILABLE_BONUSES } from "./Bonus";
import { GameProgress } from "./GameProgress";
import { PLAYER_CLASSES, PlayerClass } from "./PlayerClass";
import { ALL_ARTIFACTS, getArtifactSpell } from "./Artifact";

export type AttackType = "melee" | "ranged" | "magic";

export class Player extends Unit {
    private currentSpell: Spell;
    private spells: Spell[] = [];
    private static unitCount = 0;
    private playerClass: PlayerClass;

    constructor(scene: Scene, gridX: number, gridY: number) {
        console.log("[Player] Constructor called");

        // Get selected class from GameProgress
        const progress = GameProgress.getInstance();
        const selectedClassId = progress.getSelectedClass();
        console.log("[Player] Selected class ID:", selectedClassId);

        const playerClass =
            PLAYER_CLASSES.find((c) => c.id === selectedClassId) ||
            PLAYER_CLASSES[0];

        console.log("[Player] Found player class:", playerClass.name);
        console.log(
            "[Player] Player class has",
            playerClass.spells.length,
            "spells"
        );

        const baseStats: UnitStats = {
            health: playerClass.baseStats.health,
            maxHealth: playerClass.baseStats.health,
            moveRange: playerClass.baseStats.moveRange,
            attackRange: 3, // Will be overridden by spell range
            movementPoints: playerClass.baseStats.movementPoints,
            maxMovementPoints: playerClass.baseStats.movementPoints,
            actionPoints: playerClass.baseStats.actionPoints,
            maxActionPoints: playerClass.baseStats.actionPoints,
            // Combat stats
            force: playerClass.baseStats.force,
            dexterity: playerClass.baseStats.dexterity,
            intelligence: playerClass.baseStats.intelligence,
            armor: playerClass.baseStats.armor,
            magicResistance: playerClass.baseStats.magicResistance,
        };

        // Apply bonuses before calling super
        const stats = Player.applyBonusesToStats(baseStats);

        super(scene, gridX, gridY, "player", stats);

        // Store player class
        this.playerClass = playerClass;

        // Initialize spells with bonuses applied
        console.log("[Player] Initializing spells...");
        this.initializeSpells();
        console.log("[Player] Spells initialized, count:", this.spells.length);

        // Set default spell
        if (this.spells.length > 0) {
            this.currentSpell = this.spells[0];
            console.log(
                "[Player] Default spell set to:",
                this.currentSpell.name
            );
            this.updateAttackRange();
        } else {
            console.error("[Player] No spells found! Cannot set default spell");
        }
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
        console.log(
            "[Player] initializeSpells - player class spells:",
            this.playerClass.spells
        );

        // Get equipped spells from GameProgress
        const progress = GameProgress.getInstance();

        // Build available spells list (class spells + artifact spells)
        const availableSpells: Spell[] = [...this.playerClass.spells];

        // Add spells from acquired artifacts
        const acquiredArtifacts = progress.getAcquiredArtifacts();
        console.log("[Player] Acquired artifacts:", acquiredArtifacts);
        console.log(
            "[Player] Available artifacts in game:",
            ALL_ARTIFACTS.map((a) => a.id)
        );
        acquiredArtifacts.forEach((artifactId) => {
            const artifact = ALL_ARTIFACTS.find((a) => a.id === artifactId);
            if (artifact) {
                const artifactSpell = getArtifactSpell(artifact);
                if (artifactSpell) {
                    console.log(
                        "[Player] Adding artifact spell:",
                        artifactSpell.name,
                        "from artifact:",
                        artifact.name
                    );
                    availableSpells.push(artifactSpell);
                } else {
                    console.error(
                        "[Player] Could not find spell for artifact:",
                        artifact.name,
                        "spell ID:",
                        artifact.spellId
                    );
                }
            } else {
                console.error(
                    "[Player] Could not find artifact with ID:",
                    artifactId
                );
            }
        });
        console.log(
            "[Player] Total available spells after adding artifacts:",
            availableSpells.length
        );

        const equippedSpellIds = progress.getEquippedSpells();

        if (equippedSpellIds.length > 0) {
            // Load equipped spells
            console.log("[Player] Loading equipped spells:", equippedSpellIds);
            console.log(
                "[Player] Available spell IDs:",
                availableSpells.map((s) => s.id)
            );

            // Map equipped spell IDs to actual spells
            const mappedSpells = equippedSpellIds.map((id) => {
                const found = availableSpells.find((s) => s.id === id);
                console.log(
                    `[Player] Looking for spell ID "${id}": ${
                        found ? "FOUND" : "NOT FOUND"
                    }`
                );
                if (found) {
                    console.log(`[Player] Found spell: ${found.name}`);
                }
                return found;
            });

            this.spells = mappedSpells.filter(
                (spell) => spell !== undefined
            ) as Spell[];

            console.log(
                "[Player] Final loaded spells:",
                this.spells.map((s) => `${s.name} (${s.id})`)
            );
        } else {
            // Default to first 2 class spells + all artifact spells (up to 5 total)
            console.log(
                "[Player] No equipped spells found, using default class spells + artifact spells"
            );

            const classSpells = this.playerClass.spells.slice(0, 2);
            const artifactSpells = availableSpells.filter(
                (spell) =>
                    !this.playerClass.spells.some(
                        (classSpell) => classSpell.id === spell.id
                    )
            );

            // Combine class spells + artifact spells (up to 5 total)
            const allSpells = [...classSpells, ...artifactSpells].slice(0, 5);
            this.spells = allSpells.map((spell) => ({ ...spell }));

            console.log(
                "[Player] Using spells:",
                this.spells.map((s) => s.name)
            );

            // Auto-save this as the equipped spells for future games
            const spellIds = this.spells.map((s) => s.id);
            progress.setEquippedSpells(spellIds);
            console.log("[Player] Auto-saved equipped spells:", spellIds);
        }

        // Note: UI will show empty slots for remaining spell slots (up to 5 total)

        // Apply spell bonuses (reuse progress variable declared above)
        const appliedBonuses = progress.getAppliedBonuses();

        for (const bonusId of appliedBonuses) {
            const bonus = AVAILABLE_BONUSES.find((b) => b.id === bonusId);
            if (bonus && bonus.type === "spell" && bonus.target) {
                // Handle spell ID mapping for backwards compatibility
                let targetSpell: Spell | undefined;

                // Direct match by spell ID
                targetSpell = this.spells.find((s) => s.id === bonus.target);

                if (targetSpell) {
                    bonus.effects.forEach((effect) => {
                        // Check conditions before applying effect
                        if (effect.condition && effect.condition.requiresAoe) {
                            if (
                                !targetSpell!.aoeShape ||
                                !targetSpell!.aoeRadius
                            ) {
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
                                        targetSpell!.damage = Math.max(
                                            0,
                                            targetSpell!.damage +
                                                effect.spellValue
                                        );
                                    }
                                    break;
                                case "range":
                                    if (typeof effect.spellValue === "number") {
                                        targetSpell!.range = Math.max(
                                            1,
                                            targetSpell!.range +
                                                effect.spellValue
                                        );
                                        // Ensure minRange is not greater than range
                                        if (
                                            targetSpell!.minRange &&
                                            targetSpell!.minRange >
                                                targetSpell!.range
                                        ) {
                                            targetSpell!.minRange =
                                                targetSpell!.range;
                                        }
                                    }
                                    break;
                                case "apCost":
                                    if (typeof effect.spellValue === "number") {
                                        const oldCost = targetSpell!.apCost;
                                        targetSpell!.apCost = Math.max(
                                            1,
                                            targetSpell!.apCost +
                                                effect.spellValue
                                        );
                                        console.log(
                                            `[Player] Bonus "${
                                                bonus.name
                                            }" modified ${
                                                targetSpell!.name
                                            } AP cost: ${oldCost} -> ${
                                                targetSpell!.apCost
                                            }`
                                        );
                                    }
                                    break;
                                case "aoeShape":
                                    if (typeof effect.spellValue === "string") {
                                        targetSpell!.aoeShape =
                                            effect.spellValue as
                                                | "circle"
                                                | "line"
                                                | "cone";
                                    }
                                    break;
                                case "aoeRadius":
                                    if (typeof effect.spellValue === "number") {
                                        targetSpell!.aoeRadius = Math.max(
                                            1,
                                            (targetSpell!.aoeRadius || 0) +
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
        // Use the appropriate class sprite based on selected class
        // If playerClass is not set yet (during construction), get it from GameProgress
        let spriteName = "hero_warrior"; // Default fallback

        if (this.playerClass) {
            spriteName = this.playerClass.icon || "hero_warrior";
        } else {
            // Fallback: get sprite name from selected class in GameProgress
            const progress = GameProgress.getInstance();
            const selectedClassId = progress.getSelectedClass();
            const playerClass = PLAYER_CLASSES.find(
                (c) => c.id === selectedClassId
            );
            if (playerClass) {
                spriteName = playerClass.icon || "hero_warrior";
            }
        }

        this.sprite = this.scene.add.sprite(0, 0, spriteName);
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

