import React, { useState, useEffect } from 'react';
import { DiceResult } from '@/game-engine/dice';

interface DiceRollerProps {
  result: DiceResult | null;
  isRolling: boolean;
}

export function DiceRoller({ result, isRolling }: DiceRollerProps) {
  const [displayValue, setDisplayValue] = useState<number>(20);

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 20) + 1);
      }, 50);
      return () => clearInterval(interval);
    } else if (result) {
      setDisplayValue(result.roll);
    }
  }, [isRolling, result]);

  if (!isRolling && !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
      <div className={`relative flex flex-col items-center justify-center transform transition-transform duration-500 ${isRolling ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}`}>
        <div className={`w-32 h-32 flex items-center justify-center rounded-xl bg-gradient-to-br shadow-2xl
          ${result?.isCriticalSuccess ? 'from-yellow-400 to-yellow-600 shadow-yellow-500/50' : 
            result?.isCriticalFailure ? 'from-red-600 to-red-900 shadow-red-600/50' : 
            'from-slate-700 to-slate-900 shadow-primary/30'}
          border-4 ${result?.isCriticalSuccess ? 'border-yellow-200' : result?.isCriticalFailure ? 'border-red-400' : 'border-primary'}`}
        >
          <span className={`text-5xl font-black ${result?.isCriticalSuccess ? 'text-yellow-100' : result?.isCriticalFailure ? 'text-red-100' : 'text-primary'}`}>
            {displayValue}
          </span>
        </div>
        
        {!isRolling && result && (
          <div className="mt-4 text-center bg-background/90 p-3 rounded-lg border border-border shadow-xl">
            <div className="text-xl font-bold text-foreground">
              {result.isCriticalSuccess && <span className="text-yellow-500">Acerto Crítico!</span>}
              {result.isCriticalFailure && <span className="text-red-500">Falha Crítica!</span>}
              {!result.isCriticalSuccess && !result.isCriticalFailure && (
                result.success ? <span className="text-green-400">Sucesso</span> : <span className="text-red-400">Falha</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Dado: {result.roll} | Total: {result.total}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
