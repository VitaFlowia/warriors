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
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => handleActionClick('attack')} 
          disabled={disabled || clickedAction === 'attack'}
          className={`flex-1 min-w-[120px] py-3 px-4 font-bold rounded-lg uppercase tracking-widest text-sm transition-all duration-200 border-2 
            ${clickedAction === 'attack' 
              ? 'bg-green-600 border-green-400 scale-95 shadow-[0_0_20px_rgba(74,222,128,0.8)] text-white' 
              : 'bg-red-900 border-red-700 text-red-100 hover:bg-red-800 hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] active:scale-95'
            } 
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {clickedAction === 'attack' ? 'Atacando...' : 'Atacar'}
        </button>
        
        {hero.skills.map((skill, idx) => (
          <button 
            key={idx} 
            onClick={() => handleActionClick('skill', skill.name)}
            disabled={disabled || hero.mana < skill.cost || clickedAction === skill.name}
            title={`${skill.description} (Custo: ${skill.cost} MP)`}
            className={`flex-1 min-w-[140px] py-3 px-4 font-bold rounded-lg flex flex-col items-center justify-center text-xs uppercase tracking-wider transition-all duration-200 border-2 
              ${clickedAction === skill.name
                ? 'bg-green-600 border-green-400 scale-95 shadow-[0_0_20px_rgba(74,222,128,0.8)] text-white'
                : 'bg-purple-900 border-purple-700 text-purple-100 hover:bg-purple-800 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-95'
              } 
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>{clickedAction === skill.name ? 'Conjurando...' : skill.name}</span>
            <span className="text-[10px] opacity-70 font-normal mt-1 text-center">{skill.cost} MP</span>
          </button>
        ))}

        <button 
          onClick={() => handleActionClick('defend')} 
          disabled={disabled || clickedAction === 'defend'}
          className={`flex-1 min-w-[120px] py-3 px-4 font-bold rounded-lg uppercase tracking-widest text-sm transition-all duration-200 border-2 
            ${clickedAction === 'defend'
              ? 'bg-green-600 border-green-400 scale-95 shadow-[0_0_20px_rgba(74,222,128,0.8)] text-white'
              : 'bg-blue-900 border-blue-700 text-blue-100 hover:bg-blue-800 hover:shadow-[0_0_15px_rgba(0,100,255,0.5)] active:scale-95'
            } 
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {clickedAction === 'defend' ? 'Defendendo...' : 'Defender'}
        </button>
      </div>
    </div>
  );
}
