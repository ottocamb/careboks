
# Implementation Plan: Custom Print Template from Figma Design

## Design Analysis

Based on your Figma design, I've identified a two-page A4 layout with the following structure:

### Page 1 Layout
| Section | Border Color | Content Type |
|---------|--------------|--------------|
| **Header** | None | "Your next steps after discharge" + Careboks branding + Hospital logo |
| **WHAT DO I HAVE?** | Teal/Turquoise left border | Condition explanation with medical terms |
| **HOW THE NEXT 6 MONTHS...** | Teal left border | Timeline expectations, upcoming procedures |
| **HOW SHOULD I LIVE?** | White/Light background | Subsections: Activity & pacing, Daily habits, Diet & fluids, Alcohol & smoking, Weight & self-checks, Social & emotional wellbeing |
| **WHAT DOES IT MEAN FOR MY LIFE?** | Teal left border | Long-term implications |

### Page 2 Layout
| Section | Border/Style | Content Type |
|---------|--------------|--------------|
| **MY MEDICATIONS** | Pink/Coral left border | Medication list with "if not taken" consequences |
| **WARNING SIGNS** | Red/Coral background | Urgent symptoms requiring medical attention |
| **MY CONTACTS** | Teal background | Phone numbers with categories, Emergency Contact highlighted |
| **Feedback QR** | Small box | QR code for patient feedback |
| **Signed by** | Signature area | Clinician signature and date |

### Visual Design Elements
- Decorative heart/stethoscope illustrations in corners
- Clean, accessible fonts with good line height
- High contrast for readability
- Color-coded sections for quick scanning
- A4 paper optimization with proper margins

---

## Implementation Architecture

### New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/PrintPreview.tsx` | Clinician preview page with publish functionality |
| `src/pages/PatientDocument.tsx` | Public patient view (accessible via token) |
| `src/components/print/PrintableDocument.tsx` | Core styled layout matching Figma |
| `src/components/print/PrintSection.tsx` | Individual section component with color variants |
| `src/components/print/PrintHeader.tsx` | Document header with branding |
| `src/components/print/PrintMedications.tsx` | Specialized medication section layout |
| `src/components/print/PrintContacts.tsx` | Contacts section with emergency highlight |
| `src/components/print/PrintFooter.tsx` | Signature, QR code, feedback area |
| `src/components/QRCodeDisplay.tsx` | QR code generation component |
| `src/hooks/usePublishedDocument.ts` | Database operations for published docs |
| `src/styles/print.css` | Print-specific CSS with @media print rules |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes: `/app/print-preview/:caseId` and `/document/:accessToken` |
| `src/components/ClinicianApproval.tsx` | Navigate to print preview instead of window.print() |
| `src/index.css` | Import print.css styles |

---

## Database Changes

### New Table: `published_documents`

```sql
CREATE TABLE public.published_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES patient_cases(id),
  created_by UUID NOT NULL,
  access_token TEXT NOT NULL UNIQUE,
  sections_data JSONB NOT NULL,
  patient_language TEXT NOT NULL DEFAULT 'est',
  clinician_name TEXT NOT NULL,
  hospital_name TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- RLS Policies
-- Clinicians can manage their own documents
-- Public can SELECT with valid access_token (for patient view)
```

---

## Component Design Details

### PrintableDocument.tsx
Main container matching Figma's two-page A4 layout:
- Uses CSS Grid for section positioning
- Handles page breaks between pages
- Applies Figma's color scheme via CSS variables
- Renders Markdown content properly

### Color Scheme (from Figma)

| Element | Color | CSS Variable |
|---------|-------|--------------|
| Teal sections (What I have, 6 months, Contacts) | `#14B8A6` | `--print-teal` |
| Pink sections (Medications) | `#F472B6` | `--print-pink` |
| Red sections (Warning signs) | `#EF4444` | `--print-red` |
| Emergency contact highlight | `#14B8A6` with dark bg | `--print-emergency` |
| Text color | `#1F2937` | `--print-text` |
| Background | `#FFFFFF` | `--print-bg` |

### Typography (A4 optimized)

| Element | Size | Weight |
|---------|------|--------|
| Document title | 24pt | Bold |
| Section headers | 14pt | Bold, uppercase |
| Body text | 11pt | Regular |
| Medication names | 12pt | Bold |
| Contact numbers | 12pt | Regular |

---

## User Flow

### Clinician Flow
```text
[ClinicianApproval] 
    → Click "Print Preview" 
    → Navigate to /app/print-preview/:caseId
    → Review styled document
    → Option A: "Print" → Browser print dialog
    → Option B: "Publish" → Save to DB, generate token
    → Copy link / Show QR code
    → Return to Feedback page
```

### Patient Flow
```text
[Receive printed document with QR code]
    OR
[Receive link from clinician]
    → Scan QR / Click link
    → Opens /document/:accessToken
    → View personalized document
    → Optional: Print from device
```

---

## Technical Implementation

### Access Token Generation
- 12-character URL-safe random string
- Example: `x7Km2pQr9sYz`
- Full URL: `https://careboks.lovable.app/document/x7Km2pQr9sYz`

### Print CSS Strategy
```css
@media print {
  @page {
    size: A4;
    margin: 15mm;
  }
  
  .print-page-1 {
    page-break-after: always;
  }
  
  .no-print {
    display: none !important;
  }
}
```

### QR Code Implementation
- Install `qrcode.react` package
- Generate QR with document URL
- Display in print footer area

---

## Dependencies to Add

| Package | Purpose |
|---------|---------|
| `qrcode.react` | Generate QR codes for shareable links |

---

## Implementation Order

1. **Database**: Create `published_documents` table with RLS policies
2. **Styles**: Create `src/styles/print.css` with Figma colors and typography
3. **Components**: Build print components bottom-up:
   - `PrintSection.tsx` (base component)
   - `PrintHeader.tsx`
   - `PrintMedications.tsx`
   - `PrintContacts.tsx`
   - `PrintFooter.tsx`
   - `PrintableDocument.tsx` (assembles all)
4. **QR Code**: Add `QRCodeDisplay.tsx` component
5. **Hook**: Create `usePublishedDocument.ts` for database operations
6. **Pages**: 
   - `PrintPreview.tsx` (authenticated)
   - `PatientDocument.tsx` (public)
7. **Routing**: Update `App.tsx` with new routes
8. **Integration**: Update `ClinicianApproval.tsx` to navigate to preview

---

## Section Mapping

| Figma Section | Data Source | Notes |
|---------------|-------------|-------|
| What do I have | `sections[0]` | May need to split for 6-month section |
| How next 6 months | `sections[2]` | Timeline focus |
| How should I live | `sections[1]` | Multiple subsections in Figma |
| What does it mean | `sections[3]` | Long-term implications |
| My medications | `sections[4]` | Special formatting with "if not taken" |
| Warning signs | `sections[5]` | Red styling, urgent tone |
| My contacts | `sections[6]` | Emergency contact highlighted |

---

## Accessibility Considerations

- Large font sizes (11-14pt) for elderly patients
- High contrast colors (WCAG AA compliant)
- Clear section boundaries with colored borders
- Icons/decorations for visual scanning
- QR code for digital access option

---

## Security Notes

- Access tokens are cryptographically random
- Documents can be deactivated by clinician
- No patient identifiable info in URLs
- View count tracking for audit
- Optional expiry dates supported
