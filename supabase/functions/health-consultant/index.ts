import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const ProfileSchema = z.object({
  age: z.string().max(10).optional(),
  gender: z.string().max(20).optional(),
  height: z.string().max(20).optional(),
  weight: z.string().max(20).optional(),
  fitnessLevel: z.string().max(50).optional(),
  healthGoals: z.string().max(500).optional(),
  medicalConditions: z.string().max(500).optional(),
  dietaryRestrictions: z.string().max(500).optional(),
});

const RequestSchema = z.object({
  profile: ProfileSchema,
  query: z.string().min(1).max(2000),
  focusArea: z.string().max(50),
});

// Map frontend focus area IDs to CodeWords expected values
const focusAreaMap: Record<string, string> = {
  'fitness': 'Fitness',
  'nutrition': 'Nutrition',
  'skincare': 'Skincare',
  'wellness': 'General Wellness',
  'mental': 'Mental Health',
};

// Map frontend gender values to CodeWords expected values
const genderMap: Record<string, string> = {
  'male': 'Male',
  'female': 'Female',
  'other': 'Other',
  'prefer-not': 'Prefer not to say',
};

// Map frontend fitness level to CodeWords expected values
const fitnessLevelMap: Record<string, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
  'athlete': 'Athlete',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input. Please check your request data.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { profile, query, focusArea } = validationResult.data;
    const CODEWORDS_API_KEY = Deno.env.get('CODEWORDS_API_KEY');
    
    if (!CODEWORDS_API_KEY) {
      throw new Error('CODEWORDS_API_KEY is not configured');
    }

    console.log('Sending request to CodeWords AI Health Consultant...');

    // Build the request body for CodeWords API
    const requestBody = {
      age: parseInt(profile.age || '25') || 25,
      gender: genderMap[profile.gender || ''] || 'Prefer not to say',
      height: profile.height || 'Not specified',
      weight: profile.weight || 'Not specified',
      fitness_level: fitnessLevelMap[profile.fitnessLevel || ''] || 'Beginner',
      health_goals: profile.healthGoals || 'General wellness improvement',
      medical_conditions: profile.medicalConditions || 'None',
      dietary_restrictions: profile.dietaryRestrictions || 'None',
      health_query: query,
      focus_area: focusAreaMap[focusArea] || 'General Wellness',
    };

    console.log('CodeWords request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://runtime.codewords.ai/run/ai_health_consultant_a8018af1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CODEWORDS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CodeWords API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 401 || response.status === 403) {
        return new Response(JSON.stringify({ error: 'Authentication failed. Please check your API key.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`CodeWords API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully received CodeWords AI response');

    return new Response(JSON.stringify({ 
      result: data.consultation,
      focus_area: data.focus_area,
      disclaimer: data.disclaimer,
      tokens_used: data.tokens_used 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in health-consultant function:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
