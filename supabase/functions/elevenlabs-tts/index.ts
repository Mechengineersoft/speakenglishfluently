import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Voice IDs for different accents
const VOICE_MAP: Record<string, string> = {
  // Indian voices
  "indian-female": "pFZP5JQG7iQjIQuC4Bku", // Lily - works well for Indian accent
  "indian-female-pure": "ThT5KcBeYPX3keUQqHPh", // Nicole - pure Indian accent
  "indian-male": "onwK4e9ZLuTAKqWW03F9", // Daniel
  // British voices
  "british-female": "EXAVITQu4vr4xnSDxMaL", // Sarah
  "british-male": "JBFqnCBsd6RMkjVDRZzb", // George
  // American voices
  "american-female": "cgSgspJ2msm6clMCkdW9", // Jessica
  "american-male": "cjVigY5qzO86Huf0OWal", // Eric
  // International voices
  "international-female": "XrExE9yKIg1WjnnlVkGX", // Matilda
  "international-male": "TX3LPaxmHKxFdv7VOQHJ", // Liam
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceKey } = await req.json();

    if (!text) {
      throw new Error("Text is required");
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Get voice ID from mapping or use default
    const voiceId = VOICE_MAP[voiceKey] || "EXAVITQu4vr4xnSDxMaL";
    
    console.log(`Generating speech for voice: ${voiceKey} (${voiceId})`);
    console.log(`Text length: ${text.length} characters`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`Generated audio size: ${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
