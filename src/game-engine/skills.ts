export type SkillEffect = {
  type: 'damage' | 'damage_aoe' | 'heal' | 'buff_defense' | 'debuff';
  basePower: number;        // multiplicador de dano/cura
  attribute: 'forca' | 'inteligencia' | 'espirito' | 'defesa' | 'agilidade';  // qual atributo escala
  targetType: 'single_enemy' | 'all_enemies' | 'self' | 'single_ally';
};

// Mapa de skill type -> efeito mecânico
export const SKILL_EFFECTS: Record<string, SkillEffect> = {
  'attack':       { type: 'damage',       basePower: 1.2, attribute: 'forca',         targetType: 'single_enemy' },
  'magic_attack': { type: 'damage',       basePower: 1.5, attribute: 'inteligencia',  targetType: 'single_enemy' },
  'magic_aoe':    { type: 'damage_aoe',   basePower: 0.8, attribute: 'inteligencia',  targetType: 'all_enemies' },
  'defense':      { type: 'buff_defense', basePower: 0,   attribute: 'defesa',        targetType: 'self' },
  'heal':         { type: 'heal',         basePower: 1.0, attribute: 'espirito',      targetType: 'single_ally' }, // ou self
  'buff':         { type: 'buff_defense', basePower: 0,   attribute: 'espirito',      targetType: 'single_ally' },
};
