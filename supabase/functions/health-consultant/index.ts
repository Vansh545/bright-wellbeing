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
    const { profile, query, focusArea } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a knowledgeable and empathetic AI health consultant specializing in personalized wellness advice. Your role is to provide evidence-based recommendations while being supportive and encouraging.

IMPORTANT GUIDELINES:
- Always include a disclaimer that your advice is for educational purposes only and should not replace professional medical consultation
- Be specific and actionable in your recommendations
- Consider the user's profile information when providing advice
- Format your response with clear sections using markdown headers, bullet points, and tables where appropriate
- Be encouraging and supportive in your tone
- If the user mentions serious health concerns, always recommend consulting a healthcare professional

USER PROFILE:
- Age: ${profile.age || 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- Height: ${profile.height || 'Not specified'}
- Weight: ${profile.weight || 'Not specified'}
- Fitness Level: ${profile.fitnessLevel || 'Not specified'}
- Health Goals: ${profile.healthGoals || 'Not specified'}
- Medical Conditions: ${profile.medicalConditions || 'None mentioned'}
- Dietary Restrictions: ${profile.dietaryRestrictions || 'None mentioned'}

FOCUS AREA: ${focusArea}

Provide personalized, detailed recommendations based on the user's profile and focus area. Structure your response with:
1. Key insights
2. Specific action items or recommendations
3. A weekly plan or routine (if applicable)
4. Important notes and disclaimers`;

    console.log('Sending request to Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Successfully received AI response');

    return new Response(JSON.stringify({ result: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in health-consultant function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
