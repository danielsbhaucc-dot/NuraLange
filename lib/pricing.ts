import {
  BASE_LESSON_PRICE_ILS,
  LESSON_DURATION_MINUTES,
  MAX_EXTRA_LESSON_PRICE_ILS,
  MIN_EXTRA_LESSON_PRICE_ILS,
} from '@/constants/languages';

export interface SubscriptionTier {
  id: string;
  lessonsPerWeek: number;
  lessonsPerMonth: number;
  monthlyPriceILS: number;
  extraLessonPriceILS: number;
  isBestValue: boolean;
  minutesPerMonth: number;
}

export interface ExtraLessonPack {
  id: string;
  lessonCount: number;
  /** מחיר ליחידה לפי tier */
  getPrice: (tier: SubscriptionTier) => number;
}

/**
 * תמחור חכם: החבילה היקרה ביותר תמיד הכי משתלמת.
 * מחיר בסיס: 20 ₪ לשיעור בחבילה הכי גדולה (5/שבוע = 20/חודש)
 * 200 ₪ / 30 שיעורים ≈ 6.67 ₪ — אבל אנחנו מוכרים לפי שבועיות עם מדרג
 */
function buildTiers(): SubscriptionTier[] {
  const tiers: Omit<SubscriptionTier, 'isBestValue'>[] = [
  {
    id: 'daily',
    lessonsPerWeek: 5,
    lessonsPerMonth: 30,
    monthlyPriceILS: 200,
    extraLessonPriceILS: 15,
    minutesPerMonth: 30 * LESSON_DURATION_MINUTES,
  },
  {
    id: 'four',
    lessonsPerWeek: 4,
    lessonsPerMonth: 16,
    monthlyPriceILS: 180,
    extraLessonPriceILS: 16,
    minutesPerMonth: 16 * LESSON_DURATION_MINUTES,
  },
  {
    id: 'three',
    lessonsPerWeek: 3,
    lessonsPerMonth: 12,
    monthlyPriceILS: 150,
    extraLessonPriceILS: 17,
    minutesPerMonth: 12 * LESSON_DURATION_MINUTES,
  },
  {
    id: 'two',
    lessonsPerWeek: 2,
    lessonsPerMonth: 8,
    monthlyPriceILS: 110,
    extraLessonPriceILS: 18,
    minutesPerMonth: 8 * LESSON_DURATION_MINUTES,
  },
  {
    id: 'one',
    lessonsPerWeek: 1,
    lessonsPerMonth: 4,
    monthlyPriceILS: 60,
    extraLessonPriceILS: 20,
    minutesPerMonth: 4 * LESSON_DURATION_MINUTES,
  },
  ];

  return tiers.map((tier, index) => ({
    ...tier,
    isBestValue: index === 0,
  }));
}

export const SUBSCRIPTION_TIERS = buildTiers();

export const EXTRA_LESSON_PACKS: ExtraLessonPack[] = [
  { id: 'pack_3', lessonCount: 3, getPrice: (t) => t.extraLessonPriceILS * 3 },
  { id: 'pack_5', lessonCount: 5, getPrice: (t) => Math.round(t.extraLessonPriceILS * 5 * 0.95) },
  { id: 'pack_10', lessonCount: 10, getPrice: (t) => Math.round(t.extraLessonPriceILS * 10 * 0.9) },
];

export function pricePerLesson(tier: SubscriptionTier): number {
  return Math.round((tier.monthlyPriceILS / tier.lessonsPerMonth) * 100) / 100;
}

export function savingsVsSingleLesson(tier: SubscriptionTier): number {
  const singlePrice = SUBSCRIPTION_TIERS[SUBSCRIPTION_TIERS.length - 1].extraLessonPriceILS;
  const perLesson = pricePerLesson(tier);
  return Math.round((1 - perLesson / singlePrice) * 100);
}

export function validatePricingIntegrity(): boolean {
  const perLessonPrices = SUBSCRIPTION_TIERS.map(pricePerLesson);
  for (let i = 0; i < perLessonPrices.length - 1; i++) {
    if (perLessonPrices[i] >= perLessonPrices[i + 1]) return false;
  }

  for (const tier of SUBSCRIPTION_TIERS) {
    for (const pack of EXTRA_LESSON_PACKS) {
      const packPerLesson = pack.getPrice(tier) / pack.lessonCount;
      if (packPerLesson < tier.extraLessonPriceILS * 0.85) return false;
      if (packPerLesson > MAX_EXTRA_LESSON_PRICE_ILS) return false;
    }
  }

  const bestTier = SUBSCRIPTION_TIERS[0];
  const worstTier = SUBSCRIPTION_TIERS[SUBSCRIPTION_TIERS.length - 1];
  const bestTotal = bestTier.monthlyPriceILS + EXTRA_LESSON_PACKS[2].getPrice(bestTier);
  const worstEquivalent =
    worstTier.monthlyPriceILS * (bestTier.lessonsPerMonth / worstTier.lessonsPerMonth);
  if (bestTotal > worstEquivalent) return false;

  return true;
}

export interface UserSubscription {
  tierId: string;
  lessonsRemaining: number;
  extraLessonsRemaining: number;
  minutesRemaining: number;
  renewsAt: number;
  startedAt: number;
}

export function createSubscription(tierId: string): UserSubscription {
  const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId)!;
  const now = Date.now();
  return {
    tierId,
    lessonsRemaining: tier.lessonsPerMonth,
    extraLessonsRemaining: 0,
    minutesRemaining: tier.minutesPerMonth,
    startedAt: now,
    renewsAt: now + 30 * 24 * 60 * 60 * 1000,
  };
}

export function canStartLesson(sub: UserSubscription | null): boolean {
  if (!sub) return false;
  return sub.lessonsRemaining > 0 || sub.extraLessonsRemaining > 0;
}

export function consumeLesson(sub: UserSubscription, durationMinutes: number): UserSubscription {
  const updated = { ...sub };
  if (updated.lessonsRemaining > 0) {
    updated.lessonsRemaining -= 1;
  } else if (updated.extraLessonsRemaining > 0) {
    updated.extraLessonsRemaining -= 1;
  }
  updated.minutesRemaining = Math.max(0, updated.minutesRemaining - durationMinutes);
  return updated;
}

export function addExtraPack(sub: UserSubscription, pack: ExtraLessonPack): UserSubscription {
  const tier = SUBSCRIPTION_TIERS.find((t) => t.id === sub.tierId)!;
  return {
    ...sub,
    extraLessonsRemaining: sub.extraLessonsRemaining + pack.lessonCount,
    minutesRemaining: sub.minutesRemaining + pack.lessonCount * LESSON_DURATION_MINUTES,
  };
}

export { BASE_LESSON_PRICE_ILS, MIN_EXTRA_LESSON_PRICE_ILS, MAX_EXTRA_LESSON_PRICE_ILS };
