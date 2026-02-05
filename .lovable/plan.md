
# Bug Fix, UI Polish, and Patient Feedback Feature

## Overview

This plan addresses:
1. **Bug Fix**: `isSubmitting` state not resetting properly
2. **UI Polish**: Toast icons for visual distinction + Case ID badge in header
3. **Major Feature**: Patient-side feedback via QR code view

---

## 1. Bug Fix: isSubmitting State

### Problem

In `Feedback.tsx`, when submission succeeds, the code calls `setTimeout(() => onRestart(), 1000)` which unmounts the component. However, `isSubmitting` is never set back to `false` before unmount. 

While React handles this gracefully in most cases, there's a potential issue if:
- The component doesn't unmount (edge case)
- User quickly navigates back before timeout

### Solution

Add `setIsSubmitting(false)` before the success timeout to ensure clean state:

```typescript
// Feedback.tsx - handleSubmitAndNewPatient
toast({
  title: "Feedback submitted",
  description: "Thank you! Starting new patient..."
});

setIsSubmitting(false);  // ADD THIS - Reset state before timeout

// Brief delay to show toast, then restart
setTimeout(() => onRestart(), 1000);
```

---

## 2. UI Polish: Toast Icons and Case ID Badge

### 2a. Toast Icons with Visual Distinction

**Problem**: All toasts look the same - no visual indicator of success/warning/error beyond color.

**Solution**: Create a wrapper toast function or modify Toaster to auto-add icons based on variant.

#### Approach: Custom Toaster with Auto-Icons

Modify `src/components/ui/toaster.tsx` to automatically add icons:

| Toast Type | Icon | Color |
|------------|------|-------|
| Success (default) | CheckCircle2 | Green text |
| Warning | AlertTriangle | Amber text |
| Destructive (error) | XCircle | Red text |

**Changes to Toaster component:**

```tsx
// src/components/ui/toaster.tsx
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

function getToastIcon(variant?: string) {
  switch (variant) {
    case 'destructive':
      return <XCircle className="h-5 w-5 text-destructive-foreground" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    default:
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  }
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3">
              {getToastIcon(variant)}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
```

**Add warning variant to toast.tsx:**

```typescript
// In toastVariants
variants: {
  variant: {
    default: "border bg-background text-foreground",
    destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
    warning: "border-amber-200 bg-amber-50 text-amber-900",  // ADD THIS
  },
},
```

### 2b. Case ID Badge in Header

**Problem**: Clinician doesn't know which case they're working on throughout the workflow.

**Solution**: Add a subtle badge showing the Case ID in MedicalHeader.

**Changes to MedicalHeader:**

1. Add `caseId` prop to `MedicalHeaderProps`
2. Display a badge next to the step progress when a case is active

```tsx
interface MedicalHeaderProps {
  currentStep: number;
  totalSteps: number;
  onLogout: () => void;
  onLogoClick?: () => void;
  caseId?: string | null;  // ADD THIS
}

// In the component JSX, add between logo and progress:
{caseId && (
  <div className="hidden sm:flex items-center">
    <Badge variant="outline" className="text-xs text-muted-foreground font-mono">
      Case #{caseId.slice(0, 8)}
    </Badge>
  </div>
)}
```

**Update Index.tsx to pass caseId:**

```tsx
<MedicalHeader 
  currentStep={currentStepIndex + 1} 
  totalSteps={totalSteps} 
  onLogout={onLogout}
  onLogoClick={handleLogoClick}
  caseId={currentCaseId}  // ADD THIS
/>
```

---

## 3. Major Feature: Patient-Side Feedback

### Current State

- **Route**: `/document/:accessToken` (public, no auth)
- **Component**: `PatientDocument.tsx`
- **Database**: `case_feedback` table only has `submitted_by` (user_id) - designed for clinicians

### Requirement

Allow patients to submit feedback after viewing their document via QR code.

### Database Schema Changes

Create a new table or modify existing to distinguish feedback sources:

**Option A (Recommended): Separate table `patient_feedback`**

Keeps concerns separate, allows different question sets:

```sql
CREATE TABLE public.patient_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL,
  published_document_id uuid NOT NULL,
  feedback_source text NOT NULL DEFAULT 'qr_view',
  selected_options text[] NOT NULL DEFAULT '{}',
  additional_comments text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  -- No submitted_by since patients aren't authenticated
  CONSTRAINT fk_case FOREIGN KEY (case_id) REFERENCES patient_cases(id),
  CONSTRAINT fk_document FOREIGN KEY (published_document_id) REFERENCES published_documents(id)
);

-- RLS: Allow public INSERT (no auth required for patient feedback)
ALTER TABLE patient_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit patient feedback"
ON patient_feedback FOR INSERT
WITH CHECK (true);

-- Clinicians can view feedback for their cases
CREATE POLICY "Clinicians can view patient feedback for their cases"
ON patient_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patient_cases
    WHERE patient_cases.id = patient_feedback.case_id
    AND patient_cases.created_by = auth.uid()
  )
);
```

### Frontend Changes

#### 3a. Create Reusable Feedback Form Component

Extract the feedback form UI into a reusable component that both Feedback.tsx and PatientDocument.tsx can use:

**New file: `src/components/FeedbackForm.tsx`**

```tsx
interface FeedbackFormProps {
  questionLabel: string;  // Different text for clinician vs patient
  options: string[];
  onSubmit: (selectedOptions: string[], comments: string) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
}

export const FeedbackForm = ({
  questionLabel,
  options,
  onSubmit,
  isSubmitting,
  submitButtonText
}: FeedbackFormProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [additionalComments, setAdditionalComments] = useState("");
  
  // ... checkbox logic, textarea, submit button
};
```

#### 3b. Patient-Specific Feedback Options

For patients, use different (simpler) questions:

```typescript
const PATIENT_FEEDBACK_OPTIONS = [
  "The document was easy to understand",
  "I understand my condition better now",
  "The medication information was helpful",
  "I know what warning signs to watch for",
  "I understand what lifestyle changes I need to make",
  "I would like more details about my treatment"
];
```

#### 3c. Update PatientDocument.tsx

Add feedback section at the bottom:

```tsx
// PatientDocument.tsx
import { PatientFeedbackForm } from '@/components/PatientFeedbackForm';

// After PrintableDocument, before closing div:
<div className="no-print max-w-[210mm] mx-auto p-4 pb-12">
  <PatientFeedbackForm 
    caseId={document.case_id}
    publishedDocumentId={document.id}
    onSubmitSuccess={() => {
      // Show thank you message, hide form
    }}
  />
</div>
```

#### 3d. New PatientFeedbackForm Component

```tsx
// src/components/PatientFeedbackForm.tsx
const PATIENT_FEEDBACK_OPTIONS = [
  "The document was easy to understand",
  "I understand my condition better now",
  "The medication information was helpful",
  "I know what warning signs to watch for",
  "I understand what lifestyle changes I need to make",
];

export const PatientFeedbackForm = ({
  caseId,
  publishedDocumentId,
  onSubmitSuccess
}: {
  caseId: string;
  publishedDocumentId: string;
  onSubmitSuccess: () => void;
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [additionalComments, setAdditionalComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (selectedOptions.length === 0 && !additionalComments.trim()) {
      toast({
        title: "Please provide feedback",
        description: "Select at least one option or add a comment.",
        variant: "warning"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert into patient_feedback (no auth required)
      const { error } = await supabase.from('patient_feedback').insert({
        case_id: caseId,
        published_document_id: publishedDocumentId,
        selected_options: selectedOptions,
        additional_comments: additionalComments.trim() || null
      });

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "Your response helps us improve."
      });
      setHasSubmitted(true);
      onSubmitSuccess();
    } catch (err) {
      toast({
        title: "Could not submit feedback",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Thank you for your feedback!</h3>
          <p className="text-muted-foreground">Your response helps us improve patient care.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>How was this document?</CardTitle>
        <CardDescription>
          Your feedback helps us improve the information we provide to patients.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Checkboxes for PATIENT_FEEDBACK_OPTIONS */}
        {/* Textarea for additional comments */}
        {/* Submit button */}
      </CardContent>
    </Card>
  );
};
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/components/Feedback.tsx` | Add `setIsSubmitting(false)` before timeout |
| `src/components/ui/toast.tsx` | Add `warning` variant to toastVariants |
| `src/components/ui/toaster.tsx` | Add auto-icons based on variant |
| `src/components/MedicalHeader.tsx` | Add `caseId` prop and Badge display |
| `src/pages/Index.tsx` | Pass `caseId` to MedicalHeader |
| `src/components/PatientFeedbackForm.tsx` | **NEW** - Patient feedback form component |
| `src/pages/PatientDocument.tsx` | Add PatientFeedbackForm at bottom |
| **Database Migration** | Create `patient_feedback` table with RLS policies |

---

## Database Migration SQL

```sql
-- Create patient feedback table for QR code view feedback
CREATE TABLE public.patient_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL,
  published_document_id uuid NOT NULL,
  feedback_source text NOT NULL DEFAULT 'qr_view',
  selected_options text[] NOT NULL DEFAULT '{}',
  additional_comments text,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback (patients aren't authenticated)
CREATE POLICY "Anyone can submit patient feedback"
ON public.patient_feedback FOR INSERT
WITH CHECK (true);

-- Clinicians can view feedback for cases they created
CREATE POLICY "Clinicians view patient feedback for their cases"
ON public.patient_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patient_cases
    WHERE patient_cases.id = patient_feedback.case_id
    AND patient_cases.created_by = auth.uid()
  )
);
```

---

## Visual Flow

```text
Clinician App (/app)                    Patient View (/document/:token)
      |                                         |
      v                                         v
 MedicalHeader                           PatientDocument.tsx
 [Logo] [Case #abc12345] [Step 3/5]      - PrintableDocument
      |                                  - PatientFeedbackForm (NEW)
      v                                         |
 Feedback.tsx                                   v
 - Clinician questions                   patient_feedback table
 - case_feedback table                   (no auth, public insert)
```

---

## Testing Checklist

1. Trigger various toasts - verify icons appear (success=checkmark, error=X, warning=triangle)
2. Start a case - verify Case ID badge appears in header
3. Navigate through workflow - verify badge persists with correct ID
4. Click "Submit & New Patient" - verify `isSubmitting` resets properly
5. Access patient document via QR/URL - verify feedback form appears
6. Submit patient feedback - verify it saves to `patient_feedback` table
7. Verify clinician can query patient feedback for their cases
