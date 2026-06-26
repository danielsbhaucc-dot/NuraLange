/**
 * מנוע חזרות מרווחות — בהשראת SM-2 ו-Duocards
 * כל מילה/ביטוי עם שגיאה נשמר עם מצב למידה עצמאי
 */

export type WordStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface LearningItem {
  id: string;
  word: string;
  translation: string;
  context?: string;
  scenarioId?: string;
  language: string;
  status: WordStatus;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number;
  lastReview: number;
  mistakeCount: number;
  correctStreak: number;
  createdAt: number;
}

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export function createLearningItem(
  word: string,
  translation: string,
  language: string,
  context?: string,
  scenarioId?: string,
): LearningItem {
  const now = Date.now();
  return {
    id: `${language}_${word}_${now}`,
    word,
    translation,
    context,
    scenarioId,
    language,
    status: 'new',
    easeFactor: DEFAULT_EASE,
    interval: 0,
    repetitions: 0,
    nextReview: now,
    lastReview: 0,
    mistakeCount: 1,
    correctStreak: 0,
    createdAt: now,
  };
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * @param quality 0=שכחתי לגמרי, 5=מושלם
 */
export function processReview(item: LearningItem, quality: ReviewQuality): LearningItem {
  const now = Date.now();
  const updated = { ...item, lastReview: now };

  if (quality < 3) {
    updated.repetitions = 0;
    updated.interval = 1;
    updated.easeFactor = Math.max(MIN_EASE, item.easeFactor - 0.2);
    updated.status = 'learning';
    updated.correctStreak = 0;
    updated.mistakeCount += 1;
  } else {
    updated.correctStreak += 1;
    updated.mistakeCount = Math.max(0, updated.mistakeCount - 1);

    if (updated.repetitions === 0) {
      updated.interval = 1;
    } else if (updated.repetitions === 1) {
      updated.interval = 3;
    } else {
      updated.interval = Math.round(item.interval * item.easeFactor);
    }

    updated.repetitions += 1;
    updated.easeFactor = item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    if (updated.interval >= 21 && updated.correctStreak >= 3) {
      updated.status = 'mastered';
    } else if (updated.repetitions >= 1) {
      updated.status = 'review';
    }
  }

  updated.nextReview = now + updated.interval * 24 * 60 * 60 * 1000;
  return updated;
}

export function getDueItems(items: LearningItem[], limit = 10): LearningItem[] {
  const now = Date.now();
  return items
    .filter((item) => item.status !== 'mastered' && item.nextReview <= now)
    .sort((a, b) => {
      if (a.mistakeCount !== b.mistakeCount) return b.mistakeCount - a.mistakeCount;
      return a.nextReview - b.nextReview;
    })
    .slice(0, limit);
}

export function getWordsForConversation(items: LearningItem[], limit = 5): LearningItem[] {
  const due = getDueItems(items, limit);
  const struggling = items
    .filter((i) => i.mistakeCount >= 2 && i.status !== 'mastered')
    .sort((a, b) => b.mistakeCount - a.mistakeCount)
    .slice(0, limit - due.length);

  const combined = [...due];
  for (const item of struggling) {
    if (!combined.find((c) => c.id === item.id)) {
      combined.push(item);
    }
  }
  return combined.slice(0, limit);
}

export function getRecurringMistakes(items: LearningItem[], minMistakes = 2): LearningItem[] {
  return items
    .filter((i) => i.mistakeCount >= minMistakes && i.status !== 'mastered')
    .sort((a, b) => b.mistakeCount - a.mistakeCount);
}

export function masteryPercentage(items: LearningItem[]): number {
  if (items.length === 0) return 0;
  const mastered = items.filter((i) => i.status === 'mastered').length;
  return Math.round((mastered / items.length) * 100);
}
