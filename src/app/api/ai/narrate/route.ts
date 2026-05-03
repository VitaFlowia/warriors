import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { action, actor, target, result, isCritical } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ text: `${actor} usou ${action} em ${target}. O resultado foi ${result}.` });
    }

    // Call Gemini API natively using standard fetch
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `Você é o mestre narrador de um jogo RPG Dark Fantasy chamado Sá Pires Warriors.
Narração em apenas 1 ou 2 parágrafos curtos, vívidos e emocionantes.
Ação: ${actor} usou ${action} contra ${target}.
Resultado do dano/efeito: ${result}.
Foi crítico? ${isCritical ? 'Sim!' : 'Não.'}
Faça a narrativa focada nas trevas, névoa e sons do cais e impacto sangrento.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const narrativeText = data.candidates?.[0]?.content?.parts?.[0]?.text || "A névoa obscureceu o que aconteceu.";

    return NextResponse.json({ text: narrativeText });

  } catch (error) {
    console.error('Error generating AI narrative:', error);
    return NextResponse.json({ error: 'Failed to generate narrative' }, { status: 500 });
  }
}
