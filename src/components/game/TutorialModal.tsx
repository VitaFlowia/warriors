import React, { useState, useEffect } from 'react';
import { playActionSound, speakText, clearAudioQueue } from '@/lib/audio';

interface TutorialStep {
  title: string;
  text: string;
  image?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Bem-vindos, Guerreiros!",
    text: "Bem-vindos a Sá Pires Warriors! O RPG Tático onde a sorte e a sua estratégia decidem a vitória. Preste muita atenção neste guia de sobrevivência.",
    image: "/images/logo/sapires-warriors-logo.png"
  },
  {
    title: "Sua Jornada Começa",
    text: "Antes de entrar no combate, você ficará no Porto das Brumas. Lá você gerencia suas missões, estuda na biblioteca ou usa a forja para melhorar o seu equipamento.",
    image: "/images/backgrounds/porto-das-brumas.png"
  },
  {
    title: "A Taverna da Economia",
    text: "Cada inimigo derrotado te rende moedas de ouro. Use o seu ouro arduamente conquistado na Taverna para comprar poções de vida ou novos anéis de poder!",
    image: "/images/ui/parchment.jpg"
  },
  {
    title: "Campo de Batalha",
    text: "Durante a batalha, fique de olho na barra superior para saber de quem é o turno. Para agir, primeiro toque no cartão do inimigo que deseja focar, e depois pressione o botão de ataque ou magia na sua mesa.",
    image: "/images/backgrounds/ruas-em-chamas.png"
  },
  {
    title: "O Destino nas Suas Mãos",
    text: "Toda ação puxa a Carta do Destino do baralho. O sucesso ou a sua ruína serão decididos pela sorte! Boa sorte, guerreiro, e não deixe a sua barra de vida zerar!",
    image: "/images/backgrounds/card-back.jpg"
  }
];

interface TutorialModalProps {
  onClose: () => void;
}

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // When step changes, read the text out loud
    clearAudioQueue(); // Stop previous voice
    const step = TUTORIAL_STEPS[currentStep];
    if (step) {
      speakText(step.text, 'narrator');
    }
    
    return () => clearAudioQueue();
  }, [currentStep]);

  const handleNext = () => {
    playActionSound();
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      clearAudioQueue();
      onClose();
    }
  };

  const stepInfo = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-sapires-dark/95 border-2 border-primary rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(197,168,128,0.2)] flex flex-col">
        
        {/* Header */}
        <div className="bg-primary/20 border-b border-primary/50 p-4 flex justify-between items-center">
          <h2 className="text-xl font-black text-primary uppercase tracking-widest flex items-center gap-2">
            🎓 Tutorial Mágico
          </h2>
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-all ${i === currentStep ? 'bg-primary scale-125 shadow-[0_0_10px_rgba(197,168,128,0.8)]' : 'bg-primary/30'}`} 
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
          {stepInfo.image && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border shadow-inner opacity-80 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stepInfo.image} alt="Tutorial Info" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          )}
          
          <h3 className="text-3xl font-black text-white drop-shadow-md">{stepInfo.title}</h3>
          
          <p className="text-lg text-primary/90 leading-relaxed font-medium bg-black/50 p-4 rounded-xl border border-white/5">
            {stepInfo.text}
          </p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse mt-4">
            <span>🔊 Áudio Ligado: O Mestre está explicando...</span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-primary/20 flex justify-end">
          <button 
            onClick={handleNext}
            className="px-8 py-3 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(197,168,128,0.6)] transition-all hover:scale-[1.02] active:scale-95"
          >
            {currentStep < TUTORIAL_STEPS.length - 1 ? 'Próximo Passo ➡️' : 'Entendi, vamos jogar! ⚔️'}
          </button>
        </div>
      </div>
    </div>
  );
}
