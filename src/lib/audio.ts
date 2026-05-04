export function playClickSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Configura um som agradável de clique mágico (Sino leve)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch(e) {
    console.log('Audio not supported or disabled', e);
  }
}

export function playActionSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Som mais grave de espadada/ação
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch(e) {
    console.log('Audio not supported or disabled', e);
  }
}

export function playTurnSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Som agudo e feliz para alertar o turno (estilo Level Up rápido)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.4);
  } catch(e) {
    console.log('Audio not supported or disabled', e);
  }
}

let currentAudio: HTMLAudioElement | null = null;

export async function speakText(text: string, voiceKey: string = 'system') {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceKey })
    });

    if (!response.ok) return;

    const data = await response.json();
    if (data.audioContent) {
      // Se houver um áudio tocando, para ele antes de começar o novo
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      currentAudio = audio;
      await audio.play();
    }
  } catch (error) {
    console.error('Error in speakText:', error);
  }
}

