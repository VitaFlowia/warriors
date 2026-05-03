import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Hero } from '@/data/heroes';
import Image from 'next/image';

interface HeroCardProps {
  hero: Hero;
  onClick?: () => void;
  selected?: boolean;
}

export function HeroCard({ hero, onClick, selected }: HeroCardProps) {
  const hpPercent = (hero.hp / hero.hp) * 100; // Mock until maxHp is added to Hero
  const maxHp = hero.hp; // Since we don't have maxHp in Hero type initially, we'll assume it's current max
  
  // Mocks for MVP XP and Gold since it might not be in the base data yet
  const xp = 350;
  const xpToNextLevel = 500;
  const xpPercent = (xp / xpToNextLevel) * 100;
  const gold = 125;

  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer transition-all border-2 
        ${selected ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.8)] scale-105 z-30' : 'border-border hover:border-primary/50'}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-60 pointer-events-none" />
      <div className="relative w-full h-48 sm:h-64">
        {/* Using standard img to avoid Next Image domains config for MVP if path is not public, 
            but since it's in public/images, Image is fine. */}
        <Image 
          src={hero.cardImage} 
          alt={hero.name} 
          fill 
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          className="z-0"
        />
      </div>
      <CardHeader className="relative z-20 -mt-16 bg-background/80 backdrop-blur-sm p-4">
        <CardTitle className={`text-lg font-bold ${selected ? 'text-green-400 animate-pulse drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'text-primary'}`}>
          {hero.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{hero.class} - Nv {hero.level}</p>
      </CardHeader>
      <CardContent className="relative z-20 p-4 pt-0 bg-background/80 backdrop-blur-sm">
        <div className="space-y-3">
          {/* HP Bar */}
          <div>
            <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
              <span className="text-destructive">Vida (HP)</span>
              <span>{hero.hp} / {maxHp}</span>
            </div>
            <Progress value={hpPercent} className="h-1.5 bg-destructive/20 [&>div]:bg-destructive" />
          </div>
          
          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
              <span className="text-purple-400">Experiência</span>
              <span>{xp} / {xpToNextLevel}</span>
            </div>
            <Progress value={xpPercent} className="h-1.5 bg-purple-900/30 [&>div]:bg-purple-500" />
            <p className="text-[9px] text-right text-muted-foreground mt-0.5">Falta {xpToNextLevel - xp} XP p/ Nv {hero.level + 1}</p>
          </div>

          {/* MP & Gold Footer */}
          <div className="flex justify-between items-center text-xs pt-1 border-t border-border/50">
            <div className="flex items-center gap-1">
              <span className="text-blue-400 font-bold">MP</span>
              <span className="font-mono">{hero.mana}</span>
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
