
# Plan: Fix Toast Duration and Print Footer Spacing

## Issues Identified

### Issue 1: Toast Duration Too Long
**Current**: `TOAST_REMOVE_DELAY = 1000000` (1000 seconds!)  
**Required**: 2 seconds (2000ms)

### Issue 2: Print Layout Showing Extra Space Below Footer
Looking at the screenshot, there's a large beige/tan empty area below the teal footer. This is caused by:
1. The outer container in `PrintPreview.tsx` has `min-h-screen bg-muted`
2. The print-container doesn't fill remaining space
3. The muted background shows below the document

---

## Solution Overview

### Fix 1: Toast Duration
Update the `TOAST_REMOVE_DELAY` constant in the use-toast hook.

### Fix 2: Print Container
Make the print-container fill the remaining viewport height so no background gap appears below the footer.

---

## Technical Changes

### File 1: `src/hooks/use-toast.ts`

**Line 6 - Change:**
```typescript
// Before
const TOAST_REMOVE_DELAY = 1000000;

// After  
const TOAST_REMOVE_DELAY = 2000;  // 2 seconds
```

This ensures ALL toast notifications auto-dismiss after 2 seconds.

---

### File 2: `src/styles/print.css`

**Issue**: The `.print-footer` has conflicting styles with duplicate padding declarations.

**Lines 386-396 - Change:**
```css
/* Before */
.print-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid hsl(var(--print-border));
  padding: 16px 24px;  /* This overwrites padding-top! */
  ...
}

/* After - Remove duplicate, fix margin/padding */
.print-footer {
  margin-top: 16px;  /* Consistent spacing */
  padding: 16px 24px;
  border-top: 1px solid hsl(var(--print-border));
  ...
}
```

**Add to screen styles (lines 39-50)**: Make print-container fill remaining space

```css
@media screen {
  .print-document {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .print-container {
    padding: 20px;
    background: hsl(215 20% 95%);
    min-height: calc(100vh - 80px);  /* Fill remaining space below action bar */
  }
}
```

---

### File 3: `src/pages/PrintPreview.tsx`

**Line 143 - Ensure consistent background**:
```tsx
// The bg-muted matches print-container background, preventing color mismatch
<div className="min-h-screen bg-[hsl(215,20%,95%)]">
```

This ensures the outer container uses the same gray tone as the print-container, eliminating any visual gap or color mismatch.

---

## Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| `src/hooks/use-toast.ts` | `TOAST_REMOVE_DELAY = 2000` | All toasts dismiss after 2 seconds |
| `src/styles/print.css` | Fix duplicate padding, add min-height to container | No visual gap below footer |
| `src/pages/PrintPreview.tsx` | Match background color to print container | Seamless visual appearance |

---

## Verification

After implementation:
1. Trigger any toast (copy link, publish, etc.) - should dismiss after 2 seconds
2. View Print Preview page - no beige/tan gap should appear below the footer
3. Test print functionality - print output should remain unchanged (all screen-only changes use `@media screen`)
