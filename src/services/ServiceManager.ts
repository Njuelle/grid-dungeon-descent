/**
 * ServiceManager - Coordinates all services with dependency injection and lifecycle management
 * Provides centralized service management with initialization order and error handling
 */

import { Service, Result } from "../data/types";
import { success, failure, eventBus, GameEvent } from "../core";

export interface ServiceRegistry {
    [key: string]: Service;
}

export interface ServiceDependency {
    service: string;
    required?: boolean;
}

export interface ServiceDefinition {
    service: Service;
    dependencies?: ServiceDependency[];
    priority?: number;
}

export class ServiceManager {
    private services = new Map<string, Service>();
    private serviceDefinitions = new Map<string, ServiceDefinition>();
    private initializationOrder: string[] = [];
    private initializedServices = new Set<string>();
    private isInitialized = false;

    public registerService(
        name: string,
        service: Service,
        dependencies: ServiceDependency[] = [],
        priority = 0
    ): Result<void, string> {
        if (this.services.has(name)) {
            return failure(`Service already registered: ${name}`);
        }

        if (this.isInitialized) {
            return failure("Cannot register services after initialization");
        }

        this.services.set(name, service);
        this.serviceDefinitions.set(name, {
            service,
            dependencies,
            priority,
        });

        console.log(`[ServiceManager] Registered service: ${name}`);
        return success(undefined);
    }

    public getService<T extends Service>(name: string): T | null {
        return (this.services.get(name) as T) || null;
    }

    public hasService(name: string): boolean {
        return this.services.has(name);
    }

    public async initializeAll(): Promise<Result<void, string>> {
        if (this.isInitialized) {
            return failure("Services already initialized");
        }

        try {
            // Calculate initialization order based on dependencies and priority
            const orderResult = this.calculateInitializationOrder();
            if (orderResult.isFailure()) {
                return orderResult;
            }

            // Initialize services in order
            for (const serviceName of this.initializationOrder) {
                const initResult = await this.initializeService(serviceName);
                if (initResult.isFailure()) {
                    // Cleanup already initialized services on failure
                    await this.destroyAll();
                    return initResult;
                }
            }

            this.isInitialized = true;

            eventBus.emit(GameEvent.SCENE_READY, {
                sceneName: "ServiceManager",
                sceneData: {
                    initializedServices: Array.from(this.initializedServices),
                },
            });

            console.log(
                "[ServiceManager] All services initialized successfully"
            );
            console.log(
                "[ServiceManager] Initialization order:",
                this.initializationOrder
            );
            return success(undefined);
        } catch (error) {
            await this.destroyAll();
            return failure(`Failed to initialize services: ${error}`);
        }
    }

    public async destroyAll(): Promise<Result<void, string>> {
        const errors: string[] = [];

        // Destroy services in reverse order
        const destroyOrder = [...this.initializationOrder].reverse();

        for (const serviceName of destroyOrder) {
            if (this.initializedServices.has(serviceName)) {
                try {
                    const service = this.services.get(serviceName);
                    if (service) {
                        await service.destroy();
                        this.initializedServices.delete(serviceName);
                        console.log(
                            `[ServiceManager] Destroyed service: ${serviceName}`
                        );
                    }
                } catch (error) {
                    errors.push(`Failed to destroy ${serviceName}: ${error}`);
                }
            }
        }

        this.isInitialized = false;

        if (errors.length > 0) {
            return failure(`Errors during destruction: ${errors.join(", ")}`);
        }

        console.log("[ServiceManager] All services destroyed");
        return success(undefined);
    }

    public async restartService(name: string): Promise<Result<void, string>> {
        if (!this.services.has(name)) {
            return failure(`Service not found: ${name}`);
        }

        try {
            // Destroy the service
            if (this.initializedServices.has(name)) {
                const service = this.services.get(name)!;
                await service.destroy();
                this.initializedServices.delete(name);
            }

            // Reinitialize the service
            const initResult = await this.initializeService(name);
            if (initResult.isFailure()) {
                return initResult;
            }

            console.log(`[ServiceManager] Restarted service: ${name}`);
            return success(undefined);
        } catch (error) {
            return failure(`Failed to restart service ${name}: ${error}`);
        }
    }

    public getServiceStatus(
        name: string
    ): "not_found" | "registered" | "initialized" {
        if (!this.services.has(name)) {
            return "not_found";
        }

        return this.initializedServices.has(name)
            ? "initialized"
            : "registered";
    }

    public getAllServiceStatuses(): Record<
        string,
        "registered" | "initialized"
    > {
        const statuses: Record<string, "registered" | "initialized"> = {};

        for (const [name] of this.services) {
            statuses[name] = this.initializedServices.has(name)
                ? "initialized"
                : "registered";
        }

        return statuses;
    }

    public getInitializationOrder(): string[] {
        return [...this.initializationOrder];
    }

    public getDependencyGraph(): Record<string, string[]> {
        const graph: Record<string, string[]> = {};

        for (const [name, definition] of this.serviceDefinitions) {
            graph[name] =
                definition.dependencies?.map((dep) => dep.service) || [];
        }

        return graph;
    }

    // Private Methods
    private async initializeService(
        name: string
    ): Promise<Result<void, string>> {
        if (this.initializedServices.has(name)) {
            return success(undefined); // Already initialized
        }

        const service = this.services.get(name);
        if (!service) {
            return failure(`Service not found: ${name}`);
        }

        // Check dependencies are initialized
        const definition = this.serviceDefinitions.get(name);
        if (definition?.dependencies) {
            for (const dependency of definition.dependencies) {
                if (
                    dependency.required !== false &&
                    !this.initializedServices.has(dependency.service)
                ) {
                    return failure(
                        `Dependency not initialized: ${dependency.service} required by ${name}`
                    );
                }
            }
        }

        try {
            await service.initialize();
            this.initializedServices.add(name);
            console.log(`[ServiceManager] Initialized service: ${name}`);
            return success(undefined);
        } catch (error) {
            return failure(`Failed to initialize service ${name}: ${error}`);
        }
    }

    private calculateInitializationOrder(): Result<void, string> {
        const visited = new Set<string>();
        const visiting = new Set<string>();
        const order: string[] = [];

        const visit = (serviceName: string): boolean => {
            if (visiting.has(serviceName)) {
                // Circular dependency detected
                return false;
            }

            if (visited.has(serviceName)) {
                return true;
            }

            visiting.add(serviceName);

            const definition = this.serviceDefinitions.get(serviceName);
            if (definition?.dependencies) {
                // Sort dependencies by priority (higher priority first)
                const sortedDeps = [...definition.dependencies].sort((a, b) => {
                    const aDef = this.serviceDefinitions.get(a.service);
                    const bDef = this.serviceDefinitions.get(b.service);
                    return (bDef?.priority || 0) - (aDef?.priority || 0);
                });

                for (const dependency of sortedDeps) {
                    if (!this.services.has(dependency.service)) {
                        if (dependency.required !== false) {
                            console.error(
                                `[ServiceManager] Required dependency not found: ${dependency.service} for ${serviceName}`
                            );
                            return false;
                        }
                        continue; // Skip optional missing dependencies
                    }

                    if (!visit(dependency.service)) {
                        return false;
                    }
                }
            }

            visiting.delete(serviceName);
            visited.add(serviceName);
            order.push(serviceName);

            return true;
        };

        // Get all services sorted by priority
        const allServices = Array.from(this.serviceDefinitions.entries())
            .sort(([, a], [, b]) => (b.priority || 0) - (a.priority || 0))
            .map(([name]) => name);

        for (const serviceName of allServices) {
            if (!visit(serviceName)) {
                return failure(
                    `Circular dependency or missing required dependency detected for service: ${serviceName}`
                );
            }
        }

        this.initializationOrder = order;
        return success(undefined);
    }

    // Utility Methods
    public createServiceRegistry(): ServiceRegistry {
        const registry: ServiceRegistry = {};

        for (const [name, service] of this.services) {
            if (this.initializedServices.has(name)) {
                registry[name] = service;
            }
        }

        return registry;
    }

    public getStats() {
        return {
            totalServices: this.services.size,
            initializedServices: this.initializedServices.size,
            initializationOrder: this.initializationOrder,
            isInitialized: this.isInitialized,
        };
    }

    // Debug Methods
    public logDependencyGraph(): void {
        console.log("[ServiceManager] Dependency Graph:");
        const graph = this.getDependencyGraph();

        for (const [service, dependencies] of Object.entries(graph)) {
            const status = this.getServiceStatus(service);
            console.log(
                `  ${service} (${status}): ${
                    dependencies.length > 0
                        ? dependencies.join(", ")
                        : "no dependencies"
                }`
            );
        }
    }

    public validateDependencies(): Result<void, string> {
        const errors: string[] = [];

        for (const [serviceName, definition] of this.serviceDefinitions) {
            if (definition.dependencies) {
                for (const dependency of definition.dependencies) {
                    if (!this.services.has(dependency.service)) {
                        if (dependency.required !== false) {
                            errors.push(
                                `Service ${serviceName} has missing required dependency: ${dependency.service}`
                            );
                        }
                    }
                }
            }
        }

        if (errors.length > 0) {
            return failure(
                `Dependency validation failed: ${errors.join(", ")}`
            );
        }

        return success(undefined);
    }
}

// Global service manager instance
export const serviceManager = new ServiceManager();
