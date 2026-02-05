

# Plan: Dynamic Single-Page Layout with Auto Page Breaks

## Problem Identified

Currently, the layout forces **two fixed pages**:
- Page 1: Fixed 297mm height with 4 sections
- Page 2: Fixed 297mm height with 3 sections + footer

This wastes space when content is short and could fit on one page.

---

## Solution: Single Continuous Flow

Replace the two-page structure with a **single continuous container** where:
1. All 7 sections flow in one grid
2. CSS `@media print` handles automatic page breaks when content overflows
3. The browser's print system decides when to create new pages

---

## Changes

### 1. `src/components/print/PrintableDocument.tsx`

**Merge both pages into a single continuous layout:**

```tsx
return (
  <div className="print-container">
    <div className="print-document">
      {/* Header at top */}
      <PrintHeader 
        language={language} 
        date={date}
        hospitalName={hospitalName}
      />
      
      {/* All 7 sections in one continuous grid */}
      <div className="print-content-grid">
        <PrintSection title={...} content={sections[0]?.content} ... />
        <PrintSection title={...} content={sections[1]?.content} ... />
        <PrintSection title={...} content={sections[2]?.content} ... />
        <PrintSection title={...} content={sections[3]?.content} ... />
        <PrintMedications content={sections[4]?.content} ... />
        <PrintWarnings content={sections[5]?.content} ... />
        <PrintContacts content={sections[6]?.content} ... />
      </div>
      
      {/* Footer at bottom */}
      <PrintFooter ... />
    </div>
  </div>
);
```

**Remove:**
- The two separate `print-page` divs
- The mini header for page 2 (no longer needed)

---

### 2. `src/styles/print.css`

**Replace fixed A4 pages with flexible document container:**

```css
/* Flexible document container - grows with content */
.print-document {
  width: 210mm;
  padding: 10mm 12mm;
  margin: 0 auto;
  background: white;
  box-sizing: border-box;
}

/* Screen preview - show as single scrollable document */
@media screen {
  .print-document {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    min-height: 297mm; /* At least one A4 page */
  }
}

/* Print - let browser handle page breaks */
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }
  
  .print-document {
    width: 100%;
    padding: 0;
  }
  
  /* Allow sections to break across pages if needed */
  .print-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  /* Keep footer with last content */
  .print-footer {
    margin-top: 16px;
    break-inside: avoid;
  }
}
```

**Remove:**
- `.print-page` class with fixed 297mm height
- `.print-header-mini` styles (no longer needed)

---

## Visual Result

### Before (Fixed Two Pages)
```
┌─────────────────┐  ┌─────────────────┐
│ Page 1          │  │ Page 2          │
│ - Header        │  │ - Mini Header   │
│ - 4 sections    │  │ - 3 sections    │
│ - (wasted space)│  │ - Footer        │
└─────────────────┘  └─────────────────┘
```

### After (Dynamic Flow)
```
SHORT CONTENT:           LONG CONTENT:
┌─────────────────┐      ┌─────────────────┐
│ Header          │      │ Page 1          │
│ All 7 sections  │      │ - Header        │
│ Footer          │      │ - 5 sections    │
│ (fits on 1 page)│      ├─────────────────┤
└─────────────────┘      │ Page 2          │
                         │ - 2 sections    │
                         │ - Footer        │
                         └─────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/print/PrintableDocument.tsx` | Merge two pages into single continuous layout, remove mini header |
| `src/styles/print.css` | Replace fixed `.print-page` with flexible `.print-document`, update print media queries |

---

## Key Benefits

- **Single page when content fits** - no wasted space
- **Automatic page breaks** - browser handles overflow naturally
- **Simpler code** - one container instead of two pages
- **Still works for long content** - prints on multiple pages when needed
