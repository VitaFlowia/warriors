import React from 'react';
import { Hero } from '@/data/heroes';
import { Enemy } from '@/data/enemies';

interface InitiativeBarProps {
  turnOrder: string[];
  currentIndex: number;
  heroes: Hero[];
  enemies: { enemy: Enemy; currentHp: number }[];
  roundNumber: number;
  waveNumber?: number;
  totalWaves?: number;
}

export function InitiativeBar({ turnOrder, currentIndex, heroes, enemies, roundNumber, waveNumber = 1, totalWaves = 3 }: InitiativeBarProps) {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/70 border border-primary/40 px-4 py-2 rounded-full backdrop-blur-md">
      {/* Wave & Round info */}
      <div className="flex flex-col items-center mr-2 border-r border-primary/30 pr-3">
        <span className="text-primary/80 text-[9px] uppercase tracking-widest font-bold">Onda {waveNumber}/{totalWaves}</span>
        <span className="text-primary font-black text-xs">R{roundNumber}</span>
      </div>
      
      {/* Turn portraits */}
      <div className="flex items-center gap-1.5">
        {turnOrder.map((id, idx) => {
          const hero = heroes.find(h => h.id === id);
          const enemyData = enemies.find(e => e.enemy.id === id);
          const isActive = idx === currentIndex;
          const isDead = hero ? hero.hp <= 0 : (enemyData ? enemyData.currentHp <= 0 : false);
          const name = hero?.name || enemyData?.enemy.name || '?';
          const image = hero?.cardImage || enemyData?.enemy.cardImage || '';
          const isEnemy = !!enemyData;
          
          return (
            <div
              key={`${id}-${idx}`}
              title={name}
              className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-300
                ${isDead ? 'grayscale opacity-30 border-gray-600 scale-75' : 
                  isActive ? `scale-125 z-10 ${isEnemy ? 'border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]' : 'border-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]'}` :
                  isEnemy ? 'border-red-500/40' : 'border-primary/40'
                }
              `}
            >
              {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover object-top" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold ${isEnemy ? 'bg-red-900' : 'bg-primary/20'}`}>
                  {name[0]}
                </div>
              )}
              {isDead && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-[8px]">💀</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
