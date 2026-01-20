/**
 * GameController - Orchestrates all game systems.
 * 
 * This is the main controller that:
 * - Coordinates between systems (Turn, Combat, Movement, AI, Bonus)
 * - Manages the pure game state
 * - Emits events for UI updates
 * - Does NOT handle Phaser rendering (that's the scene's responsibility)
 * 
 * Designed to be extractable to server-side with minimal changes.
 */

import { Scene } from "phaser";
import {
    GameStateSnapshot,
    UnitState,
    SpellDefinition,
    GridPosition,
    Team,
    BonusDefinition,
} from "./core/types";
import {
    createGameState,
    getPlayer,
    getUnitById,
    getAliveUnitsByTeam,
    moveUnit,
    damageUnit,
    healUnit,
    useActionPoints,
    grantMovementPoints,
    grantActionPoints,
    setUnitActed,
    addBonus,
    incrementWins,
    updateUnit,
} from "./core/GameState";
import { isAlive, resetTurnState, markAsActed } from "./core/UnitState";
import { BonusSystem, bonusSystem } from "./systems/BonusSystem";
import { TurnManager, TurnEvent } from "./systems/TurnManager";
import { CombatSystem, AttackResult } from "./systems/CombatSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { AISystem, AITurnPlan, AIAction } from "./systems/AISystem";
import { EventEmitter, gameEventBus } from "./events/EventEmitter";

// =============================================================================
// Types
// =============================================================================

export interface GameControllerConfig {
    gridSize: number;
    level: number;
    wins: number;
    appliedBonuses: string[];
}

// =============================================================================
// GameController Class
// =============================================================================

export class GameController {
    // Systems
    private bonusSystem: BonusSystem;
    private turnManager: TurnManager;
    private combatSystem: CombatSystem;
    private movementSystem: MovementSystem;
    private aiSystem: AISystem;
    private eventBus: EventEmitter;

    // Game state
    private state: GameStateSnapshot;
    private config: GameControllerConfig;
    
    // Grid functions (provided by Phaser scene)
    private isWall: (x: number, y: number) => boolean;
    private isOccupied: (x: number, y: number) => boolean;

    // Player spells
    private playerSpells: SpellDefinition[] = [];
    private selectedSpell: SpellDefinition | null = null;

    // Bonus state
    private spellShieldUsed: boolean = false;

    constructor(config: GameControllerConfig) {
        this.config = config;
        
        // Initialize systems
        this.bonusSystem = bonusSystem;
        this.turnManager = new TurnManager();
        this.movementSystem = new MovementSystem();
        this.combatSystem = new CombatSystem(this.bonusSystem);
        this.aiSystem = new AISystem(this.movementSystem, this.combatSystem);
        this.eventBus = gameEventBus;

        // Initialize empty state
        this.state = createGameState({
            units: [],
            appliedBonuses: config.appliedBonuses,
            wins: config.wins,
        });

        // Default grid functions (will be set by scene)
        this.isWall = () => false;
        this.isOccupied = () => false;

        // Setup turn manager callbacks
        this.setupTurnCallbacks();
    }

    // =========================================================================
    // Initialization
    // =========================================================================

    /**
     * Sets up the grid functions from the scene.
     */
    public setGridFunctions(
        isWall: (x: number, y: number) => boolean,
        isOccupied: (x: number, y: number) => boolean
    ): void {
        this.isWall = isWall;
        this.isOccupied = isOccupied;
    }

    /**
     * Initializes the game with units.
     */
    public initializeGame(playerUnits: UnitState[], enemyUnits: UnitState[]): void {
        this.state = createGameState({
            units: [...playerUnits, ...enemyUnits],
            appliedBonuses: this.config.appliedBonuses,
            wins: this.config.wins,
        });

        // Reset spell shield
        this.spellShieldUsed = false;

        // Emit game started event
        this.eventBus.emit("game:started", {
            playerUnits,
            enemyUnits,
            level: this.config.level,
            difficulty: this.getDifficultyString(),
        });

        // Start the first turn
        this.turnManager.startGame();
    }

    /**
     * Sets the player's spells.
     */
    public setPlayerSpells(spells: SpellDefinition[]): void {
        this.playerSpells = this.bonusSystem.applySpellBonuses(
            spells,
            this.state.appliedBonuses
        );
    }

    // =========================================================================
    // Turn Flow
    // =========================================================================

    private setupTurnCallbacks(): void {
        this.turnManager.setOnTurnStart((event) => {
            this.onTurnStart(event);
        });

        this.turnManager.setOnTurnEnd((event) => {
            this.onTurnEnd(event);
        });

        this.turnManager.setOnTeamChanged((event) => {
            this.eventBus.emit("turn:team_changed", {
                previousTeam: event.team === "player" ? "enemy" : "player",
                newTeam: event.team,
                turnNumber: event.turn,
            });
        });

        this.turnManager.setOnVictory((event) => {
            this.onVictory();
        });

        this.turnManager.setOnDefeat((event) => {
            this.onDefeat();
        });
    }

    private onTurnStart(event: TurnEvent): void {
        // Reset unit turn state
        const team = event.team;
        this.state = {
            ...this.state,
            units: this.state.units.map((u) =>
                u.team === team ? resetTurnState(u) : u
            ),
        };

        // Emit turn start event
        this.eventBus.emit("turn:start", {
            team,
            turnNumber: event.turn,
        });

        // Apply combat medic healing at turn start (for player)
        if (team === "player" && this.state.appliedBonuses.includes("combat_medic")) {
            const player = getPlayer(this.state);
            if (player) {
                this.state = healUnit(this.state, player.id, 2);
                this.eventBus.emit("unit:healed", {
                    unitId: player.id,
                    amount: 2,
                    source: "combat_medic",
                    newHealth: getPlayer(this.state)!.stats.health,
                    maxHealth: getPlayer(this.state)!.stats.maxHealth,
                });
            }
        }

        // Apply adrenaline rush on first turn
        if (
            team === "player" &&
            event.turn === 1 &&
            this.state.appliedBonuses.includes("adrenaline_rush")
        ) {
            const player = getPlayer(this.state);
            if (player) {
                this.state = grantActionPoints(this.state, player.id, 2);
            }
        }

        // Start AI turn if it's enemy's turn
        if (team === "enemy") {
            this.runEnemyTurn();
        }
    }

    private onTurnEnd(event: TurnEvent): void {
        this.eventBus.emit("turn:end", {
            team: event.team,
            turnNumber: event.turn,
        });
    }

    /**
     * Ends the current turn.
     */
    public endTurn(): void {
        if (this.turnManager.hasGameEnded()) return;
        
        this.turnManager.endTurn();
    }

    // =========================================================================
    // Player Actions
    // =========================================================================

    /**
     * Selects a spell for the player.
     */
    public selectSpell(spell: SpellDefinition): void {
        const previousSpellId = this.selectedSpell?.id;
        this.selectedSpell = spell;

        this.eventBus.emit("ui:spell_selected", {
            spell,
            previousSpellId,
        });
    }

    /**
     * Gets the currently selected spell.
     */
    public getSelectedSpell(): SpellDefinition | null {
        return this.selectedSpell;
    }

    /**
     * Handles a tile click from the player.
     */
    public handleTileClick(position: GridPosition): void {
        if (!this.turnManager.isPlayerTurn()) return;
        if (this.turnManager.hasGameEnded()) return;

        const player = getPlayer(this.state);
        if (!player || !isAlive(player)) return;

        // Check if clicking on an enemy with a spell selected
        const targetUnit = this.state.units.find(
            (u) =>
                u.position.x === position.x &&
                u.position.y === position.y &&
                isAlive(u)
        );

        if (targetUnit && targetUnit.team === "enemy" && this.selectedSpell) {
            this.playerAttack(player, targetUnit, this.selectedSpell);
            return;
        }

        // Check if clicking on a valid movement tile
        if (!targetUnit && !this.isWall(position.x, position.y)) {
            this.playerMove(player, position);
        }
    }

    /**
     * Player movement.
     */
    private playerMove(player: UnitState, target: GridPosition): void {
        const canMove = this.movementSystem.canMoveTo(
            player,
            target,
            this.config.gridSize,
            this.isWall,
            this.isOccupied
        );

        if (!canMove.valid || canMove.cost === undefined) return;

        // Find path
        const path = this.movementSystem.findPath(
            player.position,
            target,
            this.config.gridSize,
            this.isWall,
            this.isOccupied
        );

        if (!path || path.length === 0) return;

        // Update state
        this.state = moveUnit(this.state, player.id, target, path.length);

        // Emit movement event
        this.eventBus.emit("unit:moved", {
            unitId: player.id,
            from: player.position,
            to: target,
            path,
            cost: path.length,
        });

        // Check if player should auto-end turn
        this.checkAutoEndTurn();
    }

    /**
     * Player attack.
     */
    private playerAttack(
        player: UnitState,
        target: UnitState,
        spell: SpellDefinition
    ): void {
        // Validate attack
        const hasLOS = this.combatSystem.hasLineOfSight(
            player.position,
            target.position,
            this.isWall,
            (x, y) => {
                const unit = this.state.units.find(
                    (u) => u.position.x === x && u.position.y === y && isAlive(u)
                );
                return unit !== undefined && unit.id !== target.id && unit.id !== player.id;
            }
        );

        const validation = this.combatSystem.canAttack(player, target, spell, hasLOS);
        if (!validation.valid) {
            // Could emit an error event here
            return;
        }

        // Consume AP
        this.state = useActionPoints(this.state, player.id, spell.apCost);

        // Emit spell cast event
        this.eventBus.emit("combat:spell_cast", {
            casterId: player.id,
            spell,
            targetPosition: target.position,
            targetIds: [target.id],
            apCost: spell.apCost,
        });

        // Check for AoE
        if (spell.aoeShape && spell.aoeRadius) {
            this.executeAoeAttack(player, target, spell);
        } else {
            this.executeSingleTargetAttack(player, target, spell);
        }

        // Check for spell echo (AP refund)
        if (this.bonusSystem.shouldRefundAP(spell.type, this.state.appliedBonuses)) {
            this.state = grantActionPoints(this.state, player.id, spell.apCost);
        }

        // Check victory conditions
        const victoryResult = this.turnManager.checkVictoryConditions(this.state.units);
        if (victoryResult) return;

        // Check if player should auto-end turn
        this.checkAutoEndTurn();
    }

    private executeSingleTargetAttack(
        attacker: UnitState,
        target: UnitState,
        spell: SpellDefinition
    ): void {
        const result = this.combatSystem.executeAttack(
            attacker,
            target,
            spell,
            this.state.appliedBonuses,
            this.spellShieldUsed
        );

        this.applyAttackResult(attacker, target, result, spell);
    }

    private executeAoeAttack(
        attacker: UnitState,
        primaryTarget: UnitState,
        spell: SpellDefinition
    ): void {
        // Get AoE tiles
        const aoeTiles = this.combatSystem.getAoeTiles(
            spell,
            attacker.position,
            primaryTarget.position,
            this.config.gridSize,
            this.isWall
        );

        // Get all units in AoE
        const targetsInAoe = this.state.units.filter(
            (u) =>
                isAlive(u) &&
                u.team === "enemy" &&
                aoeTiles.some((t) => t.x === u.position.x && t.y === u.position.y)
        );

        // Execute AoE attack
        const result = this.combatSystem.executeAoeAttack(
            attacker,
            primaryTarget,
            targetsInAoe,
            spell,
            this.state.appliedBonuses
        );

        // Apply primary target result
        this.applyAttackResult(attacker, primaryTarget, result, spell);

        // Apply secondary target results
        for (const aoeTarget of result.aoeTargets) {
            const target = getUnitById(this.state, aoeTarget.targetId);
            if (target) {
                this.state = damageUnit(this.state, target.id, aoeTarget.damage);
                
                this.eventBus.emit("unit:damaged", {
                    unitId: target.id,
                    damage: aoeTarget.damage,
                    damageType: spell.type === "magic" ? "magic" : "physical",
                    attackerId: attacker.id,
                    newHealth: getUnitById(this.state, target.id)!.stats.health,
                    maxHealth: target.stats.maxHealth,
                });

                if (aoeTarget.killed) {
                    this.eventBus.emit("unit:killed", {
                        unitId: target.id,
                        killerId: attacker.id,
                        position: target.position,
                    });
                }
            }
        }
    }

    private applyAttackResult(
        attacker: UnitState,
        target: UnitState,
        result: AttackResult,
        spell: SpellDefinition
    ): void {
        // Apply damage
        if (!result.blocked) {
            this.state = damageUnit(this.state, target.id, result.damage);

            this.eventBus.emit("unit:damaged", {
                unitId: target.id,
                damage: result.damage,
                damageType: spell.type === "magic" ? "magic" : "physical",
                attackerId: attacker.id,
                newHealth: getUnitById(this.state, target.id)!.stats.health,
                maxHealth: target.stats.maxHealth,
            });
        } else {
            this.spellShieldUsed = true;
            this.eventBus.emit("combat:blocked", {
                defenderId: target.id,
                attackerId: attacker.id,
                blockType: "spell_shield",
            });
        }

        // Apply critical hit event
        if (result.isCritical) {
            this.eventBus.emit("combat:critical_hit", {
                attackerId: attacker.id,
                targetId: target.id,
                originalDamage: Math.round(result.damage / 2),
                criticalDamage: result.damage,
            });
        }

        // Apply execute event
        if (result.isExecute) {
            this.eventBus.emit("combat:execute", {
                attackerId: attacker.id,
                targetId: target.id,
                spellId: spell.id,
            });
        }

        // Apply healing
        if (result.healing > 0) {
            this.state = healUnit(this.state, attacker.id, result.healing);
            this.eventBus.emit("unit:healed", {
                unitId: attacker.id,
                amount: result.healing,
                source: "on_hit",
                newHealth: getUnitById(this.state, attacker.id)!.stats.health,
                maxHealth: attacker.stats.maxHealth,
            });
        }

        // Apply thorns damage
        if (result.thornsDamage > 0) {
            this.state = damageUnit(this.state, attacker.id, result.thornsDamage);
            this.eventBus.emit("combat:thorns", {
                defenderId: target.id,
                attackerId: attacker.id,
                damage: result.thornsDamage,
            });
        }

        // Check if target killed
        if (result.targetKilled) {
            this.eventBus.emit("unit:killed", {
                unitId: target.id,
                killerId: attacker.id,
                position: target.position,
            });

            // Momentum bonus: +1 MP on kill
            if (this.state.appliedBonuses.includes("momentum")) {
                this.state = grantMovementPoints(this.state, attacker.id, 1);
            }
        }
    }

    private checkAutoEndTurn(): void {
        const player = getPlayer(this.state);
        if (!player) return;

        if (this.turnManager.shouldAutoEndPlayerTurn(player)) {
            this.endTurn();
        }
    }

    // =========================================================================
    // Enemy Turn
    // =========================================================================

    private async runEnemyTurn(): Promise<void> {
        const enemies = getAliveUnitsByTeam(this.state, "enemy");
        
        for (const enemy of enemies) {
            if (this.turnManager.hasGameEnded()) break;

            const player = getPlayer(this.state);
            if (!player || !isAlive(player)) break;

            // Plan enemy turn
            const plan = this.aiSystem.planTurn(
                enemy,
                [player],
                this.state.units,
                this.config.gridSize,
                this.isWall
            );

            // Execute actions
            for (const action of plan.actions) {
                if (this.turnManager.hasGameEnded()) break;
                await this.executeEnemyAction(enemy, action);
            }

            // Mark enemy as acted
            this.state = setUnitActed(this.state, enemy.id);
        }

        // Check victory conditions after all enemies act
        const victoryResult = this.turnManager.checkVictoryConditions(this.state.units);
        if (victoryResult) return;

        // End enemy turn
        if (!this.turnManager.hasGameEnded()) {
            this.endTurn();
        }
    }

    private async executeEnemyAction(enemy: UnitState, action: AIAction): Promise<void> {
        switch (action.type) {
            case "move":
                if (action.path && action.targetPosition) {
                    this.state = moveUnit(
                        this.state,
                        enemy.id,
                        action.targetPosition,
                        action.path.length
                    );

                    this.eventBus.emit("unit:moved", {
                        unitId: enemy.id,
                        from: enemy.position,
                        to: action.targetPosition,
                        path: action.path,
                        cost: action.path.length,
                    });
                }
                break;

            case "attack":
                if (action.targetUnitId) {
                    const target = getUnitById(this.state, action.targetUnitId);
                    const currentEnemy = getUnitById(this.state, enemy.id);
                    if (target && currentEnemy) {
                        const attackResult = this.combatSystem.executeEnemyAttack(
                            currentEnemy,
                            target,
                            this.state.appliedBonuses,
                            this.spellShieldUsed
                        );

                        if (attackResult.blocked) {
                            this.spellShieldUsed = true;
                            this.eventBus.emit("combat:blocked", {
                                defenderId: target.id,
                                attackerId: enemy.id,
                                blockType: "spell_shield",
                            });
                        } else {
                            this.state = damageUnit(this.state, target.id, attackResult.damage);

                            this.eventBus.emit("unit:damaged", {
                                unitId: target.id,
                                damage: attackResult.damage,
                                damageType: "physical",
                                attackerId: enemy.id,
                                newHealth: getUnitById(this.state, target.id)!.stats.health,
                                maxHealth: target.stats.maxHealth,
                            });

                            // Apply movement gained from damage
                            if (attackResult.movementGained > 0) {
                                this.state = grantMovementPoints(
                                    this.state,
                                    target.id,
                                    attackResult.movementGained
                                );
                            }

                            // Check if player killed
                            const updatedTarget = getUnitById(this.state, target.id);
                            if (updatedTarget && !isAlive(updatedTarget)) {
                                this.eventBus.emit("unit:killed", {
                                    unitId: target.id,
                                    killerId: enemy.id,
                                    position: target.position,
                                });
                            }
                        }
                    }
                }
                break;
        }
    }

    // =========================================================================
    // Victory/Defeat
    // =========================================================================

    private onVictory(): void {
        this.state = incrementWins(this.state);

        this.eventBus.emit("game:victory", {
            turnCount: this.turnManager.getTurnNumber(),
            enemiesDefeated: this.config.level, // Approximate
        });
    }

    private onDefeat(): void {
        this.eventBus.emit("game:defeat", {
            turnCount: this.turnManager.getTurnNumber(),
            enemiesRemaining: getAliveUnitsByTeam(this.state, "enemy").length,
        });
    }

    // =========================================================================
    // Bonus Selection
    // =========================================================================

    /**
     * Gets random bonuses for selection.
     */
    public getRandomBonuses(count: number): BonusDefinition[] {
        return this.bonusSystem.getRandomBonuses(count, this.state.appliedBonuses);
    }

    /**
     * Applies a selected bonus.
     */
    public applyBonus(bonus: BonusDefinition): void {
        this.state = addBonus(this.state, bonus.id);

        this.eventBus.emit("bonus:selected", {
            bonus,
            totalBonuses: this.state.appliedBonuses.length,
        });

        this.eventBus.emit("bonus:applied", {
            bonusId: bonus.id,
            effects: bonus.effects.map((e) => e.type),
        });
    }

    // =========================================================================
    // State Accessors
    // =========================================================================

    /**
     * Gets the current game state.
     */
    public getState(): GameStateSnapshot {
        return this.state;
    }

    /**
     * Gets the player unit.
     */
    public getPlayer(): UnitState | undefined {
        return getPlayer(this.state);
    }

    /**
     * Gets all units.
     */
    public getUnits(): UnitState[] {
        return this.state.units;
    }

    /**
     * Gets alive enemies.
     */
    public getAliveEnemies(): UnitState[] {
        return getAliveUnitsByTeam(this.state, "enemy");
    }

    /**
     * Gets applied bonuses.
     */
    public getAppliedBonuses(): string[] {
        return this.state.appliedBonuses;
    }

    /**
     * Gets win count.
     */
    public getWins(): number {
        return this.state.wins;
    }

    /**
     * Gets the player's spells.
     */
    public getPlayerSpells(): SpellDefinition[] {
        return this.playerSpells;
    }

    /**
     * Checks if it's the player's turn.
     */
    public isPlayerTurn(): boolean {
        return this.turnManager.isPlayerTurn();
    }

    /**
     * Checks if the game has ended.
     */
    public hasGameEnded(): boolean {
        return this.turnManager.hasGameEnded();
    }

    /**
     * Gets the current turn number.
     */
    public getTurnNumber(): number {
        return this.turnManager.getTurnNumber();
    }

    /**
     * Gets the event bus for UI subscriptions.
     */
    public getEventBus(): EventEmitter {
        return this.eventBus;
    }

    /**
     * Gets the bonus system.
     */
    public getBonusSystem(): BonusSystem {
        return this.bonusSystem;
    }

    /**
     * Gets the movement system for pathfinding.
     */
    public getMovementSystem(): MovementSystem {
        return this.movementSystem;
    }

    /**
     * Gets the combat system.
     */
    public getCombatSystem(): CombatSystem {
        return this.combatSystem;
    }

    // =========================================================================
    // Utility
    // =========================================================================

    private getDifficultyString(): string {
        const level = this.config.level;
        if (level <= 2) return "Easy";
        if (level <= 4) return "Normal";
        if (level <= 6) return "Hard";
        if (level <= 8) return "Veteran";
        return "Nightmare";
    }

    /**
     * Destroys the controller and cleans up.
     */
    public destroy(): void {
        this.turnManager.reset();
        this.eventBus.clear();
    }
}
