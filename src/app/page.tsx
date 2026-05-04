'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IntroVideo } from '@/components/game/IntroVideo';
import { BattleScene } from '@/components/game/BattleScene';
import { ActionPanel } from '@/components/game/ActionPanel';
import { BattleLog, LogEntry } from '@/components/game/BattleLog';
import { DiceRoller } from '@/components/game/DiceRoller';
import { D20Interactive } from '@/components/game/D20Interactive';
import { heroes, Hero } from '@/data/heroes';
import { enemies, Enemy } from '@/data/enemies';
import { executeAttack, CombatResult } from '@/game-engine/combat';
import { DiceResult } from '@/game-engine/dice';
import { playTurnSound, speakText } from '@/lib/audio';

import { VillageScene } from '@/components/game/VillageScene';
import { MapTransition } from '@/components/game/MapTransition';
import { ChatPanel } from '@/components/game/ChatPanel';
import { InventoryPanel } from '@/components/game/InventoryPanel';

type GameState = 'intro' | 'menu' | 'village' | 'transition' | 'battle';

export default function Home() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | 'loading'>('loading');
  const [destination, setDestination] = useState<string>('');
  const [activeHeroes, setActiveHeroes] = useState<Hero[]>([]);
  const [activeEnemies, setActiveEnemies] = useState<{enemy: Enemy, currentHp: number}[]>([]);
  
  // Battle State
  const [turnOrder, setTurnOrder] = useState<string[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Dice State
  const [diceResult, setDiceResult] = useState<DiceResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Player State
  const [myHeroId, setMyHeroId] = useState<string | null>(null);
  const [showTurnBanner, setShowTurnBanner] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [isInteractiveRolling, setIsInteractiveRolling] = useState(false);

  useEffect(() => {
    // Only access localStorage on client
    if (typeof window !== 'undefined') {
      const heroId = localStorage.getItem('my_hero_id');
      if (heroId) {
        setMyHeroId(heroId);
        // Start at the village (The Map) after lobby
        setGameState('village');
        
        // Prepare all 7 heroes for the session
        const allHeroes = heroes.slice(0, 7);
        const initialEnemies = [
          { enemy: { ...enemies[0], id: 'goblin-1' }, currentHp: enemies[0].maxHp },
          { enemy: { ...enemies[0], id: 'goblin-2' }, currentHp: enemies[0].maxHp },
          { enemy: { ...enemies[0], id: 'goblin-3' }, currentHp: enemies[0].maxHp },
        ];
        
        setActiveHeroes(allHeroes);
        setActiveEnemies(initialEnemies);
        
        const order = [...allHeroes.map(h => h.id), ...initialEnemies.map(e => e.enemy.id)];
        setTurnOrder(order);
        setCurrentTurnIndex(0);
      } else {
        setGameState('intro');
      }
    }
  }, []);

  useEffect(() => {
    if (gameState === 'battle' && turnOrder.length > 0) {
      const currentActorId = turnOrder[currentTurnIndex];
      if (currentActorId === myHeroId) {
        playTurnSound();
        setShowTurnBanner(true);
        setTimeout(() => setShowTurnBanner(false), 3000);
      }
    }
  }, [currentTurnIndex, gameState, myHeroId, turnOrder]);

  const addLog = (message: string, type: LogEntry['type'], voiceKey: string = 'system') => {
    setLogs(prev => [...prev, { id: Math.random().toString(), message, type, timestamp: new Date() }]);
    // Narra automaticamente logs do tipo narrativa ou sistema (início de batalha, etc)
    if (type === 'narrative' || type === 'system') {
      speakText(message, voiceKey);
    }
  };

  const enterVillage = () => {
    setGameState('village');
  };

  const handleVillageClick = (id: string) => {
    if (id === 'battle') {
      setDestination('Ruas em Chamas');
      setGameState('transition');
    } else {
      // Feedback imediato para o usuário
      alert(`Você se dirigiu para: ${id.toUpperCase()}. \n\n(A funcionalidade completa deste prédio será ativada na próxima atualização!)`);
    }
  };

  const startGame = () => {
    setGameState('battle');
    addLog('A batalha em Ruas em Chamas começou!', 'system');
  };

  const handleAction = async (actionType: string, skillName?: string) => {
    const actorId = turnOrder[currentTurnIndex];
    const actor = activeHeroes.find(h => h.id === actorId);
    if (!actor) return; // Inimigos jogam sozinhos depois

    // Target (always first alive enemy for MVP)
    const aliveEnemies = activeEnemies.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) return;
    const target = aliveEnemies[0];

    addLog(`${actor.name} prepara ${skillName || 'um ataque'} contra ${target.enemy.name}...`, 'narrative', actor.id);

    // Se for o jogador atual, abre o dado interativo 3D
    if (actorId === myHeroId) {
      setPendingAction({
        actorId: actor.id,
        actor: actor.name,
        target: target.enemy.name,
        attributeBonus: actor.attributes.forca,
        weaponDamage: 4, // Mock weapon
        defenseBonus: target.enemy.attributes.defesa
      });
      setIsInteractiveRolling(true);
      return; // Interrompe e espera o usuário jogar o dado
    }

    // Se não for (embora agora tenhamos o Ghost mode separado, fallback pro 2D normal)
    setIsRolling(true);
    setDiceResult(null);

    // Simulate dice roll delay (Aumentado para suspense das crianças)
    await new Promise(r => setTimeout(r, 3500));
    
    const result = executeAttack({
      actor: actor.name,
      target: target.enemy.name,
      attributeBonus: actor.attributes.forca,
      weaponDamage: 4, // Mock weapon
      defenseBonus: target.enemy.attributes.defesa
    });

    setIsRolling(false);
    setDiceResult(result.diceResult);
    
    // Auto hide dice after 4.5s
    setTimeout(async () => {
      setDiceResult(null);
      
      // Mostrar log técnico primeiro
      addLog(result.logMessage, 'combat');
      
      if (result.damageDealt > 0) {
        setActiveEnemies(prev => prev.map(e => 
          e.enemy.id === target.enemy.id 
            ? { ...e, currentHp: Math.max(0, e.currentHp - result.damageDealt) } 
            : e
        ));
      }

      // Invocar a IA Mestre para narrar o golpe (sem travar o fluxo principal)
      fetch('/api/ai/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionContext: result.logMessage })
      })
      .then(res => res.json())
      .then(data => {
        if (data.narrative) {
          addLog(data.narrative, 'narrative', actorId);
        }
      })
      .catch(console.error);

      nextTurn();
    }, 4500);
  };

  const handleInteractiveRollComplete = (rollValue: number) => {
    setIsInteractiveRolling(false);
    setIsRolling(true); // Abre o visualizador de resultado 2D (DiceRoller) para mostrar o número que ele tirou na tela inteira
    
    // Executa o combate forçando o valor que saiu no dado 3D físico
    const result = executeAttack({
      ...pendingAction,
      preRolledDice: rollValue
    });
    
    setPendingAction(null);
    setIsRolling(false);
    setDiceResult(result.diceResult);
    
    setTimeout(async () => {
      setDiceResult(null);
      addLog(result.logMessage, 'combat');
      
      if (result.damageDealt > 0) {
        setActiveEnemies(prev => prev.map(e => 
          e.enemy.id === pendingAction.target // Mock: here pendingAction.target is just the name, but for MVP it works since we know it's target[0]
            ? { ...e, currentHp: Math.max(0, e.currentHp - result.damageDealt) } 
            : e
        ));
      }

      fetch('/api/ai/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionContext: result.logMessage })
      })
      .then(res => res.json())
      .then(data => { if (data.narrative) addLog(data.narrative, 'narrative', pendingAction.actorId); })
      .catch(console.error);

      nextTurn();
    }, 4500);
  };

  const nextTurn = () => {
    setCurrentTurnIndex(prev => {
      const next = (prev + 1) % turnOrder.length;
      return next;
    });
  };

  // Bot logic for enemies
  useEffect(() => {
    if (gameState !== 'battle') return;
    
    const actorId = turnOrder[currentTurnIndex];
    const isEnemy = activeEnemies.some(e => e.enemy.id === actorId && e.currentHp > 0);
    
    if (isEnemy) {
      const enemy = activeEnemies.find(e => e.enemy.id === actorId);
      if (!enemy) return;
      
      const aliveHeroes = activeHeroes.filter(h => h.hp > 0);
      if (aliveHeroes.length === 0) return;
      const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];

      setTimeout(async () => {
        addLog(`${enemy.enemy.name} avança contra ${target.name}!`, 'narrative');
        
        setIsRolling(true);
        setDiceResult(null);
        await new Promise(r => setTimeout(r, 3500));
        
        const result = executeAttack({
          actor: enemy.enemy.name,
          target: target.name,
          attributeBonus: enemy.enemy.attributes.forca,
          weaponDamage: 2,
          defenseBonus: target.attributes.defesa
        });

        setIsRolling(false);
        setDiceResult(result.diceResult);
        
        setTimeout(async () => {
          setDiceResult(null);
          
          // Mostrar log técnico primeiro
          addLog(result.logMessage, 'combat');
          
          if (result.damageDealt > 0) {
            setActiveHeroes(prev => prev.map(h => 
              h.id === target.id ? { ...h, hp: Math.max(0, h.hp - result.damageDealt) } : h
            ));
          }

          // Invocar IA Mestre para narrativa do monstro
          fetch('/api/ai/narrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actionContext: result.logMessage })
          })
          .then(res => res.json())
          .then(data => {
            if (data.narrative) {
              addLog(data.narrative, 'narrative', 'system'); // Inimigos usam voz do narrador
            }
          })
          .catch(console.error);

          nextTurn();
        }, 4000);

      }, 1000);
    } else if (activeEnemies.some(e => e.enemy.id === actorId && e.currentHp <= 0)) {
      // Dead enemy turn, skip
      nextTurn();
    } else {
      // Ghost Mode (Auto-play for other Heroes / Missing Players)
      const isHero = activeHeroes.some(h => h.id === actorId && h.hp > 0);
      if (isHero && actorId !== myHeroId && myHeroId !== null) {
        const hero = activeHeroes.find(h => h.id === actorId);
        if (!hero) return;

        const aliveEnemies = activeEnemies.filter(e => e.currentHp > 0);
        if (aliveEnemies.length === 0) return;
        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

        setTimeout(async () => {
          addLog(`${hero.name} (Modo Fantasma) avança contra ${target.enemy.name}...`, 'narrative', hero.id);
          
          setIsRolling(true);
          setDiceResult(null);
          await new Promise(r => setTimeout(r, 3500));
          
          const result = executeAttack({
            actor: hero.name,
            target: target.enemy.name,
            attributeBonus: hero.attributes.forca,
            weaponDamage: 4,
            defenseBonus: target.enemy.attributes.defesa
          });

          setIsRolling(false);
          setDiceResult(result.diceResult);
          
          setTimeout(async () => {
            setDiceResult(null);
            addLog(result.logMessage, 'combat');
            
            if (result.damageDealt > 0) {
              setActiveEnemies(prev => prev.map(e => 
                e.enemy.id === target.enemy.id 
                  ? { ...e, currentHp: Math.max(0, e.currentHp - result.damageDealt) } 
                  : e
              ));
            }

            fetch('/api/ai/narrate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ actionContext: result.logMessage })
            })
            .then(res => res.json())
            .then(data => { if (data.narrative) addLog(data.narrative, 'narrative', actorId); })
            .catch(console.error);

            nextTurn();
          }, 4500);

        }, 1500);
      }
    }
  }, [currentTurnIndex, gameState, myHeroId]);

  if (gameState === 'loading') {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (gameState === 'intro') {
    return <IntroVideo onComplete={() => router.push('/login')} />;
  }

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center bg-[url('/images/backgrounds/porto-das-brumas.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="z-10 text-center space-y-8">
          <img src="/images/logo/sapires-warriors-logo.png" alt="Sá Pires Warriors" className="max-w-md mx-auto drop-shadow-2xl" />
          <h1 className="text-4xl font-bold text-primary tracking-widest uppercase">Porto das Brumas</h1>
          <div className="space-x-4">
            <button onClick={enterVillage} className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/80 transition-colors text-xl shadow-[0_0_15px_rgba(197,168,128,0.5)]">
              Entrar na Vila
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'village') {
    return (
      <div className="min-h-screen bg-sapires-dark flex flex-col items-center py-10 relative">
        <audio autoPlay loop src="/audio/music/porto-das-brumas.mp3" />
        <img src="/images/logo/sapires-warriors-logo.png" alt="Logo" className="w-64 mb-4" />
        <VillageScene onLocationClick={handleVillageClick} />
      </div>
    );
  }

  if (gameState === 'transition') {
    return (
      <div className="min-h-screen bg-black">
        <MapTransition 
          isVisible={true} 
          destinationName={destination} 
          onTransitionComplete={startGame} 
        />
      </div>
    );
  }

  const currentActorId = turnOrder[currentTurnIndex];
  const currentHero = activeHeroes.find(h => h.id === currentActorId);

  return (
    <main className="min-h-screen flex flex-col bg-[url('/images/backgrounds/ruas-em-chamas.png')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Audio Theme */}
      <audio autoPlay loop src="/audio/music/battle-theme.mp3" />

      {/* Main Battle Area */}
      <div className="flex-1 flex w-full relative z-10">
        <InventoryPanel />
        <BattleScene 
          heroes={activeHeroes}
          enemies={activeEnemies}
          activeCharacterId={currentActorId}
        />
        
        {/* Right Sidebar - Battle Log */}
        <div className="w-80 h-full border-l border-border bg-background/50 backdrop-blur-md hidden lg:block">
          <BattleLog logs={logs} />
        </div>
      </div>

      {/* Action Panel (Bottom) */}
      <div className="h-40 relative z-20 w-full">
        {currentHero ? (
          <ActionPanel 
            hero={currentHero} 
            onAction={handleAction} 
            disabled={isRolling || !!diceResult}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-secondary/50 backdrop-blur-md border-t border-border">
            <span className="text-xl text-muted-foreground animate-pulse">Turno Inimigo...</span>
          </div>
        )}
      </div>

      <DiceRoller result={diceResult} isRolling={isRolling} />
      <ChatPanel />

      {/* Turn Banner */}
      {showTurnBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in slide-in-from-top-10 fade-in duration-500">
          <div className="bg-green-900/90 border-2 border-green-400 px-10 py-4 rounded-full shadow-[0_0_30px_rgba(74,222,128,0.8)] backdrop-blur-md">
            <h2 className="text-3xl font-black text-white uppercase tracking-widest animate-pulse">É A SUA VEZ!</h2>
          </div>
        </div>
      )}

      {/* 3D Interactive Dice Overlay */}
      {isInteractiveRolling && (
        <D20Interactive onRollComplete={handleInteractiveRollComplete} isRolling={false} />
      )}
    </main>
  );
}
