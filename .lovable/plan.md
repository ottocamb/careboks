
# Plan: Fix Print Layout Bounding Box Issues

## Problem Summary

The current print layout has boxes that extend beyond their content because of **fixed grid row definitions** and **forced height properties**. Instead of sections naturally sizing to their content, they're being stretched to fill grid rows.

## Root Causes Identified

### 1. Fixed Grid Row Sizing (Page 1)
```css
/* Current - PROBLEMATIC */
.print-page-1-grid {
  grid-template-rows: 1fr 1fr auto;  /* Forces equal-height rows */
}
```
The `1fr 1fr` forces rows 1 and 2 to take equal space regardless of content.

### 2. Grid Row Spanning
```css
.print-page-1-left {
  grid-row: 1 / 3;  /* Spans both 1fr rows, stretching to fill */
}
.print-page-1-right {
  grid-row: 1 / 3;  /* Same issue */
}
```

### 3. Forced Full-Height Classes
```css
.print-section--full-height {
  height: 100%;  /* Forces box to fill container */
}
```
Used on Medications section, forcing it to fill the grid even when content is short.

### 4. Page 2 Same Issue
```css
.print-page-2-grid {
  grid-template-rows: 1fr auto;  /* 1fr stretches first row */
}
```

---

## Proposed Solution

Change from **fixed fractional grid sizing** to **content-based auto sizing** so boxes shrink to fit their content.

---

## Implementation Steps

### Step 1: Update Page 1 Grid in `print.css`

**Current:**
```css
.print-page-1-grid {
  grid-template-rows: 1fr 1fr auto;
}
```

**New:**
```css
.print-page-1-grid {
  grid-template-rows: auto auto auto;  /* All rows size to content */
}
```

### Step 2: Update Page 2 Grid in `print.css`

**Current:**
```css
.print-page-2-grid {
  grid-template-rows: 1fr auto;
}
```

**New:**
```css
.print-page-2-grid {
  grid-template-rows: auto auto;  /* Size to content */
}
```

### Step 3: Remove Row Span Overrides

**Current:**
```css
.print-page-1-left {
  grid-row: 1 / 3;  /* Spans 2 rows */
}
.print-page-1-right {
  grid-row: 1 / 3;
}
.print-page-2-left {
  grid-row: 1 / -1;
}
.print-page-2-right {
  grid-row: 1 / -1;
}
```

**New:** Remove or simplify row spans - let flexbox handle stacking within columns:
```css
.print-page-1-left {
  grid-column: 1;
  /* Remove grid-row span */
}
.print-page-1-right {
  grid-column: 2;
  /* Remove grid-row span */
}
```

### Step 4: Remove Forced Height from Sections

**Current:**
```css
.print-section--full-height {
  height: 100%;
}
```

**New:** Remove or make optional:
```css
.print-section--full-height {
  /* Remove height: 100% - let content dictate size */
  display: flex;
  flex-direction: column;
}
```

### Step 5: Update Components to Remove Full-Height Class

In `PrintMedications.tsx`, remove `print-section--full-height`:
```tsx
// Before
<div className="print-section print-section--pink print-section--full-height">

// After  
<div className="print-section print-section--pink">
```

In `PrintSection.tsx`, remove the `print-section--full-height` className usage from the "How should I live" section call.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/styles/print.css` | Update grid-template-rows, remove forced heights, simplify row spans |
| `src/components/print/PrintMedications.tsx` | Remove `print-section--full-height` class |
| `src/components/print/PrintableDocument.tsx` | Remove `className="print-section--full-height"` prop |

---

## Technical Details

### CSS Grid Changes Summary

```css
/* Page 1 Grid - Content-based sizing */
.print-page-1-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;  /* Changed from 1fr 1fr auto */
  gap: 8pt;
  /* Remove fixed height - let content flow */
}

.print-page-1-left {
  grid-column: 1;
  grid-row: 1 / 3;  /* Keep span but rows are now auto-sized */
  display: flex;
  flex-direction: column;
  gap: 8pt;
}

.print-page-1-right {
  grid-column: 2;
  grid-row: 1 / 3;
}

/* Page 2 Grid - Content-based sizing */
.print-page-2-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;  /* Changed from 1fr auto */
  gap: 8pt;
}

.print-page-2-left {
  grid-column: 1;
}

.print-page-2-right {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  gap: 8pt;
}

/* Remove forced height */
.print-section--full-height {
  display: flex;
  flex-direction: column;
  /* height: 100% removed */
}
```

---

## Expected Result

After these changes:
- All section boxes will shrink to fit their content
- No empty space at the bottom of boxes
- Consistent padding around content
- Content still flows in two-column layout
- Print on A4 will look cleaner with proper bounding boxes
