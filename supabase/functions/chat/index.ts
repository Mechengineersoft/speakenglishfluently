import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, voiceName, voiceAccent, targetLanguage } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are ${voiceName || 'an AI assistant'}, a professional English language assistant speaking with a ${voiceAccent || 'neutral'} accent. You help users practice English conversation, learn vocabulary, and improve their language skills.

Your personality traits:
- Warm, patient, and encouraging
- Professional yet friendly
- Clear and articulate in your responses
- Culturally aware and respectful

Your capabilities:
- Engage in natural English conversation
- Help with pronunciation tips (describe how words should sound)
- Explain grammar rules clearly
- Provide translations between English, Hindi (हिंदी), and Urdu (اردو)
- Suggest vocabulary and idioms appropriate to the accent you represent

Current translation mode: ${targetLanguage === 'hindi' ? 'Include Hindi translations for key phrases' : targetLanguage === 'urdu' ? 'Include Urdu translations for key phrases' : 'English only'}

Guidelines:
- Keep responses conversational and natural
- If asked to translate, provide accurate translations
- Use appropriate formality based on context
- Be helpful with language learning questions
- Keep responses concise but informative (2-4 sentences typically)`;

    console.log(`Chat request with voice: ${voiceName}, accent: ${voiceAccent}, language: ${targetLanguage}`);

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
          ...messages,
        ],
        stream: true,
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
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
