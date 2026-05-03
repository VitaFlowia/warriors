export type Enemy = {
  id: string;
  name: string;
  type: string;
  level: number;
  maxHp: number;
  maxMana: number;
  attributes: {
    forca: number;
    agilidade: number;
    inteligencia: number;
    espirito: number;
    defesa: number;
    velocidade: number;
  };
  skills: { name: string; effectType: string; target: string }[];
  passive: { name: string; description: string };
  isBoss: boolean;
  cardImage: string;
};

export const enemies: Enemy[] = [
  {
    id: 'goblin-marinho',
    name: 'Goblin Marinho',
    type: 'Monstro Costeiro',
    level: 1,
    maxHp: 12,
    maxMana: 2,
    attributes: { forca: 2, agilidade: 3, inteligencia: 1, espirito: 0, defesa: 1, velocidade: 3 },
    skills: [
      { name: 'Tridente Ferrugento', effectType: 'physical_attack', target: 'single_enemy' },
      { name: 'Rede de Ancoragem', effectType: 'debuff_speed', target: 'single_enemy' }
    ],
    passive: { name: 'Saqueador do Cais', description: '+1 AGI ao atacar alvos já feridos.' },
    isBoss: false,
    cardImage: '/images/cards/enemies/goblin-marinho.png'
  },
  {
    id: 'cria-abissal',
    name: 'Cria Abissal',
    type: 'Aberração Abissal',
    level: 1,
    maxHp: 10,
    maxMana: 8,
    attributes: { forca: 1, agilidade: 4, inteligencia: 1, espirito: 2, defesa: 1, velocidade: 4 },
    skills: [
      { name: 'Tentáculos Sibilantes', effectType: 'physical_control', target: 'single_enemy' },
      { name: 'Pulso do Vazio', effectType: 'magic_attack', target: 'all_enemies' }
    ],
    passive: { name: 'Corpo Escorregadio', description: 'Maior chance de evasão contra ataques físicos.' },
    isBoss: false,
    cardImage: '/images/cards/enemies/cria-abissal.png'
  },
  {
    id: 'pirata-possuido',
    name: 'Pirata Possuído',
    type: 'Morto-vivo Corrompido',
    level: 2,
    maxHp: 18,
    maxMana: 6,
    attributes: { forca: 3, agilidade: 2, inteligencia: 1, espirito: 2, defesa: 2, velocidade: 2 },
    skills: [
      { name: 'Sabre Maldito', effectType: 'dark_attack', target: 'single_enemy' },
      { name: 'Grito do Naufrágio', effectType: 'debuff_defense', target: 'single_enemy' }
    ],
    passive: { name: 'Determinação Profanada', description: 'Continua agressivo mesmo com pouca vida.' },
    isBoss: false,
    cardImage: '/images/cards/enemies/pirata-possuido.png'
  },
  {
    id: 'invocador-do-abismo',
    name: 'Invocador do Abismo',
    type: 'Cultista das Profundezas',
    level: 3,
    maxHp: 16,
    maxMana: 18,
    attributes: { forca: 1, agilidade: 2, inteligencia: 4, espirito: 4, defesa: 1, velocidade: 2 },
    skills: [
      { name: 'Chama Abissal', effectType: 'damage_over_time', target: 'single_enemy' },
      { name: 'Chamado das Profundezas', effectType: 'summon', target: 'self' }
    ],
    passive: { name: 'Véu Ritual', description: 'Redução de dano mágico enquanto conjura.' },
    isBoss: false,
    cardImage: '/images/cards/enemies/invocador-do-abismo.png'
  },
  {
    id: 'capitao-do-abismo',
    name: 'Capitão do Abismo',
    type: 'Chefe das Profundezas',
    level: 5,
    maxHp: 32,
    maxMana: 12,
    attributes: { forca: 5, agilidade: 2, inteligencia: 2, espirito: 4, defesa: 4, velocidade: 2 },
    skills: [
      { name: 'Lâmina da Maré Negra', effectType: 'area_physical_attack', target: 'multiple_enemies' },
      { name: 'Comando do Naufrágio', effectType: 'buff_allies_fear', target: 'all_allies' }
    ],
    passive: { name: 'Senhor das Profundezas', description: 'Reduz dano recebido e causa pressão abissal constante.' },
    isBoss: true,
    cardImage: '/images/cards/enemies/capitao-do-abismo.png'
  }
];
