import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hero } from '@/data/heroes';
import Image from 'next/image';

interface HeroCardProps {
  hero: Hero;
  onClick?: () => void;
  selected?: boolean;
  gold?: number;
}

export function HeroCard({ hero, onClick, selected, gold = 0 }: HeroCardProps) {
  const hpPercent = (hero.hp / hero.maxHp) * 100;
  const xpPercent = (hero.xp / hero.xpNextLevel) * 100;

  // HP bar color based on percentage
  const hpColor = hpPercent > 60 ? 'bg-green-500' : hpPercent > 30 ? 'bg-yellow-500' : 'bg-red-500';
  const hpGlow = hpPercent > 60 ? '' : hpPercent > 30 ? 'shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse';
  
  const isDead = hero.hp <= 0;

  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 border-2 
        ${isDead ? 'border-gray-700 opacity-50 grayscale card-die' :
          selected ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.8)] scale-105 z-30' : 
          'border-border card-idle hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(202,138,4,0.3)] hover:border-yellow-600/50'}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-60 pointer-events-none" />
      <div className="relative w-full h-48 sm:h-64">
        <Image 
          src={hero.cardImage} 
          alt={hero.name} 
          fill 
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          className="z-0"
        />
        {isDead && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
            <span className="text-red-500 font-black text-2xl uppercase tracking-widest">CAÍDO</span>
          </div>
        )}
      </div>
      <CardHeader className="relative z-20 -mt-16 bg-background/80 backdrop-blur-sm p-4">
        <CardTitle className={`text-lg font-bold ${selected ? 'text-green-400 animate-pulse drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'text-primary'}`}>
          {hero.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{hero.class} - Nv {hero.level}</p>
      </CardHeader>
      <CardContent className="relative z-20 p-4 pt-0 bg-background/80 backdrop-blur-sm">
        <div className="space-y-3">
          {/* HP Bar - Dynamic with color changes */}
          <div>
            <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
              <span className={hpPercent > 30 ? 'text-green-400' : 'text-red-400'}>Vida (HP)</span>
              <span className={hpPercent <= 30 ? 'text-red-400 animate-pulse' : ''}>{hero.hp} / {hero.maxHp}</span>
            </div>
            <div className={`w-full h-2.5 rounded-full bg-gray-800 overflow-hidden ${hpGlow}`}>
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${hpColor}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
          
          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
              <span className="text-purple-400">Experiência</span>
              <span>{hero.xp} / {hero.xpNextLevel}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-purple-900/30 overflow-hidden">
              <div 
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <p className="text-[9px] text-right text-muted-foreground mt-0.5">Falta {hero.xpNextLevel - hero.xp} XP p/ Nv {hero.level + 1}</p>
          </div>

          {/* MP, Gold & Potions Footer */}
          <div className="flex justify-between items-center text-xs pt-1 border-t border-border/50">
            <div className="flex items-center gap-1">
              <span className="text-blue-400 font-bold">MP</span>
              <span className="font-mono">{hero.mana}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-400">🧪</span>
              <span className="font-bold text-red-300">{hero.potionCount}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" stroke="black" strokeWidth="2"></path></svg>
              <span className="font-bold">{gold} Ouro</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
