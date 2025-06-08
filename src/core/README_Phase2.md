# Phase 2: Core Systems

Phase 2 builds upon the foundational architecture from Phase 1 to implement the core game systems with proper separation of concerns, service layer, and state management.

## Overview

Phase 2 introduces:

-   **Advanced Spell System** with definitions, instances, and modifiers
-   **Service Layer** with dependency injection and lifecycle management
-   **Centralized State Management** with immutable state and event-driven updates
-   **Save/Load System** with validation and backup functionality
-   **Service Coordination** with automatic dependency resolution

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                      │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ SpellService│  │ SaveService │  │ ServiceManager      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     Core Systems                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ SpellSystem │  │StateManager │  │ EventBus            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     Foundation (Phase 1)                  │
│           Types • Enums • Utilities • Result              │
└─────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. Spell System

The spell system separates **definitions** (immutable templates) from **instances** (runtime objects with modifiers).

#### SpellDefinition (Template)

```typescript
interface SpellDefinition {
    id: EntityId;
    name: string;
    description: string;
    type: SpellType;
    baseStats: SpellStats;
    requirements?: SpellRequirement[];
    tags?: string[];
}
```

#### SpellInstance (Runtime)

```typescript
class SpellInstance {
    // Computed properties with modifiers applied
    get damage(): number;
    get apCost(): number;
    get range(): number;

    // Modifier management
    addModifier(modifier: SpellModifier): void;
    removeModifier(modifierId: string): boolean;

    // Validation
    validate(): ValidationResult;
}
```

#### Usage Example

```typescript
// Create spell definition
const fireballDef = spellService.createSpellDefinition(
    "Fireball",
    SpellType.MAGIC,
    { damage: 8, apCost: 3, range: 4 }
);

// Create instance with modifiers
const instance = spellService.createSpellInstance(fireballDef.id, [
    { id: "power_boost", property: "damage", value: 2, type: "add" },
]);

// Equip to player
spellService.equipSpell(playerId, instance.id);
```

### 2. State Management

Centralized, immutable state management with event-driven updates and history support.

#### Features

-   **Immutable State**: Deep freeze in development mode
-   **Type-Safe Updates**: Strongly typed state slices
-   **Event Integration**: Automatic state updates from events
-   **History Support**: Undo/redo functionality (optional)
-   **Subscriptions**: Listen to specific state changes

#### Usage Example

```typescript
// Subscribe to player state changes
const unsubscribe = stateManager.subscribe("player", (newState, oldState) => {
    console.log(
        "Player changed from",
        oldState.classId,
        "to",
        newState.classId
    );
});

// Update state
stateManager.updatePlayerState({
    classId: PlayerClass.MAGE,
    equippedSpells: ["fireball", "magic_missile"],
});

// Get current state
const currentState = stateManager.getState();
```

### 3. Service Layer

Business logic services with dependency injection and lifecycle management.

#### Service Architecture

-   **Service Interface**: Common interface for all services
-   **Dependency Injection**: Automatic dependency resolution
-   **Lifecycle Management**: Initialize/destroy in correct order
-   **Error Handling**: Type-safe error handling with Result types

#### Available Services

**SpellService**

-   Spell definition and instance management
-   Player spell equipment
-   Spell requirement validation
-   Modifier application

**SaveService**

-   Save/load game state
-   Save slot management
-   Data validation and backup
-   Auto-save functionality

**ServiceManager**

-   Service registration and coordination
-   Dependency resolution
-   Lifecycle management
-   Health monitoring

#### Usage Example

```typescript
// Initialize all services
await initializeServices();

// Get service instance
const spellService = serviceManager.getService<SpellService>("SpellService");

// Use service
const result = await spellService.createSpellInstance("fireball");
if (result.isSuccess()) {
    const spell = result.value;
    // Use spell...
}
```

### 4. Save/Load System

Robust save/load functionality with validation, versioning, and backup support.

#### Features

-   **Data Validation**: Comprehensive save data validation
-   **Version Management**: Handle save format evolution
-   **Backup System**: Automatic backups before overwrite
-   **Multiple Slots**: Support for multiple save slots
-   **Auto-save**: Configurable auto-save functionality

#### Save Data Structure

```typescript
interface SaveData {
    version: string;
    timestamp: number;
    gameState: GameState;
    metadata: SaveMetadata;
}
```

#### Usage Example

```typescript
// Save current game
const currentState = stateManager.getState();
const saveResult = await saveService.saveGame(currentState, "My Save");

if (saveResult.isSuccess()) {
    const saveId = saveResult.value;

    // Load the game later
    const loadResult = await saveService.loadGame(saveId);
    if (loadResult.isSuccess()) {
        const gameState = loadResult.value;
        // Restore state...
    }
}
```

## Event-Driven Architecture

Phase 2 leverages the event system from Phase 1 to create loosely coupled, reactive systems.

### Event Flow

```
User Action → Service → State Update → Event Emission → UI Update
                ↓
           Other Services (reactive)
```

### Example Event Handlers

```typescript
// Automatic state updates from events
eventBus.on(GameEvent.ARTIFACT_ACQUIRED, (data) => {
    stateManager.addPlayerArtifact(data.artifactId);
});

// Cross-service communication
eventBus.on(GameEvent.SAVE_REQUESTED, async (data) => {
    const currentState = stateManager.getState();
    if (data.type === "auto") {
        await saveService.autoSave(currentState);
    }
});
```

## Error Handling Strategy

Phase 2 uses the Result type system from Phase 1 consistently across all operations.

### Patterns

```typescript
// Service operations return Results
const result = await spellService.createSpellInstance(spellId);
if (result.isFailure()) {
    console.error("Failed to create spell:", result.error);
    return; // Handle error gracefully
}

const spell = result.value; // Type-safe access

// State operations return Results
const updateResult = stateManager.updatePlayerState({ classId: "mage" });
if (updateResult.isFailure()) {
    // Handle state update failure
    eventBus.emit(GameEvent.ERROR_OCCURRED, {
        error: new Error(updateResult.error),
        context: "playerStateUpdate",
        severity: "medium",
        recoverable: true,
    });
}
```

## Initialization and Lifecycle

### Service Initialization

```typescript
// services/index.ts
export async function initializeServices(): Promise<void> {
    // Register services with dependencies
    serviceManager.registerService("StateManager", stateManager, [], 100);
    serviceManager.registerService(
        "SaveService",
        saveService,
        [{ service: "StateManager" }],
        80
    );
    serviceManager.registerService("SpellService", spellService, [], 60);

    // Initialize in dependency order
    await serviceManager.initializeAll();
}
```

### Game Initialization

```typescript
// In your game startup
async function startGame() {
    try {
        // Initialize core systems
        await initializeServices();

        // Load saved game or start new
        const hasAutoSave = saveService.hasAutoSave();
        if (hasAutoSave) {
            const loadResult = await saveService.loadAutoSave();
            if (loadResult.isSuccess()) {
                // Resume from auto-save
                stateManager.deserialize(JSON.stringify(loadResult.value));
            }
        }

        console.log("Game initialized successfully");
    } catch (error) {
        console.error("Failed to initialize game:", error);
        // Handle initialization failure
    }
}
```

## Migration from Phase 1

### Before (Phase 1)

```typescript
// Direct singleton access
GameProgress.getInstance().addBonus(bonusId);

// Manual state management
player.spells.push(newSpell);

// No service coordination
```

### After (Phase 2)

```typescript
// Service-based approach
const result = await spellService.equipSpell(playerId, spellId);

// Event-driven state updates
eventBus.emit(GameEvent.ARTIFACT_ACQUIRED, { artifactId, playerId });

// Automatic service coordination
await initializeServices();
```

## Benefits Achieved

1. **Separation of Concerns**: Clear boundaries between data, business logic, and state
2. **Type Safety**: Full TypeScript support with compile-time error checking
3. **Testability**: Pure functions and dependency injection enable easy testing
4. **Maintainability**: Well-organized code with clear responsibilities
5. **Extensibility**: Easy to add new spells, services, and features
6. **Reliability**: Comprehensive error handling and validation
7. **Performance**: Efficient state management and caching
8. **Developer Experience**: Rich debugging and monitoring capabilities

## Next Steps: Phase 3

Phase 3 will focus on:

-   **Entity Refactoring**: Convert existing Player/Enemy classes to use new systems
-   **Component System**: Implement ECS architecture
-   **UI Integration**: Connect UI components to state management
-   **Performance Optimization**: Optimize for production use

## Examples

See `src/core/examples/Phase2Usage.ts` for comprehensive usage examples of all Phase 2 systems.
