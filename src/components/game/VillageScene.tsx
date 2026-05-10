import React from 'react';
import { motion } from 'framer-motion';

interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  iconSrc: string;
  x: number;
  y: number;
  glowColor: string;
  isNew?: boolean;
}

const points: PointOfInterest[] = [
  { 
    id: 'tavern', 
    name: 'Taverna do Cais', 
    description: 'Recupere vida e descubra rumores',
    iconSrc: '/images/ui/icon-potion.png', 
    x: 25, y: 35, 
    glowColor: 'rgba(234,179,8,0.6)',
  },
  { 
    id: 'blacksmith', 
    name: 'Forja das Âncoras', 
    description: 'Melhore suas armas e armaduras',
    iconSrc: '/images/ui/icon-weapon.png', 
    x: 65, y: 30, 
    glowColor: 'rgba(239,68,68,0.6)',
    isNew: true,
  },
  { 
    id: 'library', 
    name: 'Biblioteca dos Véus', 
    description: 'Aprenda novas habilidades',
    iconSrc: '/images/ui/icon-skill.png', 
    x: 45, y: 65, 
    glowColor: 'rgba(168,85,247,0.6)',
    isNew: true,
  },
  { 
    id: 'dock', 
    name: 'Doca dos Fantasmas', 
    description: 'Compre cartas e itens raros',
    iconSrc: '/images/ui/icon-cards.png', 
    x: 80, y: 70, 
    glowColor: 'rgba(59,130,246,0.6)',
    isNew: true,
  },
  { 
    id: 'battle', 
    name: 'Ruas em Chamas', 
    description: 'Enfrentar as criaturas do abismo',
    iconSrc: '/images/ui/selecionar_missao.png', 
    x: 15, y: 80, 
    glowColor: 'rgba(220,38,38,0.8)',
  },
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
      
      {/* Animated fog wisps */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ x: [-20, 20, -20] }}
        transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
      >
        <div className="absolute top-1/3 left-0 w-full h-24 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </motion.div>

      {/* Interactive Points */}
      {points.map((point, index) => (
        <motion.div
          key={point.id}
          className="absolute flex flex-col items-center justify-center group cursor-pointer"
          style={{ left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onLocationClick(point.id)}
        >
          {/* Glow ring behind icon */}
          <div 
            className="absolute w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ 
              background: `radial-gradient(circle, ${point.glowColor} 0%, transparent 70%)`,
              filter: 'blur(8px)',
            }}
          />
          
          {/* "NEW" badge */}
          {point.isNew && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-3 -right-3 z-20 bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg"
            >
              NOVO!
            </motion.div>
          )}
          
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 + Math.random(), ease: "easeInOut" }}
            className="relative w-16 h-16 sm:w-20 sm:h-20"
            style={{ filter: `drop-shadow(0 0 15px ${point.glowColor})` }}
          >
            <img src={point.iconSrc} alt={point.name} className="w-full h-full object-contain" />
          </motion.div>
          
          {/* Label tooltip */}
          <div className="mt-2 px-3 py-2 bg-sapires-dark/95 border border-primary/50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1 text-center backdrop-blur-sm shadow-xl max-w-[160px]">
            <p className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider">{point.name}</p>
            <p className="text-muted-foreground text-[10px] mt-0.5">{point.description}</p>
          </div>
        </motion.div>
      ))}

      <div className="absolute top-4 left-4 bg-sapires-dark/80 p-4 border border-primary/30 rounded backdrop-blur-md">
        <h2 className="text-2xl font-bold text-primary tracking-widest uppercase">Porto das Brumas</h2>
        <p className="text-muted-foreground text-sm">Selecione seu destino...</p>
      </div>
      
      {/* Mini tips at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 right-4 bg-sapires-dark/80 px-4 py-2 border border-border/50 rounded-lg backdrop-blur-sm"
      >
        <p className="text-[10px] text-muted-foreground/60 italic">💡 Passe o mouse nos ícones para ver mais informações</p>
      </motion.div>
    </motion.div>
  );
}
