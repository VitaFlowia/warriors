import { Hero } from '../data/heroes';

export function addXp(hero: Hero, amount: number): Hero {
  const newXp = hero.xp + amount;
  let newLevel = hero.level;
  let newXpNextLevel = hero.xpNextLevel;

  if (newXp >= newXpNextLevel) {
    newLevel += 1;
    newXpNextLevel = newXpNextLevel * 1.5; // Next level requires 50% more XP
  }

  return {
    ...hero,
    xp: newXp,
    level: newLevel,
    xpNextLevel: newXpNextLevel
  };
}
