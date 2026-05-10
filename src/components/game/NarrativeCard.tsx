'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationLore } from '@/data/lore';

interface NarrativeCardProps {
  lore: LocationLore | null;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
}

export function NarrativeCard({ lore, onClose, onAction, actionLabel, actionDisabled }: NarrativeCardProps) {
  const [charIndex, setCharIndex] = useState(0);
  const [showFull, setShowFull] = useState(false);

  // Typewriter effect for narrative
  useEffect(() => {
    if (!lore || showFull) return;
    const interval = setInterval(() => {
      setCharIndex(prev => {
        if (prev >= lore.narrative.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 2; // 2 chars per tick for faster rendering
      });
    }, 15);
    return () => clearInterval(interval);
  }, [lore, showFull]);

  // Reset on new lore
  useEffect(() => {
    setCharIndex(0);
    setShowFull(false);
  }, [lore?.id]);

  if (!lore) return null;

  const displayedText = showFull ? lore.narrative : lore.narrative.slice(0, charIndex);
  const isTyping = !showFull && charIndex < lore.narrative.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border-2 border-primary/40 shadow-[0_0_60px_rgba(197,168,128,0.15)]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header with background */}
          <div className="relative h-48 overflow-hidden rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-sapires-dark via-sapires-ocean to-sapires-dark" />
            <div className="absolute inset-0 bg-gradient-to-t from-sapires-dark via-transparent to-transparent" />
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/40 rounded-full"
                  style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 20}%` }}
                  animate={{ y: [-10, 10, -10], opacity: [0.2, 0.8, 0.2] }}
                  transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3 }}
                />
              ))}
            </div>

            <div className="absolute bottom-4 left-6 right-6 z-10">
              <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-black text-primary uppercase tracking-widest drop-shadow-[0_0_15px_rgba(197,168,128,0.5)]"
              >
                {lore.title}
              </motion.h2>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-primary/70 italic mt-1"
              >
                {lore.subtitle}
              </motion.p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-black/80 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          {/* Content */}
          <div className="bg-sapires-dark p-6 space-y-5">
            {/* Ambient Description */}
            <div className="flex items-start gap-3 text-xs text-muted-foreground/80 italic border-l-2 border-primary/30 pl-3">
              <span className="text-primary text-sm">✦</span>
              <p>{lore.ambientDescription}</p>
            </div>

            {/* Main Narrative */}
            <div className="relative">
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line font-[Georgia,serif]">
                {displayedText}
                {isTyping && <span className="text-primary animate-pulse">▌</span>}
              </p>
              {isTyping && (
                <button
                  onClick={() => setShowFull(true)}
                  className="text-xs text-primary/60 hover:text-primary mt-2 underline"
                >
                  Pular animação →
                </button>
              )}
            </div>

            {/* NPC Quote */}
            {lore.npcName && lore.npcQuote && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center border border-primary/40">
                    <span className="text-primary font-black text-sm">{lore.npcName[0]}</span>
                  </div>
                  <span className="text-primary font-bold text-sm">{lore.npcName}</span>
                </div>
                <p className="text-foreground/80 text-sm italic pl-10">{lore.npcQuote}</p>
              </motion.div>
            )}

            {/* Action Button */}
            {onAction && actionLabel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="pt-2"
              >
                <button
                  onClick={onAction}
                  disabled={actionDisabled}
                  className={`w-full py-4 font-black uppercase tracking-widest rounded-xl transition-all duration-300 border-2 text-sm
                    ${actionDisabled 
                      ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50 text-primary hover:border-primary hover:shadow-[0_0_20px_rgba(197,168,128,0.4)] hover:scale-[1.02] active:scale-95'
                    }`}
                >
                  {actionLabel}
                </button>
              </motion.div>
            )}

            {/* Close hint */}
            <p className="text-center text-xs text-muted-foreground/40 pt-2">Clique fora para fechar</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
