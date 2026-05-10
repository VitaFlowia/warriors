import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Enemy } from '@/data/enemies';
import Image from 'next/image';

interface EnemyCardProps {
  enemy: Enemy;
  currentHp: number;
  onClick?: () => void;
  isSelectable?: boolean;
}

export function EnemyCard({ enemy, currentHp, onClick, isSelectable }: EnemyCardProps) {
  const hpPercent = (currentHp / enemy.maxHp) * 100;
  const isDead = currentHp <= 0;
  
  // Dynamic HP bar color
  const hpColor = hpPercent > 60 ? 'bg-red-500' : hpPercent > 30 ? 'bg-orange-500' : 'bg-red-300';
  const hpGlow = hpPercent <= 30 && !isDead ? 'shadow-[0_0_8px_rgba(252,165,165,0.6)] animate-pulse' : '';

  return (
    <Card 
      onClick={isSelectable && !isDead ? onClick : undefined}
      className={`relative overflow-hidden border-2 transition-all duration-300 
      ${isDead 
        ? 'border-gray-700 opacity-0 card-die scale-90' 
        : isSelectable
          ? 'border-yellow-400 cursor-pointer shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse scale-105 z-30'
          : 'border-destructive/50 shadow-md shadow-destructive/10 card-idle hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:border-red-600/50'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-60 pointer-events-none" />
      <div className="relative w-full h-40 sm:h-52">
        <Image 
          src={enemy.cardImage} 
          alt={enemy.name} 
          fill 
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          className="z-0"
        />
        {isDead && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
            <span className="text-gray-400 font-black text-xl uppercase tracking-widest">DERROTADO</span>
          </div>
        )}
      </div>
      <CardHeader className="relative z-20 -mt-12 bg-background/90 backdrop-blur-md p-3">
        <CardTitle className={`text-md font-bold ${isDead ? 'text-gray-500 line-through' : 'text-destructive'}`}>
          {enemy.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{enemy.type} - Nv {enemy.level}</p>
      </CardHeader>
      <CardContent className="relative z-20 p-3 pt-0 bg-background/90 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-destructive font-bold">HP</span>
            <span className={hpPercent <= 30 && !isDead ? 'text-red-300 animate-pulse' : ''}>
              {Math.max(0, currentHp)} / {enemy.maxHp}
            </span>
          </div>
          <div className={`w-full h-2.5 rounded-full bg-gray-800 overflow-hidden ${hpGlow}`}>
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${isDead ? 'bg-gray-600' : hpColor}`}
              style={{ width: `${Math.max(0, hpPercent)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
