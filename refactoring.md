# Website Refactoring - Completed Changes

**Branch:** `refactoring`
**Date:** January 2026

---

## Overview

This refactoring focused on reducing code duplication and improving maintainability through quick wins with low risk of introducing errors.

---

## 1. Extract Magic Numbers to Constants

**Created:** `src/constants/ui.ts`

Extracted hardcoded values that appeared across multiple files into named constants:

```typescript
export const TCI_MIN_SCORE = 90;           // Minimum TCI score for bar width calculations
export const TCI_DEFAULT_MAX = 150;        // Default maximum TCI score for range calculations
export const MIN_BAR_WIDTH_PERCENT = 5;    // Minimum bar width to ensure visibility
export const TOP_RANKINGS_COUNT = 3;       // Number of top rankings shown in hero/preview cards
export const DATE_PADDING_MS = 60 * 24 * 60 * 60 * 1000;  // 60 days padding for chart axes
```

**Files Updated:**
- `src/utils/chartUtils.ts` - now imports and uses these constants
- `src/components/TCIHeroCard.tsx` - uses `TOP_RANKINGS_COUNT`
- `src/components/LeaderboardCard.tsx` - uses `TOP_RANKINGS_COUNT` and shared bar width utility

---

## 2. Consolidate Bar Width Logic

**Location:** `src/utils/chartUtils.ts`

The `calculateBarWidth()` function was already created to handle bar width calculations. Updated remaining components to use it:

**Before (in each component):**
```typescript
const getBarWidth = (score: number) => Math.max(5, score);
```

**After:**
```typescript
import { calculateBarWidth } from '../utils/chartUtils';
const getBarWidth = (score: number) => calculateBarWidth(score, scores, { isPercentage: true });
```

**Files Updated:**
- `src/components/LeaderboardCard.tsx` - now uses shared utility

---

## 3. Extract Ranking Logic

**Created:** `src/utils/rankings.ts`

Consolidated duplicate ranking calculation code from two files into reusable utilities:

```typescript
// Calculate TCI rankings from leaderboard data
export function calculateTCIRankings(data: LeaderboardEntry[]): TCIEntry[]

// Calculate benchmark rankings for a specific benchmark key
export function calculateBenchmarkRankings(data: LeaderboardEntry[], benchmarkKey: string): RankingEntry[]

// Unified interface for both TCI and benchmark rankings
export function calculateRankings(data: LeaderboardEntry[], benchmarkKey: string): RankingEntry[]
```

**Before (duplicated in 2 files, ~35 lines each):**
```typescript
const rankings = data
  .filter(entry => entry.tci !== null)
  .map(entry => ({
    rank: 0,
    model: entry.model,
    provider: entry.provider,
    tci: entry.tci as number,
    error: entry.tci_stderr ?? calculateError(entry.tci as number, 'tci'),
    isNew: entry.rank <= 3,
  }))
  .sort((a, b) => b.tci - a.tci)
  .map((entry, index) => ({ ...entry, rank: index + 1 }));
```

**After:**
```typescript
import { calculateTCIRankings, calculateRankings } from '../utils/rankings';

const tciRankings = useMemo(() => calculateTCIRankings(data), [data]);
const rankings = useMemo(() => calculateRankings(data, benchmarkKey), [data, benchmarkKey]);
```

**Files Updated:**
- `src/pages/leaderboard.tsx` - uses `calculateTCIRankings` and `calculateBenchmarkRankings`
- `src/components/BenchmarkDetailPage.tsx` - uses `calculateRankings`

---

## 4. Consolidate Date Utilities

**Merged:** `tabs/blog/utils/formatDate.ts` → `src/utils/dateFormatting.ts`

Moved the blog's `formatDate` function to the centralized date utilities file:

```typescript
// src/utils/dateFormatting.ts
export function formatMonthTick(timestamp: number): string  // For chart X-axis
export function formatDate(dateString: string): string       // For blog cards (e.g., "JAN 8, 2026")
```

**Files Updated:**
- `tabs/blog/components/BlogCard.tsx` - updated import path
- `tabs/blog/components/BlogHero.tsx` - updated import path
- `tabs/blog/components/index.ts` - updated re-export path

**Deleted:**
- `tabs/blog/utils/formatDate.ts` (duplicate removed)

---

## 5. Create Barrel Files

Added `index.ts` barrel files for cleaner imports:

### `src/hooks/index.ts`
```typescript
export { useAccordion } from './useAccordion';
export { useBlogPostUrls } from './useBlogPostUrls';
export { useIsMobile } from './useIsMobile';
export { useLeaderboardData } from './useLeaderboardData';
```

### `src/utils/index.ts`
```typescript
export { calculateError } from './calculateTCI';
export { calculateQuarterBounds, generateQuarterlyTicks, calculateXAxisDomain, calculateBarWidth } from './chartUtils';
export { formatMonthTick, formatDate } from './dateFormatting';
export { transformLeaderboardData } from './transformLeaderboardData';
export { calculateTCIRankings, calculateBenchmarkRankings, calculateRankings } from './rankings';
export * from './linearRegression';
```

### `src/constants/index.ts`
```typescript
export { BENCHMARK_CATEGORIES, BENCHMARKS, TCI_CONFIG } from './benchmarks';
export { PROVIDER_COLORS, PROVIDER_LOGOS, normalizeProviderName } from './providers';
export { TCI_MIN_SCORE, TCI_DEFAULT_MAX, MIN_BAR_WIDTH_PERCENT, TOP_RANKINGS_COUNT, DATE_PADDING_MS } from './ui';
```

**Benefits:**
- Cleaner imports: `import { useAccordion } from '../hooks'` instead of `import { useAccordion } from '../hooks/useAccordion'`
- Better discoverability of available exports
- Easier refactoring (internal file structure changes don't affect consumers)

---

## Files Changed Summary

### Created
- `src/constants/ui.ts`
- `src/utils/rankings.ts`
- `src/hooks/index.ts`
- `src/utils/index.ts`
- `src/constants/index.ts`

### Modified
- `src/utils/chartUtils.ts` - imports constants from `ui.ts`
- `src/utils/dateFormatting.ts` - added `formatDate` function
- `src/components/TCIHeroCard.tsx` - uses `TOP_RANKINGS_COUNT`
- `src/components/LeaderboardCard.tsx` - uses shared utilities
- `src/components/BenchmarkDetailPage.tsx` - uses `calculateRankings`
- `src/pages/leaderboard.tsx` - uses ranking utilities
- `tabs/blog/components/BlogCard.tsx` - updated import
- `tabs/blog/components/BlogHero.tsx` - updated import
- `tabs/blog/components/index.ts` - updated re-export

### Deleted
- `tabs/blog/utils/formatDate.ts`

---

## Verification

Build passes successfully with all changes:
```bash
npm run build
# [SUCCESS] Generated static files in "build".
```

---

## Out of Scope (Deferred)

The following were identified but not implemented due to higher risk:
- CSS splitting (high risk of visual regressions)
- Component splitting (medium risk, needs careful testing)
- Path alias changes (needs coordination across the codebase)
