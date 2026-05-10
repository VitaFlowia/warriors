// ===========================
// LORE & NARRATIVE DATA
// Content for location stories, quests, world-building, waves, and gold
// ===========================

export type LocationLore = {
  id: string;
  title: string;
  subtitle: string;
  narrative: string;
  ambientDescription: string;
  npcName?: string;
  npcQuote?: string;
  bgImage?: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  objectiveText: string;
  reward: string;
  rewardXp: number;
  rewardGold: number;
  isCompleted: boolean;
  sourceLocation: string;
  type: 'combat' | 'explore' | 'collect' | 'social';
};

// ===========================
// WAVE SYSTEM
// ===========================

export type WaveConfig = {
  waveNumber: number;
  title: string;
  narrative: string;
  enemySetup: { enemyIndex: number; count: number }[]; // index into enemies array
  goldReward: number;
  xpBonus: number;
  isFinal: boolean;
};

export const waves: WaveConfig[] = [
  {
    waveNumber: 1,
    title: 'Onda 1 — Goblins Marinhos',
    narrative: 'As criaturas menores do abismo emergem das fendas das ruas. Goblins com escamas verdosas e tridentes enferrujados avançam com olhos famintos. É apenas a vanguarda — mas subestimá-los seria um erro fatal.',
    enemySetup: [{ enemyIndex: 0, count: 3 }], // 3 Goblins Marinhos
    goldReward: 30,
    xpBonus: 50,
    isFinal: false,
  },
  {
    waveNumber: 2,
    title: 'Onda 2 — Crias Abissais',
    narrative: 'O chão tremeu. Das rachaduras na pedra, tentáculos negros se esticaram como dedos de uma mão colossal. As Crias Abissais — aberrações sem forma definida, feitas de escuridão líquida — se materializaram com um sussurro que gelava o sangue. A brincadeira acabou.',
    enemySetup: [
      { enemyIndex: 1, count: 2 }, // 2 Crias Abissais
      { enemyIndex: 2, count: 1 }, // 1 Pirata Possuído
    ],
    goldReward: 60,
    xpBonus: 100,
    isFinal: false,
  },
  {
    waveNumber: 3,
    title: 'Onda 3 — O Capitão do Abismo',
    narrative: 'A névoa se adensou até que o mundo parecia ter encolhido. E então, ele apareceu. O Capitão do Abismo — uma figura colossal envolta em correntes vivas, com olhos que brilhavam como faróis submersos. A temperatura caiu. O mar recuou. Até as chamas pareceram se curvar diante dele.\n\n"Vocês ousaram resistir à Maré Negra," sua voz ecoou como trovão submarino. "Agora conhecerão o que habita onde a luz não alcança."',
    enemySetup: [
      { enemyIndex: 3, count: 1 }, // 1 Invocador do Abismo
      { enemyIndex: 4, count: 1 }, // 1 Capitão do Abismo (BOSS)
    ],
    goldReward: 150,
    xpBonus: 200,
    isFinal: true,
  },
];

// Gold costs for locations
export const GOLD_COSTS = {
  blacksmith: 50,
  dock: 30,
  tavern: 15,
  library: 40,
};

// Gold rewards per enemy level
export const GOLD_PER_ENEMY_LEVEL: Record<number, number> = {
  1: 8,
  2: 15,
  3: 25,
  4: 35,
  5: 60,
};

// ===========================
// LOCATION NARRATIVES
// ===========================

export const locationLore: Record<string, LocationLore> = {
  tavern: {
    id: 'tavern',
    title: 'Taverna do Cais Encalhado',
    subtitle: 'Onde a névoa encontra o rum',
    narrative: `A porta de madeira rangia como um navio velho ao se abrir. Lá dentro, o cheiro de álcool barato e peixe defumado impregnava o ar denso. Marinheiros com olhares vazios bebiam em silêncio, enquanto um bardo de mãos trêmulas dedilhava algo que um dia foi uma canção.\n\nAtrás do balcão, Dona Bruma — uma mulher robusta com um tapa-olho e um sorriso que poderia tanto curar quanto envenenar — limpava canecas com um pano que já tinha visto dias melhores. "Outro guerreiro perdido nas brumas? Sente-se. A primeira rodada é por conta da casa... se você tiver uma história boa."`,
    ambientDescription: 'Velas tremeluzindo. Um gato preto dorme sobre barris. O som abafado de ondas batendo contra as pedras lá fora.',
    npcName: 'Dona Bruma',
    npcQuote: '"A névoa leva tudo — memórias, esperança, navios. Mas nunca levou minha taverna. E enquanto eu servir, ninguém morre de sede neste cais."',
  },
  blacksmith: {
    id: 'blacksmith',
    title: 'Forja das Âncoras Partidas',
    subtitle: 'Onde o aço beija o fogo abissal',
    narrative: `O calor atingia como uma onda invisível ao se aproximar da forja. Gor, o ferreiro — um homem cuja pele parecia ter sido curtida pelo próprio fogo — martelava algo sobre a bigorna com golpes ritmados que ecoavam como o coração de Porto das Brumas.\n\nNas paredes, espadas com runas escurecidas pela maresia. Escudos com marcas de garras de criaturas que não deveriam existir. "Não faço armas bonitas," disse Gor sem levantar o olhar, "faço armas que matam o que precisa morrer."`,
    ambientDescription: 'Brasas crepitando. O cheiro metálico de ferro quente. Marteladas ecoam entre as paredes de pedra.',
    npcName: 'Gor, o Ferreiro',
    npcQuote: '"Vê essa lâmina? Forjei com ferro do navio que afundou na Tempestade Vermelha. Dizem que o aço lembra de cada alma que levou. E ainda tem fome."',
  },
  library: {
    id: 'library',
    title: 'Biblioteca dos Véus Rasgados',
    subtitle: 'Onde o saber é tão perigoso quanto o abismo',
    narrative: `O silêncio da biblioteca não era pacífico — era o tipo de silêncio que precede uma tempestade. Estantes altíssimas, curvadas pelo peso de tomos antigos, se estendiam até perder-se na escuridão do teto.\n\nA Guardiã, uma mulher etérea que parecia mais espírito do que carne, flutuava entre as prateleiras. "Cada livro aqui contém uma verdade que alguém morreu para registrar," sussurrou ela. "Escolha com cuidado o que deseja aprender. O conhecimento do abismo... muda quem o carrega."`,
    ambientDescription: 'Poeira flutuando como constelações no ar. O cheiro de pergaminho antigo. Sussurros vindos dos livros.',
    npcName: 'A Guardiã dos Véus',
    npcQuote: '"O abismo não é um lugar — é uma linguagem. E cada habilidade que você aprende aqui é mais uma palavra que você consegue entender... e que ele pode usar contra você."',
  },
  dock: {
    id: 'dock',
    title: 'Doca dos Navios Fantasma',
    subtitle: 'Onde os mortos ainda comerciam',
    narrative: `As tábuas do pier gemiam sob seus passos. Embarcações ancoradas balançavam suavemente, mas não havia tripulação — apenas sombras onde marinheiros deveriam estar.\n\nNo final da doca, um velho com uma lanterna de vidro negro esperava. "Trago mercadorias de lugares que os mapas não marcam," disse ele, abrindo um baú que brilhava com uma luz que não pertencia a este mundo. Dentro, cartas ilustradas com cenas de batalha, cada uma emanando um poder palpável.`,
    ambientDescription: 'Correntes rangendo. Neblina grossa sobre a água escura. O som distante de um sino de navio que ninguém vê.',
    npcName: 'O Mercador das Sombras',
    npcQuote: '"Cartas não são apenas papel, rapaz. São fragmentos de batalhas que aconteceram em outros tempos. Quem as carrega, carrega a força dos que lutaram antes."',
  },
  battle: {
    id: 'battle',
    title: 'Ruas em Chamas',
    subtitle: 'O primeiro cerco do Abismo',
    narrative: `As ruas estreitas de Porto das Brumas estavam tomadas. Criaturas rastejantes emergiam das fendas entre as pedras, seus olhos brilhando com uma fome ancestral. O fogo que os moradores haviam acendido para se proteger agora iluminava os horrores que a névoa escondia.\n\nEra aqui que a batalha aconteceria. Não por glória, não por ouro — mas porque se essas ruas caíssem, o porto cairia com elas. E com o porto, toda a esperança de quem ainda lutava contra a Maré Negra.`,
    ambientDescription: 'Chamas dançando nas paredes. Gritos distantes. O som gutural de criaturas se aproximando.',
  },
};

// ===========================
// QUEST SYSTEM
// ===========================

export const initialQuests: Quest[] = [
  {
    id: 'quest-1',
    title: 'Defender as Ruas',
    description: 'As criaturas do abismo tomaram as ruas de Porto das Brumas. Derrote todos os inimigos na primeira onda.',
    objectiveText: 'Derrotar 3 Goblins Marinhos (Onda 1)',
    reward: '+30 Ouro',
    rewardXp: 75,
    rewardGold: 30,
    isCompleted: false,
    sourceLocation: 'battle',
    type: 'combat',
  },
  {
    id: 'quest-2',
    title: 'Visitar a Taverna',
    description: 'Dona Bruma pode ter informações valiosas. Visite a Taverna e descubra o que ela sabe sobre as criaturas.',
    objectiveText: 'Visitar a Taverna do Cais Encalhado',
    reward: 'Cura Completa',
    rewardXp: 25,
    rewardGold: 10,
    isCompleted: false,
    sourceLocation: 'tavern',
    type: 'explore',
  },
  {
    id: 'quest-3',
    title: 'Forjar uma Nova Arma',
    description: 'Gor, o ferreiro, pode melhorar seu equipamento. Mas ele cobra 50 de ouro.',
    objectiveText: 'Comprar um upgrade na Forja (50 Ouro)',
    reward: '+1 Força Permanente',
    rewardXp: 40,
    rewardGold: 0,
    isCompleted: false,
    sourceLocation: 'blacksmith',
    type: 'collect',
  },
  {
    id: 'quest-4',
    title: 'Segredos dos Véus',
    description: 'A Guardiã dos Véus pode ensinar novas habilidades por 40 de ouro.',
    objectiveText: 'Estudar na Biblioteca (40 Ouro)',
    reward: '+2 Mana Permanente',
    rewardXp: 50,
    rewardGold: 0,
    isCompleted: false,
    sourceLocation: 'library',
    type: 'explore',
  },
  {
    id: 'quest-5',
    title: 'O Segundo Cerco',
    description: 'Criaturas mais poderosas estão chegando. Sobreviva à segunda onda de inimigos.',
    objectiveText: 'Derrotar a Onda 2: Crias Abissais',
    reward: '+60 Ouro',
    rewardXp: 150,
    rewardGold: 60,
    isCompleted: false,
    sourceLocation: 'battle',
    type: 'combat',
  },
  {
    id: 'quest-6',
    title: 'O Capitão do Abismo',
    description: 'Ele comanda a Maré Negra. Derrote-o para salvar Porto das Brumas... pelo menos por hoje.',
    objectiveText: 'Derrotar o Boss Final (Onda 3)',
    reward: 'Título: Guardião do Porto',
    rewardXp: 300,
    rewardGold: 150,
    isCompleted: false,
    sourceLocation: 'battle',
    type: 'combat',
  },
];

// ===========================
// POST-BATTLE NARRATIVE HOOKS
// ===========================

export const postBattleNarratives: Record<number, string[]> = {
  1: [
    `A névoa recuou como uma maré obediente. Os corpos das criaturas se dissolveram em sombras que rastejaram de volta para as fendas, como se o abismo recuperasse seus peões derrotados. Mas no ar, o cheiro de sal e cinza dizia o que todos sabiam: isso era apenas o começo.`,
    `O silêncio que se seguiu à batalha era mais assustador que qualquer rugido. Os guerreiros, com armas ainda gotejando a essência negra das criaturas, olharam uns para os outros. Nenhuma palavra foi dita. Nenhuma era necessária. A próxima onda viria — era só questão de quando.`,
  ],
  2: [
    `As Crias se desfizeram em poças de escuridão que evaporaram como fumaça. Mas algo havia mudado no ar — uma pressão, como se o oceano inteiro estivesse contendo a respiração. Dona Bruma, da janela da taverna, fez o sinal contra o mal. "Ele vem," sussurrou. "O Capitão."`,
    `A vitória sobre as Crias Abissais veio a um custo. As ruas estavam mais escuras agora, como se a própria luz tivesse medo de iluminá-las. "Não comemorem ainda," avisou Gor, apertando o punho de sua bigorna. "O que vocês mataram eram apenas os dedos. A mão ainda está lá embaixo."`,
  ],
  3: [
    `O corpo do Capitão do Abismo se dissolveu como uma tempestade que finalmente se esgota. Por um momento — um único e precioso momento — o céu sobre Porto das Brumas clareou. Estrelas apareceram onde antes só havia névoa.\n\nDona Bruma saiu da taverna com sete canecas transbordando. "Vocês fizeram o impossível," disse ela, e pela primeira vez, sua voz tremeu. "Mas lembrem-se: o abismo não morre. Ele apenas... espera."\n\nOs Guerreiros de Sá Pires olharam para o horizonte. O mar estava calmo. Por enquanto.`,
  ],
};

export function getPostBattleNarrative(waveNumber: number): string {
  const pool = postBattleNarratives[waveNumber] || postBattleNarratives[1];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Keep backward compat
export function getRandomPostBattleNarrative(): string {
  return getPostBattleNarrative(1);
}
