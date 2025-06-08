/**
 * PerformanceMonitor - Performance tracking and optimization utility
 *
 * Provides comprehensive performance monitoring, memory tracking,
 * and system health metrics for optimization and debugging
 */

import { eventBus, GameEvent } from "../core";

export interface PerformanceMetrics {
    frameRate: number;
    averageFrameTime: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
    entityCount: number;
    renderCallsPerFrame: number;
    updateTimeMs: number;
    gcEvents: number;
    timestamp: number;
}

export interface PerformanceAlert {
    type: "memory" | "framerate" | "update_time" | "entity_count";
    severity: "warning" | "critical";
    message: string;
    value: number;
    threshold: number;
    timestamp: number;
}

export interface PerformanceThresholds {
    minFrameRate: number;
    maxFrameTime: number;
    maxMemoryUsage: number;
    maxUpdateTime: number;
    maxEntityCount: number;
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;

    private isEnabled = false;
    private isRecording = false;
    private frameCount = 0;
    private frameTimes: number[] = [];
    private lastFrameTime = 0;
    private metricsHistory: PerformanceMetrics[] = [];
    private alerts: PerformanceAlert[] = [];

    // Performance tracking
    private updateStartTime = 0;
    private renderCallCount = 0;
    private entityCount = 0;
    private gcEventCount = 0;

    // Thresholds for alerts
    private thresholds: PerformanceThresholds = {
        minFrameRate: 30,
        maxFrameTime: 33.33, // 30 FPS in ms
        maxMemoryUsage: 0.8, // 80% of available memory
        maxUpdateTime: 16, // 16ms for 60 FPS budget
        maxEntityCount: 1000,
    };

    // Configuration
    private maxHistorySize = 300; // 5 seconds at 60 FPS
    private alertCooldown = 2000; // 2 seconds between similar alerts
    private lastAlerts = new Map<string, number>();

    private constructor() {
        this.setupPerformanceAPI();
    }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * Enable performance monitoring
     */
    public enable(): void {
        this.isEnabled = true;
        this.startMonitoring();
        console.log("[PerformanceMonitor] Performance monitoring enabled");
    }

    /**
     * Disable performance monitoring
     */
    public disable(): void {
        this.isEnabled = false;
        this.stopMonitoring();
        console.log("[PerformanceMonitor] Performance monitoring disabled");
    }

    /**
     * Start recording detailed metrics
     */
    public startRecording(): void {
        this.isRecording = true;
        this.metricsHistory = [];
        this.alerts = [];
        console.log("[PerformanceMonitor] Started recording detailed metrics");
    }

    /**
     * Stop recording and return collected data
     */
    public stopRecording(): PerformanceMetrics[] {
        this.isRecording = false;
        const history = [...this.metricsHistory];
        console.log(
            `[PerformanceMonitor] Stopped recording. Collected ${history.length} data points`
        );
        return history;
    }

    /**
     * Update performance metrics (called every frame)
     */
    public update(): void {
        if (!this.isEnabled) return;

        const now = performance.now();
        this.frameCount++;

        // Calculate frame time
        if (this.lastFrameTime > 0) {
            const frameTime = now - this.lastFrameTime;
            this.frameTimes.push(frameTime);

            // Keep only recent frame times
            if (this.frameTimes.length > 60) {
                this.frameTimes.shift();
            }
        }
        this.lastFrameTime = now;

        // Record detailed metrics if recording
        if (this.isRecording && this.frameCount % 5 === 0) {
            // Every 5 frames to reduce overhead
            this.recordMetrics();
        }

        // Check for performance issues
        this.checkPerformanceThresholds();
    }

    /**
     * Mark the start of update cycle
     */
    public markUpdateStart(): void {
        if (!this.isEnabled) return;
        this.updateStartTime = performance.now();
    }

    /**
     * Mark the end of update cycle
     */
    public markUpdateEnd(): void {
        if (!this.isEnabled || this.updateStartTime === 0) return;

        const updateTime = performance.now() - this.updateStartTime;

        if (updateTime > this.thresholds.maxUpdateTime) {
            this.createAlert(
                "update_time",
                "warning",
                `Update cycle took ${updateTime.toFixed(2)}ms (threshold: ${
                    this.thresholds.maxUpdateTime
                }ms)`,
                updateTime,
                this.thresholds.maxUpdateTime
            );
        }
    }

    /**
     * Track render calls
     */
    public trackRenderCall(): void {
        if (!this.isEnabled) return;
        this.renderCallCount++;
    }

    /**
     * Update entity count
     */
    public setEntityCount(count: number): void {
        if (!this.isEnabled) return;
        this.entityCount = count;

        if (count > this.thresholds.maxEntityCount) {
            this.createAlert(
                "entity_count",
                "warning",
                `High entity count: ${count} (threshold: ${this.thresholds.maxEntityCount})`,
                count,
                this.thresholds.maxEntityCount
            );
        }
    }

    /**
     * Get current performance metrics
     */
    public getCurrentMetrics(): PerformanceMetrics {
        const frameRate = this.getFrameRate();
        const averageFrameTime = this.getAverageFrameTime();
        const memoryUsage = this.getMemoryUsage();

        return {
            frameRate,
            averageFrameTime,
            memoryUsage,
            entityCount: this.entityCount,
            renderCallsPerFrame: this.renderCallCount,
            updateTimeMs: performance.now() - this.updateStartTime,
            gcEvents: this.gcEventCount,
            timestamp: performance.now(),
        };
    }

    /**
     * Get performance summary
     */
    public getPerformanceSummary(): {
        metrics: PerformanceMetrics;
        alerts: PerformanceAlert[];
        isHealthy: boolean;
    } {
        const metrics = this.getCurrentMetrics();
        const recentAlerts = this.alerts.filter(
            (alert) => performance.now() - alert.timestamp < 10000 // Last 10 seconds
        );

        const isHealthy =
            recentAlerts.length === 0 &&
            metrics.frameRate >= this.thresholds.minFrameRate &&
            metrics.memoryUsage.percentage < this.thresholds.maxMemoryUsage;

        return {
            metrics,
            alerts: recentAlerts,
            isHealthy,
        };
    }

    /**
     * Update performance thresholds
     */
    public setThresholds(thresholds: Partial<PerformanceThresholds>): void {
        this.thresholds = { ...this.thresholds, ...thresholds };
        console.log(
            "[PerformanceMonitor] Updated thresholds:",
            this.thresholds
        );
    }

    /**
     * Get performance history
     */
    public getHistory(): PerformanceMetrics[] {
        return [...this.metricsHistory];
    }

    /**
     * Clear performance history
     */
    public clearHistory(): void {
        this.metricsHistory = [];
        this.alerts = [];
        console.log("[PerformanceMonitor] Cleared performance history");
    }

    /**
     * Export performance data for analysis
     */
    public exportData(): {
        metrics: PerformanceMetrics[];
        alerts: PerformanceAlert[];
        summary: any;
    } {
        const summary = {
            totalFrames: this.frameCount,
            recordingDuration:
                this.metricsHistory.length > 0
                    ? this.metricsHistory[this.metricsHistory.length - 1]
                          .timestamp - this.metricsHistory[0].timestamp
                    : 0,
            averageFrameRate: this.getFrameRate(),
            peakMemoryUsage: Math.max(
                ...this.metricsHistory.map((m) => m.memoryUsage.percentage)
            ),
            totalAlerts: this.alerts.length,
            criticalAlerts: this.alerts.filter((a) => a.severity === "critical")
                .length,
        };

        return {
            metrics: this.getHistory(),
            alerts: [...this.alerts],
            summary,
        };
    }

    private setupPerformanceAPI(): void {
        // Monitor garbage collection if available
        if ((performance as any).measureUserAgentSpecificMemory) {
            // Modern memory API when available
        } else if ((window as any).gc) {
            // Development environment with manual GC
            const originalGC = (window as any).gc;
            (window as any).gc = () => {
                this.gcEventCount++;
                return originalGC();
            };
        }
    }

    private startMonitoring(): void {
        // Set up frame-based monitoring
        // This would typically be called from the game's update loop
    }

    private stopMonitoring(): void {
        // Clean up monitoring
    }

    private recordMetrics(): void {
        const metrics = this.getCurrentMetrics();
        this.metricsHistory.push(metrics);

        // Trim history to prevent memory growth
        if (this.metricsHistory.length > this.maxHistorySize) {
            this.metricsHistory.shift();
        }

        // Reset per-frame counters
        this.renderCallCount = 0;
    }

    private checkPerformanceThresholds(): void {
        const frameRate = this.getFrameRate();
        const memoryUsage = this.getMemoryUsage();

        // Frame rate check
        if (frameRate < this.thresholds.minFrameRate) {
            this.createAlert(
                "framerate",
                "warning",
                `Low frame rate: ${frameRate.toFixed(1)} FPS (threshold: ${
                    this.thresholds.minFrameRate
                } FPS)`,
                frameRate,
                this.thresholds.minFrameRate
            );
        }

        // Memory usage check
        if (memoryUsage.percentage > this.thresholds.maxMemoryUsage) {
            const severity =
                memoryUsage.percentage > 0.9 ? "critical" : "warning";
            this.createAlert(
                "memory",
                severity,
                `High memory usage: ${(memoryUsage.percentage * 100).toFixed(
                    1
                )}% (threshold: ${(
                    this.thresholds.maxMemoryUsage * 100
                ).toFixed(1)}%)`,
                memoryUsage.percentage,
                this.thresholds.maxMemoryUsage
            );
        }
    }

    private createAlert(
        type: PerformanceAlert["type"],
        severity: PerformanceAlert["severity"],
        message: string,
        value: number,
        threshold: number
    ): void {
        const alertKey = `${type}_${severity}`;
        const now = performance.now();
        const lastAlert = this.lastAlerts.get(alertKey) || 0;

        // Check cooldown to prevent spam
        if (now - lastAlert < this.alertCooldown) {
            return;
        }

        const alert: PerformanceAlert = {
            type,
            severity,
            message,
            value,
            threshold,
            timestamp: now,
        };

        this.alerts.push(alert);
        this.lastAlerts.set(alertKey, now);

        // Emit event for UI to show alert
        eventBus.emit(GameEvent.ERROR_OCCURRED, {
            error: new Error(message),
            context: "PerformanceMonitor",
            severity: severity === "critical" ? "high" : "medium",
            recoverable: true,
        });

        console.warn(
            `[PerformanceMonitor] ${severity.toUpperCase()}: ${message}`
        );
    }

    private getFrameRate(): number {
        if (this.frameTimes.length < 10) return 60; // Default assumption

        const averageFrameTime =
            this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        return Math.min(1000 / averageFrameTime, 60);
    }

    private getAverageFrameTime(): number {
        if (this.frameTimes.length === 0) return 16.67; // 60 FPS default

        return (
            this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
        );
    }

    private getMemoryUsage(): PerformanceMetrics["memoryUsage"] {
        // Use modern memory API when available
        if ((performance as any).memory) {
            const memory = (performance as any).memory;
            return {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                percentage: memory.usedJSHeapSize / memory.totalJSHeapSize,
            };
        }

        // Fallback estimation
        return {
            used: 0,
            total: 0,
            percentage: 0,
        };
    }
}

// Global instance for easy access
export const performanceMonitor = PerformanceMonitor.getInstance();
