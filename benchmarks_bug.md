# Benchmarks Section Centering Bug

## Problem Description
The Benchmarks tabs (Knowledge, Network Ops) display cards shifted to the RIGHT compared to the Dashboard tab (Overall). The entire card area shifts, not just text alignment.

## Page Structure

```
.leaderboard-layout (flex)
├── .leaderboard-tabs (fixed sidebar, 200px width)
└── .leaderboard-page (main content, margin-left: 200px)
    └── .leaderboard-content (max-width: 900px, margin: 0 auto)
        ├── Dashboard: .tci-full-table → .leaderboard-card.tci-hero-card
        └── Benchmarks: .category-section → .category-benchmarks (flex column) → multiple .leaderboard-card
```

## Key CSS (custom.css)

### Parent Container (line 910-917)
```css
.leaderboard-page {
  max-width: 1200px;
  margin: 0 auto;
  margin-left: 200px; /* Sidebar width */
  padding: 40px 24px 80px;
  text-align: center;  /* <-- Inherited by children */
  flex: 1;
}
```

### Content Wrapper (line 1021-1024)
```css
.leaderboard-content {
  max-width: 900px;
  margin: 0 auto;
}
```

### Dashboard Container (line 1091-1094)
```css
.tci-full-table {
  width: 100%;
  text-align: left;
}
```

### Benchmarks Container (line 1027-1031)
```css
.category-section {
  width: 100%;
  text-align: left;
}

.category-benchmarks {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
```

## Attempted Fixes

### Attempt 1: Remove `text-align: left` from `.category-section`
**Rationale:** Original plan suggested this would let it inherit centering from parent.
**Result:** Made text inside cards center-aligned, didn't fix card positioning.

### Attempt 2: Add `max-width: 900px; margin: 0 auto;` to both containers
**Rationale:** Match the centering approach used by `.leaderboard-content`.
**Result:** No change - duplicate centering had no effect.

### Attempt 3: Remove all styling from both `.tci-full-table` and `.category-section`
**Rationale:** Let parent `.leaderboard-content` handle all layout.
**Result:** Cards still shifted right in Benchmarks tab.

### Attempt 4: Add `width: 100%; text-align: left;` to both containers
**Rationale:** Ensure both containers take full width and override inherited `text-align: center`.
**Result:** Currently testing.

## Root Cause Analysis (from subagent investigation)

The bug stems from:
1. `.leaderboard-page` has `text-align: center` (line 915)
2. This affects child block/inline elements differently
3. The Dashboard previously had `.tci-hero-wrapper` with `text-align: left` (line 1203), but this class isn't actually used in `TCIFullTable.tsx`
4. The structural difference: Dashboard has ONE card directly in container, Benchmarks has a flex column wrapper with MULTIPLE cards

## Files Involved
- `/src/css/custom.css` - All layout styles
- `/src/pages/leaderboard.tsx` - Page structure
- `/src/components/TCIFullTable.tsx` - Dashboard tab component
- `/src/components/CategorySection.tsx` - Benchmarks tab component

## Outstanding Questions
1. Why does the flex container (`.category-benchmarks`) cause different behavior than a direct card?
2. Is there browser-specific rendering affecting this?
3. Are there other inherited styles not yet identified?

## Next Steps to Try
1. Use browser DevTools to compare computed styles between Dashboard and Benchmarks cards
2. Check if `.leaderboard-card` has different computed width in each context
3. Try removing `text-align: center` from `.leaderboard-page` entirely
4. Add explicit `align-items: stretch` to `.category-benchmarks`
5. Check for any CSS specificity conflicts
