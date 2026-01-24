import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const WorkoutEntrySchema = z.object({
  date: z.string().max(50),
  type: z.string().max(50),
  duration: z.number().min(0).max(1440).optional(),
  duration_minutes: z.number().min(0).max(1440).optional(),
  calories: z.number().min(0).max(50000).optional(),
  notes: z.string().max(500).optional(),
});

const SkincareEntrySchema = z.object({
  routineType: z.string().max(50).optional(),
  routine_type: z.string().max(50).optional(),
  products: z.array(z.string().max(100)).max(20).optional(),
  products_used: z.array(z.string().max(100)).max(20).optional(),
  condition: z.string().max(50).optional(),
  skin_condition: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

const RequestSchema = z.object({
  fitness_level: z.string().max(50).optional(),
  primary_goal: z.string().max(200).optional(),
  weight_goal: z.string().max(100).optional(),
  workouts: z.array(WorkoutEntrySchema).max(100).optional(),
  skincare_routines: z.array(SkincareEntrySchema).max(100).optional(),
  generate_exercise_plan: z.boolean().optional(),
  generate_skincare_tips: z.boolean().optional(),
});

interface WorkoutEntry {
  date: string;
  type: string;
  duration_minutes: number;
  calories: number;
  notes: string;
}

interface SkincareEntry {
  routine_type: string;
  products_used: string[];
  skin_condition: string;
  notes: string;
}

// Map workout types to CodeWords expected values
const workoutTypeMap: Record<string, string> = {
  'cardio': 'Cardio',
  'strength': 'Strength',
  'yoga': 'Yoga',
  'hiit': 'HIIT',
  'sports': 'Sports',
  'walking': 'Walking',
  'other': 'Other',
};

// Map skin conditions to CodeWords expected values
const skinConditionMap: Record<string, string> = {
  'excellent': 'Excellent',
  'good': 'Good',
  'fair': 'Fair',
  'needs-attention': 'Needs Attention',
};

// Map routine types to CodeWords expected values
const routineTypeMap: Record<string, string> = {
  'morning': 'Morning',
  'evening': 'Evening',
  'weekly': 'Weekly Treatment',
};

// Map fitness levels to CodeWords expected values
const fitnessLevelMap: Record<string, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

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
    
    const { 
      fitness_level,
      primary_goal,
      weight_goal,
      workouts,
      skincare_routines,
      generate_exercise_plan,
      generate_skincare_tips
    } = validationResult.data;
    
    const CODEWORDS_API_KEY = Deno.env.get('CODEWORDS_API_KEY');
    
    if (!CODEWORDS_API_KEY) {
      throw new Error('CODEWORDS_API_KEY is not configured');
    }

    console.log('Sending request to CodeWords Personal Health Hub...');

    // Transform workouts to CodeWords format
    const transformedWorkouts: WorkoutEntry[] = (workouts || []).map((w) => ({
      date: typeof w.date === 'string' ? w.date : new Date(w.date).toISOString().split('T')[0],
      type: workoutTypeMap[w.type] || 'Other',
      duration_minutes: w.duration || w.duration_minutes || 0,
      calories: w.calories || 0,
      notes: w.notes || '',
    }));

    // Transform skincare routines to CodeWords format
    const transformedSkincareRoutines: SkincareEntry[] = (skincare_routines || []).map((s) => ({
      routine_type: routineTypeMap[s.routineType || ''] || routineTypeMap[s.routine_type || ''] || 'Morning',
      products_used: Array.isArray(s.products) ? s.products : (s.products_used || []),
      skin_condition: skinConditionMap[s.condition || ''] || skinConditionMap[s.skin_condition || ''] || 'Good',
      notes: s.notes || '',
    }));

    const requestBody = {
      fitness_level: fitnessLevelMap[fitness_level || ''] || fitness_level || 'Beginner',
      primary_goal: primary_goal || 'General fitness',
      weight_goal: weight_goal || '',
      workouts: transformedWorkouts,
      skincare_routines: transformedSkincareRoutines,
      generate_exercise_plan: generate_exercise_plan ?? false,
      generate_skincare_tips: generate_skincare_tips ?? false,
    };

    console.log('CodeWords request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://runtime.codewords.ai/run/personal_health_hub_961e9d3a', {
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
    console.log('Successfully received CodeWords Personal Health Hub response');

    return new Response(JSON.stringify({
      fitness_metrics: data.fitness_metrics,
      progress_insights: data.progress_insights,
      exercise_plan: data.exercise_plan,
      skincare_recommendations: data.skincare_recommendations,
      summary: data.summary,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in personal-health-hub function:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
