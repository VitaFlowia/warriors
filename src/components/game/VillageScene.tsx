import React from 'react';
import { motion } from 'framer-motion';

interface PointOfInterest {
  id: string;
  name: string;
  iconSrc: string;
  x: number; // percentage
  y: number; // percentage
}

const points: PointOfInterest[] = [
  { id: 'tavern', name: 'Recuperar Vida', iconSrc: '/images/ui/icon-potion.png', x: 25, y: 35 },
  { id: 'blacksmith', name: 'Comprar Armas', iconSrc: '/images/ui/icon-weapon.png', x: 65, y: 30 },
  { id: 'library', name: 'Melhorar Habilidades', iconSrc: '/images/ui/icon-skill.png', x: 45, y: 65 },
  { id: 'dock', name: 'Desbloquear Cartas', iconSrc: '/images/ui/icon-cards.png', x: 80, y: 70 },
  { id: 'battle', name: 'Ir para a Batalha (Ruas em Chamas)', iconSrc: '/images/ui/selecionar_missao.png', x: 15, y: 80 },
];

interface VillageSceneProps {
  onLocationClick: (id: string) => void;
}

export function VillageScene({ onLocationClick }: VillageSceneProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="relative w-full max-w-6xl mx-auto h-[80vh] border-4 border-primary shadow-2xl shadow-primary/20 rounded-xl overflow-hidden mt-10"
    >
      <div 
        className="absolute inset-0 bg-[url('/images/backgrounds/porto-das-brumas.png')] bg-cover bg-center"
      />
      
      {/* Fog Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-sapires-dark/80 via-transparent to-sapires-dark/40 pointer-events-none" />

      {/* Interactive Points */}
      {points.map((point) => (
        <motion.div
          key={point.id}
          className="absolute flex flex-col items-center justify-center group cursor-pointer"
          style={{ left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)' }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onLocationClick(point.id)}
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 + Math.random(), ease: "easeInOut" }}
            className="relative w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_15px_rgba(197,168,128,0.6)]"
          >
            <img src={point.iconSrc} alt={point.name} className="w-full h-full object-contain" />
          </motion.div>
          <div className="mt-2 px-3 py-1 bg-sapires-dark/90 border border-primary/50 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {point.name}
          </div>
        </motion.div>
      ))}

      <div className="absolute top-4 left-4 bg-sapires-dark/80 p-4 border border-primary/30 rounded backdrop-blur-md">
        <h2 className="text-2xl font-bold text-primary tracking-widest uppercase">Porto das Brumas</h2>
        <p className="text-muted-foreground text-sm">Selecione seu destino...</p>
      </div>
    </motion.div>
  );
}
