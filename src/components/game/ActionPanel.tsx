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
  const [showInfo, setShowInfo] = useState(false);

  const handleActionClick = (actionId: string, actionName?: string) => {
    if (disabled) return;
    playActionSound();
    setClickedAction(actionId);
    onAction(actionId, actionName);
    
    // Clear the click state after a short delay or when disabled prop changes
    setTimeout(() => setClickedAction(null), 500);
  };

  return (
    <div className="bg-secondary/50 p-4 border-t border-border mt-auto backdrop-blur-md relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-primary font-bold text-lg">{hero.name} - Suas Ações</h3>
        <button 
          onClick={() => setShowInfo(true)}
          className="flex items-center gap-2 px-3 py-1 bg-sapires-dark/80 border border-primary/50 rounded-full text-primary hover:bg-primary/20 hover:text-yellow-400 transition-colors text-xs uppercase font-bold tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Ficha do Herói
        </button>
      </div>
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

      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-sapires-dark/95 border-2 border-primary/50 w-full max-w-md rounded-2xl p-6 shadow-[0_0_50px_rgba(197,168,128,0.2)] animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
              <div>
                <h2 className="text-2xl font-black text-primary uppercase tracking-widest">{hero.name}</h2>
                <p className="text-muted-foreground text-sm uppercase tracking-wider">{hero.class} - Nível {hero.level}</p>
              </div>
              <button onClick={() => setShowInfo(false)} className="text-muted-foreground hover:text-red-400 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background p-3 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground block mb-1 uppercase tracking-widest">Atributos</span>
                <ul className="text-sm font-bold text-foreground space-y-1">
                  <li><span className="text-red-400">Força:</span> {hero.attributes.forca}</li>
                  <li><span className="text-green-400">Agilidade:</span> {hero.attributes.agilidade}</li>
                  <li><span className="text-blue-400">Inteligência:</span> {hero.attributes.inteligencia}</li>
                  <li><span className="text-purple-400">Espírito:</span> {hero.attributes.espirito}</li>
                  <li><span className="text-yellow-400">Defesa:</span> {hero.attributes.defesa}</li>
                  <li><span className="text-cyan-400">Velocidade:</span> {hero.attributes.velocidade}</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="bg-background p-3 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground block mb-1 uppercase tracking-widest">Equipamento</span>
                  <ul className="text-sm font-bold text-foreground">
                    {hero.equipment.map((eq, i) => <li key={i}>{eq}</li>)}
                  </ul>
                </div>
                
                <div className="bg-primary/10 p-3 rounded-lg border border-primary/30">
                  <span className="text-xs text-primary block mb-1 uppercase tracking-widest">Passiva</span>
                  <p className="text-sm font-bold text-foreground">{hero.passive.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{hero.passive.description}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowInfo(false)}
              className="w-full py-3 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-lg hover:bg-primary/80 transition-colors"
            >
              Fechar Ficha
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
