import type { LanguageCode, ScenarioId } from '@/constants/languages';
import type { LearningItem } from '@/lib/spacedRepetition';
import { getWordsForConversation } from '@/lib/spacedRepetition';

export type AIMode = 'bilingual' | 'target_only';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  correction?: string;
  timestamp: number;
}

export interface ConversationContext {
  nativeLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  aiMode: AIMode;
  scenarioId: ScenarioId;
  difficulty: number;
  reviewWords: LearningItem[];
  conversationHistory: ConversationMessage[];
}

export interface ConversationScore {
  overall: number;
  fluency: number;
  accuracy: number;
  vocabulary: number;
  confidence: number;
  naturalness: number;
  mistakes: Array<{ word: string; correction: string; context: string }>;
  newWords: string[];
  reviewedWords: string[];
  nextStep: string;
}

const SCENARIO_PROMPTS: Record<ScenarioId, { role: string; setting: string }> = {
  restaurant: {
    role: 'מלצר/ית במסעדה איטלקית יוקרתית',
    setting: 'הלקוח מגיע להזמין ארוחת ערב. יש תפריט עם מנות מיוחדות.',
  },
  airport: {
    role: 'נציג/ת דלפק בטחון בשדה תעופה',
    setting: 'נוסע מגיע לבדיקת דרכונים לפני טיסה בינלאומית.',
  },
  job_interview: {
    role: 'מנהל/ת משאבי אנוש בחברת הייטק',
    setting: 'ראיון עבודה לתפקיד מפתח/ת תוכנה בכיר/ה.',
  },
  doctor: {
    role: 'רופא/ה במרפאה',
    setting: 'מטופל/ת מגיע/ה עם תסמינים של כמה ימים.',
  },
  shopping: {
    role: 'מוכר/ת בחנות בגדים',
    setting: 'לקוח/ה מחפש/ת בגדים לאירוע מיוחד.',
  },
  neighbor: {
    role: 'שכן/ה חדש/ה בבניין',
    setting: 'פגישה ראשונה במסדרון, רוצים להכיר.',
  },
  hotel: {
    role: 'פקיד/ת קבלה במלון בינלאומי',
    setting: 'אורח/ת מגיע/ה לצ\'ק-אין עם הזמנה.',
  },
  complaint: {
    role: 'נציג/ת שירות לקוחות בחברת תקשורת',
    setting: 'לקוח/ה מתקשר/ת עם תלונה על חיוב שגוי.',
  },
};

const SCENARIO_OPENERS: Record<ScenarioId, Record<string, string>> = {
  restaurant: {
    en: "Good evening! Welcome to Bella Vista. Do you have a reservation, or shall I find you a table?",
    es: "¡Buenas noches! Bienvenido a Bella Vista. ¿Tiene reserva o le busco una mesa?",
    fr: "Bonsoir ! Bienvenue au Bella Vista. Avez-vous une réservation ?",
    de: "Guten Abend! Willkommen im Bella Vista. Haben Sie reserviert?",
  },
  airport: {
    en: "Good morning. May I see your passport and boarding pass, please?",
    es: "Buenos días. ¿Puedo ver su pasaporte y tarjeta de embarque?",
    fr: "Bonjour. Puis-je voir votre passeport et votre carte d'embarquement ?",
    de: "Guten Morgen. Darf ich bitte Ihren Reisepass und Bordkarte sehen?",
  },
  job_interview: {
    en: "Thank you for coming in today. Let's start — can you tell me about your experience with team leadership?",
    es: "Gracias por venir hoy. Empecemos — ¿puede contarme sobre su experiencia liderando equipos?",
    fr: "Merci d'être venu aujourd'hui. Commençons — pouvez-vous me parler de votre expérience en leadership ?",
    de: "Danke, dass Sie heute gekommen sind. Fangen wir an — erzählen Sie mir von Ihrer Führungserfahrung.",
  },
  doctor: {
    en: "Hello, I'm Dr. Cohen. What brings you in today?",
    es: "Hola, soy el Dr. Cohen. ¿Qué le trae hoy?",
    fr: "Bonjour, je suis le Dr Cohen. Qu'est-ce qui vous amène aujourd'hui ?",
    de: "Hallo, ich bin Dr. Cohen. Was führt Sie heute zu mir?",
  },
  shopping: {
    en: "Hi there! Looking for something special today?",
    es: "¡Hola! ¿Busca algo especial hoy?",
    fr: "Bonjour ! Vous cherchez quelque chose de spécial ?",
    de: "Hallo! Suchen Sie heute etwas Besonderes?",
  },
  neighbor: {
    en: "Oh, hi! I don't think we've met — I just moved in next door.",
    es: "¡Oh, hola! Creo que no nos conocemos — acabo de mudarme al lado.",
    fr: "Oh, bonjour ! Je ne crois pas qu'on se connaisse — je viens d'emménager à côté.",
    de: "Oh, hallo! Wir kennen uns wohl nicht — ich bin gerade nebenan eingezogen.",
  },
  hotel: {
    en: "Good afternoon and welcome to the Grand Palace Hotel. Do you have a reservation with us?",
    es: "Buenas tardes y bienvenido al Hotel Grand Palace. ¿Tiene reserva con nosotros?",
    fr: "Bon après-midi et bienvenue au Grand Palace Hôtel. Avez-vous une réservation ?",
    de: "Guten Tag und willkommen im Grand Palace Hotel. Haben Sie eine Reservierung?",
  },
  complaint: {
    en: "Thank you for calling TechConnect support. I understand you have a billing concern — how can I help?",
    es: "Gracias por llamar al soporte de TechConnect. Entiendo que tiene un problema de facturación — ¿cómo puedo ayudarle?",
    fr: "Merci d'appeler le support TechConnect. Je comprends que vous avez un problème de facturation — comment puis-je vous aider ?",
    de: "Danke, dass Sie TechConnect-Support anrufen. Ich verstehe, Sie haben ein Abrechnungsproblem — wie kann ich helfen?",
  },
};

function getOpener(scenarioId: ScenarioId, lang: string): string {
  const openers = SCENARIO_OPENERS[scenarioId];
  return openers[lang] ?? openers.en ?? "Hello! Let's begin our conversation.";
}

function buildSystemPrompt(ctx: ConversationContext): string {
  const scenario = SCENARIO_PROMPTS[ctx.scenarioId];
  const reviewWordsList = ctx.reviewWords.map((w) => w.word).join(', ');

  const modeInstruction =
    ctx.aiMode === 'target_only'
      ? `דבר רק ב${ctx.targetLanguage}. אל תשתמש בשפת האם.`
      : `דבר בעיקר ב${ctx.targetLanguage}, אבל הסבר תיקונים ב${ctx.nativeLanguage}.`;

  return `אתה מורה פרטי לשפות ב-NuraLange. ${modeInstruction}

תפקיד: ${scenario.role}
הגדרה: ${scenario.setting}
רמת קושי: ${ctx.difficulty}/5

כללים:
1. שיחה טבעית — לא תרגילים, לא שאלות "תאר את..."
2. הכנס בצורה טבעית את המילים הבאות לשיחה: ${reviewWordsList || 'אין'}
3. תקן שגיאות בעדינות — הצג תיקון קצר אחרי תגובת המשתמש
4. התאם קושי בזמן אמת לפי איכות התגובות
5. שמור על אווירה של שיחה אמיתית, לא מבחן`;
}

export function createConversationContext(
  nativeLanguage: LanguageCode,
  targetLanguage: LanguageCode,
  aiMode: AIMode,
  scenarioId: ScenarioId,
  learningItems: LearningItem[],
  difficulty = 2,
): ConversationContext {
  return {
    nativeLanguage,
    targetLanguage,
    aiMode,
    scenarioId,
    difficulty,
    reviewWords: getWordsForConversation(learningItems),
    conversationHistory: [],
  };
}

export function startConversation(ctx: ConversationContext): ConversationMessage {
  const opener = getOpener(ctx.scenarioId, ctx.targetLanguage);
  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: opener,
    timestamp: Date.now(),
  };
}

/**
 * מנוע AI מקומי להדגמה — מוכן להחלפה ב-OpenAI/Anthropic API
 * הגדר EXPO_PUBLIC_AI_API_URL ו-EXPO_PUBLIC_AI_API_KEY לחיבור אמיתי
 */
export async function generateAIResponse(
  ctx: ConversationContext,
  userMessage: string,
): Promise<ConversationMessage> {
  const apiUrl = process.env.EXPO_PUBLIC_AI_API_URL;

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_AI_API_KEY ?? ''}`,
        },
        body: JSON.stringify({
          system: buildSystemPrompt(ctx),
          messages: ctx.conversationHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage,
          difficulty: ctx.difficulty,
          reviewWords: ctx.reviewWords.map((w) => w.word),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: data.content,
          correction: data.correction,
          timestamp: Date.now(),
        };
      }
    } catch {
      // fall through to local engine
    }
  }

  return generateLocalResponse(ctx, userMessage);
}

function generateLocalResponse(
  ctx: ConversationContext,
  userMessage: string,
): ConversationMessage {
  const lang = ctx.targetLanguage;
  const turnCount = ctx.conversationHistory.filter((m) => m.role === 'user').length;
  const reviewWord = ctx.reviewWords[turnCount % Math.max(ctx.reviewWords.length, 1)];

  const responses: Record<string, string[]> = {
    en: [
      "That's interesting! Tell me more about that.",
      "I see. And how did that make you feel?",
      "Good point. What would you do differently next time?",
      "Absolutely. By the way, have you ever had to deal with a similar situation at work?",
      "I understand. Let's explore that a bit more — can you give me a specific example?",
    ],
    es: [
      "¡Interesante! Cuéntame más sobre eso.",
      "Entiendo. ¿Y cómo te hizo sentir eso?",
      "Buen punto. ¿Qué harías diferente la próxima vez?",
      "Por cierto, ¿alguna vez has tenido que lidiar con una situación similar?",
      "Comprendo. Profundicemos — ¿puedes darme un ejemplo específico?",
    ],
    fr: [
      "C'est intéressant ! Dites-m'en plus.",
      "Je vois. Et comment cela vous a-t-il fait sentir ?",
      "Bon point. Que feriez-vous différemment la prochaine fois ?",
      "Au fait, avez-vous déjà dû faire face à une situation similaire ?",
      "Je comprends. Approfondissons — pouvez-vous me donner un exemple précis ?",
    ],
    de: [
      "Das ist interessant! Erzählen Sie mir mehr darüber.",
      "Ich verstehe. Und wie hat Sie das gefühlt?",
      "Guter Punkt. Was würden Sie beim nächsten Mal anders machen?",
      "Übrigens, hatten Sie schon einmal mit einer ähnlichen Situation zu tun?",
      "Ich verstehe. Lassen Sie uns das vertiefen — können Sie ein konkretes Beispiel geben?",
    ],
  };

  const langResponses = responses[lang] ?? responses.en;
  let content = langResponses[turnCount % langResponses.length];

  if (reviewWord && turnCount > 0 && turnCount % 2 === 0) {
    const inserts: Record<string, (w: string) => string> = {
      en: (w) => ` Speaking of which, when was the last time you used "${w}" in conversation?`,
      es: (w) => ` Por cierto, ¿cuándo fue la última vez que usaste "${w}" en una conversación?`,
      fr: (w) => ` À propos, quand avez-vous utilisé "${w}" pour la dernière fois ?`,
      de: (w) => ` Übrigens, wann haben Sie "${w}" zuletzt in einem Gespräch verwendet?`,
    };
    const insert = inserts[lang] ?? inserts.en;
    content += insert(reviewWord.word);
  }

  const correction = detectSimpleMistake(userMessage, lang, ctx.nativeLanguage);

  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content,
    correction,
    timestamp: Date.now(),
  };
}

function detectSimpleMistake(
  text: string,
  targetLang: string,
  nativeLang: string,
): string | undefined {
  if (text.length < 3) return undefined;

  const hints: Record<string, Record<string, string>> = {
    en: {
      he: 'שים לב לסדר מילים — באנגלית הפועל בא לפני המשלים',
    },
    es: {
      he: 'בספרדית, שים לב להטיית פעלים לפי גוף הדובר',
    },
  };

  if (text.split(' ').length === 1 && text.length > 2) {
    return hints[targetLang]?.[nativeLang];
  }
  return undefined;
}

export function calculateScore(
  ctx: ConversationContext,
  durationSeconds: number,
): ConversationScore {
  const userMessages = ctx.conversationHistory.filter((m) => m.role === 'user');
  const corrections = ctx.conversationHistory.filter((m) => m.correction).length;
  const totalWords = userMessages.reduce((sum, m) => sum + m.content.split(' ').length, 0);
  const avgWordsPerMessage = userMessages.length > 0 ? totalWords / userMessages.length : 0;

  const accuracy = Math.max(40, Math.min(98, 90 - corrections * 8));
  const fluency = Math.max(30, Math.min(95, 50 + avgWordsPerMessage * 5 + userMessages.length * 3));
  const vocabulary = Math.max(35, Math.min(92, 45 + ctx.reviewWords.length * 4));
  const confidence = Math.max(25, Math.min(90, 40 + userMessages.length * 6));
  const naturalness = Math.max(30, Math.min(88, 55 + durationSeconds / 10));

  const overall = Math.round(
    accuracy * 0.3 + fluency * 0.25 + vocabulary * 0.15 + confidence * 0.15 + naturalness * 0.15,
  );

  const mistakes = ctx.reviewWords.slice(0, 3).map((w) => ({
    word: w.word,
    correction: w.translation,
    context: w.context ?? 'הופיע בשיחה',
  }));

  const nextSteps: Record<string, string> = {
    en: 'נסה להשתמש ב-3 מילים חדשות בשיחה הבאה — במיוחד בזמן עבר',
    es: 'תרגל פעלים בזמן עבר בשיחה הבאה',
    fr: 'התמקד בזכר ונקבה של שמות עצם בשיחה הבאה',
    de: 'תרגל מבנה משפט עם פועל במקום השני',
  };

  return {
    overall,
    fluency: Math.round(fluency),
    accuracy: Math.round(accuracy),
    vocabulary: Math.round(vocabulary),
    confidence: Math.round(confidence),
    naturalness: Math.round(naturalness),
    mistakes,
    newWords: ctx.reviewWords.slice(0, 2).map((w) => w.word),
    reviewedWords: ctx.reviewWords.map((w) => w.word),
    nextStep: nextSteps[ctx.targetLanguage] ?? nextSteps.en,
  };
}

export function adjustDifficulty(current: number, userMessageQuality: number): number {
  if (userMessageQuality >= 4) return Math.min(5, current + 0.5);
  if (userMessageQuality <= 2) return Math.max(1, current - 0.5);
  return current;
}
