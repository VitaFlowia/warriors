'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface IntroVideoProps {
  onComplete: () => void;
}

export function IntroVideo({ onComplete }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Autoplay blocked:", err);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center border-4 border-yellow-600/50 shadow-[inset_0_0_50px_rgba(202,138,4,0.5)] overflow-hidden">
      <video 
        ref={videoRef}
        src="/Intro.mp4" 
        className="w-full h-full object-cover pointer-events-none"
        onEnded={onComplete}
        onError={onComplete}
        playsInline
      />

      {/* Se o autoplay for bloqueado pelo navegador, exibe o botão Dourado */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-20">
          <button 
            onClick={() => {
              videoRef.current?.play();
              setIsPlaying(true);
            }}
            className="px-12 py-6 bg-yellow-600/20 text-yellow-400 border-2 border-yellow-500 rounded-lg text-4xl font-black tracking-widest uppercase shadow-[0_0_40px_rgba(234,179,8,0.6)] hover:bg-yellow-500/40 hover:scale-110 hover:shadow-[0_0_60px_rgba(234,179,8,0.9)] transition-all duration-300"
          >
            Iniciar Jornada
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="absolute bottom-10 right-10 z-20">
          <button 
            onClick={onComplete} 
            className="px-4 py-2 bg-black/50 border border-yellow-700/50 text-yellow-600 hover:text-yellow-400 hover:bg-black/80 rounded transition-colors text-sm uppercase tracking-widest"
          >
            Pular Intro
          </button>
        </div>
      )}
    </div>
  );
}
