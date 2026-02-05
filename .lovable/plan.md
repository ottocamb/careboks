
# Workflow Refactoring: New Flow & Feedback Persistence

## Overview

This plan refactors the clinician workflow to follow the new order:
**Input → Profile → Approval → Output (PrintPreview) → Feedback → New Patient**

It also implements database persistence for feedback, removes deprecated Comprehension Test code, and updates all navigation and button labels.

---

## Database Schema Change

A new `case_feedback` table will store clinician feedback linked to each case.

```sql
CREATE TABLE public.case_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES patient_cases(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL,
  selected_options TEXT[] NOT NULL DEFAULT '{}',
  additional_comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.case_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create feedback for their cases"
  ON public.case_feedback FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by AND
    EXISTS (SELECT 1 FROM patient_cases WHERE id = case_feedback.case_id AND created_by = auth.uid())
  );

CREATE POLICY "Users can view their own feedback"
  ON public.case_feedback FOR SELECT
  USING (auth.uid() = submitted_by);
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Update steps array to `['input', 'profile', 'approval', 'output', 'feedback']`, reorder step rendering, pass caseId to Feedback, update navigation handlers |
| `src/components/ClinicianApproval.tsx` | Change "Feedback" button to navigate to PrintPreview (output step) instead of feedback |
| `src/pages/PrintPreview.tsx` | Rename "Print" to "Print for Patient", rename "Back to Editing" to just "Back" (returns to approval), add "Continue to Feedback" button |
| `src/components/Feedback.tsx` | Add caseId prop, database persistence via Supabase, free-text field, toast on success, rename "Next Careboks" to "New Patient", update back navigation |
| `src/components/FinalOutput.tsx` | Remove Comprehension Test UI, state, and all related code |

---

## Detailed Changes

### 1. src/pages/Index.tsx

**Steps Array Reorder:**
```typescript
// OLD
const steps: Step[] = ['input', 'profile', 'approval', 'feedback', 'output'];

// NEW  
const steps: Step[] = ['input', 'profile', 'approval', 'output', 'feedback'];
```

**Handler Updates:**
- `handleClinicianApproval`: Now navigates to `'output'` instead of `'feedback'`
- Add new `handleOutputToFeedback` handler that sets step to `'feedback'`
- `handleFeedbackBack`: Returns to `'approval'` (so user can edit document)
- Add `handleOutputBack`: Returns to `'approval'` step

**Component Rendering:**
- The `output` step now renders before `feedback`
- Pass `caseId` to Feedback component
- Pass new navigation handler to Output for "Continue to Feedback" button

---

### 2. src/components/ClinicianApproval.tsx

**Navigation Change:**
The current "Feedback" button text changes to "Print for Patient" and now calls:
```typescript
onClick={() => {
  // Save approval first, then navigate to output/print step
  handleApproveAndNavigate();
}}
```

The approval action now:
1. Validates clinician name
2. Saves approval to database  
3. Calls `onApprove()` which navigates to the `output` step

Button label change:
```typescript
// OLD
<Button onClick={handleApprove}>
  <CheckCircle2 /> Feedback
</Button>

// NEW
<Button onClick={handleApprove}>
  <Printer /> Print for Patient
</Button>
```

---

### 3. src/pages/PrintPreview.tsx

**Button Renames:**
- "Print" → "Print for Patient"
- "Back to Editing" → "Back" (navigates to approval step via state)

**New Button:**
Add "Continue to Feedback" button that navigates to Index with feedback step:
```tsx
<Button onClick={handleContinueToFeedback}>
  <MessageSquare className="mr-2 h-4 w-4" />
  Continue to Feedback
</Button>
```

Navigation handler:
```typescript
const handleContinueToFeedback = () => {
  navigate('/app', { 
    state: { 
      returnToCaseId: caseId,
      navigateToStep: 'feedback'
    } 
  });
};
```

---

### 4. src/components/Feedback.tsx

**New Props:**
```typescript
interface FeedbackProps {
  caseId: string;  // NEW - required for DB persistence
  onBack: () => void;
  onRestart: () => void;
}
```

**New State:**
```typescript
const [additionalComments, setAdditionalComments] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Database Persistence:**
```typescript
const handleSubmit = async () => {
  if (selectedOptions.length === 0 && !additionalComments.trim()) {
    toast({ 
      title: "Feedback required", 
      description: "Please select at least one option or add comments",
      variant: "destructive"
    });
    return;
  }

  setIsSubmitting(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from('case_feedback').insert({
      case_id: caseId,
      submitted_by: user.id,
      selected_options: selectedOptions,
      additional_comments: additionalComments.trim() || null
    });

    if (error) throw error;

    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!"
    });
  } catch (err) {
    toast({
      title: "Submission failed",
      description: "Could not save feedback. Please try again.",
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

**UI Updates:**
- Add free-text field below checkboxes:
```tsx
<div className="space-y-2">
  <Label htmlFor="comments">Additional Comments/Suggestions</Label>
  <Textarea
    id="comments"
    value={additionalComments}
    onChange={(e) => setAdditionalComments(e.target.value)}
    placeholder="Share any additional feedback..."
    rows={4}
  />
</div>
```

- Add "Back" button:
```tsx
<Button onClick={onBack} variant="outline">
  <ChevronLeft className="w-4 h-4 mr-1" />
  Back
</Button>
```

- Rename "Next Careboks" to "New Patient":
```tsx
<Button onClick={onRestart}>
  <UserPlus className="w-4 h-4 mr-1" />
  New Patient
</Button>
```

---

### 5. src/components/FinalOutput.tsx

**Remove Comprehension Test:**
Delete all code related to:
- `showComprehensionTest` state
- `COMPREHENSION_QUESTIONS` constant
- `toggleComprehensionTest` function
- The entire comprehension test UI section (lines 212-253)
- The "Comprehension Test" button

Keep only:
- Document preview
- Print functionality
- Back button
- New Patient button

---

## Navigation Flow Diagram

```text
+--------+     +----------+     +-----------+     +----------------+     +------------+
| Input  | --> | Profile  | --> | Approval  | --> | PrintPreview   | --> | Feedback   |
+--------+     +----------+     +-----------+     +----------------+     +------------+
                                      ^                   |                     |
                                      |                   |                     |
                                      +------- Back ------+                     |
                                      |                                         |
                                      +---------------- Back -------------------+
                                                                                |
                                                                                v
                                                                          [New Patient]
                                                                                |
                                                                                v
                                                                          +--------+
                                                                          | Input  |
                                                                          +--------+
```

---

## Technical Implementation Notes

1. **PrintPreview as Output Step**: The PrintPreview page becomes the "output" step but is still a separate route (`/app/print-preview/:caseId`). Navigation from Index to PrintPreview uses the existing `handlePrintPreview` pattern from ClinicianApproval.

2. **State Passing**: The `location.state` pattern already used for "Back to Editing" will be extended to support `navigateToStep: 'feedback'` for the "Continue to Feedback" button.

3. **Feedback Back Navigation**: When clicking "Back" from Feedback, users return to the Approval step where they can edit content and re-navigate to print preview.

4. **No Rating Scale**: Per requirements, the existing checkbox questionnaire is kept as-is without star ratings.

