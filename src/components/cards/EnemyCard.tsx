import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Enemy } from '@/data/enemies';
import Image from 'next/image';

interface EnemyCardProps {
  enemy: Enemy;
  currentHp: number;
}

export function EnemyCard({ enemy, currentHp }: EnemyCardProps) {
  const hpPercent = (currentHp / enemy.maxHp) * 100;

  return (
    <Card className="relative overflow-hidden border-2 border-destructive/50 shadow-md shadow-destructive/10">
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-60 pointer-events-none" />
      <div className="relative w-full h-40 sm:h-52">
        <Image 
          src={enemy.cardImage} 
          alt={enemy.name} 
          fill 
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          className="z-0"
        />
      </div>
      <CardHeader className="relative z-20 -mt-12 bg-background/90 backdrop-blur-md p-3">
        <CardTitle className="text-md font-bold text-destructive">{enemy.name}</CardTitle>
        <p className="text-xs text-muted-foreground">{enemy.type} - Nv {enemy.level}</p>
      </CardHeader>
      <CardContent className="relative z-20 p-3 pt-0 bg-background/90 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-destructive font-bold">HP</span>
            <span>{currentHp} / {enemy.maxHp}</span>
          </div>
          <Progress value={hpPercent} className="h-2 bg-destructive/20 [&>div]:bg-destructive" />
        </div>
      </CardContent>
    </Card>
  );
}
