import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(5000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
  userName: z.string().max(50).optional(),
});

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
    
    const { messages, userName } = validationResult.data;
    const CODEWORDS_API_KEY = Deno.env.get('CODEWORDS_API_KEY');
    
    if (!CODEWORDS_API_KEY) {
      throw new Error('CODEWORDS_API_KEY is not configured');
    }

    // Get the latest user message
    const userMessages = messages.filter((msg) => msg.role === 'user');
    const latestMessage = userMessages[userMessages.length - 1]?.content || '';

    // Prepare conversation history for CodeWords API
    const conversationHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    console.log('Sending chat request to CodeWords AI Health Chatbot...');

    const response = await fetch('https://runtime.codewords.ai/run/ai_health_chatbot_a1b0473f', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CODEWORDS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: latestMessage,
        conversation_history: conversationHistory,
        user_name: userName || 'User',
      }),
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
    console.log('Successfully received CodeWords chat response');

    return new Response(JSON.stringify({ 
      response: data.response,
      tokens_used: data.tokens_used 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in wellness-chat function:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
