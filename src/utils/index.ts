/**
 * Utility functions for the tactical game
 * Common operations and helpers used throughout the application
 */

import { EntityId, Position, GridPosition } from "../data/types";
import { Direction } from "../data/enums";

// ID Generation
export class IdGenerator {
    private static counter = 0;

    /**
     * Generate a unique entity ID
     */
    static generateId(prefix?: string): EntityId {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        const counter = (++this.counter).toString(36);

        const id = `${timestamp}_${random}_${counter}`;
        return prefix ? `${prefix}_${id}` : id;
    }

    /**
     * Generate a typed entity ID with prefix
     */
    static generateTypedId(type: string): EntityId {
        return this.generateId(type.toLowerCase());
    }

    /**
     * Generate a spell ID following the pattern
     */
    static generateSpellId(name: string): EntityId {
        const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
        return this.generateId(`spell_${normalized}`);
    }
}

// Position and Grid Utilities
export class PositionUtils {
    /**
     * Calculate distance between two positions
     */
    static distance(pos1: Position, pos2: Position): number {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate Manhattan distance (grid distance)
     */
    static manhattanDistance(pos1: Position, pos2: Position): number {
        return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y);
    }

    /**
     * Check if two positions are equal
     */
    static equals(pos1: Position, pos2: Position): boolean {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }

    /**
     * Get direction from one position to another
     */
    static getDirection(from: Position, to: Position): Direction {
        const dx = to.x - from.x;
        const dy = to.y - from.y;

        if (dx === 0 && dy < 0) return Direction.NORTH;
        if (dx === 0 && dy > 0) return Direction.SOUTH;
        if (dx > 0 && dy === 0) return Direction.EAST;
        if (dx < 0 && dy === 0) return Direction.WEST;
        if (dx > 0 && dy < 0) return Direction.NORTHEAST;
        if (dx < 0 && dy < 0) return Direction.NORTHWEST;
        if (dx > 0 && dy > 0) return Direction.SOUTHEAST;
        if (dx < 0 && dy > 0) return Direction.SOUTHWEST;

        return Direction.NORTH; // Default
    }

    /**
     * Get all positions within range
     */
    static getPositionsInRange(
        center: Position,
        range: number,
        minRange = 0
    ): Position[] {
        const positions: Position[] = [];

        for (let x = center.x - range; x <= center.x + range; x++) {
            for (let y = center.y - range; y <= center.y + range; y++) {
                const distance = this.manhattanDistance(center, { x, y });
                if (distance >= minRange && distance <= range) {
                    positions.push({ x, y });
                }
            }
        }

        return positions;
    }

    /**
     * Convert screen position to grid position
     */
    static screenToGrid(screenPos: Position, tileSize: number): GridPosition {
        const gridX = Math.floor(screenPos.x / tileSize);
        const gridY = Math.floor(screenPos.y / tileSize);
        return {
            x: screenPos.x,
            y: screenPos.y,
            gridX,
            gridY,
        };
    }

    /**
     * Convert grid position to screen position
     */
    static gridToScreen(gridPos: GridPosition, tileSize: number): Position {
        return {
            x: gridPos.gridX * tileSize + tileSize / 2,
            y: gridPos.gridY * tileSize + tileSize / 2,
        };
    }
}

// Math Utilities
export class MathUtils {
    /**
     * Clamp a value between min and max
     */
    static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Linear interpolation
     */
    static lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    /**
     * Random integer between min and max (inclusive)
     */
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Random float between min and max
     */
    static randomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * Random boolean with given probability
     */
    static randomBool(probability = 0.5): boolean {
        return Math.random() < probability;
    }

    /**
     * Roll dice (returns 1 to sides)
     */
    static rollDice(sides: number): number {
        return this.randomInt(1, sides);
    }

    /**
     * Calculate percentage
     */
    static percentage(value: number, total: number): number {
        return total === 0 ? 0 : (value / total) * 100;
    }

    /**
     * Round to specified decimal places
     */
    static round(value: number, decimals = 0): number {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }
}

// Array Utilities
export class ArrayUtils {
    /**
     * Get random element from array
     */
    static random<T>(array: T[]): T | undefined {
        if (array.length === 0) return undefined;
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Get multiple random elements from array
     */
    static randomMultiple<T>(array: T[], count: number): T[] {
        if (count >= array.length) return [...array];

        const result: T[] = [];
        const remaining = [...array];

        for (let i = 0; i < count && remaining.length > 0; i++) {
            const index = Math.floor(Math.random() * remaining.length);
            result.push(remaining.splice(index, 1)[0]);
        }

        return result;
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    static shuffle<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * Remove element from array
     */
    static remove<T>(array: T[], element: T): T[] {
        const index = array.indexOf(element);
        if (index > -1) {
            return [...array.slice(0, index), ...array.slice(index + 1)];
        }
        return array;
    }

    /**
     * Group array elements by key
     */
    static groupBy<T, K extends keyof T>(
        array: T[],
        key: K
    ): Record<string, T[]> {
        return array.reduce((groups, item) => {
            const groupKey = String(item[key]);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {} as Record<string, T[]>);
    }

    /**
     * Check if arrays are equal
     */
    static equals<T>(array1: T[], array2: T[]): boolean {
        if (array1.length !== array2.length) return false;
        return array1.every((item, index) => item === array2[index]);
    }
}

// Object Utilities
export class ObjectUtils {
    /**
     * Deep clone an object
     */
    static deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== "object") return obj;
        if (obj instanceof Date) return new Date(obj.getTime()) as any;
        if (obj instanceof Array)
            return obj.map((item) => this.deepClone(item)) as any;

        const cloned = {} as T;
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    /**
     * Merge objects deeply
     */
    static deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.deepMerge(target, ...sources);
    }

    /**
     * Check if value is an object
     */
    static isObject(item: any): boolean {
        return item && typeof item === "object" && !Array.isArray(item);
    }

    /**
     * Get nested property value
     */
    static getNestedProperty<T>(obj: any, path: string): T | undefined {
        return path.split(".").reduce((current, key) => current?.[key], obj);
    }

    /**
     * Set nested property value
     */
    static setNestedProperty(obj: any, path: string, value: any): void {
        const keys = path.split(".");
        const lastKey = keys.pop()!;
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }
}

// String Utilities
export class StringUtils {
    /**
     * Capitalize first letter
     */
    static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert to camelCase
     */
    static toCamelCase(str: string): string {
        return str.replace(/[-_\s]+(.)/g, (_, char) => char.toUpperCase());
    }

    /**
     * Convert to kebab-case
     */
    static toKebabCase(str: string): string {
        return str.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
    }

    /**
     * Convert to snake_case
     */
    static toSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
    }

    /**
     * Truncate string with ellipsis
     */
    static truncate(str: string, length: number): string {
        if (str.length <= length) return str;
        return str.substring(0, length - 3) + "...";
    }

    /**
     * Generate random string
     */
    static random(length: number): string {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// Time Utilities
export class TimeUtils {
    /**
     * Format milliseconds to readable time
     */
    static formatTime(ms: number): string {
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60)) % 60;
        const hours = Math.floor(ms / (1000 * 60 * 60));

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    /**
     * Create a delay promise
     */
    static delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Get timestamp
     */
    static timestamp(): number {
        return Date.now();
    }

    /**
     * Format date
     */
    static formatDate(date: Date = new Date()): string {
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }
}

// Validation Utilities
export class ValidationUtils {
    /**
     * Check if email is valid
     */
    static isValidEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Check if string is not empty
     */
    static isNotEmpty(str: string): boolean {
        return str.trim().length > 0;
    }

    /**
     * Check if number is in range
     */
    static isInRange(value: number, min: number, max: number): boolean {
        return value >= min && value <= max;
    }

    /**
     * Check if value is positive
     */
    static isPositive(value: number): boolean {
        return value > 0;
    }

    /**
     * Check if value is non-negative
     */
    static isNonNegative(value: number): boolean {
        return value >= 0;
    }
}

// Export all utilities
export * from "./Result";
export * from "./PerformanceMonitor";
export {
    IdGenerator,
    PositionUtils,
    MathUtils,
    ArrayUtils,
    ObjectUtils,
    StringUtils,
    TimeUtils,
    ValidationUtils,
};

