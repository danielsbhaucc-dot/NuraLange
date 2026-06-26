import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import type { LanguageCode } from '@/constants/languages';

export type SpeechState = 'idle' | 'listening' | 'processing' | 'speaking';

const SPEECH_LANG_MAP: Record<LanguageCode, string> = {
  he: 'he-IL',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ar: 'ar-SA',
  ru: 'ru-RU',
  it: 'it-IT',
  pt: 'pt-BR',
  ja: 'ja-JP',
};

type SpeechCallback = (text: string) => void;
type StateCallback = (state: SpeechState) => void;

interface WebSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface WebSpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => WebSpeechRecognition;
    webkitSpeechRecognition?: new () => WebSpeechRecognition;
  }
}

class SpeechService {
  private recognition: WebSpeechRecognition | null = null;
  private onResult: SpeechCallback | null = null;
  private onStateChange: StateCallback | null = null;
  private isSpeaking = false;

  isRecognitionAvailable(): boolean {
    if (Platform.OS === 'web') {
      return !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
    }
    return false;
  }

  setCallbacks(onResult: SpeechCallback, onStateChange: StateCallback) {
    this.onResult = onResult;
    this.onStateChange = onStateChange;
  }

  private setState(state: SpeechState) {
    this.onStateChange?.(state);
  }

  startListening(language: LanguageCode) {
    if (Platform.OS !== 'web') {
      this.setState('idle');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.stopListening();

    this.recognition = new SpeechRecognition();
    this.recognition.lang = SPEECH_LANG_MAP[language] ?? 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript) {
        this.onResult?.(transcript);
      }
      this.setState('idle');
    };

    this.recognition.onerror = () => {
      this.setState('idle');
    };

    this.recognition.onend = () => {
      if (!this.isSpeaking) this.setState('idle');
    };

    this.setState('listening');
    this.recognition.start();
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
  }

  async speak(text: string, language: LanguageCode): Promise<void> {
    this.isSpeaking = true;
    this.setState('speaking');

    return new Promise((resolve) => {
      Speech.speak(text, {
        language: SPEECH_LANG_MAP[language] ?? 'en-US',
        rate: 0.9,
        pitch: 1.0,
        onDone: () => {
          this.isSpeaking = false;
          this.setState('idle');
          resolve();
        },
        onError: () => {
          this.isSpeaking = false;
          this.setState('idle');
          resolve();
        },
      });
    });
  }

  stopSpeaking() {
    Speech.stop();
    this.isSpeaking = false;
    this.setState('idle');
  }
}

export const speechService = new SpeechService();
