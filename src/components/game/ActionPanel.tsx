import React, { useState } from 'react';
import { playActionSound } from '@/lib/audio';
import { Button } from '@/components/ui/button';
import { Hero } from '@/data/heroes';

interface ActionPanelProps {
  hero: Hero;
  onAction: (actionType: string, skillName?: string) => void;
  disabled?: boolean;
}

export function ActionPanel({ hero, onAction, disabled }: ActionPanelProps) {
  const [clickedAction, setClickedAction] = useState<string | null>(null);

  const handleActionClick = (actionId: string, actionName?: string) => {
    if (disabled) return;
    playActionSound();
    setClickedAction(actionId);
    onAction(actionId, actionName);
    
    // Clear the click state after a short delay or when disabled prop changes
    setTimeout(() => setClickedAction(null), 500);
  };

  return (
    <div className="bg-secondary/50 p-4 border-t border-border mt-auto backdrop-blur-md">
      <h3 className="text-primary font-bold mb-3">{hero.name} - Suas Ações</h3>
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => handleActionClick('attack')} 
          disabled={disabled || clickedAction === 'attack'}
          className={`flex-1 min-w-[120px] py-4 px-4 font-black rounded-xl uppercase tracking-widest text-sm transition-all duration-300 border-2 relative overflow-hidden group
            ${clickedAction === 'attack' 
              ? 'bg-yellow-400 border-yellow-200 scale-95 shadow-[0_0_30px_rgba(250,204,21,1)] text-yellow-900' 
              : 'bg-red-700/80 border-red-500 text-red-100 hover:bg-red-600 hover:border-red-400 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(239,68,68,0.8)] active:scale-95'
            } 
            ${disabled && clickedAction !== 'attack' ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
        >
          {clickedAction !== 'attack' && <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent pointer-events-none" />}
          <span className="relative z-10">{clickedAction === 'attack' ? 'ATACANDO!!!' : 'ATACAR'}</span>
        </button>
        
        {hero.skills.map((skill, idx) => (
          <button 
            key={idx} 
            onClick={() => handleActionClick('skill', skill.name)}
            disabled={disabled || hero.mana < skill.cost || clickedAction === skill.name}
            title={`${skill.description} (Custo: ${skill.cost} MP)`}
            className={`flex-1 min-w-[140px] py-4 px-4 font-bold rounded-xl flex flex-col items-center justify-center text-xs uppercase tracking-wider transition-all duration-300 border-2 relative overflow-hidden group
              ${clickedAction === skill.name
                ? 'bg-yellow-400 border-yellow-200 scale-95 shadow-[0_0_30px_rgba(250,204,21,1)] text-yellow-900'
                : 'bg-purple-700/80 border-purple-500 text-purple-100 hover:bg-purple-600 hover:border-purple-400 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] active:scale-95'
              } 
              ${(disabled || hero.mana < skill.cost) && clickedAction !== skill.name ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
          >
            {clickedAction !== skill.name && <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent pointer-events-none" />}
            <span className="relative z-10 font-black">{clickedAction === skill.name ? 'CONJURANDO!!!' : skill.name}</span>
            <span className="relative z-10 text-[10px] text-purple-200 font-bold mt-1 bg-black/40 px-2 py-0.5 rounded-full">{skill.cost} MP</span>
          </button>
        ))}

        <button 
          onClick={() => handleActionClick('defend')} 
          disabled={disabled || clickedAction === 'defend'}
          className={`flex-1 min-w-[120px] py-4 px-4 font-black rounded-xl uppercase tracking-widest text-sm transition-all duration-300 border-2 relative overflow-hidden group
            ${clickedAction === 'defend'
              ? 'bg-yellow-400 border-yellow-200 scale-95 shadow-[0_0_30px_rgba(250,204,21,1)] text-yellow-900'
              : 'bg-blue-700/80 border-blue-500 text-blue-100 hover:bg-blue-600 hover:border-blue-400 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] active:scale-95'
            } 
            ${disabled && clickedAction !== 'defend' ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
        >
          {clickedAction !== 'defend' && <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent pointer-events-none" />}
          <span className="relative z-10">{clickedAction === 'defend' ? 'DEFENDENDO!!!' : 'DEFENDER'}</span>
        </button>
      </div>
    </div>
  );
}
