
# Bug Fixes: Patient Profile Navigation and Feedback Labels

## Overview
Fix two issues affecting the workflow:
1. Patient Profile page not rendering correctly after using "Next Careboks"
2. Feedback page checkbox labels not visible due to broken Label component

---

## Root Causes Identified

### Issue 1: Patient Profile Page Bug After First Cycle

**Problem**: The `TechnicalNoteInput` component always creates a new case, even when navigating back to edit an existing case. It doesn't receive the current case ID.

**Current behavior**:
- `handleLogoClick()` sets step to 'input' but keeps `currentCaseId`
- `TechnicalNoteInput` always calls `createCase()` which creates a new case ID
- This causes state inconsistency where the workflow expects one case but creates another

**Solution**: 
- Pass `currentCaseId` to `TechnicalNoteInput`
- Update TechnicalNoteInput to use `updateCase()` when editing an existing case
- Only call `createCase()` when starting fresh (no case ID)

### Issue 2: Invisible Feedback Labels

**Problem**: The `Label` component in `src/components/ui/label.tsx` has an empty function body - it returns `undefined` instead of the actual Radix Label element.

**Current (broken)**:
```typescript
const Label = React.forwardRef<...>(({
  className,
  ...props
}, ref) => {});  // Empty - returns undefined!
```

---

## Changes Required

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/label.tsx` | Fix | Restore proper Label component implementation |
| `src/pages/Index.tsx` | Modify | Pass `currentCaseId` to TechnicalNoteInput |
| `src/components/TechnicalNoteInput.tsx` | Modify | Add case ID prop and update logic to handle both create and update |

---

## Technical Implementation Details

### 1. Fix Label Component (`src/components/ui/label.tsx`)

Restore the standard shadcn/ui Label implementation:

```typescript
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
```

### 2. Update TechnicalNoteInput Props

Add optional `caseId` prop to handle existing cases:

```typescript
interface TechnicalNoteInputProps {
  onNext: (note: string, caseId: string) => void;
  initialNote?: string;
  caseId?: string | null;  // NEW: existing case ID for edit mode
}
```

### 3. Update TechnicalNoteInput handleNext Logic

Modify the submit handler to update existing cases instead of always creating new ones:

```typescript
const handleNext = async () => {
  if (!note.trim()) return;
  
  setIsProcessing(true);
  const fileNames = uploadedFiles.map(f => f.name);
  
  // If we have an existing case ID, update it; otherwise create new
  if (caseId) {
    const { data, error } = await updateCase(caseId, {
      technicalNote: note,
      uploadedFileNames: fileNames
    });
    
    if (error) {
      // handle error
      return;
    }
    
    onNext(note, caseId);  // Use existing case ID
  } else {
    const { data, error } = await createCase(note, fileNames);
    
    if (error) {
      // handle error
      return;
    }
    
    onNext(note, data.id);  // Use newly created case ID
  }
  
  setIsProcessing(false);
};
```

### 4. Update Index.tsx to Pass Case ID

```typescript
{currentStep === 'input' && (
  <TechnicalNoteInput 
    onNext={handleTechnicalNoteSubmit} 
    initialNote={technicalNote}
    caseId={currentCaseId}  // NEW: pass current case ID
  />
)}
```

---

## Navigation Behavior After Fix

| Action | Goes To | Case ID | Effect |
|--------|---------|---------|--------|
| Logo Click | Input page | Preserved | Edit existing case |
| "Patient Profile" back button | Input page | Preserved | Edit existing case |
| "Next Careboks" | Input page | Cleared | Start fresh, create new case on submit |
| "Rewrite" (Feedback) | N/A | N/A | Just clears checkbox selections |

---

## Files Modified Summary

1. **`src/components/ui/label.tsx`** - Fix empty component to properly render Label
2. **`src/pages/Index.tsx`** - Add `caseId` prop to TechnicalNoteInput
3. **`src/components/TechnicalNoteInput.tsx`** - Add caseId prop, use updateCase when editing
