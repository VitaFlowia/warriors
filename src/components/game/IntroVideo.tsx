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
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center flex-col">
      <video 
        ref={videoRef}
        src="/intro.mp4" 
        className="w-full h-full object-cover max-w-7xl"
        onEnded={onComplete}
        controls={!isPlaying}
      />
      <div className="absolute bottom-10 right-10">
        <Button onClick={onComplete} variant="secondary" className="bg-background/50 hover:bg-background/80 text-foreground">
          Pular Intro
        </Button>
      </div>
    </div>
  );
}
