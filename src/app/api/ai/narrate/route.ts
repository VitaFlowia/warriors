import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actionContext, waveContext, heroNames, roundNumber, narrativeType } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback when no API key
      return NextResponse.json({ narrative: actionContext || 'A batalha continua...' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    let prompt: string;

    if (narrativeType === 'wave_intro') {
      // Wave introduction narrative
      prompt = `Você é o Mestre Narrador do jogo RPG Dark Fantasy "Sá Pires Warriors", ambientado em Porto das Brumas — um porto amaldiçoado pela Maré Negra.

CONTEXTO DA ONDA: ${waveContext}
HERÓIS PRESENTES: ${heroNames || 'Guerreiros de Porto das Brumas'}
RODADA: ${roundNumber || 1}

Gere uma introdução narrativa épica para esta onda de inimigos. 2-3 parágrafos curtos. Estilo: sombrio, visceral, atmosférico.
Use sons, cheiros e sensações táteis. Mencione a névoa, o mar, e o abismo.
NÃO use listas ou formatação — apenas prosa narrativa pura.
Escreva em português brasileiro.`;
    } else if (narrativeType === 'post_battle') {
      // Post-battle AI continuation
      prompt = `Você é o Mestre Narrador do jogo RPG "Sá Pires Warriors".
Os guerreiros acabaram de vencer uma batalha em Porto das Brumas.

CONTEXTO: ${actionContext}
HERÓIS: ${heroNames || 'Os sete guerreiros'}

Gere um EPÍLOGO narrativo de 2 parágrafos. O que acontece DEPOIS da batalha?
Pode mencionar: NPCs reagindo (Dona Bruma, Gor, A Guardiã), o estado do porto, presságios do futuro, 
pequenos detalhes atmosféricos (névoa, mar, vento).
Tom: melancólico mas esperançoso. Dark fantasy com humanidade.
NÃO revele spoilers sobre futuras ondas. Mantenha suspense.
Escreva em português brasileiro.`;
    } else {
      // Combat narration (default)
      prompt = `Você é o Mestre Narrador do RPG Dark Fantasy "Sá Pires Warriors", ambientado em Porto das Brumas.
Narração de combate em 1-2 frases CURTAS, vívidas e cinematográficas.

AÇÃO: ${actionContext}
RODADA: ${roundNumber || '?'}

Regras:
- Máximo 2 frases
- Use sensações: névoa, sal, frio, metal, sangue negro
- Varie o estilo: às vezes brutal, às vezes poético
- Mencione o ambiente (ruas, fogo, pedras, cais)
- NÃO repita estruturas de frase
Escreva em português brasileiro.`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 300,
          topP: 0.95,
        }
      })
    });

    const data = await response.json();
    const narrativeText = data.candidates?.[0]?.content?.parts?.[0]?.text || "A névoa obscureceu o que aconteceu.";

    return NextResponse.json({ narrative: narrativeText.trim() });

  } catch (error) {
    console.error('Error generating AI narrative:', error);
    return NextResponse.json({ narrative: 'A batalha continua nas sombras de Porto das Brumas...' });
  }
}
