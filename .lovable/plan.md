
# Plan: Fix Print Output Issues (Upside Down & Grey Background)

## Issues Identified from PDF Analysis

Looking at the printed PDF:

1. **Document is UPSIDE DOWN** - The header with "Careboks" logo is at the bottom, footer with QR code at the top. The text is rotated 180 degrees.

2. **Grey Background Visible** - Grey background color (`hsl(215 20% 95%)`) from the screen preview container is appearing in the print output.

---

## Root Cause

The mobile responsive CSS in `src/styles/print.css` lines 54-77 uses `transform: scale()` for screen preview. During print, the browser may apply these transforms incorrectly, causing:
- The 180° rotation (upside-down appearance)
- The grey background bleeding through

Current problematic code:
```css
@media screen and (max-width: 767px) {
  .print-document {
    transform-origin: top left;
    transform: scale(calc((100vw - 32px) / 210mm));
  }
}

@media screen and (min-width: 768px) and (max-width: 849px) {
  .print-document {
    transform-origin: top center;
    transform: scale(0.9);
  }
}
```

The `@media print` block (lines 81-127) does NOT explicitly reset these transforms with `!important`, so they may persist during print.

---

## Solution

Add explicit `transform: none !important` and `transform-origin: initial !important` to the `@media print` block to guarantee no transforms affect print output.

Also add explicit `background: white !important` to all print elements to eliminate grey areas.

---

## Technical Changes

### File: `src/styles/print.css`

**Update `@media print` block (lines 103-107) to add transform resets:**

```css
.print-document {
  width: 100%;
  padding: 0;
  box-shadow: none;
  /* CRITICAL: Reset any transforms from responsive styles */
  transform: none !important;
  transform-origin: initial !important;
  background: white !important;
}
```

**Also update `.print-container` in `@media print` block:**

```css
.print-container {
  padding: 0;
  margin: 0;
  background: white !important;
  /* Reset any transforms */
  transform: none !important;
  transform-origin: initial !important;
}
```

**Also add to `.print-content-grid` in `@media print`:**

```css
.print-content-grid {
  background: white !important;
}
```

---

## Summary

| File | Change | Impact |
|------|--------|--------|
| `src/styles/print.css` | Add `transform: none !important`, `transform-origin: initial !important`, and `background: white !important` to `.print-document` and `.print-container` in `@media print` block | Document prints right-side-up with pure white background |

---

## Verification

After implementation:
1. Open Print Preview page on ANY screen size (mobile, tablet, desktop)
2. Click Print or Ctrl+P
3. The PDF should show:
   - Header with Careboks logo at the TOP
   - Footer with QR code at the BOTTOM
   - NO grey background anywhere
   - Text readable left-to-right, top-to-bottom
