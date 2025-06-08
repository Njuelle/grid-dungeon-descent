/**
 * Type-safe EventBus system for decoupling components
 * Supports both synchronous and asynchronous event handling
 */

export type EventHandler<T = any> = (data: T) => void | Promise<void>;
export type UnsubscribeFunction = () => void;

export interface EventBusOptions {
    /**
     * Whether to log events for debugging
     */
    debug?: boolean;

    /**
     * Maximum number of listeners per event (prevents memory leaks)
     */
    maxListeners?: number;
}

export class EventBus {
    private listeners = new Map<string, Set<EventHandler>>();
    private options: Required<EventBusOptions>;

    constructor(options: EventBusOptions = {}) {
        this.options = {
            debug: false,
            maxListeners: 100,
            ...options,
        };
    }

    /**
     * Subscribe to an event
     */
    on<T = any>(event: string, handler: EventHandler<T>): UnsubscribeFunction {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        const eventListeners = this.listeners.get(event)!;

        // Check max listeners limit
        if (eventListeners.size >= this.options.maxListeners) {
            console.warn(
                `EventBus: Maximum listeners (${this.options.maxListeners}) reached for event "${event}"`
            );
        }

        eventListeners.add(handler);

        if (this.options.debug) {
            console.log(
                `EventBus: Subscribed to "${event}", total listeners: ${eventListeners.size}`
            );
        }

        // Return unsubscribe function
        return () => this.off(event, handler);
    }

    /**
     * Subscribe to an event, but automatically unsubscribe after first emission
     */
    once<T = any>(
        event: string,
        handler: EventHandler<T>
    ): UnsubscribeFunction {
        const wrappedHandler = (data: T) => {
            handler(data);
            this.off(event, wrappedHandler);
        };

        return this.on(event, wrappedHandler);
    }

    /**
     * Unsubscribe from an event
     */
    off<T = any>(event: string, handler: EventHandler<T>): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(handler);

            if (eventListeners.size === 0) {
                this.listeners.delete(event);
            }

            if (this.options.debug) {
                console.log(
                    `EventBus: Unsubscribed from "${event}", remaining listeners: ${eventListeners.size}`
                );
            }
        }
    }

    /**
     * Emit an event synchronously
     */
    emit<T = any>(event: string, data?: T): void {
        const eventListeners = this.listeners.get(event);

        if (this.options.debug) {
            console.log(
                `EventBus: Emitting "${event}" to ${
                    eventListeners?.size || 0
                } listeners`,
                data
            );
        }

        if (eventListeners) {
            // Create a copy to avoid issues if listeners are modified during emission
            const listenersArray = Array.from(eventListeners);

            for (const handler of listenersArray) {
                try {
                    const result = handler(data);

                    // Handle async handlers (though emit is sync)
                    if (result instanceof Promise) {
                        result.catch((error) => {
                            console.error(
                                `EventBus: Async error in handler for "${event}":`,
                                error
                            );
                        });
                    }
                } catch (error) {
                    console.error(
                        `EventBus: Error in handler for "${event}":`,
                        error
                    );
                }
            }
        }
    }

    /**
     * Emit an event asynchronously, waiting for all handlers to complete
     */
    async emitAsync<T = any>(event: string, data?: T): Promise<void> {
        const eventListeners = this.listeners.get(event);

        if (this.options.debug) {
            console.log(
                `EventBus: Emitting async "${event}" to ${
                    eventListeners?.size || 0
                } listeners`,
                data
            );
        }

        if (eventListeners) {
            const listenersArray = Array.from(eventListeners);
            const promises: Promise<void>[] = [];

            for (const handler of listenersArray) {
                try {
                    const result = handler(data);

                    if (result instanceof Promise) {
                        promises.push(result);
                    }
                } catch (error) {
                    console.error(
                        `EventBus: Error in handler for "${event}":`,
                        error
                    );
                }
            }

            // Wait for all async handlers to complete
            if (promises.length > 0) {
                await Promise.allSettled(promises);
            }
        }
    }

    /**
     * Remove all listeners for a specific event, or all listeners if no event specified
     */
    removeAllListeners(event?: string): void {
        if (event) {
            this.listeners.delete(event);

            if (this.options.debug) {
                console.log(`EventBus: Removed all listeners for "${event}"`);
            }
        } else {
            this.listeners.clear();

            if (this.options.debug) {
                console.log("EventBus: Removed all listeners");
            }
        }
    }

    /**
     * Get the number of listeners for an event
     */
    listenerCount(event: string): number {
        return this.listeners.get(event)?.size || 0;
    }

    /**
     * Get all registered event names
     */
    eventNames(): string[] {
        return Array.from(this.listeners.keys());
    }
}

/**
 * Standard game events
 */
export enum GameEvent {
    // Combat events
    COMBAT_DAMAGE_DEALT = "combat:damage_dealt",
    COMBAT_ENTITY_KILLED = "combat:entity_killed",
    COMBAT_DAMAGE_TAKEN = "combat:damage_taken",

    // Movement events
    PLAYER_MOVED = "player:moved",
    PLAYER_ACTION = "player:action",
}

// Create a default instance
export const eventBus = new EventBus({
    debug: process.env.NODE_ENV === "development",
});

