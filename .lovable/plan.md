

# Plan: Enhance Header Separator Line Visibility

## Current State

The `.print-header` class already includes a thin separator line:
```css
.print-header {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid hsl(var(--print-border));
}
```

The line exists, but you may want **more spacing/padding** around it for better visual separation.

---

## Changes

### `src/styles/print.css`

Update the `.print-header` styling to increase the spacing around the separator line:

```css
.print-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;        /* Increased from 12px - more space after line */
  padding-bottom: 16px;       /* Increased from 10px - more space before line */
  border-bottom: 1px solid hsl(var(--print-border));
  position: relative;
}
```

---

## Visual Result

### Before
```
┌─────────────────────────────────────────┐
│ Your next steps after discharge    Logo │
│ Personalized care information...        │
│─────────────────────────────────────────│ ← 10px padding above, 12px margin below
│ [Card 1]        │ [Card 2]              │
```

### After
```
┌─────────────────────────────────────────┐
│ Your next steps after discharge    Logo │
│ Personalized care information...        │
│                                         │ ← 16px padding above line
│─────────────────────────────────────────│ 
│                                         │ ← 20px margin below line
│ [Card 1]        │ [Card 2]              │
```

---

## File to Modify

| File | Change |
|------|--------|
| `src/styles/print.css` | Update `.print-header` padding-bottom from 10px to 16px and margin-bottom from 12px to 20px |

