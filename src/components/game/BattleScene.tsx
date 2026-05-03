import React from 'react';
import { Hero } from '@/data/heroes';
import { Enemy } from '@/data/enemies';
import { HeroCard } from '../cards/HeroCard';
import { EnemyCard } from '../cards/EnemyCard';

interface BattleSceneProps {
  heroes: Hero[];
  enemies: { enemy: Enemy; currentHp: number }[];
  activeCharacterId: string;
}

export function BattleScene({ heroes, enemies, activeCharacterId }: BattleSceneProps) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-8 p-4 z-10 w-full max-w-7xl mx-auto">
      
      {/* Enemies Area */}
      <div className="flex justify-center gap-4 flex-wrap">
        {enemies.map((e, idx) => (
          <div key={idx} className={`transition-all duration-300 ${activeCharacterId === e.enemy.id ? 'scale-110 shadow-xl shadow-destructive/50 z-20' : 'opacity-90'}`}>
            <EnemyCard enemy={e.enemy} currentHp={e.currentHp} />
          </div>
        ))}
      </div>

      <div className="h-12 w-full flex items-center justify-center">
        <span className="text-2xl font-black text-muted-foreground/50 italic tracking-widest uppercase">VS</span>
      </div>

      {/* Heroes Area */}
      <div className="flex justify-center gap-4 flex-wrap">
        {heroes.map((hero) => (
          <div key={hero.id} className="w-48">
            <HeroCard 
              hero={hero} 
              selected={activeCharacterId === hero.id} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
