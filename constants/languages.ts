export const LANGUAGES = [
  { code: 'he', name: 'עברית', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'en', name: 'אנגלית', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'ספרדית', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'צרפתית', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'גרמנית', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'ערבית', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'רוסית', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'איטלקית', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'פורטוגזית', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ja', name: 'יפנית', nativeName: '日本語', flag: '🇯🇵' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const SCENARIOS = [
  {
    id: 'restaurant',
    icon: '🍽️',
    difficulty: 1,
    durationMinutes: 10,
    tags: ['יומיומי', 'אוכל'],
  },
  {
    id: 'airport',
    icon: '✈️',
    difficulty: 2,
    durationMinutes: 12,
    tags: ['נסיעות', 'שירות'],
  },
  {
    id: 'job_interview',
    icon: '💼',
    difficulty: 3,
    durationMinutes: 15,
    tags: ['קריירה', 'פורמלי'],
  },
  {
    id: 'doctor',
    icon: '🏥',
    difficulty: 2,
    durationMinutes: 10,
    tags: ['בריאות', 'דחוף'],
  },
  {
    id: 'shopping',
    icon: '🛍️',
    difficulty: 1,
    durationMinutes: 8,
    tags: ['יומיומי', 'קניות'],
  },
  {
    id: 'neighbor',
    icon: '🏠',
    difficulty: 2,
    durationMinutes: 10,
    tags: ['חברתי', 'שכנים'],
  },
  {
    id: 'hotel',
    icon: '🏨',
    difficulty: 2,
    durationMinutes: 12,
    tags: ['נסיעות', 'שירות'],
  },
  {
    id: 'complaint',
    icon: '📞',
    difficulty: 3,
    durationMinutes: 12,
    tags: ['שירות', 'פתרון בעיות'],
  },
] as const;

export type ScenarioId = (typeof SCENARIOS)[number]['id'];

export const LESSON_DURATION_MINUTES = 10;
export const BASE_LESSON_PRICE_ILS = 20;
export const MIN_EXTRA_LESSON_PRICE_ILS = 15;
export const MAX_EXTRA_LESSON_PRICE_ILS = 20;
