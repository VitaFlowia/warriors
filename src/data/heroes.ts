export type Hero = {
  id: string;
  name: string;
  class: string;
  level: number;
  hp: number;
  mana: number;
  attributes: {
    forca: number;
    agilidade: number;
    inteligencia: number;
    espirito: number;
    defesa: number;
    velocidade: number;
  };
  skills: { name: string; description: string; cost: number; type: string }[];
  passive: { name: string; description: string };
  equipment: string[];
  xp: number;
  xpNextLevel: number;
  cardImage: string;
  fullImage: string;
};

export const heroes: Hero[] = [
  {
    id: 'rurik-sa-ferro',
    name: 'Rurik Sá-Ferro',
    class: 'Guerreiro',
    level: 1,
    hp: 22,
    mana: 6,
    attributes: { forca: 4, agilidade: 2, inteligencia: 1, espirito: 1, defesa: 3, velocidade: 2 },
    skills: [
      { name: 'Golpe de Escudo', description: 'Ataque físico com chance de atordoar.', cost: 1, type: 'attack' },
      { name: 'Proteger Aliado', description: 'Redireciona parte do dano para si por 1 turno.', cost: 2, type: 'defense' }
    ],
    passive: { name: 'Postura Inabalável', description: '+1 DEF quando a vida estiver abaixo de 50%.' },
    equipment: ['Espada Curta', 'Escudo de Madeira'],
    xp: 0,
    xpNextLevel: 100,
    cardImage: '/images/cards/heroes/rurik-sa-ferro.png',
    fullImage: '/images/escolher_personagens/Rurik_Sa_Ferro.png'
  },
  {
    id: 'yara-da-nevoa',
    name: 'Yara da Névoa',
    class: 'Maga',
    level: 1,
    hp: 14,
    mana: 18,
    attributes: { forca: 1, agilidade: 2, inteligencia: 4, espirito: 2, defesa: 1, velocidade: 3 },
    skills: [
      { name: 'Raio de Névoa', description: 'Dano mágico em único alvo.', cost: 2, type: 'magic_attack' },
      { name: 'Explosão de Brumas', description: 'Dano leve em todos os monstros.', cost: 4, type: 'magic_aoe' }
    ],
    passive: { name: 'Mente Afiada', description: '+1 em testes de Investigação e Conhecimento.' },
    equipment: ['Cajado Simples', 'Grimório de Névoa'],
    xp: 0,
    xpNextLevel: 100,
    cardImage: '/images/cards/heroes/yara-da-nevoa.png',
    fullImage: '/images/escolher_personagens/Yara_da_Nevoa.png'
  },
  {
    id: 'naira-olhos-de-nevoa',
    name: 'Naira Olhos-de-Névoa',
    class: 'Patrulheira',
    level: 1,
    hp: 18,
    mana: 10,
    attributes: { forca: 2, agilidade: 4, inteligencia: 2, espirito: 1, defesa: 2, velocidade: 4 },
    skills: [
      { name: 'Flecha Precisa', description: 'Ataque à distância com alta chance de acerto.', cost: 1, type: 'ranged_attack' },
      { name: 'Passo Sombrio', description: 'Reposiciona-se e ganha evasão por 1 turno.', cost: 2, type: 'movement' }
    ],
    passive: { name: 'Olhos de Caça', description: '+1 em testes de Percepção e rastreamento.' },
    equipment: ['Arco Longo', 'Adaga de Caçadora'],
    xp: 0,
    xpNextLevel: 100,
    cardImage: '/images/cards/heroes/naira-olhos-de-nevoa.png',
    fullImage: '/images/escolher_personagens/Naira_Olhos_de_Nevoa.png'
  },
  {
    id: 'irma-joana-de-brumas',
    name: 'Irmã Joana de Brumas',
    class: 'Clériga',
    level: 1,
    hp: 16,
    mana: 16,
    attributes: { forca: 1, agilidade: 2, inteligencia: 2, espirito: 4, defesa: 2, velocidade: 2 },
    skills: [
      { name: 'Luz Restauradora', description: 'Cura um aliado.', cost: 2, type: 'heal' },
      { name: 'Bênção da Bruma', description: 'Reduz o dano sofrido pelo grupo.', cost: 3, type: 'buff_defense' }
    ],
    passive: { name: 'Fé Inabalável', description: 'Resistência extra contra medo e corrupção.' },
    equipment: ['Cetro Sagrado', 'Símbolo de Brumas'],
    xp: 0,
    xpNextLevel: 100,
    cardImage: '/images/cards/heroes/irma-joana-de-brumas.png',
    fullImage: '/images/escolher_personagens/Irma_Joana_de_Brunas.png'
  },
  {
    id: 'sir-alvaro-lumiar',
    name: 'Sir Álvaro Lumiar',
    class: 'Paladino',
    level: 1,
    hp: 20,
    mana: 12,
    attributes: { forca: 3, agilidade: 2, inteligencia: 1, espirito: 3, defesa: 3, velocidade: 2 },
    skills: [
      { name: 'Julgamento Radiante', description: 'Golpe sagrado com dano extra contra criaturas corrompidas.', cost: 2, type: 'holy_attack' },
      { name: 'Escudo da Aurora', description: 'Concede proteção a um aliado e reduz dano recebido por 1 turno.', cost: 3, type: 'shield_ally' }
    ],
    passive: { name: 'Juramento da Luz', description: 'Resistência extra contra medo e corrupção.' },
    equipment: ['Espada Consagrada', 'Escudo Solar'],
    xp: 0,
    xpNextLevel: 100,
    cardImage: '/images/cards/heroes/sir-alvaro-lumiar.png',
    fullImage: '/images/escolher_personagens/Sir_Alvaro_Lumiar.png'
  },
  {
    id: 'vico-sombras',
    name: 'Vico Sombras',
    class: 'Ladino',
    level: 1,
    hp: 16,
    mana: 8,
    attributes: { forca: 2, agilidade: 4, inteligencia: 2, espirito: 1, defesa: 1, velocidade: 4 },
    skills: [
      { name: 'Adaga Fantasma', description: 'Ataque rápido com alta chance de crítico.', cost: 1, type: 'critical_attack' },
      { name: 'Véu das Docas', description: 'Entra em furtividade e ganha evasão por 1 turno.', cost: 2, type: 'stealth' }
    ],
    passive: { name: 'Golpe Oportunista', description: 'Causa dano extra ao atingir inimigos enfraquecidos.' },
    equipment: ['Adagas Gêmeas', 'Kit de Gazuas'],
    xp: 0,
    xpNextLevel: 100,
    cardImage: '/images/cards/heroes/vico-sombras.png',
    fullImage: '/images/escolher_personagens/Vico_Sombras.png'
  },
  {
    id: 'sa-leo-das-cancoes',
    name: 'Sá Leo das Canções',
    class: 'Bardo',
    level: 1,
    hp: 17,
    mana: 14,
    attributes: { forca: 1, agilidade: 2, inteligencia: 3, espirito: 3, defesa: 1, velocidade: 3 },
    skills: [
      { name: 'Acorde Inspirador', description: 'Fortalece um aliado e aumenta seu poder de ação.', cost: 2, type: 'buff_attack' },
      { name: 'Balada da Maré Serena', description: 'Cura leve o grupo e dissipa medo.', cost: 3, type: 'group_heal' }
    ],
    passive: { name: 'Presença Magnética', description: 'Bônus em testes sociais e de liderança.' },
    equipment: ['Alaúde de Bruma', 'Flauta do Cais'],
    xp: 0,
    xpNextLevel: 100,
    cardImage: '/images/cards/heroes/sa-leo-das-cancoes.png',
    fullImage: '/images/escolher_personagens/Sa_Leo_das_Cancoes.png'
  }
];
