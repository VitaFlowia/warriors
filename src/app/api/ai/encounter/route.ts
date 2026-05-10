import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { heroName, locationName, waveNumber } = body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Você é o mestre de RPG do jogo 'Sá Pires Warriors'.
O herói principal chama-se ${heroName || 'Herói'}.
Ele está explorando o local: ${locationName || 'as redondezas'}.
Esta é a onda de inimigos número ${waveNumber || 1}.

Gere um encontro aleatório narrativo curto (máximo de 3 parágrafos) que o jogador acabou de viver antes da próxima batalha. 
Pode ser um encontro com um NPC excêntrico, uma armadilha evitada, uma visão sinistra ou uma carroça quebrada.
O tom deve ser épico, mas com toques de humor clássico de D&D.

Não crie diálogos do herói, apenas narre a situação.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error('Error in /api/ai/encounter:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate encounter' }, { status: 500 });
  }
}
