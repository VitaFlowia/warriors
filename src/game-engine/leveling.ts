import { Hero } from '../data/heroes';

// XP rewards per enemy level
const XP_PER_ENEMY_LEVEL: Record<number, number> = {
  1: 25,
  2: 40,
  3: 60,
  4: 80,
  5: 120, // Boss
};

// Bonus XP for completing the entire battle
const VICTORY_BONUS_XP = 50;

export type LevelUpResult = {
  hero: Hero;
  didLevelUp: boolean;
  oldLevel: number;
  newLevel: number;
  xpGained: number;
};

/**
 * Adds XP to a hero. If XP exceeds the threshold, levels up.
 * On level up: HP increases, attributes get a small boost.
 */
export function addXp(hero: Hero, amount: number): LevelUpResult {
  const oldLevel = hero.level;
  let newXp = hero.xp + amount;
  let newLevel = hero.level;
  let newXpNextLevel = hero.xpNextLevel;
  let newMaxHp = hero.maxHp;
  let newHp = hero.hp;
  let newMana = hero.mana;

  // Check for level up (can level up multiple times if XP is huge)
  while (newXp >= newXpNextLevel) {
    newLevel += 1;
    newXp -= newXpNextLevel;
    newXpNextLevel = Math.floor(newXpNextLevel * 1.5); // 50% more XP required per level
    
    // Level up bonuses
    newMaxHp += 3 + Math.floor(hero.attributes.defesa * 0.5); // Base + defense scaling
    newHp = newMaxHp; // Full heal on level up
    newMana += 2;
  }

  const updatedHero: Hero = {
    ...hero,
    xp: newXp,
    level: newLevel,
    xpNextLevel: newXpNextLevel,
    maxHp: newMaxHp,
    hp: newLevel > oldLevel ? newMaxHp : newHp, // Full heal only on level up
    mana: newMana,
  };

  return {
    hero: updatedHero,
    didLevelUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
    xpGained: amount,
  };
}

/**
 * Calculate XP reward for killing an enemy.
 */
export function getEnemyXpReward(enemyLevel: number): number {
  return XP_PER_ENEMY_LEVEL[enemyLevel] || 20;
}

/**
 * Get victory bonus XP.
 */
export function getVictoryBonusXp(): number {
  return VICTORY_BONUS_XP;
}

/**
 * Distribute XP to all alive heroes after a battle victory.
 */
export function distributeVictoryXp(
  heroes: Hero[], 
  totalEnemyXp: number
): LevelUpResult[] {
  const aliveHeroes = heroes.filter(h => h.hp > 0);
  if (aliveHeroes.length === 0) return [];
  
  // Each alive hero gets full XP + victory bonus
  const xpPerHero = totalEnemyXp + VICTORY_BONUS_XP;
  
  return aliveHeroes.map(hero => addXp(hero, xpPerHero));
}
