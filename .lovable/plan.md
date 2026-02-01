
# Fix Print Layout Grid Structure

## Root Cause

The CSS Grid is not properly distributing sections across the two-column layout because:

1. The grid row assignments are missing for `.print-page-1-left` - it defaults to auto placement instead of spanning rows 1-2
2. The grid-template-rows uses `auto auto auto` which doesn't properly allocate space for the left column's two stacked sections
3. Similar issues exist in the Page 2 grid structure

## Changes Required

### 1. Fix src/styles/print.css - Grid Layout Rules

Update the Page 1 grid to properly span rows:

```css
.print-page-1-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr auto;  /* Two equal rows for columns, auto for full-width */
  gap: 8pt;
  height: calc(100% - 60pt);
}

.print-page-1-left {
  grid-column: 1;
  grid-row: 1 / 3;  /* ADD THIS: Span rows 1 and 2 */
  display: flex;
  flex-direction: column;
  gap: 8pt;
}

.print-page-1-right {
  grid-column: 2;
  grid-row: 1 / 3;  /* Span rows 1 and 2 */
}

.print-page-1-full {
  grid-column: 1 / -1;
  grid-row: 3;  /* ADD THIS: Explicitly place in row 3 */
}
```

Update the Page 2 grid similarly:

```css
.print-page-2-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  gap: 8pt;
  height: calc(100% - 80pt);
}

.print-page-2-left {
  grid-column: 1;
  grid-row: 1 / -1;  /* Span all rows */
}

.print-page-2-right {
  grid-column: 2;
  grid-row: 1 / -1;  /* Span all rows */
  display: flex;
  flex-direction: column;
  gap: 8pt;
}
```

### 2. Verify PrintableDocument.tsx Structure

The component structure is correct but we should verify sections are being passed with content. Add debug logging if needed.

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/styles/print.css` | Fix grid-row assignments for left column, add explicit row placement for full-width section |

---

## CSS Grid Visual Fix

### Before (Broken)
```text
+------------------+------------------+
| What I Have      | How to Live      |
| (row 1 only)     | (spans 1-2)      |
+------------------+                  |
| 6 Months         |                  |
| (pushed to row 2)|                  |
+------------------+------------------+
| Life Impact (row 3 - auto)         |
+------------------------------------+
```

### After (Fixed)
```text
+------------------+------------------+
| What I Have      | How to Live      |
| +                | (spans rows 1-2) |
| 6 Months         |                  |
| (both in left    |                  |
|  column, row 1-2)|                  |
+------------------+------------------+
| Life Impact (full width, row 3)    |
+------------------------------------+
```

---

## Implementation

1. Update `.print-page-1-left` to add `grid-row: 1 / 3`
2. Update `.print-page-1-full` to add `grid-row: 3`
3. Update `.print-page-2-right` to span all rows properly
4. Test print output to verify layout matches Figma design
