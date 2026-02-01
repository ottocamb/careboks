
# Fix Print Layout to Match Figma Design

## Issues to Fix

| Issue | Current State | Fix |
|-------|--------------|-----|
| **Layout** | Single column, stacked sections | Two-column grid layout on both pages |
| **QR Codes** | Two QR codes displayed | Only ONE QR code in footer |
| **Print Fragmentation** | Sections break across pages | Clean page breaks between Page 1 and Page 2 |
| **Decorative Elements** | None | Heart/stethoscope illustrations in corners |

---

## Figma Design Structure

### Page 1 Layout (Two Columns)
```text
+------------------------------------------+
|  "Your next steps       [♥ illustration] |
|   after discharge"        [Careboks logo]|
+-------------------+----------------------+
| WHAT DO I HAVE?   | HOW SHOULD I LIVE?   |
| (teal border)     | Activity & pacing    |
|                   | Daily habits         |
+-------------------+ Diet & fluids        |
| HOW THE NEXT 6    | Alcohol & smoking    |
| MONTHS WILL LOOK  | Weight & self-checks |
| (teal border)     | Social & emotional   |
+-------------------+----------------------+
| WHAT DOES IT MEAN FOR MY LIFE?           |
| (teal border - full width)               |
+------------------------------------------+
```

### Page 2 Layout (Two Columns + Footer)
```text
+------------------------------------------+
| [♥ illustration]            [Careboks]   |
+-------------------+----------------------+
| MY MEDICATIONS    | WARNING SIGNS        |
| (pink border)     | (red background)     |
|                   |                      |
+-------------------+----------------------+
|                   | MY CONTACTS          |
|                   | (teal background)    |
+-------------------+----------------------+
| [Feedback QR]     | Signed by            |
|                   | Dr. Name, Date       |
+------------------------------------------+
```

---

## Implementation Changes

### 1. Update src/styles/print.css
- Add two-column CSS Grid layouts for both pages
- Add stronger page break controls to prevent fragmentation
- Define grid areas for precise section positioning
- Set explicit A4 page heights (297mm)

### 2. Update src/components/print/PrintableDocument.tsx
- Restructure from single-column to two-column grid layout
- Page 1: Left column (What I Have + 6 Months) | Right column (How to Live)
- Page 2: Left column (Medications) | Right column (Warnings + Contacts)
- Add page wrapper divs with proper break controls

### 3. Update src/components/print/PrintHeader.tsx
- Add decorative illustration support (heart/stethoscope in corners)
- Keep Careboks logo in top-right position

### 4. Update src/components/print/PrintFooter.tsx
- Keep single QR code pointing to existing `/document/:accessToken` URL
- Update label to match Figma design

### 5. Update src/pages/PrintPreview.tsx
- Remove the extra QR code card from the preview UI (lines ~198-216)
- Keep only the QR code in the actual printed document footer

### 6. Update src/pages/PatientDocument.tsx
- Remove QR code display (since this IS the destination page)
- Keep print button for patients

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/styles/print.css` | Add two-column grid layouts, fix page break rules |
| `src/components/print/PrintableDocument.tsx` | Restructure to two-column grid matching Figma |
| `src/components/print/PrintHeader.tsx` | Add decorative illustration support |
| `src/components/print/PrintFooter.tsx` | Keep single QR code, update styling |
| `src/pages/PrintPreview.tsx` | Remove extra QR code card from UI |
| `src/pages/PatientDocument.tsx` | Remove redundant QR display |

---

## CSS Grid Structure

### Page 1 Grid
```css
.print-page-1-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 12pt;
}
```

### Page 2 Grid
```css
.print-page-2-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 12pt;
}
```

---

## Print Fragmentation Fix

```css
@media print {
  .print-page {
    height: 297mm;
    width: 210mm;
    overflow: hidden;
    page-break-after: always;
    page-break-inside: avoid;
  }
  
  .print-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

---

## QR Code Behavior
- Single QR code in footer only
- Links to existing public patient page: `/document/:accessToken`
- Patients can view and print from that page
- No new download endpoint needed

---

## Implementation Order

1. Update `print.css` with grid layouts and page break fixes
2. Restructure `PrintableDocument.tsx` to two-column layout
3. Update `PrintHeader.tsx` with decoration support
4. Clean up `PrintFooter.tsx` styling
5. Remove extra QR from `PrintPreview.tsx`
6. Remove QR from `PatientDocument.tsx`
7. Test print output for consistent A4 formatting
