import { Hero } from './heroes';

export const mercenaries: Hero[] = [
  {
    id: 'merc-1',
    name: 'Escudeiro Feroz',
    class: 'Tank',
    level: 1,
    hp: 150,
    maxHp: 150,
    mana: 30,
    xp: 0,
    xpNextLevel: 100,
    potionCount: 1,
    attributes: { forca: 12, agilidade: 4, inteligencia: 2, espirito: 4, defesa: 15, velocidade: 3 },
    passive: { name: 'Escudo Humano', description: 'Ganha 2 de Defesa passiva contra ataques físicos.' },
    skills: [
      { name: 'Golpe de Escudo', description: 'Causa dano e aumenta própria defesa.', cost: 10, type: 'Físico' }
    ],
    equipment: ['Escudo de Torre', 'Espada Curta'],
    cardImage: '/images/heroes/merc_squire.png',
    fullImage: '/images/heroes/merc_squire.png'
  },
  {
    id: 'merc-2',
    name: 'Caçador Sombrio',
    class: 'Atirador',
    level: 1,
    hp: 90,
    maxHp: 90,
    mana: 40,
    xp: 0,
    xpNextLevel: 100,
    potionCount: 1,
    attributes: { forca: 6, agilidade: 14, inteligencia: 4, espirito: 3, defesa: 6, velocidade: 12 },
    passive: { name: 'Olho de Águia', description: 'Sempre foca o ponto fraco (Crit chance +5%).' },
    skills: [
      { name: 'Tiro Duplo', description: 'Dispara duas setas rápidas (dano baseado em agilidade).', cost: 15, type: 'Físico' }
    ],
    equipment: ['Besta Dupla', 'Capuz de Couro'],
    cardImage: '/images/heroes/merc_hunter.png',
    fullImage: '/images/heroes/merc_hunter.png'
  },
  {
    id: 'merc-3',
    name: 'Lâmina Dançante',
    class: 'Assassina',
    level: 1,
    hp: 85,
    maxHp: 85,
    mana: 35,
    xp: 0,
    xpNextLevel: 100,
    potionCount: 1,
    attributes: { forca: 8, agilidade: 16, inteligencia: 5, espirito: 3, defesa: 5, velocidade: 15 },
    passive: { name: 'Esquiva Perfeita', description: 'Alta chance de desviar do primeiro ataque no turno.' },
    skills: [
      { name: 'Corte Fantasma', description: 'Ataque fatal nas sombras (dano severo).', cost: 20, type: 'Físico' }
    ],
    equipment: ['Adagas Gêmeas', 'Traje de Seda Noturna'],
    cardImage: '/images/heroes/merc_dancer.png',
    fullImage: '/images/heroes/merc_dancer.png'
  },
  {
    id: 'merc-4',
    name: 'Feiticeira da Névoa',
    class: 'Maga',
    level: 1,
    hp: 75,
    maxHp: 75,
    mana: 80,
    xp: 0,
    xpNextLevel: 100,
    potionCount: 2,
    attributes: { forca: 2, agilidade: 5, inteligencia: 16, espirito: 10, defesa: 4, velocidade: 7 },
    passive: { name: 'Manto de Gelo', description: 'Inimigos que a atacam perdem velocidade.' },
    skills: [
      { name: 'Estilhaços de Gelo', description: 'Magia de gelo perfurante.', cost: 25, type: 'Mágico' }
    ],
    equipment: ['Cajado de Cristal', 'Manto Azure'],
    cardImage: '/images/heroes/merc_sorceress.png',
    fullImage: '/images/heroes/merc_sorceress.png'
  },
  {
    id: 'merc-5',
    name: 'Clériga do Sol',
    class: 'Curandeira',
    level: 1,
    hp: 110,
    maxHp: 110,
    mana: 90,
    xp: 0,
    xpNextLevel: 100,
    potionCount: 3,
    attributes: { forca: 4, agilidade: 4, inteligencia: 12, espirito: 15, defesa: 8, velocidade: 6 },
    passive: { name: 'Aura Dourada', description: 'Recupera levemente a vida do grupo a cada turno.' },
    skills: [
      { name: 'Luz Divina', description: 'Cura um herói da família massivamente.', cost: 30, type: 'Mágico' }
    ],
    equipment: ['Maça Leve', 'Símbolo Sagrado'],
    cardImage: '/images/heroes/merc_cleric.png',
    fullImage: '/images/heroes/merc_cleric.png'
  },
  {
    id: 'merc-6',
    name: 'Alquimista Andarilho',
    class: 'Suporte',
    level: 1,
    hp: 100,
    maxHp: 100,
    mana: 60,
    xp: 0,
    xpNextLevel: 100,
    potionCount: 4,
    attributes: { forca: 5, agilidade: 8, inteligencia: 14, espirito: 8, defesa: 6, velocidade: 9 },
    passive: { name: 'Bolsos Fundos', description: 'Começa o jogo com mais poções.' },
    skills: [
      { name: 'Chuva Ácida', description: 'Causa dano em área.', cost: 25, type: 'Mágico' }
    ],
    equipment: ['Bolsa de Frascos', 'Manto Químico'],
    cardImage: '/images/heroes/merc_alchemist.png',
    fullImage: '/images/heroes/merc_alchemist.png'
  },
  {
    id: 'merc-7',
    name: 'Bardo Errante',
    class: 'Buff/Canção',
    level: 1,
    hp: 95,
    maxHp: 95,
    mana: 70,
    xp: 0,
    xpNextLevel: 100,
    potionCount: 1,
    attributes: { forca: 4, agilidade: 10, inteligencia: 10, espirito: 14, defesa: 5, velocidade: 11 },
    passive: { name: 'Presença Inspiradora', description: 'Todos do grupo ganham +1 de Velocidade.' },
    skills: [
      { name: 'Canção de Batalha', description: 'Aumenta a força de todos na mesa.', cost: 30, type: 'Mágico' }
    ],
    equipment: ['Alaúde', 'Roupas Extravagantes'],
    cardImage: '/images/heroes/merc_bard.png',
    fullImage: '/images/heroes/merc_bard.png'
  }
];
