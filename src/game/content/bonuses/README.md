# Spell-Based Bonus Filtering System

## Problem Solved

Previously, spell bonuses could be offered to players even if they didn't have the target spell or if the spell was from a different class. For example:

-   A **Warrior** could get "Inferno" (fireball bonus) without having fireball
-   A **Mage** could get "Eagle Eye" (arrow shot bonus) without having arrow shot
-   A **Ranger** could get "Sharper Blade" (slash bonus) without having slash

## Solution Implementation

### 1. Spell ID Mapping System

Created a mapping between bonus target IDs and actual player spell IDs:

```typescript
const SPELL_ID_MAPPING: Record<string, string[]> = {
    // Melee spells
    slash: ["warrior_basic_attack"],
    power_strike: ["warrior_power_attack"],

    // Ranged spells
    arrow_shot: ["ranger_basic_attack"],
    bone_piercer: ["ranger_power_attack"],

    // Magic spells
    magic_missile: ["mage_basic_attack"],
    fireball: ["mage_power_attack"],

    // Advanced spells (acquired later)
    whirlwind: ["whirlwind"],
    shield_bash: ["shield_bash"],
    precise_shot: ["precise_shot"],
    explosive_arrow: ["explosive_arrow"],
    ice_shard: ["ice_shard"],
    chain_lightning: ["chain_lightning"],
    heal: ["heal"],
};
```

### 2. Enhanced Bonus Filtering Functions

#### `getValidSpellBonusesForPlayer(playerSpellIds: string[])`

-   Returns only spell bonuses that target spells the player actually has
-   Includes universal bonuses (those without specific targets)

#### `getBonusesForClass(classId, playerSpellIds)`

-   Gets bonuses appropriate for a specific class
-   Combines stat bonuses, universal bonuses, valid spell bonuses, and special bonuses
-   Removes duplicates

#### Updated `getRandomBonuses(count, exclude, playerSpellIds, playerClass)`

-   Now accepts player context (spells and class)
-   Uses class-appropriate filtering
-   Falls back to all bonuses if no player context provided
-   Maintains backward compatibility

### 3. Player Integration

#### Updated UIManager

-   Passes player spell IDs and class to bonus selection
-   Works for both initial bonus selection and reroll functionality

#### Updated Player Class

-   Enhanced spell bonus application with mapping system
-   Added `getSpellMappingIds()` method for backwards compatibility
-   Handles both direct matches and mapped matches for spell targeting

## How It Works

1. **Bonus Selection**: When player defeats an enemy, the system:

    - Gets player's current spells (`player.getSpells().map(s => s.id)`)
    - Gets player's class from GameProgress
    - Filters available bonuses to only include:
        - Stat bonuses (work for everyone)
        - Universal spell bonuses
        - Spell bonuses that target spells the player actually has
        - Special bonuses

2. **Spell Bonus Application**: When applying bonuses to spells:
    - First tries direct ID match (for advanced spells)
    - Falls back to mapping system (for basic class spells)
    - Only applies bonus if target spell is found

## Examples

### Before Fix:

-   **Warrior** with spells: `["warrior_basic_attack", "warrior_power_attack"]`
-   Could get: "Inferno" (targets "fireball") ❌
-   Could get: "Extended Missiles" (targets "magic_missile") ❌
-   Could get: "Eagle Eye" (targets "arrow_shot") ❌

### After Fix:

-   **Warrior** with spells: `["warrior_basic_attack", "warrior_power_attack"]`
-   Can get: "Sharper Blade" (targets "slash" → maps to "warrior_basic_attack") ✅
-   Can get: "Crushing Blow" (targets "power_strike" → maps to "warrior_power_attack") ✅
-   Can get: "Explosive Glass" (universal AoE bonus) ✅
-   Can get: "+2 Force" (stat bonus) ✅
-   **Cannot get**: "Inferno", "Extended Missiles", "Eagle Eye" ❌

## Backward Compatibility

-   All existing bonus IDs and effects remain unchanged
-   `getRandomBonuses()` function signature expanded but old calls still work
-   Spell application logic handles both old and new targeting systems
-   No changes needed to existing bonus definitions

## Future Extensibility

-   Easy to add new spell mappings for advanced spells
-   Class-specific bonus filtering can be enhanced
-   Mapping system supports multiple target spells per bonus
-   System ready for dynamic spell acquisition systems
