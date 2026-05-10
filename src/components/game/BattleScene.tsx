import React from 'react';
import { Hero } from '@/data/heroes';
import { Enemy } from '@/data/enemies';
import { HeroCard } from '../cards/HeroCard';
import { EnemyCard } from '../cards/EnemyCard';

interface FloatingNumber {
  id: number;
  amount: number;
  type: 'damage' | 'heal' | 'xp';
  targetId: string;
}

interface BattleSceneProps {
  heroes: Hero[];
  enemies: { enemy: Enemy; currentHp: number }[];
  activeCharacterId: string;
  gold?: number;
  floatingNumbers?: FloatingNumber[];
  defendingHeroes?: Set<string>;
  onTargetClick?: (targetId: string, isEnemy: boolean) => void;
  isSelectingTarget?: boolean;
}

export function BattleScene({ heroes, enemies, activeCharacterId, gold, floatingNumbers = [], defendingHeroes = new Set(), onTargetClick, isSelectingTarget }: BattleSceneProps) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-8 p-4 z-10 w-full max-w-7xl mx-auto">
      
      {/* Enemies Area */}
      <div className="flex justify-center gap-4 flex-wrap">
        {enemies.map((e, idx) => (
          <div key={idx} className={`transition-all duration-300 relative ${activeCharacterId === e.enemy.id ? 'scale-110 shadow-xl shadow-destructive/50 z-20' : 'opacity-90'}`}>
            <EnemyCard 
              enemy={e.enemy} 
              currentHp={e.currentHp} 
              isSelectable={isSelectingTarget}
              onClick={() => onTargetClick?.(e.enemy.id, true)}
            />
            {/* Floating damage numbers */}
            {floatingNumbers.filter(f => f.targetId === e.enemy.id).map(f => (
              <div key={f.id} className="floating-damage absolute top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <span className={`text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                  f.type === 'damage' ? 'text-red-400' : f.type === 'heal' ? 'text-green-400' : 'text-purple-400'
                }`}>
                  {f.type === 'damage' ? `-${f.amount}` : `+${f.amount}`}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="h-12 w-full flex items-center justify-center">
        <span className="text-2xl font-black text-muted-foreground/50 italic tracking-widest uppercase">VS</span>
      </div>

      {/* Heroes Area */}
      <div className="flex justify-center gap-4 flex-wrap">
        {heroes.map((hero) => (
          <div key={hero.id} className={`w-48 relative ${defendingHeroes.has(hero.id) ? 'defend-glow rounded-xl' : ''}`}>
            <HeroCard 
              hero={hero} 
              selected={activeCharacterId === hero.id}
              gold={gold}
            />
            {/* Defending shield icon */}
            {defendingHeroes.has(hero.id) && (
              <div className="absolute -top-2 -right-2 z-30 w-8 h-8 bg-blue-500/90 rounded-full flex items-center justify-center text-sm shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse">
                🛡️
              </div>
            )}
            {/* Floating damage/heal numbers */}
            {floatingNumbers.filter(f => f.targetId === hero.id).map(f => (
              <div key={f.id} className="floating-damage absolute top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <span className={`text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                  f.type === 'damage' ? 'text-red-400' : f.type === 'heal' ? 'text-green-400' : 'text-purple-400'
                }`}>
                  {f.type === 'damage' ? `-${f.amount}` : `+${f.amount}`}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
