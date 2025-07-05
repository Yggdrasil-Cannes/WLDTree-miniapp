import { useCallback, useRef } from 'react';

// Audio feedback hook
export function useAudioFeedback() {
  const audioContext = useRef<AudioContext | null>(null);

  const initializeAudio = useCallback(() => {
    if (!audioContext.current && typeof window !== 'undefined') {
      try {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContext.current) {
      initializeAudio();
    }

    if (!audioContext.current) return;

    try {
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

      oscillator.start();
      oscillator.stop(audioContext.current.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [initializeAudio]);

  const playSound = useCallback((type: string) => {
    const sounds = {
      'dna-form': () => {
        // DNA formation sound - ascending tones
        playTone(220, 0.2);
        setTimeout(() => playTone(330, 0.2), 100);
        setTimeout(() => playTone(440, 0.3), 200);
      },
      'block-chain': () => {
        // Blockchain link sound - digital beeps
        playTone(800, 0.1, 'square');
        setTimeout(() => playTone(600, 0.1, 'square'), 150);
        setTimeout(() => playTone(800, 0.2, 'square'), 300);
      },
      'tree-grow': () => {
        // Tree growth sound - organic sweep
        const startTime = Date.now();
        const playGrowthTone = () => {
          const elapsed = Date.now() - startTime;
          const frequency = 200 + (elapsed / 10);
          if (elapsed < 1000) {
            playTone(frequency, 0.1);
            setTimeout(playGrowthTone, 50);
          }
        };
        playGrowthTone();
      },
      'story-discover': () => {
        // Story unlock sound - magical chime
        playTone(659, 0.2); // E
        setTimeout(() => playTone(784, 0.2), 100); // G
        setTimeout(() => playTone(1047, 0.3), 200); // C
      },
      'security-activate': () => {
        // Security activation - strong confirmation
        playTone(440, 0.3);
        setTimeout(() => playTone(554, 0.3), 100);
        setTimeout(() => playTone(659, 0.4), 200);
      },
      'genesis-create': () => {
        // Genesis creation - triumphant chord
        playTone(523, 0.5); // C
        setTimeout(() => playTone(659, 0.5), 0); // E
        setTimeout(() => playTone(784, 0.5), 0); // G
        setTimeout(() => playTone(1047, 0.7), 200); // C octave
      },
      'step-complete': () => {
        // Simple step completion
        playTone(800, 0.1);
        setTimeout(() => playTone(1000, 0.15), 100);
      },
      'success': () => {
        // Success fanfare
        playTone(523, 0.2);
        setTimeout(() => playTone(659, 0.2), 150);
        setTimeout(() => playTone(784, 0.2), 300);
        setTimeout(() => playTone(1047, 0.4), 450);
      }
    };

    const soundFunction = sounds[type as keyof typeof sounds];
    if (soundFunction) {
      soundFunction();
    }
  }, [playTone]);

  return { playSound, initializeAudio };
}

// Haptic feedback hook
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Haptic feedback not supported:', error);
      }
    }
  }, []);

  const hapticPatterns = {
    nodeDiscovery: [100, 50, 100], // Double pulse
    treeGrowth: [200, 100, 300],   // Growing intensity
    worldIdSuccess: [50, 50, 50, 50, 50], // Success rhythm
    genesisCreation: [500], // Single strong pulse
    stepComplete: [80], // Simple confirmation
    error: [200, 100, 200, 100, 200], // Error pattern
    transition: [30] // Subtle transition
  };

  const triggerHaptic = useCallback((type: keyof typeof hapticPatterns) => {
    vibrate(hapticPatterns[type]);
  }, [vibrate, hapticPatterns]);

  return { vibrate, triggerHaptic, hapticPatterns };
}

// Combined feedback hook
export function useOnboardingFeedback() {
  const audio = useAudioFeedback();
  const haptics = useHapticFeedback();

  const playFeedback = useCallback((type: string, includeHaptic = true) => {
    console.log(`Onboarding Feedback: ${type}`);
    
    // Play audio
    audio.playSound(type);
    
    // Play haptic if supported and requested
    if (includeHaptic) {
      const hapticType = {
        'dna-form': 'transition',
        'block-chain': 'transition', 
        'tree-grow': 'treeGrowth',
        'story-discover': 'nodeDiscovery',
        'security-activate': 'worldIdSuccess',
        'genesis-create': 'genesisCreation',
        'step-complete': 'stepComplete',
        'success': 'worldIdSuccess'
      }[type] as keyof typeof haptics.hapticPatterns;
      
      if (hapticType) {
        haptics.triggerHaptic(hapticType);
      }
    }
  }, [audio, haptics]);

  return {
    playFeedback,
    audio,
    haptics
  };
} 