# Careboks - AI Communication Tool for Cardiac Patients

A proof-of-concept tool that transforms complex technical clinical notes into clear, personalised, patient-friendly explanations of cardiac conditions.

## 🎯 Project Overview

Careboks helps clinicians communicate complex medical information in a clear, structured, patient-appropriate format. The system adapts content to patient attributes (age, sex, health literacy, comorbidities, language, etc.) and ensures clinical safety via mandatory clinician approval before communication.

**Supported Languages:** Estonian, Russian, English

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Rich Text | TipTap editor |
| Backend | Lovable Cloud (Supabase) |
| AI | Google Gemini via Lovable AI |
| PDF Processing | pdf.js, OCR via edge functions |

## 📦 Setup Guide

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install
```

### Environment Variables

The following variables are automatically configured by Lovable Cloud:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 🔄 Application Workflow

### 5-Step Document Generation Process

```
Input → Patient Profile → Clinician Approval → Print Preview → Feedback
```

1. **Technical Note Input** - Paste clinical notes or upload PDF/images with automatic OCR
2. **Patient Profile** - Collect patient attributes for personalisation
3. **Clinician Approval** - AI generates document; clinician reviews and edits
4. **Print Preview** - View A4 document, print, and publish shareable link
5. **Feedback** - Collect clinician feedback on the generated document

## 🏗️ Architecture

### Frontend Structure

```
src/
├── pages/
│   ├── Index.tsx           # Main 5-step workflow
│   ├── Landing.tsx         # Public landing page
│   ├── Auth.tsx            # Authentication
│   ├── Account.tsx         # User settings
│   ├── PrintPreview.tsx    # A4 document preview
│   ├── PatientDocument.tsx # Public patient document view
│   └── NotFound.tsx        # 404 page
├── components/
│   ├── TechnicalNoteInput  # Step 1: Note input with OCR
│   ├── PatientProfile      # Step 2: Patient attributes
│   ├── ClinicianApproval   # Step 3: AI review & approval
│   ├── Feedback            # Step 5: Feedback collection
│   ├── print/              # Print-specific components
│   ├── account/            # Account management sections
│   └── ui/                 # shadcn/ui components
├── hooks/
│   ├── useCasePersistence  # Database CRUD operations
│   └── usePublishedDocument # Document publishing
└── utils/
    ├── draftParser         # Section parsing
    ├── structuredDocumentParser # JSON parsing
    └── pdfTextExtraction   # PDF utilities
```

### Backend Functions

| Function | Purpose |
|----------|---------|
| `generate-patient-document-v2` | AI document generation with structured output |
| `regenerate-section` | Single section regeneration |
| `extract-text-from-document` | OCR/PDF text extraction |

### Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts with name, email, role, language |
| `patient_cases` | Case tracking with status workflow |
| `patient_profiles` | Patient attributes linked to cases |
| `ai_analyses` | Stored AI drafts and analysis data |
| `approvals` | Clinician approval records with audit trail |
| `published_documents` | Published patient documents with access tokens |
| `case_feedback` | Clinician feedback on generated documents |
| `patient_feedback` | Patient comprehension feedback |
| `clinician_contacts` | Hospital contact directory |
| `user_documents` | Uploaded file metadata |

#### Case Status Flow

```
draft → processing → pending_approval → approved → completed
```

## 📝 Output Document Structure

The AI generates 7 personalised sections:

1. **What do I have** - Plain-language diagnosis explanation
2. **How should I live next** - Lifestyle changes and physical activity
3. **Next 6 months** - Short-term recovery expectations
4. **What it means for my life** - Long-term consequences
5. **My medications** - Drug list with purpose and importance
6. **Warning signs** - Symptoms requiring medical attention
7. **My contacts** - Relevant hospital contacts

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Publish via Lovable

Use the "Publish" button in the Lovable interface to deploy to production.

## 🔐 Security

- **Row Level Security (RLS)** on all database tables
- Users can only access their own cases and data
- Clinician approval required before patient communication
- Audit trail for all approvals
- No unapproved outputs reach patients

## 🔗 Links

- **Preview:** https://id-preview--423bb879-b2c1-4d85-a117-0bbe70a9ea66.lovable.app
- **Published:** https://careboks.lovable.app
- **Lovable Project:** https://lovable.dev/projects/423bb879-b2c1-4d85-a117-0bbe70a9ea66

## 📄 License

This project is a proof-of-concept for healthcare communication improvement.
