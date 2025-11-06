/**
 * REFERENCE COPY: Medical Communicator AI Prompts
 * 
 * This is a read-only reference copy of the prompts used in the backend edge function.
 * The actual prompts used by the AI are stored in:
 * supabase/functions/generate-patient-draft/prompts/medical-communicator-prompt.ts
 * 
 * This file exists for visibility and documentation purposes.
 * Any changes should be made to the backend version.
 */

export const PROMPT_DOCUMENTATION = `
The medical communicator AI uses a comprehensive prompt system designed to:

1. SYSTEM PROMPT:
   - Defines the AI's role as an expert medical communicator
   - Sets core principles: clarity, empathy, accuracy, personalization, safety
   - Establishes the 7-section output structure

2. PERSONALIZATION INSTRUCTIONS:
   Generated dynamically based on patient profile:
   - Health Literacy (low/medium/high) → vocabulary and sentence complexity
   - Age → life concerns and communication style
   - Journey Type (emergency/first-time/chronic) → tone and depth
   - Risk Appetite → level of detail provided

3. SECTION GUIDELINES:
   Specific instructions for each of the 7 sections:
   - What do I have? (diagnosis explanation)
   - How should I live next? (lifestyle changes)
   - How will the next 6 months look? (short-term prognosis)
   - What does this mean for my life? (long-term impact)
   - My Medications (drug information)
   - My Contacts (care team information)
   - Warning Signs (emergency symptoms)

4. LANGUAGE-SPECIFIC GUIDELINES:
   - Estonian: Formal "Teie" form, modest communication
   - Russian: Formal "Вы" form, direct style
   - English: Professional warmth, international awareness

5. SAFETY RULES:
   - Never speculate or hallucinate medical information
   - Acknowledge gaps explicitly
   - Always include emergency contact information
   - Emphasize medication adherence safety

EXAMPLE PERSONALIZATION FLOW:

For a 70-year-old patient with low health literacy in Estonian:
- Very simple vocabulary (5th-grade level)
- Short sentences (10-15 words max)
- Formal "Teie" address
- Focus on independence and mobility concerns
- Avoid medical jargon entirely
- Use everyday analogies
- Larger conceptual spacing in formatting

For a 35-year-old patient with high health literacy in English:
- Professional medical terminology with context
- Longer, detailed explanations
- Address career and family planning impact
- Can include statistics and percentages
- More technical depth acceptable

STRUCTURED OUTPUT FORMAT:

═══════════════════════════════════════════════════
SECTION TITLE (in patient's language)
═══════════════════════════════════════════════════

[Content personalized to patient profile]

[Repeated for all 7 sections]

PROMPT FILES LOCATION:
Backend (Active): supabase/functions/generate-patient-draft/prompts/medical-communicator-prompt.ts
Frontend (Reference): src/config/patient-communication-prompt.ts (this file)

TO VIEW THE ACTUAL PROMPTS:
See the backend file for the complete, active prompt templates.
`;

export const PROMPT_PRINCIPLES = {
  clarity: "Simple language over medical jargon",
  empathy: "Warm and supportive without patronizing",
  accuracy: "Never hallucinate; acknowledge uncertainty",
  personalization: "Adapt to literacy, age, language, emotional state",
  safety: "Emphasize medications, warning signs, emergency contacts",
  transparency: "Acknowledge gaps in information explicitly"
};

export const SECTION_STRUCTURE = [
  "1. What do I have? (The Illness)",
  "2. How should I live next? (Lifestyle Changes)",
  "3. How will the next 6 months look? (Short-Term Prognosis)",
  "4. What does this mean for my life? (Long-Term Consequences)",
  "5. My Medications",
  "6. My Contacts",
  "7. Warning Signs"
];
