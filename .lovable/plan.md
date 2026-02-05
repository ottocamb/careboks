
# Fix Critical Bugs and UI Polish

## Overview

This plan addresses four issues:
1. **Critical Bug**: "Back" button state corruption where section content gets merged
2. **Workflow**: Consolidate "Print for Patient" and "Publish & Share" into single action
3. **Validation**: Add warning toast when skipping feedback
4. **UI Polish**: Move toasts to bottom-left corner

---

## 1. Critical Bug: Back Button State Corruption

### Root Cause Analysis

When navigating back from PrintPreview or Feedback to ClinicianApproval, the bug occurs because:

1. **PrintPreview.tsx** passes `navigateToStep: 'approval'` to Index.tsx via router state
2. **Index.tsx** `useEffect` calls `loadCase(returnToCaseId)` which loads from database
3. The database only stores `ai_draft_text` (flat text), NOT the parsed sections array
4. **ClinicianApproval** receives sections via props: `sections={approvedSections.length > 0 ? approvedSections : aiSections}`
5. But neither `approvedSections` nor `aiSections` are restored because `loadCase` only returns raw text

The actual fix is: **Pass the sections data through navigation state**, not just `returnToCaseId`. The sections are already in memory on PrintPreview - we just need to pass them back.

### Changes Required

**PrintPreview.tsx (handleBack function):**
```typescript
const handleBack = () => {
  // Pass sections back through state to preserve them
  navigate('/app', { 
    state: { 
      returnToCaseId: caseId, 
      navigateToStep: 'approval',
      sections: sections  // ADD THIS
    } 
  });
};
```

**Index.tsx (useEffect hook):**
Update the state restoration logic to prefer sections from navigation state over database reload:

```typescript
useEffect(() => {
  const state = location.state as LocationState | null;
  if (state?.returnToCaseId && state.returnToCaseId !== currentCaseId) {
    
    // If sections are passed in state, use them directly (preserves edits)
    if (state.sections && state.sections.length > 0) {
      setApprovedSections(state.sections);
      setAiSections(state.sections);
    }
    
    // Load remaining case data from database
    loadCase(state.returnToCaseId).then(({ data, error }) => {
      // ... existing restoration logic
    });
    
    // Navigate to target step
    setCurrentStep(state.navigateToStep || 'approval');
    setCurrentCaseId(state.returnToCaseId);
    
    window.history.replaceState({}, document.title);
  }
}, [location.state]);
```

**LocationState interface (Index.tsx):**
```typescript
interface LocationState {
  returnToCaseId?: string;
  navigateToStep?: Step;
  sections?: ParsedSection[];  // ADD THIS
}
```

---

## 2. Print & Publish Workflow Consolidation

### Current Flow
- Button 1: "Print for Patient" → Opens print dialog
- Button 2: "Publish & Share" → Saves to database, generates URL

### New Flow
- Single Button: "Print & Publish for Patient" → Does both automatically

### Changes Required

**ClinicianApproval.tsx:**
Rename button and update `handleApprove` to also publish:

```typescript
const handleApprove = async () => {
  // ... existing validation and approval save ...
  
  // Also publish the document
  const { publishDocument, getDocumentUrl } = usePublishedDocument();
  const token = await publishDocument(
    caseId,
    sections,
    clinicianName,
    patientData?.language || 'english',
    undefined // hospitalName
  );
  
  // Navigate to PrintPreview with published URL
  navigate(`/app/print-preview/${caseId}`, {
    state: {
      sections,
      clinicianName,
      language: patientData?.language || 'english',
      publishedUrl: token ? getDocumentUrl(token) : undefined
    }
  });
};
```

Button label change:
```tsx
<Button onClick={handleApprove} className="flex-1">
  <Printer className="w-4 h-4 mr-1" />
  Print & Publish for Patient
</Button>
```

**PrintPreview.tsx:**
- Remove the standalone "Publish & Share" button
- If `state.publishedUrl` is passed, show the URL input immediately (already published)
- Keep the "Print for Patient" button for re-printing

Update LocationState:
```typescript
interface LocationState {
  sections: { title: string; content: string }[];
  clinicianName: string;
  language: string;
  hospitalName?: string;
  publishedUrl?: string;  // ADD THIS - pre-published URL from approval
}
```

Initialize state from props:
```typescript
const [publishedUrl, setPublishedUrl] = useState<string | null>(
  state?.publishedUrl || null
);
```

Remove the "Publish & Share" button from the action bar since it's now done automatically.

---

## 3. Feedback Validation - Skip Warning

### Requirement
When user clicks "New Patient" (or potentially "Submit") with empty form, show a warning toast asking them to confirm.

### Implementation

**Feedback.tsx:**
Add state for skip confirmation:
```typescript
const [skipWarningShown, setSkipWarningShown] = useState(false);
```

Update "New Patient" button handler:
```typescript
const handleNewPatient = () => {
  // If form is empty and warning not yet shown, show warning
  if (selectedOptions.length === 0 && !additionalComments.trim() && !skipWarningShown) {
    toast({
      title: "Skip feedback?",
      description: "Are you sure you want to start a new patient without submitting feedback? Click again to confirm.",
      variant: "default"
    });
    setSkipWarningShown(true);
    return;
  }
  
  // Second click or form has content - proceed
  onRestart();
};
```

Button change:
```tsx
<Button onClick={handleNewPatient} className="flex-1">
  <UserPlus className="w-4 h-4 mr-1" />
  New Patient
</Button>
```

Reset the warning state when user adds content:
```typescript
useEffect(() => {
  if (selectedOptions.length > 0 || additionalComments.trim()) {
    setSkipWarningShown(false);
  }
}, [selectedOptions, additionalComments]);
```

---

## 4. Toast Positioning - Bottom Left

### Current Position
Toasts appear in **bottom-right** (via `sm:right-0` in ToastViewport)

### Target Position
Toasts should appear in **bottom-left**

### Changes Required

**src/components/ui/toast.tsx (ToastViewport):**
```typescript
// Change from:
"fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"

// To:
"fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:left-0 sm:top-auto sm:flex-col md:max-w-[420px]"
```

Also update the slide animation to come from left:
```typescript
// In toastVariants, change:
"data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"

// To:
"data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-left-full"

// And for exit:
"data-[state=closed]:slide-out-to-right-full"

// To:
"data-[state=closed]:slide-out-to-left-full"
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Update LocationState interface to include sections, modify useEffect to restore sections from nav state |
| `src/components/ClinicianApproval.tsx` | Rename button to "Print & Publish for Patient", add publish logic to handleApprove, import usePublishedDocument |
| `src/pages/PrintPreview.tsx` | Update LocationState to accept publishedUrl, initialize from props, pass sections in handleBack, remove standalone Publish button |
| `src/components/Feedback.tsx` | Add skipWarningShown state, modify New Patient handler to show warning toast on first click if form empty |
| `src/components/ui/toast.tsx` | Change ToastViewport from right-0 to left-0, update slide animations for left side |

---

## Navigation State Flow Diagram

```text
ClinicianApproval
      |
      | handleApprove() 
      | - saves approval
      | - publishes document (NEW)
      | - navigate with { sections, publishedUrl }
      v
PrintPreview
      |
      |-- handleBack() with { sections } --> ClinicianApproval (sections preserved)
      |
      |-- handleContinueToFeedback() with { sections } --> Feedback
      v
Feedback
      |
      |-- handleBack() with { sections } --> ClinicianApproval (sections preserved)
      |
      |-- handleNewPatient() --> reset all state
```

---

## Testing Checklist

1. Create a case and go through to ClinicianApproval
2. Edit section content manually
3. Click "Print & Publish for Patient" - verify document publishes AND navigates to PrintPreview
4. Verify QR code/URL appears immediately (already published)
5. Click "Back" - verify you return to ClinicianApproval with all edits preserved
6. Click through to Feedback
7. Click "Back" from Feedback - verify edits still preserved
8. On Feedback, click "New Patient" with empty form - should show warning toast
9. Click "New Patient" again - should reset workflow
10. Verify all toasts appear in bottom-left corner
