import React, { useState, useEffect } from 'react';
import { DiceResult } from '@/game-engine/dice';

interface DiceRollerProps {
  result: DiceResult | null;
  isRolling: boolean;
}

export function DiceRoller({ result, isRolling }: DiceRollerProps) {
  const [phase, setPhase] = useState<'hidden' | 'suspense' | 'reveal'>('hidden');

  useEffect(() => {
    if (isRolling) {
      setPhase('suspense');
    } else if (result) {
      setPhase('reveal');
      const t = setTimeout(() => setPhase('hidden'), 2500); // Esconde a carta após 2.5s
      return () => clearTimeout(t);
    } else {
      setPhase('hidden');
    }
  }, [isRolling, result]);

  if (phase === 'hidden') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none transition-opacity duration-300 perspective-1000">
      
      {/* Fase 1: Carta Virada para Baixo (Suspense) */}
      {phase === 'suspense' && (
        <div className="w-48 h-72 rounded-xl bg-[url('/images/backgrounds/card-back.jpg')] bg-cover bg-center border-4 border-yellow-600 shadow-[0_0_40px_rgba(202,138,4,0.6)] animate-flip-in card-idle relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
           <div className="absolute inset-0 border-2 border-yellow-400/50 rounded-lg m-1" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="w-16 h-16 border-4 border-yellow-500 rounded-full animate-spin border-t-transparent shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
           </div>
        </div>
      )}

      {/* Fase 2: Carta Revelada (Flip) */}
      {phase === 'reveal' && result && (
        <div className={`w-56 h-80 rounded-2xl border-4 shadow-2xl flex flex-col items-center justify-center animate-flip-in relative overflow-hidden
          ${result.isCriticalSuccess ? 'bg-gradient-to-br from-yellow-500 to-yellow-800 border-yellow-300 shadow-[0_0_80px_rgba(250,204,21,0.8)]' : 
            result.isCriticalFailure ? 'bg-gradient-to-br from-red-700 to-red-950 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.8)]' : 
            'bg-gradient-to-br from-slate-700 to-slate-900 border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.5)]'}
        `}>
          <div className="absolute inset-0 bg-[url('/images/ui/parchment.jpg')] bg-cover opacity-20 mix-blend-overlay" />
          
          {/* Efeito de raio de luz */}
          {(result.isCriticalSuccess || result.success) && <div className="absolute inset-0 light-sweep pointer-events-none" />}

          <div className="relative z-10 text-center px-4">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-widest mb-2">Destino</h3>
            
            <div className={`text-7xl font-black drop-shadow-lg mb-4
              ${result.isCriticalSuccess ? 'text-yellow-100' : result.isCriticalFailure ? 'text-red-200' : 'text-white'}`}>
              {result.roll}
            </div>

            <div className="bg-black/60 rounded-xl p-3 border border-white/20 backdrop-blur-sm w-full">
              <div className="text-xl font-black uppercase tracking-widest">
                {result.isCriticalSuccess && <span className="text-yellow-400">Crítico!</span>}
                {result.isCriticalFailure && <span className="text-red-500">Falha!</span>}
                {!result.isCriticalSuccess && !result.isCriticalFailure && (
                  result.success ? <span className="text-green-400">Sucesso</span> : <span className="text-red-400">Erro</span>
                )}
              </div>
              <div className="text-xs text-white/60 mt-1 font-bold">
                Poder Total: {result.total}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
