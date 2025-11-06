import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  SYSTEM_PROMPT, 
  getPersonalizationInstructions,
  getSectionGuidelines,
  getLanguageSpecificGuidelines,
  SAFETY_RULES,
  PatientProfile
} from "../generate-patient-draft/prompts/medical-communicator-prompt.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      sectionIndex, 
      sectionTitle, 
      currentContent,
      analysis, 
      patientData, 
      technicalNote 
    } = await req.json();

    console.log('Regenerating section:', sectionTitle, 'at index:', sectionIndex);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build patient profile
    const profile: PatientProfile = {
      age: parseInt(patientData.age) || 50,
      sex: patientData.sex || 'other',
      healthLiteracy: patientData.healthLiteracy || 'medium',
      language: patientData.language || 'english',
      journeyType: patientData.journeyType,
      comorbidities: patientData.comorbidities?.join(', '),
      smokingStatus: patientData.smokingStatus,
      riskAppetite: patientData.riskAppetite || 'moderate'
    };

    // Format analysis data
    const analysisText = analysis ? `
EXTRACTED MEDICAL INFORMATION:
- Primary Diagnosis: ${analysis.primaryDiagnosis || 'Not specified'}
- Secondary Diagnoses: ${analysis.secondaryDiagnoses?.join(', ') || 'None'}
- Medications: ${analysis.medications?.join(', ') || 'None listed'}
- Procedures: ${analysis.procedures?.join(', ') || 'None'}
- Test Results: ${analysis.testResults?.join(', ') || 'None'}
- Lifestyle Recommendations: ${analysis.lifestyleRecommendations?.join(', ') || 'None'}
- Follow-up Plans: ${analysis.followUpPlans?.join(', ') || 'None'}
- Warning Signs: ${analysis.warningSignsMentioned?.join(', ') || 'None'}
- Emergency Contacts: ${analysis.emergencyContacts?.join(', ') || 'None'}
` : 'No structured analysis available.';

    // Build focused prompt for this specific section
    const userPrompt = `
TECHNICAL NOTE:
${technicalNote}

${analysisText}

PATIENT PROFILE:
- Age: ${profile.age}
- Sex: ${profile.sex}
- Language: ${profile.language}
- Health Literacy: ${profile.healthLiteracy}
- Journey Type: ${profile.journeyType || 'not specified'}
- Comorbidities: ${profile.comorbidities || 'none'}
- Risk Appetite: ${profile.riskAppetite}

${getPersonalizationInstructions(profile)}

${getSectionGuidelines(profile.language)}

${getLanguageSpecificGuidelines(profile.language)}

${SAFETY_RULES}

CRITICAL INSTRUCTIONS:
- You are regenerating ONLY this section: "${sectionTitle}"
- Focus exclusively on the content for this section
- Do NOT include section separators or dividers
- Do NOT include the section title
- Do NOT generate content for other sections
- Return ONLY the paragraph text that belongs in this section
- Use all the medical information provided above to answer this specific question
- Follow all personalization requirements for this patient

Current content (for context):
${currentContent || '(empty)'}

Generate improved content for the section "${sectionTitle}" in ${profile.language}.`;

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const regeneratedContent = data.choices[0].message.content.trim();

    console.log('Section regenerated successfully');

    return new Response(
      JSON.stringify({ regeneratedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in regenerate-section:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
