
# Feedback Page Implementation Plan

## Overview
Update the ClinicianApproval page layout and create a new Feedback page to collect clinician feedback on the most useful patient communication features.

---

## Changes Summary

### 1. Update ClinicianApproval.tsx Layout

**Current State (lines 455-483):**
- Clinician name input and action buttons are in the same Card component
- "Sign with Smart ID" button leads to approval

**New Layout:**
- **Separate Card for Clinician Name**: Visual distinction with its own header
- **Separate Card for Action Buttons**: Contains three buttons
- Replace "Sign with Smart ID" button with "Feedback" button that navigates to feedback step

### 2. Add New Feedback Step

**Workflow Change:**
- Current: `input` → `profile` → `approval` → `output`
- New: `input` → `profile` → `approval` → `feedback` → `output`

**Feedback Page Features:**
- Question: "Based on your experience, which feature do you consider most useful for patients?"
- Checkbox options (multi-select):
  - What do I have
  - How should I live next
  - How the next 6 months of my life look like
  - What does it mean for my life
  - My medications
  - Warning signs
  - General Notes

**Three Action Buttons:**
1. **Rewrite** - Resets all checkbox selections
2. **Submit** - Placeholder (does nothing for now)
3. **Next Careboks** - Resets entire workflow and returns to Technical Note Input page

---

## Technical Details

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Index.tsx` | Modify | Add 'feedback' step, update workflow handlers |
| `src/components/ClinicianApproval.tsx` | Modify | Split Approval Controls into two Cards, replace "Sign with Smart ID" with "Feedback" |
| `src/components/Feedback.tsx` | Create | New feedback component with checkbox form |

### Updated Workflow Types
```text
type Step = 'input' | 'profile' | 'approval' | 'feedback' | 'output';
```

### Feedback Component Props
```text
interface FeedbackProps {
  onBack: () => void;           // Return to approval step
  onRestart: () => void;        // Reset entire workflow (Next Careboks)
}
```

### State Management
- Selected options stored in local component state (array of strings)
- No database persistence for PoC (Submit does nothing)

---

## Visual Layout

### ClinicianApproval - New Approval Section
```text
+------------------------------------------+
|  Approving Clinician                     |
|  ----------------------------------------|
|  Approving Clinician Name *              |
|  [ Dr. Jane Smith                      ] |
+------------------------------------------+

+------------------------------------------+
|  Action Buttons                          |
|  ----------------------------------------|
|  [ Patient Profile ] [ Print Preview ]   |
|  [ Feedback ]                            |
+------------------------------------------+
```

### Feedback Page Layout
```text
+------------------------------------------+
|  Feedback                                |
|  ----------------------------------------|
|  Based on your experience, which feature |
|  do you consider most useful for         |
|  patients?                               |
|                                          |
|  [ ] What do I have                      |
|  [ ] How should I live next              |
|  [ ] How the next 6 months...            |
|  [ ] What does it mean for my life       |
|  [ ] My medications                      |
|  [ ] Warning signs                       |
|  [ ] General Notes                       |
|                                          |
|  [ Rewrite ] [ Submit ] [ Next Careboks ]|
+------------------------------------------+
```

---

## Implementation Steps

1. **Create Feedback Component** (`src/components/Feedback.tsx`)
   - Add checkbox list with all 7 options
   - Implement Rewrite button to clear selections
   - Add Submit button (placeholder)
   - Add Next Careboks button with restart handler

2. **Update Index.tsx**
   - Add 'feedback' step to workflow
   - Add navigation handlers for feedback transitions
   - Connect handleRestart to Next Careboks

3. **Update ClinicianApproval.tsx**
   - Split bottom Card into two separate Cards
   - Replace "Sign with Smart ID" with "Feedback" button
   - Update onApprove callback to navigate to feedback

