'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
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
import { addXp, getEnemyXpReward, getVictoryBonusXp, distributeVictoryXp, LevelUpResult } from '@/game-engine/leveling';
import { playTurnSound, speakText, playVictoryFanfare, clearAudioQueue } from '@/lib/audio';

import { VillageScene } from '@/components/game/VillageScene';
import { MapTransition } from '@/components/game/MapTransition';
import { ChatPanel } from '@/components/game/ChatPanel';
import { InventoryPanel } from '@/components/game/InventoryPanel';
import { PWAInstall } from '@/components/game/PWAInstall';
import { NarrativeCard } from '@/components/game/NarrativeCard';
import { QuestPanel } from '@/components/game/QuestPanel';
import { InitiativeBar } from '@/components/game/InitiativeBar';
import { TavernShop, ShopItem } from '@/components/game/TavernShop';
import { TutorialModal } from '@/components/game/TutorialModal';
import { locationLore, initialQuests, Quest, LocationLore, getPostBattleNarrative, waves, WaveConfig, GOLD_COSTS, GOLD_PER_ENEMY_LEVEL } from '@/data/lore';

type GameState = 'intro' | 'menu' | 'village' | 'transition' | 'battle' | 'victory';

// Background music volume (lower to let voices through)
const BG_MUSIC_VOLUME = 0.12;

// Delays (ms)
const GHOST_INITIAL_DELAY = 2500;
const GHOST_DICE_ANIM = 2000;
const GHOST_RESULT_DISPLAY = 2500;
const ENEMY_INITIAL_DELAY = 1500;
const ENEMY_DICE_ANIM = 2000;
const ENEMY_RESULT_DISPLAY = 2500;
const PLAYER_RESULT_DISPLAY = 3000;

export default function Home() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | 'loading'>('loading');
  const [destination, setDestination] = useState<string>('');
  const [activeHeroes, setActiveHeroes] = useState<Hero[]>([]);
  const [activeEnemies, setActiveEnemies] = useState<{enemy: Enemy, currentHp: number}[]>([]);
  
  // Battle State
  const [turnOrder, setTurnOrder] = useState<string[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Dice State
  const [diceResult, setDiceResult] = useState<DiceResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Player State
  const [myHeroId, setMyHeroId] = useState<string | null>(null);
  const [showTurnBanner, setShowTurnBanner] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [isInteractiveRolling, setIsInteractiveRolling] = useState(false);
  const [broadcastChannel, setBroadcastChannel] = useState<any>(null);
  
  // XP tracking
  const [totalEnemyXpEarned, setTotalEnemyXpEarned] = useState(0);
  const [levelUpResults, setLevelUpResults] = useState<LevelUpResult[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Player join notifications
  const [joinNotification, setJoinNotification] = useState<string | null>(null);
  
  // Narrative & Quest system
  const [activeNarrative, setActiveNarrative] = useState<LocationLore | null>(null);
  const [narrativeAction, setNarrativeAction] = useState<{ label: string; action: () => void; disabled?: boolean } | null>(null);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [visitedLocations, setVisitedLocations] = useState<Set<string>>(new Set());
  const [postBattleNarrative, setPostBattleNarrative] = useState<string | null>(null);
  
  // Wave system
  const [currentWave, setCurrentWave] = useState(0); // index into waves array
  const [showWaveIntro, setShowWaveIntro] = useState(false);
  const [waveIntroText, setWaveIntroText] = useState('');
  
  // Gold system
  const [gold, setGold] = useState(20); // Start with 20 gold
  const [goldAnimation, setGoldAnimation] = useState<{ amount: number; id: number } | null>(null);
  
  // Battle FX
  const [screenShake, setScreenShake] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; amount: number; type: 'damage' | 'heal' | 'xp'; targetId: string }[]>([]);
  
  // Target Selection
  const [selectingTargetAction, setSelectingTargetAction] = useState<{actionType: string, skillName?: string} | null>(null);
  
  // Mobile UI
  const [isMobileLogOpen, setIsMobileLogOpen] = useState(false);
  
  // Economy & Shop UI
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Defending heroes (reduce damage by 50% on next hit)
  const [defendingHeroes, setDefendingHeroes] = useState<Set<string>>(new Set());
  
  // === SEMAPHORE: prevents turn overlap ===
  const isTurnProcessing = useRef(false);
  const turnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Music ref
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // Initialize session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const validateSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const heroId = localStorage.getItem('my_hero_id');
        
        if (session && heroId) {
          setMyHeroId(heroId);
          setGameState('village');

          // Setup Broadcast Channel for shouts, sync, and join notifications
          const channel = supabase.channel('battle_room_1');
          channel.on('broadcast', { event: 'shout' }, ({ payload }) => {
            addLog(payload.message, 'narrative', payload.heroId);
          });
          channel.on('broadcast', { event: 'victory' }, ({ payload }) => {
            // Apply XP results from host
            if (payload.xpResults) {
              setLevelUpResults(payload.xpResults);
              setShowLevelUp(payload.xpResults.some((r: LevelUpResult) => r.didLevelUp));
            }
            setGameState('victory');
            playVictoryFanfare();
          });
          channel.on('broadcast', { event: 'player_joined' }, ({ payload }) => {
            const name = payload.playerName || 'Um aventureiro';
            const heroName = payload.heroName || '';
            setJoinNotification(`⚔️ ${name} entrou na batalha${heroName ? ` como ${heroName}` : ''}!`);
            addLog(`${name} entrou na partida!`, 'system');
            setTimeout(() => setJoinNotification(null), 5000);
          });
          channel.subscribe();
          setBroadcastChannel(channel);
          
          // Announce self joining
          const meta = session.user.user_metadata || {};
          const myName = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Aventureiro';
          const myHero = heroes.find(h => h.id === heroId);
          setTimeout(() => {
            channel.send({
              type: 'broadcast',
              event: 'player_joined',
              payload: { playerName: myName, heroName: myHero?.name || '' }
            });
          }, 2000); // Small delay to ensure subscription is ready
          
          const allHeroes = heroes.slice(0, 7);
          
          // Initialize first wave enemies
          const wave1 = waves[0];
          const initialEnemies = buildEnemiesFromWave(wave1);
          
          setActiveHeroes(allHeroes);
          setActiveEnemies(initialEnemies);
          setCurrentWave(0);
          
          const order = [...allHeroes.map(h => h.id), ...initialEnemies.map(e => e.enemy.id)];
          setTurnOrder(order);
          setCurrentTurnIndex(0);
        } else {
          setGameState('intro');
        }
      };
      
      validateSession();
    }
  }, []);

  // Turn banner notification
  useEffect(() => {
    if (gameState === 'battle' && turnOrder.length > 0) {
      const currentActorId = turnOrder[currentTurnIndex];
      if (currentActorId === myHeroId) {
        playTurnSound();
        setShowTurnBanner(true);
        const t = setTimeout(() => setShowTurnBanner(false), 3000);
        return () => clearTimeout(t);
      }
    }
  }, [currentTurnIndex, gameState, myHeroId, turnOrder]);

  const addLog = useCallback((message: string, type: LogEntry['type'], voiceKey: string = 'system') => {
    setLogs(prev => [...prev, { id: Math.random().toString(), message, type, timestamp: new Date() }]);
    if (type === 'narrative' || type === 'system') {
      speakText(message, voiceKey);
    }
  }, []);

  const enterVillage = () => {
    setGameState('village');
  };

  const handleVillageClick = (id: string) => {
    // Track visited locations for quest completion
    setVisitedLocations(prev => new Set(prev).add(id));
    
    // Get lore for this location
    const lore = locationLore[id];
    
    if (id === 'battle') {
      // Show battle narrative then start
      if (lore) {
        setActiveNarrative(lore);
        setNarrativeAction({
          label: '⚔️ Entrar na Batalha',
          action: () => {
            setActiveNarrative(null);
            setNarrativeAction(null);
            setDestination('Ruas em Chamas');
            setGameState('transition');
          }
        });
      } else {
        setDestination('Ruas em Chamas');
        setGameState('transition');
      }
      return;
    }
    
    if (id === 'tavern') {
      setActiveNarrative(lore || null);
      setNarrativeAction({
        label: '🍺 Abrir Loja da Taverna',
        action: () => {
          setIsShopOpen(true);
          setActiveNarrative(null);
          setNarrativeAction(null);
        }
      });
      return;
    }
    
    if (id === 'blacksmith') {
      const myHero = activeHeroes.find(h => h.id === myHeroId);
      setActiveNarrative(lore || null);
      setNarrativeAction({
        label: gold >= GOLD_COSTS.blacksmith 
          ? `🗡️ Melhorar Arma (+1 Força) — ${GOLD_COSTS.blacksmith} Ouro`
          : `🗡️ Ouro insuficiente (${gold}/${GOLD_COSTS.blacksmith})`,
        disabled: gold < GOLD_COSTS.blacksmith,
        action: () => {
          if (myHero && gold >= GOLD_COSTS.blacksmith) {
            setGold(prev => prev - GOLD_COSTS.blacksmith);
            setActiveHeroes(prev => prev.map(h => 
              h.id === myHeroId ? { 
                ...h, 
                attributes: { ...h.attributes, forca: h.attributes.forca + 1 } 
              } : h
            ));
            addLog(`${myHero.name} melhorou sua arma na Forja! +1 Força. (-${GOLD_COSTS.blacksmith} Ouro)`, 'system', myHero.id);
            setQuests(prev => prev.map(q => 
              q.id === 'quest-3' && !q.isCompleted ? { ...q, isCompleted: true } : q
            ));
          }
          setActiveNarrative(null);
          setNarrativeAction(null);
        }
      });
      return;
    }
    
    if (id === 'library') {
      const myHero = activeHeroes.find(h => h.id === myHeroId);
      setActiveNarrative(lore || null);
      setNarrativeAction({
        label: gold >= GOLD_COSTS.library 
          ? `📚 Estudar (+2 Mana) — ${GOLD_COSTS.library} Ouro`
          : `📚 Ouro insuficiente (${gold}/${GOLD_COSTS.library})`,
        disabled: gold < GOLD_COSTS.library,
        action: () => {
          if (myHero && gold >= GOLD_COSTS.library) {
            setGold(prev => prev - GOLD_COSTS.library);
            setActiveHeroes(prev => prev.map(h => 
              h.id === myHeroId ? { ...h, mana: h.mana + 2 } : h
            ));
            addLog(`${myHero.name} estudou na Biblioteca! +2 Mana. (-${GOLD_COSTS.library} Ouro)`, 'system', myHero.id);
            setQuests(prev => prev.map(q => 
              q.id === 'quest-4' && !q.isCompleted ? { ...q, isCompleted: true } : q
            ));
          }
          setActiveNarrative(null);
          setNarrativeAction(null);
        }
      });
      return;
    }
    
    if (id === 'dock') {
      const myHero = activeHeroes.find(h => h.id === myHeroId);
      setActiveNarrative(lore || null);
      setNarrativeAction({
        label: gold >= GOLD_COSTS.dock 
          ? `🃏 Comprar Poções (+2) — ${GOLD_COSTS.dock} Ouro`
          : `🃏 Ouro insuficiente (${gold}/${GOLD_COSTS.dock})`,
        disabled: gold < GOLD_COSTS.dock,
        action: () => {
          if (myHero && gold >= GOLD_COSTS.dock) {
            setGold(prev => prev - GOLD_COSTS.dock);
            setActiveHeroes(prev => prev.map(h => 
              h.id === myHeroId ? { ...h, potionCount: h.potionCount + 2 } : h
            ));
            addLog(`${myHero.name} comprou suprimentos na Doca! +2 Poções. (-${GOLD_COSTS.dock} Ouro)`, 'system', myHero.id);
          }
          setActiveNarrative(null);
          setNarrativeAction(null);
        }
      });
      return;
    }
    
    // Fallback
    if (lore) {
      setActiveNarrative(lore);
      setNarrativeAction(null);
    }
  };

  // ============================
  // BUILD ENEMIES FROM WAVE CONFIG
  // ============================
  const buildEnemiesFromWave = (wave: WaveConfig): {enemy: Enemy, currentHp: number}[] => {
    const result: {enemy: Enemy, currentHp: number}[] = [];
    for (const setup of wave.enemySetup) {
      const baseEnemy = enemies[setup.enemyIndex];
      for (let i = 0; i < setup.count; i++) {
        result.push({
          enemy: { ...baseEnemy, id: `${baseEnemy.id}-w${wave.waveNumber}-${i}` },
          currentHp: baseEnemy.maxHp
        });
      }
    }
    return result;
  };

  // ============================
  // GOLD ANIMATION
  // ============================
  const addGold = useCallback((amount: number) => {
    setGold(prev => prev + amount);
    setGoldAnimation({ amount, id: Date.now() });
    setTimeout(() => setGoldAnimation(null), 2000);
  }, []);

  const startGame = () => {
    isTurnProcessing.current = false;
    setCurrentTurnIndex(0);
    setRoundNumber(1);
    setGameState('battle');
    
    const wave = waves[currentWave];
    addLog(`⚔️ ${wave.title} — A batalha começou!`, 'system');
    
    // Fire-and-forget AI wave intro
    fetch('/api/ai/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        narrativeType: 'wave_intro',
        waveContext: wave.narrative,
        heroNames: activeHeroes.filter(h => h.hp > 0).map(h => h.name).join(', '),
        roundNumber: 1,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.narrative) {
        addLog(data.narrative, 'narrative');
      }
    })
    .catch(console.error);
  };

  // ============================
  // VICTORY CHECK + XP DISTRIBUTION
  // ============================
  const checkVictory = useCallback((currentEnemies: {enemy: Enemy, currentHp: number}[]): boolean => {
    const allDead = currentEnemies.every(e => e.currentHp <= 0);
    if (allDead) {
      const wave = waves[currentWave];
      
      // Calculate total XP earned from all enemies
      const totalXp = totalEnemyXpEarned + (wave?.xpBonus || getVictoryBonusXp());
      
      // Award gold
      const goldEarned = wave?.goldReward || 30;
      addGold(goldEarned);
      
      // Distribute XP to all alive heroes
      const xpResults = distributeVictoryXp(activeHeroes, totalEnemyXpEarned);
      setLevelUpResults(xpResults);
      
      // Apply XP to heroes state
      setActiveHeroes(prev => prev.map(h => {
        const result = xpResults.find(r => r.hero.id === h.id);
        return result ? result.hero : h;
      }));
      
      // Check for level ups
      const levelUps = xpResults.filter(r => r.didLevelUp);
      if (levelUps.length > 0) {
        setShowLevelUp(true);
        levelUps.forEach(lu => {
          addLog(`🌟 ${lu.hero.name} subiu para o Nível ${lu.newLevel}!`, 'system', lu.hero.id);
        });
      }
      
      addLog(`🎉 VITÓRIA na ${wave?.title || 'Onda'}! +${totalXp} XP, +${goldEarned} Ouro!`, 'system');
      setGameState('victory');
      playVictoryFanfare();
      
      // Broadcast victory + XP results to all players
      if (broadcastChannel) {
        broadcastChannel.send({
          type: 'broadcast',
          event: 'victory',
          payload: { xpResults }
        });
      }
      return true;
    }
    return false;
  }, [broadcastChannel, addLog, activeHeroes, totalEnemyXpEarned, currentWave, addGold]);

  // ============================
  // NEXT TURN (with semaphore)
  // ============================
  const nextTurn = useCallback(() => {
    isTurnProcessing.current = false;
    setIsRolling(false);
    setDiceResult(null);
    
    setCurrentTurnIndex(prev => {
      const next = (prev + 1) % turnOrder.length;
      if (next === 0) {
        setRoundNumber(r => r + 1);
      }
      return next;
    });
  }, [turnOrder.length]);

  // ============================
  // PROCESS COMBAT RESULT
  // ============================
  const processCombatResult = useCallback((
    result: CombatResult, 
    targetIsEnemy: boolean, 
    targetIds: string[],
    actorId: string,
    displayTime: number
  ) => {
    setIsRolling(false);
    setDiceResult(result.diceResult);
    
    if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
    
    turnTimeoutRef.current = setTimeout(() => {
      setDiceResult(null);
      addLog(result.logMessage, 'combat');
      
      if (result.damageDealt > 0) {
        let actualDamage = result.damageDealt; // Used as damage OR heal amount
        
        if (targetIsEnemy) {
          // Floating damage/heal on enemies
          const type: 'heal' | 'damage' = result.isHeal ? 'heal' : 'damage';
          setFloatingNumbers(prev => [
            ...prev, 
            ...targetIds.map((id, idx) => ({ id: Date.now() + idx, amount: actualDamage, type, targetId: id }))
          ]);
          
          setTimeout(() => setFloatingNumbers(prev => prev.filter(f => !targetIds.includes(f.targetId) || Date.now() - f.id > 1400)), 1500);
          
          setActiveEnemies(prev => {
            let updated = [...prev];
            targetIds.forEach(tId => {
              updated = updated.map(e => 
                e.enemy.id === tId 
                  ? { ...e, currentHp: result.isHeal ? Math.min(e.enemy.maxHp, e.currentHp + actualDamage) : Math.max(0, e.currentHp - actualDamage) } 
                  : e
              );
              
              // Check if this enemy was just killed -> award XP
              if (!result.isHeal) {
                const killedEnemy = updated.find(e => e.enemy.id === tId && e.currentHp <= 0);
                const wasAlive = prev.find(e => e.enemy.id === tId && e.currentHp > 0);
                if (killedEnemy && wasAlive) {
                  const xpReward = getEnemyXpReward(killedEnemy.enemy.level);
                  const goldReward = GOLD_PER_ENEMY_LEVEL[killedEnemy.enemy.level] || 5;
                  setTotalEnemyXpEarned(x => x + xpReward);
                  addGold(goldReward);
                  addLog(`💀 ${killedEnemy.enemy.name} derrotado! (+${xpReward} XP, +${goldReward} 💰)`, 'system');
                }
              }
            });
            
            // Check victory after updating
            setTimeout(() => checkVictory(updated), 300);
            return updated;
          });
        } else {
          // Hero logic
          targetIds.forEach((tId, idx) => {
            let heroDmg = actualDamage;
            if (!result.isHeal && defendingHeroes.has(tId)) {
              heroDmg = Math.max(1, Math.floor(heroDmg * 0.5));
              setDefendingHeroes(prev => { const next = new Set(prev); next.delete(tId); return next; });
              addLog(`🛡️ Defesa absorveu parte do dano! (-${actualDamage - heroDmg} bloqueado)`, 'system', tId);
            }
            
            if (!result.isHeal) {
              setScreenShake(true);
              setTimeout(() => setScreenShake(false), 400);
            }
            
            const type: 'heal' | 'damage' = result.isHeal ? 'heal' : 'damage';
            setFloatingNumbers(prev => [...prev, { id: Date.now() + idx, amount: heroDmg, type, targetId: tId }]);
            
            setActiveHeroes(prev => prev.map(h => 
              h.id === tId ? { 
                ...h, 
                hp: result.isHeal ? Math.min(h.maxHp, h.hp + heroDmg) : Math.max(0, h.hp - heroDmg) 
              } : h
            ));
          });
          setTimeout(() => setFloatingNumbers(prev => prev.filter(f => !targetIds.includes(f.targetId) || Date.now() - f.id > 1400)), 1500);
        }
      }

      // AI narration (fire-and-forget, no blocking)
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

      // Move to next turn
      nextTurn();
    }, displayTime);
  }, [addLog, checkVictory, nextTurn]);

  // ============================
  // PLAYER ACTION (click attack/skill)
  // ============================
  const handleAction = async (actionType: string, skillName?: string) => {
    if (isTurnProcessing.current) return; // Prevent double-click
    
    const actorId = turnOrder[currentTurnIndex];
    const actor = activeHeroes.find(h => h.id === actorId);
    if (!actor) return;

    // === DEFEND ACTION ===
    if (actionType === 'defend') {
      isTurnProcessing.current = true;
      setDefendingHeroes(prev => new Set(prev).add(actorId));
      addLog(`🛡️ ${actor.name} assume posição defensiva! (+50% redução no próximo dano)`, 'system', actorId);
      
      // Regen 1 mana when defending
      setActiveHeroes(prev => prev.map(h => 
        h.id === actorId ? { ...h, mana: Math.min(h.mana + 1, 20) } : h
      ));
      
      nextTurn();
      return;
    }

    // === USE POTION ===
    if (actionType === 'use_potion') {
      if (actor.potionCount <= 0) return;
      isTurnProcessing.current = true;
      
      const healAmount = Math.floor(actor.maxHp * 0.3);
      setActiveHeroes(prev => prev.map(h => 
        h.id === actorId ? { 
          ...h, 
          hp: Math.min(h.hp + healAmount, h.maxHp), 
          potionCount: h.potionCount - 1 
        } : h
      ));
      
      // Floating heal number
      setFloatingNumbers(prev => [...prev, { id: Date.now(), amount: healAmount, type: 'heal', targetId: actorId }]);
      setTimeout(() => setFloatingNumbers(prev => prev.filter(f => f.targetId !== actorId || Date.now() - f.id > 1400)), 1500);
      
      addLog(`🧪 ${actor.name} usou uma poção! +${healAmount} HP (restam ${actor.potionCount - 1})`, 'system', actorId);
      nextTurn();
      return;
    }

    // === CHECK SKILL VALIDITY ===
    let skillConfig: any = null;
    if (actionType === 'skill' && skillName) {
      skillConfig = actor.skills.find(s => s.name === skillName);
      if (!skillConfig) return;
      if (actor.mana < skillConfig.cost) {
        addLog(`⚠️ Mana insuficiente para ${skillName}!`, 'system', actorId);
        return;
      }
    }

    // === INITIATE TARGET SELECTION OR AOE ===
    const aliveEnemies = activeEnemies.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) return;

    const isAoe = skillConfig?.type === 'magic_aoe';

    if (isAoe) {
      // Execute AoE directly
      executePreparedAction(actionType, skillName, aliveEnemies.map(e => e.enemy.id));
    } else {
      // Single target -> enter selection mode
      setSelectingTargetAction({ actionType, skillName });
      addLog(`🎯 Selecione um alvo para ${skillName || 'Atacar'}!`, 'system');
    }
  };

  // ============================
  // EXECUTE PREPARED ACTION
  // ============================
  const executePreparedAction = async (actionType: string, skillName?: string, targetIds?: string[]) => {
    if (!targetIds || targetIds.length === 0) return;
    
    const actorId = turnOrder[currentTurnIndex];
    const actor = activeHeroes.find(h => h.id === actorId);
    if (!actor) return;

    // Determine attribute bonus based on skill type
    const skill = actionType === 'skill' ? actor.skills.find(s => s.name === skillName) : null;
    
    // Deduct mana if it's a skill
    if (skill) {
      setActiveHeroes(prev => prev.map(h => 
        h.id === actorId ? { ...h, mana: h.mana - skill.cost } : h
      ));
    }

    const isMagic = skill?.type === 'magic_attack' || skill?.type === 'magic_aoe';
    const attrBonus = isMagic ? actor.attributes.inteligencia : actor.attributes.forca;
    const weaponDmg = isMagic ? 3 : 4; // Em um jogo real, isso viria da arma equipada

    isTurnProcessing.current = true;
    
    // Pegar o nome do primeiro alvo ou "Todos os Inimigos"
    const firstTargetEnemy = activeEnemies.find(e => e.enemy.id === targetIds[0])?.enemy;
    const targetName = targetIds.length > 1 ? "Todos os Inimigos" : (firstTargetEnemy?.name || 'Alvo');
    const targetDefense = firstTargetEnemy?.attributes.defesa || 0;

    addLog(`${actor.name} prepara ${skillName || 'um ataque'} contra ${targetName}...`, 'narrative', actor.id);

    // If this is MY hero, open interactive dice
    if (actorId === myHeroId) {
      setPendingAction({
        actorId: actor.id,
        actor: actor.name,
        targetId: targetIds.join(','),
        target: targetName,
        attributeBonus: attrBonus,
        weaponDamage: weaponDmg,
        defenseBonus: targetDefense,
        skillName: skillName
      });
      setIsInteractiveRolling(true);
      return;
    }

    // Fallback for non-interactive
    setIsRolling(true);
    setDiceResult(null);

    await new Promise(r => setTimeout(r, GHOST_DICE_ANIM));
    
    const result = executeAttack({
      actor: actor.name,
      target: targetName,
      attributeBonus: attrBonus,
      weaponDamage: weaponDmg,
      defenseBonus: targetDefense,
      skillName: skillName
    });

    processCombatResult(result, true, targetIds, actor.id, PLAYER_RESULT_DISPLAY);
  };

  // ============================
  // TARGET CLICK HANDLER
  // ============================
  const handleTargetClick = (targetId: string, isEnemy: boolean) => {
    if (!selectingTargetAction) return;
    if (!isEnemy) {
      addLog('⚠️ Você deve selecionar um inimigo!', 'system');
      return;
    }
    const { actionType, skillName } = selectingTargetAction;
    setSelectingTargetAction(null);
    executePreparedAction(actionType, skillName, [targetId]);
  };

  // ============================
  // INTERACTIVE DICE COMPLETE
  // ============================
  const handleInteractiveRollComplete = useCallback((rollValue: number) => {
    setIsInteractiveRolling(false);
    
    if (!pendingAction) {
      isTurnProcessing.current = false;
      return;
    }
    
    const result = executeAttack({
      actor: pendingAction.actor,
      target: pendingAction.target,
      attributeBonus: pendingAction.attributeBonus,
      weaponDamage: pendingAction.weaponDamage,
      defenseBonus: pendingAction.defenseBonus,
      preRolledDice: rollValue
    });
    
    const targetId = pendingAction.targetId;
    const actorId = pendingAction.actorId;
    setPendingAction(null);
    
    processCombatResult(result, true, targetId, actorId, PLAYER_RESULT_DISPLAY);
  }, [pendingAction, processCombatResult]);

  // ============================
  // USE POTION
  // ============================
  const handleUsePotion = useCallback((heroId: string) => {
    setActiveHeroes(prev => prev.map(h => {
      if (h.id === heroId && h.potionCount > 0 && h.hp < h.maxHp) {
        const healAmount = Math.ceil(h.maxHp * 0.4); // Heal 40% of max HP
        const newHp = Math.min(h.maxHp, h.hp + healAmount);
        addLog(`${h.name} usou uma Poção de Vida! Recuperou ${newHp - h.hp} HP.`, 'system', heroId);
        return { ...h, hp: newHp, potionCount: h.potionCount - 1 };
      }
      return h;
    }));
  }, [addLog]);

  // ============================
  // BOT / GHOST TURN ENGINE
  // ============================
  useEffect(() => {
    if (gameState !== 'battle') return;
    if (isTurnProcessing.current) return;
    
    const actorId = turnOrder[currentTurnIndex];
    if (!actorId) return;

    // Check if all enemies are dead
    const aliveEnemies = activeEnemies.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) {
      checkVictory(activeEnemies);
      return;
    }

    // === ENEMY TURN ===
    const enemyEntry = activeEnemies.find(e => e.enemy.id === actorId);
    if (enemyEntry) {
      if (enemyEntry.currentHp <= 0) {
        // Dead enemy, skip immediately
        nextTurn();
        return;
      }

      isTurnProcessing.current = true;
      
      const aliveHeroes = activeHeroes.filter(h => h.hp > 0);
      if (aliveHeroes.length === 0) return;
      const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];

      turnTimeoutRef.current = setTimeout(() => {
        addLog(`${enemyEntry.enemy.name} avança contra ${target.name}!`, 'narrative');
        
        setIsRolling(true);
        setDiceResult(null);

        turnTimeoutRef.current = setTimeout(() => {
          const result = executeAttack({
            actor: enemyEntry.enemy.name,
            target: target.name,
            attributeBonus: enemyEntry.enemy.attributes.forca,
            weaponDamage: 2,
            defenseBonus: target.attributes.defesa
          });

          processCombatResult(result, false, [target.id], actorId, ENEMY_RESULT_DISPLAY);
        }, ENEMY_DICE_ANIM);
      }, ENEMY_INITIAL_DELAY);

      return;
    }

    // === HERO TURN ===
    const hero = activeHeroes.find(h => h.id === actorId);
    if (!hero) {
      nextTurn();
      return;
    }

    // Dead hero skip
    if (hero.hp <= 0) {
      nextTurn();
      return;
    }

    // MY hero -> wait for player input (do nothing, the ActionPanel handles it)
    if (actorId === myHeroId) {
      return;
    }

    // === GHOST MODE (auto-play for other heroes) ===
    if (myHeroId !== null) {
      isTurnProcessing.current = true;

      const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

      turnTimeoutRef.current = setTimeout(() => {
        addLog(`${hero.name} (Modo Fantasma) avança contra ${target.enemy.name}...`, 'narrative', hero.id);
        
        setIsRolling(true);
        setDiceResult(null);

        turnTimeoutRef.current = setTimeout(() => {
          const result = executeAttack({
            actor: hero.name,
            target: target.enemy.name,
            attributeBonus: hero.attributes.forca,
            weaponDamage: 4,
            defenseBonus: target.enemy.attributes.defesa
          });

          processCombatResult(result, true, [target.enemy.id], actorId, GHOST_RESULT_DISPLAY);
        }, GHOST_DICE_ANIM);
      }, GHOST_INITIAL_DELAY);
    }

    // Cleanup timeouts on unmount or turn change
    return () => {
      if (turnTimeoutRef.current) {
        clearTimeout(turnTimeoutRef.current);
        turnTimeoutRef.current = null;
      }
    };
  }, [currentTurnIndex, gameState, myHeroId, activeEnemies, activeHeroes, turnOrder, addLog, checkVictory, nextTurn, processCombatResult]);

  // ============================
  // REQUEST HELP
  // ============================
  const handleRequestHelp = (heroName: string, heroId: string) => {
    const messages = [
      `Ei, preciso de ajuda aqui! [sigh] Minha vida está baixa!`,
      `Alguém pode me dar uma mão? [short pause] Estou cercado!`,
      `Preciso de suprimentos agora mesmo!`,
      `Não sei se aguento mais muito tempo... [medium pause] Ajuda!!`
    ];
    const message = `${heroName}: ${messages[Math.floor(Math.random() * messages.length)]}`;
    
    addLog(message, 'narrative', heroId);
    
    if (broadcastChannel) {
      broadcastChannel.send({
        type: 'broadcast',
        event: 'shout',
        payload: { message, heroId }
      });
    }
  };

  const handleBuyItem = (item: ShopItem) => {
    if (gold >= item.cost) {
      setGold(prev => prev - item.cost);
      setActiveHeroes(prev => prev.map(h => {
        if (h.id === myHeroId) {
          if (item.type === 'potion') {
            return { ...h, potionCount: (h.potionCount || 0) + 1 };
          }
          if (item.type === 'passive') {
            return { ...h, maxHp: h.maxHp + 20, hp: h.hp + 20 };
          }
          if (item.type === 'weapon') {
            const isMagic = item.name.includes('Cajado');
            return { 
              ...h, 
              attributes: { 
                ...h.attributes, 
                forca: isMagic ? h.attributes.forca : h.attributes.forca + 5,
                inteligencia: isMagic ? h.attributes.inteligencia + 5 : h.attributes.inteligencia
              } 
            };
          }
        }
        return h;
      }));
      addLog(`Você comprou ${item.name}! (-${item.cost} Ouro)`, 'system');
      
      // Complete tavern quest if not done
      setQuests(prev => prev.map(q => 
        q.id === 'quest-2' && !q.isCompleted ? { ...q, isCompleted: true } : q
      ));
    }
  };

  // ============================
  // RENDERS
  // ============================

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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={enterVillage} className="w-64 px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl hover:bg-primary/80 transition-all text-xl shadow-[0_0_20px_rgba(197,168,128,0.5)] hover:scale-105 active:scale-95">
              Entrar no Jogo
            </button>
            <button onClick={() => setShowTutorial(true)} className="w-64 px-8 py-4 bg-transparent border-2 border-primary text-primary font-black uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all text-xl shadow-[0_0_15px_rgba(197,168,128,0.2)] hover:scale-105 active:scale-95">
              🎓 Como Jogar
            </button>
          </div>
        </div>
        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      </div>
    );
  }

  if (gameState === 'village') {
    return (
      <div className="min-h-screen bg-sapires-dark flex flex-col items-center py-10 relative">
        <audio autoPlay loop ref={bgMusicRef} src="/audio/music/porto-das-brumas.mp3" 
          onLoadedData={(e) => { (e.target as HTMLAudioElement).volume = BG_MUSIC_VOLUME; }} 
        />
        <img src="/images/logo/sapires-warriors-logo.png" alt="Logo" className="w-64 mb-4" />
        
        {/* Gold & Wave HUD */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 bg-yellow-900/40 border border-yellow-500/40 px-4 py-2 rounded-xl backdrop-blur-sm relative">
            <span className="text-yellow-400 text-lg">💰</span>
            <span className="text-yellow-200 font-black text-lg">{gold}</span>
            <span className="text-yellow-400/60 text-xs">Ouro</span>
            {goldAnimation && (
              <span key={goldAnimation.id} className="absolute -top-6 right-0 text-yellow-300 font-bold text-sm animate-bounce">
                +{goldAnimation.amount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/30 px-4 py-2 rounded-xl backdrop-blur-sm">
            <span className="text-red-400 text-sm">⚔️</span>
            <span className="text-red-200 font-bold text-sm">Onda {currentWave + 1}/{waves.length}</span>
          </div>
        </div>
        
        <VillageScene onLocationClick={handleVillageClick} />
        
        {/* Quest Panel */}
        <QuestPanel quests={quests} />
        
        {isShopOpen && (
          <TavernShop 
            playerGold={gold} 
            onBuyItem={handleBuyItem} 
            onClose={() => setIsShopOpen(false)} 
          />
        )}
        
        {/* Narrative Card Modal */}
        <NarrativeCard
          lore={activeNarrative}
          onClose={() => { setActiveNarrative(null); setNarrativeAction(null); }}
          onAction={narrativeAction?.action}
          actionLabel={narrativeAction?.label}
          actionDisabled={narrativeAction?.disabled}
        />
        
        {/* Post-battle narrative overlay */}
        {postBattleNarrative && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPostBattleNarrative(null)}>
            <div className="max-w-xl bg-sapires-dark/95 border border-primary/40 rounded-2xl p-8 space-y-4" onClick={e => e.stopPropagation()}>
              <p className="text-xs text-primary/60 uppercase tracking-widest font-bold">Epílogo da Batalha</p>
              <p className="text-foreground/90 text-sm leading-relaxed font-[Georgia,serif] italic">{postBattleNarrative}</p>
              <button onClick={() => setPostBattleNarrative(null)} className="w-full py-3 bg-primary/10 border border-primary/30 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors text-sm uppercase tracking-widest">Continuar</button>
            </div>
          </div>
        )}
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

  // ============================
  // VICTORY SCREEN
  // ============================
  if (gameState === 'victory') {
    const wave = waves[currentWave];
    const totalXpDisplay = totalEnemyXpEarned + (wave?.xpBonus || getVictoryBonusXp());
    const goldEarned = wave?.goldReward || 30;
    const hasNextWave = currentWave < waves.length - 1;
    const isFinalWave = wave?.isFinal || false;
    
    // Map wave to quest completion
    const waveQuestMap: Record<number, string> = { 0: 'quest-1', 1: 'quest-5', 2: 'quest-6' };
    
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/backgrounds/porto-das-brumas.png')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/40 via-transparent to-transparent" />
        
        <div className="absolute w-[600px] h-[600px] bg-yellow-400/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute w-[400px] h-[400px] bg-yellow-400/20 rounded-full animate-pulse" />
        
        <div className="relative z-10 text-center space-y-6 animate-in zoom-in-50 duration-1000 max-w-3xl mx-auto px-4">
          <div className="text-6xl animate-bounce">{isFinalWave ? '👑' : '⚔️'}</div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 uppercase tracking-widest drop-shadow-2xl">
            {isFinalWave ? 'VITÓRIA FINAL!' : `ONDA ${wave?.waveNumber || 1} LIMPA!`}
          </h1>
          <p className="text-lg text-yellow-200/80 max-w-md mx-auto">
            {isFinalWave 
              ? 'Porto das Brumas está salvo! O Capitão do Abismo foi derrotado. A Maré Negra recuou... por enquanto.'
              : hasNextWave 
                ? `Os guerreiros resistiram! Mas algo mais poderoso se aproxima...` 
                : 'Todos os inimigos foram eliminados!'}
          </p>
          
          {/* Rewards Summary */}
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="bg-purple-900/40 border border-purple-500/50 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-purple-300 text-xs uppercase tracking-widest font-bold mb-1">XP</p>
              <p className="text-2xl font-black text-purple-200">+{totalXpDisplay}</p>
            </div>
            <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-yellow-300 text-xs uppercase tracking-widest font-bold mb-1">Ouro</p>
              <p className="text-2xl font-black text-yellow-200">+{goldEarned} 💰</p>
              <p className="text-[10px] text-yellow-400/60 mt-0.5">Total: {gold}</p>
            </div>
          </div>
          
          {/* Hero Cards */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
            {activeHeroes.filter(h => h.hp > 0).map(h => {
              const xpResult = levelUpResults.find(r => r.hero.id === h.id);
              return (
                <div key={h.id} className={`bg-black/60 border rounded-xl p-3 backdrop-blur-sm transition-all duration-500
                  ${xpResult?.didLevelUp ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.6)]' : 'border-yellow-500/50'}`}
                >
                  <img src={h.cardImage} alt={h.name} className="w-12 h-12 mx-auto rounded-full border-2 border-yellow-400 object-cover mb-1" />
                  <p className="text-yellow-300 text-xs font-bold">{h.name}</p>
                  <p className="text-yellow-100/60 text-[10px]">{h.hp}/{h.maxHp} HP</p>
                  {xpResult && (
                    <div className="mt-1">
                      <div className="w-full h-1 rounded-full bg-purple-900/50 overflow-hidden">
                        <div className="h-full rounded-full bg-purple-500 transition-all duration-1000"
                          style={{ width: `${(xpResult.hero.xp / xpResult.hero.xpNextLevel) * 100}%` }}
                        />
                      </div>
                      <p className="text-[8px] text-purple-400/70">Nv {xpResult.hero.level}</p>
                      {xpResult.didLevelUp && (
                        <p className="text-[10px] font-black text-purple-300 animate-pulse">🌟 LEVEL UP!</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-6 flex-wrap">
            {hasNextWave && (
              <button 
                onClick={() => {
                  clearAudioQueue();
                  const questId = waveQuestMap[currentWave];
                  if (questId) {
                    setQuests(prev => prev.map(q => q.id === questId && !q.isCompleted ? { ...q, isCompleted: true } : q));
                  }
                  const nextWaveIdx = currentWave + 1;
                  setCurrentWave(nextWaveIdx);
                  const nextWave = waves[nextWaveIdx];
                  const newEnemies = buildEnemiesFromWave(nextWave);
                  setActiveEnemies(newEnemies);
                  const order = [...activeHeroes.filter(h => h.hp > 0).map(h => h.id), ...newEnemies.map(e => e.enemy.id)];
                  setTurnOrder(order);
                  setTotalEnemyXpEarned(0);
                  setLevelUpResults([]);
                  setDestination(nextWave.title);
                  setGameState('transition');
                }}
                className="px-8 py-4 bg-gradient-to-r from-red-700 via-red-500 to-red-700 text-white text-xl font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:shadow-[0_0_50px_rgba(239,68,68,0.9)] border-2 border-red-300 animate-pulse"
              >
                ⚔️ Próxima Onda ({waves[currentWave + 1]?.title})
              </button>
            )}
            <button 
              onClick={() => { 
                clearAudioQueue(); 
                const questId = waveQuestMap[currentWave];
                if (questId) {
                  setQuests(prev => prev.map(q => q.id === questId && !q.isCompleted ? { ...q, isCompleted: true } : q));
                }
                setPostBattleNarrative(getPostBattleNarrative(wave?.waveNumber || 1));
                setGameState('village'); 
                setTotalEnemyXpEarned(0); 
                setLevelUpResults([]); 
              }}
              className="px-8 py-4 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-black text-lg font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(250,204,21,0.6)] border-2 border-yellow-200"
            >
              🏠 Voltar à Vila
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // BATTLE SCREEN
  // ============================
  const currentActorId = turnOrder[currentTurnIndex];
  const currentHero = activeHeroes.find(h => h.id === currentActorId);
  const isMyTurn = currentActorId === myHeroId;

  return (
    <main className={`min-h-screen flex flex-col bg-[url('/images/backgrounds/ruas-em-chamas.png')] bg-cover bg-center relative overflow-hidden ${screenShake ? 'screen-shake' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
      
      {/* Floating Ash/Spark Particles (CSS Only) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-60">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full bg-yellow-500 blur-[2px]"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-up-damage ${Math.random() * 5 + 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Audio Theme - Lower volume */}
      <audio autoPlay loop src="/audio/music/battle-theme.mp3" 
        onLoadedData={(e) => { (e.target as HTMLAudioElement).volume = BG_MUSIC_VOLUME; }}
      />

      {/* Initiative / Turn Order Bar */}
      <InitiativeBar
        turnOrder={turnOrder}
        currentIndex={currentTurnIndex}
        heroes={activeHeroes}
        enemies={activeEnemies}
        roundNumber={roundNumber}
        waveNumber={currentWave + 1}
        totalWaves={waves.length}
      />

      {/* Main Battle Area */}
      <div className="flex-1 flex w-full relative z-10">
        <InventoryPanel 
          heroes={activeHeroes}
          myHeroId={myHeroId}
          onUsePotion={handleUsePotion}
        />
        <BattleScene 
          heroes={activeHeroes}
          enemies={activeEnemies}
          activeCharacterId={currentActorId}
          gold={gold}
          floatingNumbers={floatingNumbers}
          defendingHeroes={defendingHeroes}
          isSelectingTarget={!!selectingTargetAction}
          onTargetClick={handleTargetClick}
        />
        
        {/* Mobile Log Toggle */}
        <button 
          onClick={() => setIsMobileLogOpen(true)}
          className="lg:hidden absolute bottom-4 right-4 z-40 bg-sapires-dark/90 border border-primary text-primary px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2"
        >
          <span>📜</span> Histórico
        </button>

        {/* Right Sidebar - Battle Log (Desktop) */}
        <div className="w-80 h-full border-l border-border bg-background/50 backdrop-blur-md hidden lg:block">
          <BattleLog logs={logs} />
        </div>

        {/* Mobile Battle Log Modal */}
        {isMobileLogOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm lg:hidden animate-in slide-in-from-bottom-full">
            <div className="flex justify-between items-center p-4 border-b border-border bg-sapires-dark">
              <h3 className="font-bold text-primary">Histórico de Batalha</h3>
              <button onClick={() => setIsMobileLogOpen(false)} className="text-red-400 font-bold p-2 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-hidden h-full">
              <BattleLog logs={logs} />
            </div>
          </div>
        )}
      </div>
      <PWAInstall />

      {/* Action Panel (Bottom) */}
      <div className="h-40 relative z-20 w-full">
        {currentHero && isMyTurn ? (
          <ActionPanel 
            hero={currentHero} 
            onAction={handleAction} 
            onRequestHelp={handleRequestHelp}
            disabled={isRolling || !!diceResult || isTurnProcessing.current}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-secondary/50 backdrop-blur-md border-t border-border">
            <div className="text-center">
              <span className="text-xl text-muted-foreground animate-pulse block">
                {currentHero ? `${currentHero.name} está jogando...` : 'Turno Inimigo...'}
              </span>
              <span className="text-xs text-muted-foreground/60 mt-1 block">Aguarde sua vez</span>
            </div>
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
      
      {/* Player Join Notification */}
      {joinNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right fade-in duration-500">
          <div className="bg-blue-900/90 border-2 border-blue-400 px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] backdrop-blur-md">
            <p className="text-blue-100 font-bold text-sm">{joinNotification}</p>
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
