import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LanguageCode, ScenarioId } from '@/constants/languages';
import type { AIMode, ConversationMessage, ConversationScore } from '@/lib/aiEngine';
import type { LearningItem } from '@/lib/spacedRepetition';
import { createLearningItem, processReview } from '@/lib/spacedRepetition';
import type { UserSubscription } from '@/lib/pricing';
import { createSubscription } from '@/lib/pricing';

export interface ConversationRecord {
  id: string;
  scenarioId: ScenarioId;
  score: ConversationScore;
  durationSeconds: number;
  timestamp: number;
}

interface AppState {
  onboardingComplete: boolean;
  nativeLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  aiMode: AIMode;
  difficulty: number;
  learningItems: LearningItem[];
  conversationHistory: ConversationRecord[];
  subscription: UserSubscription | null;
  streak: number;
  lastActiveDate: string | null;
  currentScenario: ScenarioId | null;

  completeOnboarding: (native: LanguageCode, target: LanguageCode, mode: AIMode) => void;
  setLanguages: (native: LanguageCode, target: LanguageCode) => void;
  setAIMode: (mode: AIMode) => void;
  setCurrentScenario: (id: ScenarioId) => void;
  addLearningItem: (word: string, translation: string, context?: string, scenarioId?: string) => void;
  processWordReview: (id: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
  recordConversation: (record: ConversationRecord) => void;
  setSubscription: (sub: UserSubscription | null) => void;
  updateSubscription: (sub: UserSubscription) => void;
  updateStreak: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      nativeLanguage: 'he',
      targetLanguage: 'en',
      aiMode: 'bilingual',
      difficulty: 2,
      learningItems: [],
      conversationHistory: [],
      subscription: null,
      streak: 0,
      lastActiveDate: null,
      currentScenario: null,

      completeOnboarding: (native, target, mode) =>
        set({ onboardingComplete: true, nativeLanguage: native, targetLanguage: target, aiMode: mode }),

      setLanguages: (native, target) => set({ nativeLanguage: native, targetLanguage: target }),

      setAIMode: (mode) => set({ aiMode: mode }),

      setCurrentScenario: (id) => set({ currentScenario: id }),

      addLearningItem: (word, translation, context, scenarioId) => {
        const { learningItems, targetLanguage } = get();
        const existing = learningItems.find(
          (i) => i.word.toLowerCase() === word.toLowerCase() && i.language === targetLanguage,
        );
        if (existing) {
          set({
            learningItems: learningItems.map((i) =>
              i.id === existing.id ? { ...i, mistakeCount: i.mistakeCount + 1 } : i,
            ),
          });
          return;
        }
        set({
          learningItems: [
            ...learningItems,
            createLearningItem(word, translation, targetLanguage, context, scenarioId),
          ],
        });
      },

      processWordReview: (id, quality) => {
        set({
          learningItems: get().learningItems.map((item) =>
            item.id === id ? processReview(item, quality) : item,
          ),
        });
      },

      recordConversation: (record) => {
        const history = [record, ...get().conversationHistory].slice(0, 50);
        set({ conversationHistory: history });
        get().updateStreak();

        for (const mistake of record.score.mistakes) {
          get().addLearningItem(mistake.word, mistake.correction, mistake.context, record.scenarioId);
        }
      },

      setSubscription: (sub) => set({ subscription: sub }),

      updateSubscription: (sub) => set({ subscription: sub }),

      updateStreak: () => {
        const { lastActiveDate, streak } = get();
        const t = today();
        if (lastActiveDate === t) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const newStreak = lastActiveDate === yesterdayStr ? streak + 1 : 1;
        set({ streak: newStreak, lastActiveDate: t });
      },
    }),
    {
      name: 'nuralange-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        nativeLanguage: state.nativeLanguage,
        targetLanguage: state.targetLanguage,
        aiMode: state.aiMode,
        difficulty: state.difficulty,
        learningItems: state.learningItems,
        conversationHistory: state.conversationHistory,
        subscription: state.subscription,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
      }),
    },
  ),
);

export function simulateSubscription(tierId: string) {
  const sub = createSubscription(tierId);
  useAppStore.getState().setSubscription(sub);
}

export type { ConversationMessage, ConversationScore };
