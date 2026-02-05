
# Plan: Remove "Document Published" Toast Notification

## Issue

The toast notification "Document published - Patient can now access their document via the link" appears when a document is published, but this is redundant because the Print Preview page already displays a green confirmation card with the same information.

## Current Behavior

When a document is published:
1. ✅ Green confirmation card appears on Print Preview page (should keep)
2. ❌ Toast notification pops up (remove this)

## Solution

Remove the success toast from the `publishDocument` function in `usePublishedDocument.ts`, while keeping the error toast for failed publishing attempts (important for user feedback when something goes wrong).

---

## Technical Changes

### File: `src/hooks/usePublishedDocument.ts`

**Lines 73-76 - Remove the success toast:**

```typescript
// Before (lines 71-77)
if (error) throw error;

toast({
  title: 'Document published',
  description: 'Patient can now access their document via the link'
});

return accessToken;

// After
if (error) throw error;

return accessToken;
```

**Note**: The error toast (lines 82-86) will remain so users are still notified if publishing fails.

---

## Summary

| File | Change | Impact |
|------|--------|--------|
| `src/hooks/usePublishedDocument.ts` | Remove success toast at lines 73-76 | No popup on successful publish; green card on Print Preview provides confirmation |

---

## What Stays

- ✅ Green confirmation card on Print Preview page ("Document Published - The QR code on the printed document will allow patients to access their care document online.")
- ✅ Error toast notification if publishing fails
- ✅ All other functionality unchanged
