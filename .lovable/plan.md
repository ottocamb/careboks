
# Plan: Print Layout Redesign with CSS Grid & New Visual Style

## Summary

Implement visual style updates while maintaining CSS Grid layout (no absolute positioning), keeping system fonts, keeping emoji icons, and styling all sections uniformly as cards.

---

## Changes Overview

| What | Current | Target |
|------|---------|--------|
| **Section Background** | Filled backgrounds (teal-light, pink-light, gray) | White background for ALL sections |
| **Section Border** | Left border only (3pt) | Full 1px border around entire card |
| **Border Radius** | 5pt | 12px |
| **Typography** | 18pt title, 10pt headers, 9pt body | 16px title, 14px headers, 12px body |
| **Grid Gaps** | 12pt | 16px uniform gaps |
| **Footer** | Plain with border-top | Teal background with white signature box |
| **Warnings Section** | Filled red background | White bg with red border (like other cards) |
| **Contacts Section** | Filled teal background | White bg with teal border (like other cards) |
| **Layout** | CSS Grid | CSS Grid (unchanged) |
| **Font** | System fonts | System fonts (unchanged) |
| **Icons** | Emoji icons in headers | Keep emoji icons (unchanged) |

---

## File Changes

### 1. `src/styles/print.css`

**Color Variables Update:**
```css
:root {
  /* Border colors for section variants */
  --print-teal-border: #43B39D;
  --print-pink-border: #DD4C6E;
  --print-red-border: #ce556e;
  --print-navy-border: #252e51;
  
  /* Footer teal background */
  --print-footer-bg: #C0E1D9;
  
  /* Keep existing text colors */
  --print-text: 215 25% 27%;
  --print-text-light: 215 20% 45%;
  --print-bg: 0 0% 100%;
  --print-border: 215 20% 88%;
}
```

**Typography Updates:**
```css
.print-title {
  font-size: 16px;  /* Changed from 18pt */
  font-weight: 700;
}

.print-section-header {
  font-size: 14px;  /* Changed from 10pt */
  font-weight: 700;
}

.print-body {
  font-size: 12px;  /* Changed from 9pt */
  line-height: 1.4;
}
```

**Section Card Styling (All White Background with Colored Borders):**
```css
.print-section {
  padding: 12px;
  border-radius: 12px;
  background: white;
  border: 1px solid;
}

.print-section--teal {
  border-color: var(--print-teal-border);
}

.print-section--teal .print-section-header {
  color: var(--print-teal-border);
}

.print-section--pink {
  border-color: var(--print-pink-border);
}

.print-section--pink .print-section-header {
  color: var(--print-pink-border);
}

/* Warnings: NOW white bg with red border (not filled red) */
.print-section--red {
  border-color: var(--print-red-border);
  background: white;
  color: inherit;  /* Normal text color */
}

.print-section--red .print-section-header {
  color: var(--print-red-border);
}

/* Contacts: NOW white bg with navy/teal border (not filled teal) */
.print-section--contacts {
  border-color: var(--print-navy-border);
  background: white;
  color: inherit;  /* Normal text color */
}

.print-section--contacts .print-section-header {
  color: var(--print-navy-border);
}

.print-section--neutral {
  border-color: var(--print-border);
}
```

**Grid Gap Update:**
```css
.print-page-1-grid {
  gap: 16px;  /* Changed from 12pt */
}

.print-page-1-left {
  gap: 16px;  /* Changed from 12pt */
}

.print-page-2-grid {
  gap: 16px;  /* Changed from 12pt */
}

.print-page-2-right {
  gap: 16px;  /* Changed from 12pt */
}
```

**New Footer Styling (Teal Background):**
```css
.print-footer {
  margin-top: auto;
  padding: 16px 24px;
  background: var(--print-footer-bg);  /* #C0E1D9 teal */
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: none;  /* Remove old border */
}

/* QR code on LEFT side */
.print-qr-container {
  text-align: center;
  order: -1;  /* Move to left via flexbox order */
}

.print-qr-label {
  font-size: 10px;
  color: hsl(var(--print-text));
  margin-top: 4px;
}

/* Signature box on RIGHT side - white card */
.print-signature {
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  text-align: right;
}

.print-signature-label {
  font-size: 10px;
  color: hsl(var(--print-text-light));
  margin-bottom: 4px;
}

.print-signature-line {
  font-size: 14px;
  font-weight: 600;
  font-style: italic;
  border-bottom: none;  /* Remove underline */
}
```

---

### 2. `src/components/print/PrintFooter.tsx`

Update structure for new layout (QR left, signature right in white box):

```tsx
export const PrintFooter = ({ clinicianName, date, documentUrl, language }: PrintFooterProps) => {
  const normalizedLang = language?.toLowerCase() || "english";
  const labels = LABELS[normalizedLang] || LABELS.english;

  return (
    <div className="print-footer">
      {/* QR Code on LEFT */}
      {documentUrl && (
        <div className="print-qr-container">
          <QRCodeSVG value={documentUrl} size={64} level="M" includeMargin={false} />
          <p className="print-qr-label">{labels.scanQr}</p>
        </div>
      )}

      {/* Signature box on RIGHT - white card */}
      <div className="print-signature">
        <p className="print-signature-label">{labels.signedBy}</p>
        <p className="print-signature-line">{clinicianName}</p>
        <p className="print-signature-date">{date}</p>
      </div>
    </div>
  );
};
```

---

### 3. `src/components/print/PrintContacts.tsx`

Change styling to use card variant (white bg, colored border) instead of filled teal:
- The CSS changes above handle this automatically
- No component code changes needed (just CSS class behavior change)

---

### 4. `src/components/print/PrintWarnings.tsx`

Change styling to use card variant (white bg, red border) instead of filled red:
- The CSS changes above handle this automatically  
- No component code changes needed (just CSS class behavior change)

---

### 5. `src/components/print/PrintableDocument.tsx`

No changes needed - already using CSS Grid layout which we're keeping.

---

## What Stays the Same

| Element | Status |
|---------|--------|
| CSS Grid layout | ✅ Keeping |
| System fonts | ✅ Keeping (no Montserrat) |
| Emoji icons (❤️, 📅, 🏃, ✨, 💊, ⚠️, 📞) | ✅ Keeping in headers |
| Two-page A4 layout | ✅ Keeping |
| ReactMarkdown for content | ✅ Keeping |
| Careboks logo | ✅ Keeping |

---

## Visual Comparison

### Before (Current)
- Filled colored backgrounds on sections
- Left-border-only styling
- 5pt border radius
- Filled red warnings, filled teal contacts
- Plain footer with border-top
- 9pt body text

### After (Target)
- White backgrounds on ALL sections
- Full 1px colored border around entire card
- 12px border radius
- White bg with red border on warnings
- White bg with navy border on contacts
- Teal background footer with white signature box
- 12px body text

---

## Files Summary

| File | Type of Change |
|------|----------------|
| `src/styles/print.css` | Major - new color variables, typography sizes, section styling, footer redesign |
| `src/components/print/PrintFooter.tsx` | Minor - reorder QR/signature, add classes |
| `src/components/print/PrintContacts.tsx` | None - CSS handles it |
| `src/components/print/PrintWarnings.tsx` | None - CSS handles it |
| `src/components/print/PrintableDocument.tsx` | None - keep grid layout |
| `src/components/print/PrintSection.tsx` | None - keep icons |
| `src/components/print/PrintMedications.tsx` | None - keep icons |

---

## Expected Result

A "collage" style layout with:
- Uniform 16px gaps between all cards
- All cards have white background with thin colored borders
- 12px rounded corners on all cards
- Teal footer with QR (left) and white signature box (right)
- Icons preserved in all section headers
- System fonts maintained
- CSS Grid layout (flexible, not brittle absolute positioning)
