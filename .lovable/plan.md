

# Plan: Auto-Regenerate AI Draft When Patient Profile Changes

## Problem

When navigating back from "Review & Edit Patient Communication" to "Patient Profile" and making changes, the app only saves the updated profile but does **not** regenerate the AI draft. The existing sections remain unchanged.

## Root Cause

The `ClinicianApproval` component's `useEffect` only triggers AI generation when:
```javascript
const shouldGenerate = !draft && (!preParsedSections || preParsedSections.length === 0);
```

Since sections already exist from the first generation, `shouldGenerate` evaluates to `false`.

## Solution

Clear the existing `aiSections` and `aiDraft` state when navigating back to profile, so that when the user proceeds again, the `ClinicianApproval` component will detect empty sections and trigger a fresh regeneration.

---

## Changes

### `src/pages/Index.tsx`

Update `handleBackToProfile` to clear the AI-generated content:

**Before:**
```typescript
const handleBackToProfile = () => {
  setCurrentStep('profile');
};
```

**After:**
```typescript
const handleBackToProfile = () => {
  // Clear AI-generated content so it regenerates with updated profile
  setAiDraft("");
  setAiSections([]);
  setApprovedSections([]);
  setAnalysis(null);
  setCurrentStep('profile');
};
```

---

## Flow After Change

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         User Workflow                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Clinician Approval]                                                    │
│         │                                                                │
│         │ Click "Patient Profile" button                                 │
│         ▼                                                                │
│  handleBackToProfile()                                                   │
│         │                                                                │
│         ├── Clear aiDraft, aiSections, approvedSections, analysis        │
│         │                                                                │
│         └── setCurrentStep('profile')                                    │
│                    │                                                     │
│                    ▼                                                     │
│            [Patient Profile]                                             │
│                    │                                                     │
│                    │ User edits profile, clicks "Generate AI Draft"      │
│                    ▼                                                     │
│         handlePatientProfileSubmit(data)                                 │
│                    │                                                     │
│                    ├── setPatientData(data)                              │
│                    │                                                     │
│                    └── setCurrentStep('approval')                        │
│                              │                                           │
│                              ▼                                           │
│                    [Clinician Approval]                                  │
│                              │                                           │
│                              │ useEffect detects:                        │
│                              │   shouldGenerate = !draft && !sections    │
│                              │   shouldGenerate = true                   │
│                              ▼                                           │
│                    handleStartGeneration() → NEW AI DRAFT               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Details

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Update `handleBackToProfile` function to clear `aiDraft`, `aiSections`, `approvedSections`, and `analysis` before navigating back |

---

## User Experience

1. User is on "Review & Edit Patient Communication" page
2. User clicks "Patient Profile" button
3. User modifies patient attributes (e.g., changes language from English to Estonian)
4. User clicks "Generate AI Draft"
5. **New behavior**: AI generates a fresh document using the updated patient profile
6. User sees the newly generated sections tailored to the updated profile

