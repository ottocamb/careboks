
# Plan: Fix Gray Background in Print/PDF Output

## Problem

When printing to PDF or using the browser's print function, there's a gray area visible below the footer. This happens because:

1. `.print-container` (the wrapper around `.print-document`) has `background: hsl(215 20% 95%)` (gray) defined in the screen media query
2. The `@media print` section doesn't include rules to reset the `.print-container` styling
3. When the browser renders the print preview, the gray background is still applied and shows below the content

## Root Cause

In `src/styles/print.css`:

```css
@media screen {
  .print-container {
    padding: 20px;
    background: hsl(215 20% 95%);  /* Gray background - shows in print! */
  }
}
```

The screen-specific styles are being applied, but `@media print` doesn't override them for the container element. Browsers may still apply non-print styles if not explicitly overridden.

## Solution

Add explicit print styles for `.print-container` in the `@media print` block to:
1. Remove the background color (set to transparent or white)
2. Remove the padding
3. Ensure clean white background for the entire printed page

## Technical Change

**File: `src/styles/print.css`**

Add the following rules inside the existing `@media print` block:

```css
@media print {
  /* ... existing rules ... */
  
  .print-container {
    padding: 0;
    margin: 0;
    background: white !important;
  }
  
  /* Ensure html/body are also white */
  html, body {
    margin: 0;
    padding: 0;
    background: white !important;
  }
}
```

## Visual Result

### Before
```
┌─────────────────────────────────┐
│ Header                          │
│ [Content Grid]                  │
│ [Footer with teal bg]           │
│                                 │ ← Gray background visible
│        (gray area)              │
└─────────────────────────────────┘
```

### After
```
┌─────────────────────────────────┐
│ Header                          │
│ [Content Grid]                  │
│ [Footer with teal bg]           │
└─────────────────────────────────┘
↑ Clean white background - no gray
```

## Summary

| File | Change |
|------|--------|
| `src/styles/print.css` | Add `.print-container` rules in `@media print` block to set white background and remove padding |
