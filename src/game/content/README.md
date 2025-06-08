# Game Content Organization

This directory contains the organized game content system for bonuses, artifacts, and spells. The content has been restructured for better maintainability, easier expansion, and cleaner organization.

## 📁 Directory Structure

```
src/game/content/
├── bonuses/                 # Organized bonus content
│   ├── StatBonuses.ts      # Direct attribute bonuses
│   ├── SpellBonuses.ts     # Spell modification bonuses
│   ├── SpecialBonuses.ts   # Unique mechanics bonuses
│   └── index.ts            # Bonus exports & utilities
├── artifacts/               # Organized artifact content
│   ├── WarriorArtifacts.ts # Melee combat artifacts
│   ├── RangerArtifacts.ts  # Ranged combat artifacts
│   ├── MageArtifacts.ts    # Magic artifacts
│   └── index.ts            # Artifact exports & utilities
├── spells/                  # Organized spell content
│   ├── BasicSpells.ts      # Universal foundation spells
│   ├── WarriorSpells.ts    # Melee combat spells
│   ├── RangerSpells.ts     # Ranged combat spells
│   ├── MageSpells.ts       # Magic spells
│   ├── UtilitySpells.ts    # Cross-class utility spells
│   └── index.ts            # Spell exports & utilities
├── index.ts                # Main content exports
└── README.md               # This documentation
```

## 🎯 Bonus Organization

Bonuses are now organized by their function and impact:

### StatBonuses.ts

-   **Purpose**: Direct stat modifications (health, force, dexterity, etc.)
-   **Examples**: Health Boost, Strength, Glass Cannon builds
-   **Categories**:
    -   Basic single stat bonuses
    -   Balanced multi-stat bonuses
    -   High-risk high-reward builds
    -   Specialized builds with trade-offs
    -   Extreme builds

### SpellBonuses.ts

-   **Purpose**: Modifications to existing spells
-   **Examples**: Sharper Blade, Explosive Fireball, Swift Slash
-   **Categories**:
    -   Melee spell bonuses (Slash, Power Strike)
    -   Ranged spell bonuses (Arrow Shot, Bone Piercer)
    -   Magic spell bonuses (Magic Missile, Fireball)
    -   Universal spell bonuses (affects multiple spells)

### SpecialBonuses.ts

-   **Purpose**: Unique mechanics that can't be expressed as simple stat/spell mods
-   **Examples**: Critical Striker, Vampiric Strikes, Phoenix Blessing
-   **Categories**:
    -   Combat mechanics (critical hits, lifesteal, thorns)
    -   Magic mechanics (mana burn, spell echo)
    -   Defensive mechanics (adaptive armor, spell shield)
    -   Conditional bonuses (last stand, berserker rage)
    -   Movement mechanics (momentum, shadow step)
    -   Resource management (blood magic, adrenaline rush)

## ⚔️ Artifact Organization

Artifacts are organized by player class and combat style:

### WarriorArtifacts.ts

-   **Focus**: Melee combat and physical prowess
-   **Examples**: Berserker's Axe, Shield of Valor, Belt of the Titan
-   **Categories**:
    -   Offensive melee artifacts
    -   Defensive & utility artifacts
    -   Legendary artifacts
    -   Additional warrior artifacts

### RangerArtifacts.ts

-   **Focus**: Ranged combat and agility
-   **Examples**: Hunter's Longbow, Shadow Cloak, Beast Companion Charm
-   **Categories**:
    -   Precision ranged artifacts
    -   Mobility & stealth artifacts
    -   Legendary artifacts
    -   Additional ranger artifacts

### MageArtifacts.ts

-   **Focus**: Magic and spellcasting
-   **Examples**: Staff of Eternal Frost, Tome of Divine Healing, Sphere of Elemental Chaos
-   **Categories**:
    -   Elemental artifacts
    -   Utility & support artifacts
    -   Legendary artifacts
    -   Additional mage artifacts

## ⚡ Spell Organization

Spells are now organized by class and function for better combat design:

### BasicSpells.ts

-   **Purpose**: Universal foundation spells available to all classes
-   **Examples**: Slash, Power Strike, Arrow Shot, Magic Missile
-   **Categories**:
    -   Melee basics (slash, power strike)
    -   Ranged basics (arrow shot, bone piercer)
    -   Magic basics (magic missile, fireball)
    -   Class-specific basic spells

### WarriorSpells.ts

-   **Focus**: Melee combat and physical prowess
-   **Examples**: Whirlwind, Shield Bash, Crushing Blow, Earthquake
-   **Categories**:
    -   Basic warrior abilities
    -   Advanced warrior techniques
    -   Area control & intimidation
    -   Additional warrior spells

### RangerSpells.ts

-   **Focus**: Ranged combat and tactical mobility
-   **Examples**: Precise Shot, Shadow Step, Mark Target, Explosive Arrow
-   **Categories**:
    -   Basic ranger abilities
    -   Precision shooting
    -   Mobility & stealth
    -   Tactical abilities

### MageSpells.ts

-   **Focus**: Magic and elemental mastery
-   **Examples**: Ice Shard, Chain Lightning, Heal, Elemental Blast
-   **Categories**:
    -   Basic mage abilities
    -   Elemental magic
    -   Healing & protection
    -   Mind magic & control

### UtilitySpells.ts

-   **Purpose**: Cross-class and special purpose abilities
-   **Examples**: Emergency Heal, Tactical Retreat, Meditation
-   **Categories**:
    -   Universal basic spells
    -   Special utility spells
    -   Debug & testing spells

## 🔧 Usage Examples

### Basic Usage (Backward Compatible)

```typescript
// These imports continue to work exactly as before
import { AVAILABLE_BONUSES, getRandomBonuses } from "../../classes/Bonus";
import { ALL_ARTIFACTS, getArtifactsForClass } from "../../classes/Artifact";
import { PLAYER_SPELLS } from "../../classes/Spell";
```

### New Organized Usage

```typescript
// Import specific categories
import { STAT_BONUSES, SPELL_BONUSES } from "../content/bonuses";
import { WARRIOR_ARTIFACTS, MAGE_ARTIFACTS } from "../content/artifacts";
import { WARRIOR_SPELLS, MAGE_SPELLS, BASIC_SPELLS } from "../content/spells";

// Use utility functions
import {
    getBonusesByCategory,
    getArtifactsByRarity,
    getSpellsByType,
} from "../content";
```

### Advanced Content Filtering

```typescript
import {
    getSpellBonusesForSpell,
    getStatBonusesForStat,
    getArtifactsBySpellType,
    getWeightedRandomArtifacts,
    getSpellsForClass,
    getSpellsWithEffect,
    getRandomSpells,
} from "../content";

// Get all bonuses that affect fireball
const fireballBonuses = getSpellBonusesForSpell("fireball");

// Get all force-related stat bonuses
const forceBonuses = getStatBonusesForStat("force");

// Get artifacts with magic spells
const magicArtifacts = getArtifactsBySpellType("magic");

// Get weighted random artifacts (legendaries are rarer)
const randomArtifacts = getWeightedRandomArtifacts("warrior", 3);

// Get all warrior spells
const warriorSpells = getSpellsForClass("warrior");

// Get all healing spells
const healingSpells = getSpellsWithEffect("healing");

// Get random magic spells with AP cost <= 3
const affordableMagicSpells = getRandomSpells(5, {
    type: "magic",
    maxAPCost: 3,
});
```

## 📊 Content Statistics

Current content distribution:

**Bonuses**:

-   Stat Bonuses: ~30 bonuses (direct attribute modifications)
-   Spell Bonuses: ~40 bonuses (spell modifications)
-   Special Bonuses: ~25 bonuses (unique mechanics)
-   **Total**: ~95 bonuses

**Artifacts**:

-   Warrior Artifacts: 9 artifacts (melee focused)
-   Ranger Artifacts: 10 artifacts (ranged/agility focused)
-   Mage Artifacts: 12 artifacts (magic focused)
-   **Total**: 31 artifacts

**Spells**:

-   Basic Spells: 12 spells (universal foundation)
-   Warrior Spells: 12 spells (melee combat focused)
-   Ranger Spells: 13 spells (ranged combat focused)
-   Mage Spells: 15 spells (magic focused)
-   Utility Spells: 16 spells (cross-class abilities)
-   **Total**: ~40+ unique spells (after deduplication)

## 🛡️ Backward Compatibility

The reorganization maintains 100% backward compatibility:

-   All existing imports continue to work
-   `AVAILABLE_BONUSES`, `ALL_ARTIFACTS`, and `PLAYER_SPELLS` arrays are preserved
-   All existing functions (`getRandomBonuses`, `getArtifactsForClass`) work unchanged
-   No breaking changes to game logic or save data

## 🔄 Migration Guide

### For Developers

1. **Immediate**: All existing code continues to work without changes
2. **Gradual**: Start using organized imports for new features
3. **Future**: Consider migrating to organized structure for better maintainability

### Adding New Content

1. **Bonuses**: Add to appropriate category file (`StatBonuses.ts`, `SpellBonuses.ts`, or `SpecialBonuses.ts`)
2. **Artifacts**: Add to appropriate class file (`WarriorArtifacts.ts`, `RangerArtifacts.ts`, or `MageArtifacts.ts`)
3. **Spells**: Add to appropriate category file (`BasicSpells.ts`, `WarriorSpells.ts`, `RangerSpells.ts`, `MageSpells.ts`, or `UtilitySpells.ts`)
4. **Organization**: Follow existing patterns and documentation

### Content Guidelines

1. **Stat Bonuses**: Simple, clear attribute modifications
2. **Spell Bonuses**: Target specific spells with clear effects
3. **Special Bonuses**: Complex mechanics requiring special implementation
4. **Artifacts**: Class-appropriate with thematic spells
5. **Basic Spells**: Universal abilities that work across classes
6. **Class Spells**: Class-specific abilities that fit the archetype
7. **Utility Spells**: Cross-class support and special mechanics

## 🚀 Benefits

1. **Maintainability**: Content is organized by function and easy to find
2. **Scalability**: Adding new content is straightforward with clear categories
3. **Discoverability**: Developers can quickly find related content
4. **Flexibility**: Utility functions enable sophisticated content filtering
5. **Backward Compatibility**: Existing code continues to work unchanged
6. **Documentation**: Clear structure makes the codebase more approachable

## 🔮 Future Possibilities

With this organized structure, future enhancements become easier:

1. **Dynamic Content Loading**: Load only needed content categories
2. **Modding Support**: Clear structure for external content
3. **Balance Analytics**: Analyze content by category
4. **Procedural Content**: Generate content following existing patterns
5. **Content Validation**: Automated checks for content consistency
6. **Localization**: Organize translations by content type

---

This organization provides a solid foundation for current and future content development while maintaining complete compatibility with existing systems.

