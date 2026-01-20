/**
 * EventEmitter - Type-safe event emitter for game events.
 * 
 * Provides a centralized event bus with:
 * - Type-safe event emission and subscription
 * - Wildcard listeners for debugging
 * - Event history for replay/debugging
 */

import { GameEventMap } from "./GameEvents";

// =============================================================================
// Types
// =============================================================================

export type EventCallback<T> = (payload: T) => void;
export type WildcardCallback = (eventName: string, payload: unknown) => void;

interface Subscription {
    callback: EventCallback<unknown>;
    once: boolean;
}

// =============================================================================
// EventEmitter Class
// =============================================================================

export class EventEmitter {
    private listeners: Map<string, Subscription[]> = new Map();
    private wildcardListeners: WildcardCallback[] = [];
    private eventHistory: Array<{ event: string; payload: unknown; timestamp: number }> = [];
    private maxHistorySize: number = 100;
    private enabled: boolean = true;

    // =========================================================================
    // Event Subscription
    // =========================================================================

    /**
     * Subscribe to an event.
     */
    public on<K extends keyof GameEventMap>(
        event: K,
        callback: EventCallback<GameEventMap[K]>
    ): () => void {
        const listeners = this.listeners.get(event) || [];
        listeners.push({ callback: callback as EventCallback<unknown>, once: false });
        this.listeners.set(event, listeners);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event once (auto-unsubscribe after first call).
     */
    public once<K extends keyof GameEventMap>(
        event: K,
        callback: EventCallback<GameEventMap[K]>
    ): () => void {
        const listeners = this.listeners.get(event) || [];
        listeners.push({ callback: callback as EventCallback<unknown>, once: true });
        this.listeners.set(event, listeners);

        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from an event.
     */
    public off<K extends keyof GameEventMap>(
        event: K,
        callback: EventCallback<GameEventMap[K]>
    ): void {
        const listeners = this.listeners.get(event);
        if (!listeners) return;

        const index = listeners.findIndex((l) => l.callback === callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Subscribe to all events (for debugging/logging).
     */
    public onAny(callback: WildcardCallback): () => void {
        this.wildcardListeners.push(callback);
        return () => this.offAny(callback);
    }

    /**
     * Unsubscribe from all events.
     */
    public offAny(callback: WildcardCallback): void {
        const index = this.wildcardListeners.indexOf(callback);
        if (index !== -1) {
            this.wildcardListeners.splice(index, 1);
        }
    }

    // =========================================================================
    // Event Emission
    // =========================================================================

    /**
     * Emit an event.
     */
    public emit<K extends keyof GameEventMap>(
        event: K,
        payload: GameEventMap[K]
    ): void {
        if (!this.enabled) return;

        // Record in history
        this.recordEvent(event, payload);

        // Notify wildcard listeners
        for (const callback of this.wildcardListeners) {
            try {
                callback(event, payload);
            } catch (error) {
                console.error(`Error in wildcard listener for ${event}:`, error);
            }
        }

        // Notify specific listeners
        const listeners = this.listeners.get(event);
        if (!listeners) return;

        // Create a copy to avoid issues with listeners being added/removed during iteration
        const listenersCopy = [...listeners];
        const toRemove: number[] = [];

        listenersCopy.forEach((subscription, index) => {
            try {
                subscription.callback(payload);
                if (subscription.once) {
                    toRemove.push(index);
                }
            } catch (error) {
                console.error(`Error in listener for ${event}:`, error);
            }
        });

        // Remove once listeners
        for (let i = toRemove.length - 1; i >= 0; i--) {
            listeners.splice(toRemove[i], 1);
        }
    }

    // =========================================================================
    // Event History
    // =========================================================================

    /**
     * Records an event in history.
     */
    private recordEvent(event: string, payload: unknown): void {
        this.eventHistory.push({
            event,
            payload,
            timestamp: Date.now(),
        });

        // Trim history if needed
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * Gets the event history.
     */
    public getHistory(): Array<{ event: string; payload: unknown; timestamp: number }> {
        return [...this.eventHistory];
    }

    /**
     * Gets recent events of a specific type.
     */
    public getRecentEvents<K extends keyof GameEventMap>(
        event: K,
        count: number = 10
    ): GameEventMap[K][] {
        return this.eventHistory
            .filter((e) => e.event === event)
            .slice(-count)
            .map((e) => e.payload as GameEventMap[K]);
    }

    /**
     * Clears the event history.
     */
    public clearHistory(): void {
        this.eventHistory = [];
    }

    /**
     * Sets the maximum history size.
     */
    public setMaxHistorySize(size: number): void {
        this.maxHistorySize = size;
        while (this.eventHistory.length > size) {
            this.eventHistory.shift();
        }
    }

    // =========================================================================
    // Utility Methods
    // =========================================================================

    /**
     * Enables event emission.
     */
    public enable(): void {
        this.enabled = true;
    }

    /**
     * Disables event emission.
     */
    public disable(): void {
        this.enabled = false;
    }

    /**
     * Checks if event emission is enabled.
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Gets the number of listeners for an event.
     */
    public listenerCount<K extends keyof GameEventMap>(event: K): number {
        return this.listeners.get(event)?.length || 0;
    }

    /**
     * Removes all listeners for an event.
     */
    public removeAllListeners<K extends keyof GameEventMap>(event: K): void {
        this.listeners.delete(event);
    }

    /**
     * Removes all listeners for all events.
     */
    public clear(): void {
        this.listeners.clear();
        this.wildcardListeners = [];
    }

    /**
     * Destroys the event emitter.
     */
    public destroy(): void {
        this.clear();
        this.clearHistory();
        this.enabled = false;
    }
}

// =============================================================================
// Global Event Bus
// =============================================================================

/**
 * Global game event bus.
 * Use this for cross-system communication.
 */
export const gameEventBus = new EventEmitter();
