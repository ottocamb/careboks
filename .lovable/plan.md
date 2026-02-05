
# Plan: Simplified Horizontal Flow Layout (Masonry-Style)

## Problem Identified

The current layout uses a **rigid two-column grid** with explicit positioning:
- `grid-column: 1` forces cards into the left column
- `grid-column: 2` forces cards into the right column
- Cards in `print-page-1-left` are stacked vertically, leaving unused horizontal space

This creates **wasted space** because cards don't flow horizontally to fill available room.

---

## Solution: CSS Grid with Auto-Fill

Replace the rigid column-based layout with a **flexible grid that auto-fits cards horizontally**:

```css
/* Cards flow horizontally, wrap when needed */
.print-content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  /* Two equal columns */
  gap: 16px;
  flex: 1;
}
```

Each section becomes a simple grid item that flows into the next available cell. Sections that need full width can span both columns.

---

## Changes

### 1. `src/styles/print.css`

**Replace the rigid column/row placement with a simpler auto-flow grid:**

```css
/* Simple horizontal flow grid - cards fill left to right, then wrap */
.print-content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  flex: 1;  /* Fill available space */
}

/* Full-width section spans both columns */
.print-section--full-width {
  grid-column: 1 / -1;
}

/* Remove rigid column placements */
/* DELETE: .print-page-1-left, .print-page-1-right, .print-page-1-full */
/* DELETE: .print-page-2-left, .print-page-2-right */
```

### 2. `src/components/print/PrintableDocument.tsx`

**Simplify the JSX structure - remove column wrappers, let grid handle flow:**

```tsx
{/* PAGE 1 - Simplified horizontal flow */}
<div className="print-page">
  <PrintHeader ... />
  
  <div className="print-content-grid">
    {/* Cards flow horizontally automatically */}
    <PrintSection title={...} content={sections[0]?.content} variant="teal" icon={...} />
    <PrintSection title={...} content={sections[1]?.content} variant="neutral" icon={...} />
    <PrintSection title={...} content={sections[2]?.content} variant="teal" icon={...} />
    
    {/* Full width card spans both columns */}
    <div className="print-section--full-width">
      <PrintSection title={...} content={sections[3]?.content} variant="teal" icon={...} />
    </div>
  </div>
</div>

{/* PAGE 2 - Same horizontal flow */}
<div className="print-page">
  <div className="print-header-mini">...</div>
  
  <div className="print-content-grid">
    <PrintMedications ... />
    <PrintWarnings ... />
    <PrintContacts ... />
  </div>
  
  <PrintFooter ... />
</div>
```

---

## Visual Result

### Before (Current)
```
┌─────────────────────────────────────┐
│ Header                              │
├──────────────┬──────────────────────┤
│ Card 1       │ Card 2               │
│              │                      │
├──────────────┤                      │
│ Card 3       │ (wasted space)       │
│              │                      │
├──────────────┴──────────────────────┤
│ Card 4 (full width)                 │
└─────────────────────────────────────┘
```

### After (Horizontal Flow)
```
┌─────────────────────────────────────┐
│ Header                              │
├──────────────┬──────────────────────┤
│ Card 1       │ Card 2               │
│              │                      │
├──────────────┼──────────────────────┤
│ Card 3       │ Card 4               │
│              │                      │
└──────────────┴──────────────────────┘
```

Cards automatically flow left-to-right, filling horizontal space before wrapping to the next row.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/styles/print.css` | Replace rigid grid classes with simple `.print-content-grid` |
| `src/components/print/PrintableDocument.tsx` | Remove column wrapper divs, use flat grid structure |

---

## Key Benefits

- **No wasted space** - cards fill horizontally before stacking
- **Simpler code** - fewer wrapper divs, no explicit column/row assignments
- **True collage look** - cards flow naturally like a masonry layout
- **Maintains 16px gap** - consistent spacing in all directions
