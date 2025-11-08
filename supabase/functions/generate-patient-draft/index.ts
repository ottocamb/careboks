// ⚠️ DEPRECATED: This function is no longer used in production.
// Replaced by generate-patient-document-v2 (single-stage pipeline)
// Kept for historical reference only. Safe to delete after 2025-12-01.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  SYSTEM_PROMPT,
  getPersonalizationInstructions,
  getSectionGuidelines,
  getLanguageSpecificGuidelines,
  SAFETY_RULES,
  type PatientProfile,
} from "./prompts/medical-communicator-prompt.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis, patientData, technicalNote } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating patient draft for:", { 
      language: patientData.language, 
      literacy: patientData.healthLiteracy 
    });

    // Build comprehensive prompt
    const patientProfile: PatientProfile = {
      age: patientData.age || 65,
      sex: patientData.sex || 'other',
      healthLiteracy: patientData.healthLiteracy || 'medium',
      language: patientData.language || 'english',
      journeyType: patientData.journeyType,
      comorbidities: patientData.comorbidities,
      smokingStatus: patientData.smokingStatus,
      riskAppetite: patientData.riskAppetite || 'moderate',
    };

    // Format the extracted categories for the AI
    const formattedCategories = analysis.categories.map((cat: any) => {
      return `
CATEGORY: ${cat.name}
Extracted Information:
${cat.extractedInfo.map((info: string) => `• ${info}`).join('\n')}

Gaps & Missing Information:
${cat.gaps.map((gap: string) => `• ${gap}`).join('\n')}
`;
    }).join('\n---\n');

    const userPrompt = `Generate a patient-friendly medical communication document based on the following:

TECHNICAL NOTE:
${technicalNote}

EXTRACTED CATEGORIES:
${formattedCategories}

PATIENT PROFILE:
- Age: ${patientProfile.age}
- Sex: ${patientProfile.sex}
- Health Literacy: ${patientProfile.healthLiteracy}
- Language: ${patientProfile.language}
- Journey Type: ${patientProfile.journeyType || 'Not specified'}
- Comorbidities: ${patientProfile.comorbidities || 'None'}
- Smoking Status: ${patientProfile.smokingStatus || 'Not specified'}

${getPersonalizationInstructions(patientProfile)}

${getSectionGuidelines(patientProfile.language)}

${getLanguageSpecificGuidelines(patientProfile.language)}

${SAFETY_RULES}

Generate the complete patient communication document in ${patientProfile.language} language with all 7 sections properly formatted.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const generatedDraft = data.choices?.[0]?.message?.content;
    
    if (!generatedDraft) {
      throw new Error("No draft content received from AI");
    }

    console.log("Draft generated successfully, length:", generatedDraft.length);

    return new Response(JSON.stringify({ 
      draft: generatedDraft,
      model: "google/gemini-2.5-flash"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-patient-draft:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
