import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { technicalNote, patientData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical document analysis assistant. Analyze clinical notes and extract information into 7 specific categories for patient communication. For each category, provide:
1. Extracted Information: Bulleted list of relevant data from the document
2. Gaps & Physician Prompts: What information is missing or needs clarification

Be thorough, precise, and flag any ambiguities that require physician input.`;

    const userPrompt = `Analyze this clinical note and patient profile:

CLINICAL NOTE:
${technicalNote}

PATIENT PROFILE:
- Age: ${patientData.age}
- Health Literacy: ${patientData.healthLiteracy}
- Language: ${patientData.language}
- Comorbidities: ${patientData.comorbidities || 'None listed'}
- Journey Type: ${patientData.journeyType || 'Not specified'}
- Mental State: ${patientData.mentalState || 'Not specified'}

Extract and structure information for the 7 categories.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "structure_medical_analysis",
              description: "Structure the medical document analysis into 7 categories with extracted info and gaps",
              parameters: {
                type: "object",
                properties: {
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { 
                          type: "string",
                          enum: [
                            "What do I have? (The Illness)",
                            "How should I live next? (Lifestyle Changes)",
                            "How will the next 6 months look? (Short-Term Prognosis)",
                            "What does this mean for my life? (Long-Term Consequences)",
                            "My Medications",
                            "My Contacts",
                            "Warning Signs"
                          ]
                        },
                        extractedInfo: {
                          type: "array",
                          items: { type: "string" },
                          description: "Bulleted list of extracted information"
                        },
                        gaps: {
                          type: "array",
                          items: { type: "string" },
                          description: "Missing information and physician prompts"
                        }
                      },
                      required: ["name", "extractedInfo", "gaps"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["categories"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "structure_medical_analysis" } }
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
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No structured output received from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-medical-note:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
