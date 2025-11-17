// Text-to-Speech utility using Web Speech API
export class TextToSpeech {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.synth = window.speechSynthesis;
    this.initVoice();
  }

  private initVoice() {
    // Wait for voices to load
    const setVoice = () => {
      const voices = this.synth.getVoices();
      
      // Try to find a pleasant female voice
      const preferredVoices = [
        'Samantha', // Mac
        'Google UK English Female',
        'Google US English Female',
        'Microsoft Zira Desktop', // Windows
        'Microsoft Aria Online (Natural)', // Windows 11
        'Karen', // Mac
        'Female',
      ];

      for (const preferred of preferredVoices) {
        const foundVoice = voices.find(v => v.name.includes(preferred));
        if (foundVoice) {
          this.voice = foundVoice;
          console.log('Selected voice:', foundVoice.name);
          return;
        }
      }

      // Fallback to first female voice
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman')
      );
      
      if (femaleVoice) {
        this.voice = femaleVoice;
      } else if (voices.length > 0) {
        // Last resort: use first available voice
        this.voice = voices[0];
      }
      
      console.log('Selected voice:', this.voice?.name);
    };

    // Voices might not be loaded immediately
    if (this.synth.getVoices().length > 0) {
      setVoice();
    } else {
      this.synth.addEventListener('voiceschanged', setVoice);
    }
  }

  speak(text: string, options: { rate?: number; pitch?: number; volume?: number } = {}) {
    if (!this.isEnabled) {
      console.log('TTS is disabled');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    // Set natural, friendly parameters
    utterance.rate = options.rate || 0.95; // Slightly slower for clarity
    utterance.pitch = options.pitch || 1.1; // Slightly higher for friendliness
    utterance.volume = options.volume || 0.8;

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };

    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stop();
    }
    return this.isEnabled;
  }

  isActive() {
    return this.synth.speaking;
  }

  getEnabled() {
    return this.isEnabled;
  }
}

// Singleton instance
let ttsInstance: TextToSpeech | null = null;

export const getTextToSpeech = (): TextToSpeech => {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeech();
  }
  return ttsInstance;
};
