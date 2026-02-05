

# Plan: Add Separator Line Above Footer

## Current State

The footer styling currently has no visual separator from the content above:
```css
.print-footer {
  margin-top: auto;
  padding: 16px 24px;
  background: var(--print-footer-bg);
  border-radius: 12px;
  /* No border-top or padding-top for separation */
}
```

---

## Solution

Add a separator line **above** the footer with matching spacing to the header:

```css
.print-footer {
  margin-top: 20px;           /* Match header's margin-bottom */
  padding-top: 16px;          /* Space between line and footer content */
  border-top: 1px solid hsl(var(--print-border));  /* Separator line */
  /* ... rest of existing styles ... */
}
```

---

## Visual Result

### Before
```
│ [Card 5]        │ [Card 6]              │
│ [Card 7]        │                       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ QR Code        Signature Box        │ │  ← No visual separation
│ └─────────────────────────────────────┘ │
```

### After
```
│ [Card 5]        │ [Card 6]              │
│ [Card 7]        │                       │
│                                         │ ← 20px margin above line
│─────────────────────────────────────────│ ← Separator line
│                                         │ ← 16px padding below line
│ ┌─────────────────────────────────────┐ │
│ │ QR Code        Signature Box        │ │
│ └─────────────────────────────────────┘ │
```

---

## File to Modify

| File | Change |
|------|--------|
| `src/styles/print.css` | Update `.print-footer` to add `padding-top: 16px`, change `margin-top` from `auto` to `20px`, and add `border-top: 1px solid hsl(var(--print-border))` |

