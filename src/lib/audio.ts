// ===== AUDIO QUEUE SYSTEM =====
// Prevents overlapping TTS by queuing audio sequentially

let audioQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;
let currentAudio: HTMLAudioElement | null = null;

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (audioQueue.length > 0) {
    const task = audioQueue.shift();
    if (task) {
      try {
        await task();
      } catch (e) {
        console.error('Audio queue error:', e);
      }
    }
  }

  isProcessingQueue = false;
}

function enqueueAudio(task: () => Promise<void>) {
  audioQueue.push(task);
  processQueue();
}

// Clear the queue (e.g., when entering a new scene)
export function clearAudioQueue() {
  audioQueue = [];
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

// ===== SOUND EFFECTS =====

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

// Chat notification sound (short magical chime)
export function playChatNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6
    osc1.frequency.setValueAtTime(1318.5, audioCtx.currentTime + 0.08); // E6
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1568, audioCtx.currentTime + 0.08); // G6
    
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start();
    osc2.start(audioCtx.currentTime + 0.08);
    osc1.stop(audioCtx.currentTime + 0.25);
    osc2.stop(audioCtx.currentTime + 0.25);
  } catch(e) {
    console.log('Audio not supported or disabled', e);
  }
}

// Victory fanfare
export function playVictoryFanfare() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.15);
      osc.stop(audioCtx.currentTime + i * 0.15 + 0.4);
    });
  } catch(e) {
    console.log('Audio not supported or disabled', e);
  }
}

// ===== TTS (Text-to-Speech) with Queue =====

export async function speakText(text: string, voiceKey: string = 'system') {
  enqueueAudio(async () => {
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
        
        await new Promise<void>((resolve) => {
          audio.onended = () => {
            currentAudio = null;
            resolve();
          };
          audio.onerror = () => {
            currentAudio = null;
            resolve();
          };
          audio.play().catch(() => resolve());
        });
      }
    } catch (error) {
      console.error('Error in speakText:', error);
    }
  });
}

// Quick speak for chat notifications (doesn't go through TTS API, uses browser SpeechSynthesis)
export function speakChatNotification(senderName: string) {
  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${senderName} enviou uma mensagem!`);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.1;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.log('SpeechSynthesis not available:', e);
  }
}
