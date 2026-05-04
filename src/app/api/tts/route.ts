import { NextRequest, NextResponse } from 'next/server';
import { getPersona, injectMarkupTags, stripMarkupTags } from '@/lib/voice-persona-service';

export async function POST(req: NextRequest) {
  const { text, voiceKey } = await req.json();

  const googleKey = process.env.GOOGLE_TTS_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!googleKey && !geminiKey) {
    return NextResponse.json({ error: 'TTS not configured' }, { status: 500 });
  }

  const persona = getPersona(voiceKey);

  try {
    // Tentativa 1: Gemini-TTS (Se houver chave e quisermos tentar sem ffmpeg - nota: Gemini costuma retornar PCM)
    // Por simplicidade e compatibilidade sem ffmpeg, vamos focar no Google Cloud TTS Chirp3/Neural2 que retornam MP3/OGG prontos.
    
    // Tentativa 2: Chirp3-HD (Google Cloud TTS)
    if (googleKey) {
      const cleanText = stripMarkupTags(text);
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: cleanText },
            voice: { languageCode: 'pt-BR', name: persona.chirp3Voice },
            audioConfig: {
              audioEncoding: 'MP3', // MP3 é amplamente compatível
              speakingRate: persona.speakingRate,
              pitch: 0.0,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ audioContent: data.audioContent });
      }
    }

    // Tentativa 3: Neural2 Fallback
    if (googleKey) {
      const cleanText = stripMarkupTags(text);
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: cleanText },
            voice: { languageCode: 'pt-BR', name: persona.neural2Voice },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: persona.speakingRate,
              pitch: 0.0,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ audioContent: data.audioContent });
      }
    }

    return NextResponse.json({ error: 'Failed to synthesize audio' }, { status: 500 });
  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
