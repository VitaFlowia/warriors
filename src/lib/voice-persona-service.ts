export type VoicePersona = {
  geminiVoice: string;
  chirp3Voice: string;
  neural2Voice: string;
  stylePrompt: string;
  speakingRate: number;
};

const DEFAULT_PERSONA: VoicePersona = {
  geminiVoice: 'pt-BR-Chirp3-HD-Achernar',
  chirp3Voice: 'pt-BR-Chirp3-HD-Achernar',
  neural2Voice: 'pt-BR-Neural2-A',
  stylePrompt: 'Você é um narrador épico de RPG. Sua voz deve ser profunda, misteriosa e heróica.',
  speakingRate: 1.0,
};

const PERSONAS: Record<string, VoicePersona> = {
  'rurik-sa-ferro': {
    geminiVoice: 'pt-BR-Chirp3-HD-Achird',
    chirp3Voice: 'pt-BR-Chirp3-HD-Achird',
    neural2Voice: 'pt-BR-Neural2-B',
    stylePrompt: 'Você é Rurik Sá-Ferro, um guerreiro forte e honrado. Fale com voz grossa, firme e determinada.',
    speakingRate: 0.9,
  },
  'yara-da-nevoa': {
    geminiVoice: 'pt-BR-Chirp3-HD-Aoede',
    chirp3Voice: 'pt-BR-Chirp3-HD-Aoede',
    neural2Voice: 'pt-BR-Neural2-C',
    stylePrompt: 'Você é Yara da Névoa, uma maga mística e sábia. Fale com voz calma, elegante e um pouco misteriosa.',
    speakingRate: 1.0,
  },
  'naira-olhos-de-nevoa': {
    geminiVoice: 'pt-BR-Chirp3-HD-Kore',
    chirp3Voice: 'pt-BR-Chirp3-HD-Kore',
    neural2Voice: 'pt-BR-Neural2-A',
    stylePrompt: 'Você é Naira, uma patrulheira ágil e atenta. Fale de forma rápida, focada e jovem.',
    speakingRate: 1.1,
  },
  'irma-joana-de-brumas': {
    geminiVoice: 'pt-BR-Chirp3-HD-Leda',
    chirp3Voice: 'pt-BR-Chirp3-HD-Leda',
    neural2Voice: 'pt-BR-Neural2-A',
    stylePrompt: 'Você é a Irmã Joana, uma clériga bondosa. Fale com voz suave, acolhedora e cheia de fé.',
    speakingRate: 0.95,
  },
  'sir-alvaro-lumiar': {
    geminiVoice: 'pt-BR-Chirp3-HD-Algenib',
    chirp3Voice: 'pt-BR-Chirp3-HD-Algenib',
    neural2Voice: 'pt-BR-Neural2-B',
    stylePrompt: 'Você é Sir Álvaro Lumiar, um paladino heróico. Fale com voz potente, inspiradora e autoritária.',
    speakingRate: 1.0,
  },
  'vico-sombras': {
    geminiVoice: 'pt-BR-Chirp3-HD-Charon',
    chirp3Voice: 'pt-BR-Chirp3-HD-Charon',
    neural2Voice: 'pt-BR-Neural2-B',
    stylePrompt: 'Você é Vico Sombras, um ladino furtivo. Fale em tom mais baixo, rápido e levemente sarcástico.',
    speakingRate: 1.15,
  },
  'sa-leo-das-cancoes': {
    geminiVoice: 'pt-BR-Chirp3-HD-Orus',
    chirp3Voice: 'pt-BR-Chirp3-HD-Orus',
    neural2Voice: 'pt-BR-Neural2-B',
    stylePrompt: 'Você é Sá Leo das Canções, um bardo carismático. Fale de forma expressiva, alegre e rítmica.',
    speakingRate: 1.05,
  },
  'system': DEFAULT_PERSONA,
};

export function getPersona(key?: string | null): VoicePersona {
  if (!key || !PERSONAS[key]) return DEFAULT_PERSONA;
  return PERSONAS[key];
}

export function injectMarkupTags(text: string): string {
  // Exemplo de injeção simples: adiciona pausas em pontuações
  return text
    .replace(/\.\.\./g, '... [medium pause] ')
    .replace(/\!/g, '! [short pause] ')
    .replace(/\?/g, '? [short pause] ');
}

export function stripMarkupTags(text: string): string {
  return text.replace(/\[.*?\]/g, '');
}
