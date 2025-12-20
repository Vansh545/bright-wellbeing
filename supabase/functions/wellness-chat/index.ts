import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userName } = await req.json();
    const CODEWORDS_API_KEY = Deno.env.get('CODEWORDS_API_KEY');
    
    if (!CODEWORDS_API_KEY) {
      throw new Error('CODEWORDS_API_KEY is not configured');
    }

    // Get the latest user message
    const userMessages = messages.filter((msg: ConversationMessage) => msg.role === 'user');
    const latestMessage = userMessages[userMessages.length - 1]?.content || '';

    // Prepare conversation history for CodeWords API
    const conversationHistory: ConversationMessage[] = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
