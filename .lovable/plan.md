
# Plan: Print Layout Redesign & Patient Feedback Improvements (Corrected)

## Summary

This plan addresses two main areas:
1. **Print Layout Overhaul**: Unified color scheme, remove ONLY decorative background elements (keep section icons), consistent spacing, header/footer consistency, QR label update
2. **Patient Feedback**: One-time submission with localStorage persistence, auto-dismissing confirmation

---

## Part 1: Print Layout Changes

### 1.1 Unified Box Background Color

**Current State**: Multiple color variants (teal, pink, red, neutral, contacts) with different backgrounds.

**Target**: Single uniform light pastel background for most sections, keeping red (warnings) and teal (contacts) for emphasis.

**File**: `src/styles/print.css`

**Changes**:
```css
/* Add new CSS variable */
:root {
  --print-section-bg: 210 20% 98%;  /* Very light gray: #F8F9FA */
}

/* Update section variants to use uniform background */
.print-section--teal {
  border-left: 3pt solid hsl(var(--print-teal));
  background: hsl(var(--print-section-bg));  /* Changed from teal-light */
}

.print-section--pink {
  border-left: 3pt solid hsl(var(--print-pink));
  background: hsl(var(--print-section-bg));  /* Changed from pink-light */
}

.print-section--neutral {
  border: 1pt solid hsl(var(--print-border));
  background: hsl(var(--print-section-bg));  /* Unified */
}

/* KEEP red warning section - important for safety visibility */
.print-section--red {
  background: hsl(var(--print-red));
  color: white;
}

/* KEEP contacts with teal background for visual hierarchy */
.print-section--contacts {
  background: hsl(var(--print-teal));
  color: white;
}
```

### 1.2 Remove ONLY Decorative Background Elements (Keep Section Icons!)

**Clarification**: Keep all icons in section headers (❤️, 📅, 🏃, ✨, 💊, ⚠️, 📞). Only remove the floating decorative elements on pages.

**File**: `src/components/print/PrintableDocument.tsx`

**Changes - Remove these lines**:
```tsx
// Page 1 - REMOVE this line (around line 72):
<span className="print-decoration print-decoration--top-right">❤️</span>

// Page 2 - REMOVE this line (around line 126):
<span className="print-decoration print-decoration--top-left">💊</span>
```

**Keep all icon props on PrintSection components!**

### 1.3 Consistent Spacing Between Boxes

**File**: `src/styles/print.css`

**Changes**:
```css
/* Increase gap for better breathing room */
.print-page-1-grid {
  gap: 12pt;  /* Changed from 8pt */
}

.print-page-2-grid {
  gap: 12pt;  /* Changed from 8pt */
}

.print-page-1-left {
  gap: 12pt;  /* Changed from 8pt */
}

.print-page-2-right {
  gap: 12pt;  /* Changed from 8pt */
}
```

### 1.4 Header/Footer Border Consistency

**File**: `src/styles/print.css`

**Changes**:
```css
/* Make header border match footer (1pt solid) */
.print-header {
  border-bottom: 1pt solid hsl(var(--print-border));  /* Changed from 2pt teal */
}

/* Footer already uses 1pt solid - no change needed */
.print-footer {
  border-top: 1pt solid hsl(var(--print-border));
}

/* Mini header already uses 1pt solid - no change needed */
.print-header-mini {
  border-bottom: 1pt solid hsl(var(--print-border));
}
```

### 1.5 Update QR Code Label

**File**: `src/components/print/PrintFooter.tsx`

**Changes**:
```tsx
const LABELS: Record<string, { signedBy: string; scanQr: string }> = {
  estonian: {
    signedBy: "Kinnitanud",
    scanQr: "Skanni digitaalseks koopiaks"  // Changed from "Skanni ligipääsuks"
  },
  russian: {
    signedBy: "Утверждено",
    scanQr: "Сканируйте для цифровой копии"  // Changed from "Сканируйте для доступа"
  },
  english: {
    signedBy: "Signed by",
    scanQr: "Scan for digital copy"  // Changed from "Scan for access"
  }
};
```

---

## Part 2: Patient Feedback - One-Time Submission

### 2.1 Check for Previous Submission on Load

**File**: `src/components/PatientFeedbackForm.tsx`

**Changes**:
- Add state to check if feedback was already submitted for this document
- Use localStorage to persist submission state across page refreshes
- If already submitted, don't render the form at all

```tsx
// Add new state and effect
const [alreadySubmitted, setAlreadySubmitted] = useState(false);
const [showConfirmation, setShowConfirmation] = useState(true);

// Check localStorage on mount
useEffect(() => {
  const submittedDocs = JSON.parse(
    localStorage.getItem('patientFeedbackSubmitted') || '[]'
  );
  if (submittedDocs.includes(publishedDocumentId)) {
    setAlreadySubmitted(true);
  }
}, [publishedDocumentId]);

// On successful submission, save to localStorage
const handleSubmit = async () => {
  // ... existing submit logic ...
  
  // After successful submission:
  const submittedDocs = JSON.parse(
    localStorage.getItem('patientFeedbackSubmitted') || '[]'
  );
  submittedDocs.push(publishedDocumentId);
  localStorage.setItem('patientFeedbackSubmitted', JSON.stringify(submittedDocs));
  setHasSubmitted(true);
};

// Don't render anything if already submitted previously
if (alreadySubmitted) {
  return null;
}
```

### 2.2 Auto-Dismiss Confirmation After 3 Seconds

**File**: `src/components/PatientFeedbackForm.tsx`

**Changes**:
```tsx
// Add effect to auto-dismiss confirmation
useEffect(() => {
  if (hasSubmitted) {
    const timer = setTimeout(() => {
      setShowConfirmation(false);
      // Also notify parent to hide completely
      onSubmitSuccess?.();
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [hasSubmitted, onSubmitSuccess]);

// In render - show confirmation only for 3 seconds
if (hasSubmitted) {
  if (!showConfirmation) {
    return null;  // Completely hide after 3 seconds
  }
  return (
    <Card className="mt-8 border-primary/20 bg-primary/5">
      {/* ... thank you message ... */}
    </Card>
  );
}
```

### 2.3 Update PatientDocument Page

**File**: `src/pages/PatientDocument.tsx`

**Changes**:
```tsx
// Add state to track if feedback section should be hidden
const [feedbackVisible, setFeedbackVisible] = useState(true);

// Conditionally render feedback form
{feedbackVisible && (
  <div className="no-print max-w-[210mm] mx-auto px-4 pb-12">
    <PatientFeedbackForm 
      caseId={document.case_id}
      publishedDocumentId={document.id}
      onSubmitSuccess={() => setFeedbackVisible(false)}
    />
  </div>
)}
```

---

## Files Summary

| File | Changes |
|------|---------|
| `src/styles/print.css` | Unified background color, increased spacing (8pt → 12pt), header border consistency (2pt teal → 1pt neutral) |
| `src/components/print/PrintableDocument.tsx` | Remove decorative background elements ONLY (keep section icons) |
| `src/components/print/PrintFooter.tsx` | Change QR label to "Scan for digital copy" in all 3 languages |
| `src/components/PatientFeedbackForm.tsx` | Add localStorage check for previous submission, auto-dismiss confirmation after 3 seconds |
| `src/pages/PatientDocument.tsx` | Handle hiding feedback section after submission completes |

---

## What Stays the Same (Per User Request)

- ✅ Section icons STAY: ❤️, 📅, 🏃, ✨, 💊 in section headers
- ✅ Red warning section keeps its red background (safety)
- ✅ Contacts section keeps its teal background (hierarchy)
- ✅ Careboks logo at top of pages

---

## Expected Results

**Print Layout**:
- Clean, uniform light gray (#F8F9FA) background on most content boxes
- Red warnings and teal contacts keep their distinctive colors
- Section icons (❤️, 📅, etc.) REMAIN in headers
- Decorative floating elements (background ❤️ and 💊) REMOVED
- Consistent 12pt spacing between all boxes
- Matching 1pt border lines on header and footer
- QR code label says "Scan for digital copy" in all languages

**Patient Feedback**:
- If patient has already submitted feedback for this document, the form is completely hidden
- After submitting, confirmation message shows for 3 seconds then disappears
- Feedback state persisted in localStorage to survive page refreshes
