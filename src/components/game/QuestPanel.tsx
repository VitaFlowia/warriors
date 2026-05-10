'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quest } from '@/data/lore';

interface QuestPanelProps {
  quests: Quest[];
  onQuestClick?: (quest: Quest) => void;
}

export function QuestPanel({ quests, onQuestClick }: QuestPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeQuests = quests.filter(q => !q.isCompleted);
  const completedQuests = quests.filter(q => q.isCompleted);

  const typeIcons: Record<string, string> = {
    combat: '⚔️',
    explore: '🗺️',
    collect: '💎',
    social: '💬',
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 flex items-center gap-2 bg-purple-900/80 border border-purple-500/50 text-purple-200 px-4 py-2 rounded-xl hover:bg-purple-800 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all backdrop-blur-sm group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2"/><path d="m2 10 4 2"/><path d="M4 10v10l8 4 8-4V10"/><path d="m12 6v18"/></svg>
        <span className="font-bold text-sm uppercase tracking-wider">Objetivos</span>
        {activeQuests.length > 0 && (
          <span className="bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            {activeQuests.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        className="fixed top-0 left-0 z-50 w-80 h-full bg-sapires-dark/95 border-r border-purple-500/30 shadow-2xl backdrop-blur-md overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-purple-950/90 backdrop-blur-sm p-4 border-b border-purple-500/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 className="text-lg font-black text-purple-300 uppercase tracking-widest">Objetivos</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-red-400 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Active Quests */}
          {activeQuests.length > 0 && (
            <div>
              <p className="text-xs text-purple-400 uppercase tracking-widest font-bold mb-3">Missões Ativas ({activeQuests.length})</p>
              <div className="space-y-3">
                {activeQuests.map((quest) => (
                  <motion.div
                    key={quest.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 cursor-pointer hover:border-purple-400/60 hover:shadow-[0_0_12px_rgba(168,85,247,0.2)] transition-all"
                    onClick={() => onQuestClick?.(quest)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{typeIcons[quest.type] || '❓'}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-purple-200">{quest.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{quest.description}</p>
                        
                        <div className="mt-3 bg-black/30 rounded-lg p-2 border border-purple-500/20">
                          <p className="text-xs text-purple-300 font-bold">
                            <span className="text-purple-500">▸</span> {quest.objectiveText}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mt-3 text-[10px] font-bold">
                          <span className="text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded-full">+{quest.rewardXp} XP</span>
                          {quest.rewardGold > 0 && (
                            <span className="text-yellow-400 bg-yellow-900/40 px-2 py-0.5 rounded-full">+{quest.rewardGold} 💰</span>
                          )}
                          <span className="text-green-400 bg-green-900/40 px-2 py-0.5 rounded-full">{quest.reward}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-green-400/70 uppercase tracking-widest font-bold mb-3">Concluídas ({completedQuests.length})</p>
              <div className="space-y-2">
                {completedQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className="bg-green-900/10 border border-green-500/20 rounded-lg p-3 opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <p className="text-xs text-green-300 font-bold line-through">{quest.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeQuests.length === 0 && completedQuests.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground italic text-sm">Nenhum objetivo por enquanto...</p>
              <p className="text-xs text-muted-foreground/50 mt-2">Explore o mapa para descobrir missões</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
