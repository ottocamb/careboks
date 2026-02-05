

# Plan: Print Layout Minor Adjustments

## Summary

Three small but important changes to improve the print layout appearance:
1. Remove the date from the header section
2. Position the footer at the bottom of the page with a small margin (not where content ends)
3. Change the doctor's name styling from italic to bold only

---

## Changes Required

### 1. Remove Date from Header

**File: `src/components/print/PrintHeader.tsx`**

Remove line 55 that displays the date in the header:

```tsx
// REMOVE this line:
<p className="print-header-date mt-2">{date}</p>
```

The header will only show the titles on the left and the logo on the right.

---

### 2. Footer Positioned at Page Bottom

**File: `src/styles/print.css`**

The footer currently uses `margin-top: auto` but the parent page doesn't have the proper flexbox structure to push it to the bottom. 

Update the `.print-page` class to use flexbox column layout, and add positioning rules for the page 2 content:

```css
/* A4 page container - add flexbox for footer positioning */
.print-page {
  width: 210mm;
  height: 297mm;
  padding: 10mm 12mm;
  margin: 0 auto;
  background: hsl(var(--print-bg));
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  display: flex;           /* NEW */
  flex-direction: column;  /* NEW */
}

/* Footer at absolute bottom with small margin */
.print-footer {
  margin-top: auto;        /* Pushes to bottom */
  margin-bottom: 0;        /* NEW - small gap from page edge */
  padding: 16px 24px;
  background: var(--print-footer-bg);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

This makes the print page a flex container, allowing `margin-top: auto` on the footer to push it to the bottom of the A4 page.

---

### 3. Doctor Name: Bold Only (Remove Italic)

**File: `src/styles/print.css`**

Update `.print-signature-line` to remove the italic style:

```css
.print-signature-line {
  font-size: 14px;
  font-weight: 600;       /* Keep bold */
  /* font-style: italic;  REMOVE */
  color: hsl(var(--print-text));
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/print/PrintHeader.tsx` | Remove date display line |
| `src/styles/print.css` | Add flexbox to `.print-page`, remove italic from `.print-signature-line` |

---

## Expected Result

- Header shows only titles (left) and logo (right) — no date
- Footer sticks to the bottom of the A4 page with a small margin, regardless of how much content is above it
- Clinician name appears in **bold** only, without italic styling

