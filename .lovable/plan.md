

# Plan: Fix Gray Background Extending Beyond Footer

## Problem

After the footer, there's a visible gray area extending to the bottom of the page. This happens because:

1. `.print-container` has `background: hsl(215 20% 95%)` (gray) on screen
2. `.print-document` has `min-height: 297mm` (A4 page height)
3. When content doesn't fill the full page, the gray background of the container is visible below the white document

## Root Cause Analysis

```text
┌────────────────────────────────────────────┐
│        .print-container (gray bg)          │
│  ┌──────────────────────────────────────┐  │
│  │      .print-document (white bg)       │  │
│  │                                       │  │
│  │  [Header]                             │  │
│  │  [Content Grid]                       │  │
│  │  [Footer]                             │  │
│  │                                       │  │  ← White document ends here
│  └──────────────────────────────────────┘  │
│                                            │  ← Gray container still visible
│         ↑ Weird gray area here ↑           │
└────────────────────────────────────────────┘
```

## Solution

Remove the `min-height: 297mm` from `.print-document` in the screen media query. The document should only be as tall as its content, with the gray container background providing visual framing around it.

---

## Technical Change

**File: `src/styles/print.css`**

Update the screen media query for `.print-document`:

```css
@media screen {
  .print-document {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    /* REMOVE: min-height: 297mm; - causes gray area after footer */
  }
  
  .print-container {
    padding: 20px;
    background: hsl(215 20% 95%);
  }
}
```

---

## Visual Result

### Before
```text
┌─────────────────────────────────┐
│ Header                          │
│ [Content]                       │
│ [Footer]                        │
│                                 │ ← Gray background visible
│          (gray area)            │
│                                 │
└─────────────────────────────────┘
```

### After
```text
┌─────────────────────────────────┐
│ Header                          │
│ [Content]                       │
│ [Footer]                        │
└─────────────────────────────────┘
↑ Document ends cleanly at footer
```

---

## Summary

| File | Change |
|------|--------|
| `src/styles/print.css` | Remove `min-height: 297mm` from `.print-document` within the `@media screen` block (line 44) |

