# Phase 1: Foundation Architecture

This directory contains the foundational architecture for the tactical game refactoring. Phase 1 establishes the core building blocks that will be used throughout the application.

## Overview

The foundation provides:

-   **Type-safe error handling** with Result types
-   **Event-driven architecture** with EventBus
-   **Standardized types and interfaces**
-   **Utility functions** for common operations
-   **Consistent enums and constants**

## Directory Structure

```
src/
├── core/                   # Core game systems
│   ├── events/             # Event system
│   │   ├── EventBus.ts     # Event bus implementation
│   │   └── GameEvents.ts   # Game event definitions
│   └── index.ts            # Core exports
├── data/                   # Data models and types
│   ├── types/              # TypeScript interfaces
│   ├── enums/              # Enums and constants
│   └── index.ts            # Data exports
└── utils/                  # Utility functions
    ├── Result.ts           # Error handling
    └── index.ts            # Utility exports
```

## Key Components

### 1. Result Type (Error Handling)

Replace throwing exceptions with type-safe error handling:

```typescript
import { Result, success, failure } from "@/core";

function validateSpell(spellId: string): Result<Spell, string> {
    const spell = spellDatabase.get(spellId);
    if (!spell) {
        return failure(`Spell not found: ${spellId}`);
    }
    return success(spell);
}

// Usage
const result = validateSpell("fireball");
if (result.isSuccess()) {
    const spell = result.value;
    // Use spell safely
} else {
    console.error(result.error);
}
```

### 2. EventBus System

Decouple components with type-safe events:

```typescript
import { eventBus, GameEvent } from "@/core";

// Listen to events
const unsubscribe = eventBus.on(GameEvent.PLAYER_SPELL_CHANGED, (data) => {
    console.log(`Player ${data.playerId} changed spell to ${data.newSpellId}`);
});

// Emit events
eventBus.emit(GameEvent.PLAYER_SPELL_CHANGED, {
    playerId: "player_123",
    newSpellId: "fireball",
    previousSpellId: "magic_missile",
});

// Clean up
unsubscribe();
```

### 3. Utility Classes

Common operations made easy:

```typescript
import { IdGenerator, PositionUtils, MathUtils, ArrayUtils } from "@/core";

// Generate unique IDs
const spellId = IdGenerator.generateSpellId("Magic Missile");
const entityId = IdGenerator.generateTypedId("player");

// Position calculations
const distance = PositionUtils.distance({ x: 0, y: 0 }, { x: 3, y: 4 }); // 5
const inRange = PositionUtils.getPositionsInRange({ x: 5, y: 5 }, 2);

// Math utilities
const clamped = MathUtils.clamp(150, 0, 100); // 100
const randomInt = MathUtils.randomInt(1, 6); // Dice roll

// Array utilities
const randomSpell = ArrayUtils.random(availableSpells);
const shuffledDeck = ArrayUtils.shuffle(cardDeck);
```

### 4. Standardized Types

Type-safe interfaces for all game entities:

```typescript
import { PlayerState, SpellStats, UnitStats, EntityId } from "@/core";

interface PlayerEntity {
    id: EntityId;
    state: PlayerState;
    stats: UnitStats;
}

interface SpellDefinition {
    id: EntityId;
    name: string;
    stats: SpellStats;
}
```

### 5. Constants and Enums

Centralized game constants:

```typescript
import { GameScene, SpellType, GAME_CONSTANTS, COLORS } from "@/core";

// Use enums for type safety
const currentScene: GameScene = GameScene.TACTICAL_BATTLE;
const spellType: SpellType = SpellType.MAGIC;

// Use constants for consistency
const maxSpells = GAME_CONSTANTS.MAX_SPELL_SLOTS; // 5
const tileSize = GAME_CONSTANTS.TILE_SIZE; // 64
const primaryColor = COLORS.PRIMARY; // 0xd4af37
```

## Migration Guide

### Before (Phase 0)

```typescript
// Direct coupling
GameProgress.getInstance().addBonus(bonusId);

// Exception-based error handling
try {
    const spell = getSpell(spellId);
    player.equipSpell(spell);
} catch (error) {
    console.error("Failed to equip spell:", error);
}

// Magic numbers and strings
if (player.spells.length >= 5) {
    /* ... */
}
```

### After (Phase 1)

```typescript
// Event-driven
eventBus.emit(GameEvent.BONUS_APPLIED, {
    bonusId,
    playerId: player.id,
    effectType: "stat",
});

// Type-safe error handling
const result = spellService.equipSpell(player.id, spellId);
if (result.isFailure()) {
    console.error("Failed to equip spell:", result.error);
    return;
}

// Named constants
if (player.spells.length >= GAME_CONSTANTS.MAX_SPELL_SLOTS) {
    /* ... */
}
```

## Benefits

1. **Type Safety**: Compile-time error catching with TypeScript
2. **Maintainability**: Clear separation of concerns and consistent patterns
3. **Testability**: Pure functions and dependency injection ready
4. **Extensibility**: Easy to add new events, types, and utilities
5. **Developer Experience**: Autocomplete, documentation, and clear APIs

## Next Steps

Phase 2 will build on this foundation to:

-   Extract spell system using these types
-   Implement service layer with Result types
-   Create proper state management with events
-   Standardize ID system using IdGenerator

## Usage Examples

See the `examples/` directory for complete usage examples of each component.
