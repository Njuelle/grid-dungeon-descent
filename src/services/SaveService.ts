/**
 * SaveService - Handles game save/load operations with validation and backup
 * Provides type-safe save/load functionality with error handling
 */

import {
    SaveData,
    SaveMetadata,
    GameState,
    ValidationResult,
    Result,
    Service,
} from "../data/types";
import { SaveType, GAME_CONSTANTS } from "../data/enums";
import {
    success,
    failure,
    eventBus,
    GameEvent,
    TimeUtils,
    IdGenerator,
} from "../core";

export interface SaveServiceConfig {
    enableAutoSave?: boolean;
    autoSaveInterval?: number;
    maxSaveSlots?: number;
    enableBackup?: boolean;
    enableCompression?: boolean;
    enableEncryption?: boolean;
}

export interface SaveSlot {
    id: string;
    name: string;
    data: SaveData;
    lastModified: number;
    size: number;
}

export class SaveService implements Service {
    public readonly name = "SaveService";

    private config: Required<SaveServiceConfig>;
    private autoSaveTimer?: NodeJS.Timeout;
    private saveSlots = new Map<string, SaveSlot>();
    private currentSaveId?: string;

    constructor(config: SaveServiceConfig = {}) {
        this.config = {
            enableAutoSave: true,
            autoSaveInterval: GAME_CONSTANTS.AUTO_SAVE_INTERVAL,
            maxSaveSlots: GAME_CONSTANTS.MAX_SAVE_SLOTS,
            enableBackup: true,
            enableCompression: false,
            enableEncryption: false,
            ...config,
        };
    }

    public async initialize(): Promise<void> {
        await this.loadSaveSlots();
        console.log(
            "[SaveService] Initialized with",
            this.saveSlots.size,
            "save slots"
        );
    }

    public async destroy(): Promise<void> {
        this.saveSlots.clear();
        console.log("[SaveService] Destroyed");
    }

    // Save Operations
    public async saveGame(
        gameState: GameState,
        name?: string,
        type: SaveType = SaveType.MANUAL
    ): Promise<Result<string, string>> {
        try {
            const saveId =
                this.currentSaveId || IdGenerator.generateTypedId("save");
            const saveData = this.createSaveData(gameState, saveId, type);

            // Validate save data
            const validation = this.validateSaveData(saveData);
            if (!validation.isValid) {
                return failure(
                    `Invalid save data: ${validation.errors.join(", ")}`
                );
            }

            // Check save slot limit
            if (
                this.saveSlots.size >= this.config.maxSaveSlots &&
                !this.saveSlots.has(saveId)
            ) {
                return failure(
                    `Maximum save slots reached (${this.config.maxSaveSlots})`
                );
            }

            // Create backup if enabled
            if (this.config.enableBackup && this.saveSlots.has(saveId)) {
                await this.createBackup(saveId);
            }

            // Create save slot
            const slot: SaveSlot = {
                id: saveId,
                name: name || this.generateSaveName(saveData),
                data: saveData,
                lastModified: Date.now(),
                size: JSON.stringify(saveData).length,
            };

            // Save to memory and localStorage
            this.saveSlots.set(saveId, slot);
            await this.persistSaveSlot(slot);

            this.currentSaveId = saveId;

            // Emit save event
            eventBus.emit(GameEvent.SAVE_REQUESTED, {
                type: type === SaveType.AUTO ? "auto" : "manual",
            });

            console.log(
                `[SaveService] Saved game "${slot.name}" (${slot.size} bytes)`
            );
            return success(saveId);
        } catch (error) {
            return failure(`Failed to save game: ${error}`);
        }
    }

    public async autoSave(
        gameState: GameState
    ): Promise<Result<string, string>> {
        const autoSaveId = "autosave";
        const saveData = this.createSaveData(
            gameState,
            autoSaveId,
            SaveType.AUTO
        );

        try {
            const slot: SaveSlot = {
                id: autoSaveId,
                name: `Auto Save - ${TimeUtils.formatDate()}`,
                data: saveData,
                lastModified: Date.now(),
                size: JSON.stringify(saveData).length,
            };

            this.saveSlots.set(autoSaveId, slot);
            await this.persistSaveSlot(slot);

            console.log("[SaveService] Auto-saved game");
            return success(autoSaveId);
        } catch (error) {
            return failure(`Auto-save failed: ${error}`);
        }
    }

    public async quickSave(
        gameState: GameState
    ): Promise<Result<string, string>> {
        return this.saveGame(gameState, "Quick Save", SaveType.MANUAL);
    }

    // Load Operations
    public async loadGame(saveId: string): Promise<Result<GameState, string>> {
        try {
            const slot = this.saveSlots.get(saveId);
            if (!slot) {
                return failure(`Save not found: ${saveId}`);
            }

            // Validate save data
            const validation = this.validateSaveData(slot.data);
            if (!validation.isValid) {
                return failure(
                    `Corrupted save data: ${validation.errors.join(", ")}`
                );
            }

            this.currentSaveId = saveId;

            // Emit load event
            eventBus.emit(GameEvent.LOAD_REQUESTED, {
                saveId,
            });

            console.log(`[SaveService] Loaded game "${slot.name}"`);
            return success(slot.data.gameState);
        } catch (error) {
            return failure(`Failed to load game: ${error}`);
        }
    }

    public async loadLatestSave(): Promise<Result<GameState, string>> {
        const saves = this.getSaveSlots();
        if (saves.length === 0) {
            return failure("No saves available");
        }

        // Sort by last modified and get the latest
        const latestSave = saves.sort(
            (a, b) => b.lastModified - a.lastModified
        )[0];
        return this.loadGame(latestSave.id);
    }

    public async loadAutoSave(): Promise<Result<GameState, string>> {
        return this.loadGame("autosave");
    }

    // Save Slot Management
    public getSaveSlots(): SaveSlot[] {
        return Array.from(this.saveSlots.values()).sort(
            (a, b) => b.lastModified - a.lastModified
        );
    }

    public getSaveSlot(saveId: string): SaveSlot | null {
        return this.saveSlots.get(saveId) || null;
    }

    public async deleteSave(saveId: string): Promise<Result<void, string>> {
        try {
            if (!this.saveSlots.has(saveId)) {
                return failure(`Save not found: ${saveId}`);
            }

            // Remove from memory and localStorage
            this.saveSlots.delete(saveId);
            localStorage.removeItem(`save_${saveId}`);

            // If this was the current save, clear it
            if (this.currentSaveId === saveId) {
                this.currentSaveId = undefined;
            }

            console.log(`[SaveService] Deleted save: ${saveId}`);
            return success(undefined);
        } catch (error) {
            return failure(`Failed to delete save: ${error}`);
        }
    }

    public async renameSave(
        saveId: string,
        newName: string
    ): Promise<Result<void, string>> {
        try {
            const slot = this.saveSlots.get(saveId);
            if (!slot) {
                return failure(`Save not found: ${saveId}`);
            }

            // Update name and persist
            slot.name = newName;
            slot.lastModified = Date.now();
            await this.persistSaveSlot(slot);

            console.log(`[SaveService] Renamed save ${saveId} to "${newName}"`);
            return success(undefined);
        } catch (error) {
            return failure(`Failed to rename save: ${error}`);
        }
    }

    public async clearAllSaves(): Promise<Result<void, string>> {
        try {
            // Clear memory
            const saveIds = Array.from(this.saveSlots.keys());
            this.saveSlots.clear();
            this.currentSaveId = undefined;

            // Clear localStorage
            saveIds.forEach((saveId) => {
                localStorage.removeItem(`save_${saveId}`);
            });

            localStorage.removeItem("save_slots_index");

            console.log("[SaveService] Cleared all saves");
            return success(undefined);
        } catch (error) {
            return failure(`Failed to clear saves: ${error}`);
        }
    }

    // Backup Operations
    public async createBackup(saveId: string): Promise<Result<string, string>> {
        try {
            const slot = this.saveSlots.get(saveId);
            if (!slot) {
                return failure(`Save not found: ${saveId}`);
            }

            const backupId = `${saveId}_backup_${Date.now()}`;
            const backupSlot: SaveSlot = {
                ...slot,
                id: backupId,
                name: `${slot.name} (Backup)`,
                lastModified: Date.now(),
            };

            this.saveSlots.set(backupId, backupSlot);
            await this.persistSaveSlot(backupSlot);

            console.log(`[SaveService] Created backup: ${backupId}`);
            return success(backupId);
        } catch (error) {
            return failure(`Failed to create backup: ${error}`);
        }
    }

    public async restoreBackup(
        backupId: string
    ): Promise<Result<void, string>> {
        const backupSlot = this.saveSlots.get(backupId);
        if (!backupSlot) {
            return failure(`Backup not found: ${backupId}`);
        }

        // Extract original save ID
        const originalId = backupId.split("_backup_")[0];

        // Restore the backup as the original save
        const restoredSlot: SaveSlot = {
            ...backupSlot,
            id: originalId,
            name: backupSlot.name.replace(" (Backup)", ""),
            lastModified: Date.now(),
        };

        this.saveSlots.set(originalId, restoredSlot);
        await this.persistSaveSlot(restoredSlot);

        console.log(
            `[SaveService] Restored backup ${backupId} to ${originalId}`
        );
        return success(undefined);
    }

    // Validation
    public validateSaveData(saveData: SaveData): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            // Version check
            if (!saveData.version) {
                errors.push("Save version is missing");
            } else if (saveData.version !== GAME_CONSTANTS.SAVE_VERSION) {
                warnings.push(
                    `Save version mismatch: ${saveData.version} vs ${GAME_CONSTANTS.SAVE_VERSION}`
                );
            }

            // Timestamp check
            if (!saveData.timestamp || isNaN(saveData.timestamp)) {
                errors.push("Invalid timestamp");
            }

            // Game state validation
            if (!saveData.gameState) {
                errors.push("Game state is missing");
            } else {
                // Basic state structure validation
                const requiredKeys = [
                    "player",
                    "battle",
                    "progress",
                    "ui",
                    "entities",
                ];
                for (const key of requiredKeys) {
                    if (!(key in saveData.gameState)) {
                        errors.push(`Missing game state key: ${key}`);
                    }
                }
            }

            // Metadata validation
            if (!saveData.metadata) {
                warnings.push("Metadata is missing");
            } else {
                if (!saveData.metadata.playerId) {
                    warnings.push("Player ID is missing");
                }
                if (!saveData.metadata.gameVersion) {
                    warnings.push("Game version is missing");
                }
            }
        } catch (error) {
            errors.push(`Validation error: ${error}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    // Utility Methods
    public hasAutoSave(): boolean {
        return this.saveSlots.has("autosave");
    }

    public getCurrentSaveId(): string | undefined {
        return this.currentSaveId;
    }

    public getSaveStats() {
        const slots = this.getSaveSlots();
        const totalSize = slots.reduce((sum, slot) => sum + slot.size, 0);

        return {
            totalSaves: slots.length,
            totalSize,
            averageSize:
                slots.length > 0 ? Math.round(totalSize / slots.length) : 0,
            latestSave: slots[0]?.lastModified || 0,
            hasAutoSave: this.hasAutoSave(),
        };
    }

    // Private Methods
    private createSaveData(
        gameState: GameState,
        saveId: string,
        type: SaveType
    ): SaveData {
        const metadata: SaveMetadata = {
            playerId: gameState.player.id,
            sessionId: IdGenerator.generateTypedId("session"),
            platform: "web",
            gameVersion: GAME_CONSTANTS.SAVE_VERSION,
        };

        return {
            version: GAME_CONSTANTS.SAVE_VERSION,
            timestamp: Date.now(),
            gameState,
            metadata,
        };
    }

    private generateSaveName(saveData: SaveData): string {
        const date = new Date(saveData.timestamp);
        const wins = saveData.gameState.progress.wins;
        const className = saveData.gameState.progress.selectedClass;

        return `${className} - Level ${wins} - ${TimeUtils.formatDate(date)}`;
    }

    private async persistSaveSlot(slot: SaveSlot): Promise<void> {
        // Save individual slot
        localStorage.setItem(`save_${slot.id}`, JSON.stringify(slot));

        // Update index
        const index = Array.from(this.saveSlots.keys());
        localStorage.setItem("save_slots_index", JSON.stringify(index));
    }

    private async loadSaveSlots(): Promise<void> {
        try {
            const indexData = localStorage.getItem("save_slots_index");
            if (!indexData) return;

            const saveIds: string[] = JSON.parse(indexData);

            for (const saveId of saveIds) {
                const slotData = localStorage.getItem(`save_${saveId}`);
                if (slotData) {
                    const slot: SaveSlot = JSON.parse(slotData);
                    this.saveSlots.set(saveId, slot);
                }
            }

            console.log(
                `[SaveService] Loaded ${this.saveSlots.size} save slots`
            );
        } catch (error) {
            console.error("[SaveService] Failed to load save slots:", error);
        }
    }

    private startAutoSave(): void {
        this.autoSaveTimer = setInterval(() => {
            eventBus.emit(GameEvent.SAVE_REQUESTED, {
                type: "auto",
            });
        }, this.config.autoSaveInterval);

        console.log(
            `[SaveService] Auto-save enabled (${this.config.autoSaveInterval}ms interval)`
        );
    }

    private setupEventListeners(): void {
        // Listen for save requests
        eventBus.on(GameEvent.SAVE_REQUESTED, (data) => {
            if (data.type === "auto") {
                // Auto-save will be handled by the game manager
                console.log("[SaveService] Auto-save requested");
            }
        });

        // Listen for errors to create emergency saves
        eventBus.on(GameEvent.ERROR_OCCURRED, (data) => {
            if (data.severity === "critical") {
                // Emergency save could be implemented here
                console.log(
                    "[SaveService] Critical error detected, emergency save might be needed"
                );
            }
        });
    }
}

// Global save service instance
export const saveService = new SaveService();

