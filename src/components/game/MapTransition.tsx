import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapTransitionProps {
  isVisible: boolean;
  destinationName: string;
  onTransitionComplete: () => void;
}

export function MapTransition({ isVisible, destinationName, onTransitionComplete }: MapTransitionProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onTransitionComplete();
      }, 3000); // 3 seconds transition duration
      return () => clearTimeout(timer);
    }
  }, [isVisible, onTransitionComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          {/* Cloud/Fog Animation */}
          <div className="absolute inset-0 bg-[url('/images/backgrounds/animacao_ini.png')] bg-cover bg-center opacity-40 mix-blend-screen animate-pulse" />
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative z-10 text-center"
          >
            <h1 className="text-sm uppercase tracking-[0.5em] text-muted-foreground mb-4">Viajando para</h1>
            <h2 className="text-5xl md:text-7xl font-black text-primary drop-shadow-[0_0_20px_rgba(197,168,128,0.5)]">
              {destinationName}
            </h2>
            <motion.div 
              className="mt-8 h-1 bg-primary mx-auto" 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 2 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
