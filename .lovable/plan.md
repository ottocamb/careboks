

# Plan: Fix Vertical Spacing & Header Typography

## Issues Identified

1. **Vertical wasted space between cards** - The CSS Grid with `grid-template-columns: repeat(2, 1fr)` creates equal-width columns, but rows still stretch to match the tallest item in each row, creating gaps
2. **Insufficient space between header titles** - "Your Next Steps After Discharge" and "Personalized Care Information" need more breathing room
3. **Subtitle should use body font styling** - "Personalized Care Information" should match body text style (not be styled as a distinct subtitle)

---

## Solution

### 1. Fix Vertical Spacing with Dense Grid Packing

Add `grid-auto-rows: min-content` and `align-items: start` to prevent rows from stretching:

```css
.print-content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  flex: 1;
  align-items: start;         /* Cards align to top, don't stretch */
  grid-auto-rows: min-content; /* Rows only as tall as content */
}
```

### 2. Increase Space Between Title and Subtitle

Update the header subtitle margin:

```css
.print-subtitle {
  font-size: 12px;            /* Match body font size */
  color: hsl(var(--print-text-light));
  line-height: 1.4;           /* Match body line-height */
  margin-top: 8px;            /* Add more space above */
  font-weight: 400;           /* Normal weight like body */
}
```

### 3. Update PrintHeader Component

Add a spacer class to the subtitle for more visual separation:

```tsx
<h1 className="print-title">{titles.main}</h1>
<p className="print-subtitle mt-2">{titles.sub}</p>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/styles/print.css` | Add `align-items: start` and `grid-auto-rows: min-content` to grid; update `.print-subtitle` to use body font styling with more top margin |
| `src/components/print/PrintHeader.tsx` | Add `mt-2` class to subtitle for visual spacing |

---

## Visual Result

### Before
```
┌──────────────────────────────────────┐
│ Your Next Steps After Discharge      │
│ Personalized care information...     │  ← Too close, styled differently
├─────────────────┬────────────────────┤
│ Card 1          │ Card 2             │
│ (short)         │ (tall)             │
│                 │                    │
│ ← wasted space  │                    │
├─────────────────┼────────────────────┤
│ Card 3          │ Card 4             │
```

### After
```
┌──────────────────────────────────────┐
│ Your Next Steps After Discharge      │
│                                      │  ← More breathing room
│ Personalized care information...     │  ← Body font styling
├─────────────────┬────────────────────┤
│ Card 1          │ Card 2             │
│ (short)         │ (tall)             │
├─────────────────┤                    │
│ Card 3          │                    │  ← No vertical gaps
│                 │                    │
├─────────────────┼────────────────────┤
│ Card 4          │ Card 5             │
```

---

## CSS Changes Detail

**Grid fix (eliminate vertical gaps):**
```css
.print-content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  flex: 1;
  align-items: start;           /* NEW - cards don't stretch */
  grid-auto-rows: min-content;  /* NEW - rows fit content */
}
```

**Subtitle styling (body font with spacing):**
```css
.print-subtitle {
  font-size: 12px;              /* Changed from 10px to match body */
  color: hsl(var(--print-text-light));
  line-height: 1.4;             /* Match body line-height */
  margin-top: 8px;              /* NEW - more space above */
}
```

