import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/ui/Background';
import { Badge, GlassButton, GlassCard } from '@/components/ui/Glass';
import { he } from '@/constants/i18n';
import { colors, spacing, typography } from '@/constants/theme';
import {
  EXTRA_LESSON_PACKS,
  SUBSCRIPTION_TIERS,
  pricePerLesson,
  savingsVsSingleLesson,
} from '@/lib/pricing';
import { paymentService } from '@/lib/paymentService';
import { simulateSubscription, useAppStore } from '@/store/useAppStore';

const t = he.pricing;

export default function PricingScreen() {
  const subscription = useAppStore((s) => s.subscription);
  const updateSubscription = useAppStore((s) => s.updateSubscription);
  const [selectedTier, setSelectedTier] = useState(subscription?.tierId ?? 'daily');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'plans' | 'extra'>('plans');

  const tier = SUBSCRIPTION_TIERS.find((item) => item.id === selectedTier)!;
  const activeTier = subscription
    ? SUBSCRIPTION_TIERS.find((item) => item.id === subscription.tierId)!
    : tier;

  const handlePurchase = async () => {
    setLoading(true);
    const result = await paymentService.purchaseSubscription(selectedTier);
    if (result.success) {
      simulateSubscription(selectedTier);
    }
    setLoading(false);
    router.back();
  };

  const handleExtraPack = async (packId: string) => {
    if (!subscription) return;
    setLoading(true);
    const pack = EXTRA_LESSON_PACKS.find((p) => p.id === packId)!;
    const result = await paymentService.purchaseExtraPack(packId, subscription.tierId);
    if (result.success) {
      const { addExtraPack } = await import('@/lib/pricing');
      updateSubscription(addExtraPack(subscription, pack));
    }
    setLoading(false);
    router.back();
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.close}>
            <Ionicons name="close" size={28} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, tab === 'plans' && styles.tabActive]}
            onPress={() => setTab('plans')}
          >
            <Text style={[styles.tabText, tab === 'plans' && styles.tabTextActive]}>תוכניות</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'extra' && styles.tabActive]}
            onPress={() => setTab('extra')}
          >
            <Text style={[styles.tabText, tab === 'extra' && styles.tabTextActive]}>{t.extraLessons}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'plans' ? (
            <>
              {SUBSCRIPTION_TIERS.map((tierItem) => {
                const perLesson = pricePerLesson(tierItem);
                const savings = savingsVsSingleLesson(tierItem);
                const isSelected = tierItem.id === selectedTier;

                return (
                  <GlassCard
                    key={tierItem.id}
                    style={[styles.tierCard, isSelected && styles.tierSelected]}
                    onPress={() => setSelectedTier(tierItem.id)}
                    glow={tierItem.isBestValue ? 'primary' : 'none'}
                  >
                    <View style={styles.tierHeader}>
                      <View style={styles.tierBadges}>
                        {tierItem.isBestValue && <Badge text={t.bestValue} color={colors.primary} />}
                        {tierItem.id === 'three' && <Badge text={t.popular} color={colors.accent} />}
                        {subscription?.tierId === tierItem.id && (
                          <Badge text={t.current} color={colors.success} />
                        )}
                      </View>
                      <Text style={styles.tierName}>
                        {t.tiers[tierItem.id as keyof typeof t.tiers]}
                      </Text>
                    </View>

                    <View style={styles.tierPricing}>
                      <Text style={styles.tierPrice}>{tierItem.monthlyPriceILS} ₪</Text>
                      <Text style={styles.tierPeriod}>{t.perMonth}</Text>
                    </View>

                    <View style={styles.tierDetails}>
                      <Text style={styles.tierDetail}>
                        {tierItem.lessonsPerWeek} {t.lessonsPerWeek} · {tierItem.lessonsPerMonth} {he.common.lessons}
                      </Text>
                      <Text style={styles.tierPerLesson}>
                        {perLesson} ₪ {t.perLesson}
                      </Text>
                      {savings > 0 && (
                        <Text style={styles.tierSavings}>
                          {t.savings} {savings}% {t.comparedTo}
                        </Text>
                      )}
                    </View>

                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </GlassCard>
                );
              })}

              <Text style={styles.note}>{t.lessonDuration}</Text>
              <Text style={styles.demoNote}>{t.noPaymentYet}</Text>

              <GlassButton
                title={loading ? he.common.loading : t.simulatePurchase}
                onPress={handlePurchase}
                size="lg"
                fullWidth
                disabled={loading}
              />
            </>
          ) : (
            <>
              <Text style={styles.extraDesc}>{t.extraDesc}</Text>
              {!subscription ? (
                <Text style={styles.noSub}>{he.home.noPlan}</Text>
              ) : (
                EXTRA_LESSON_PACKS.map((pack) => {
                  const price = pack.getPrice(activeTier);
                  const perLesson = Math.round(price / pack.lessonCount);
                  return (
                    <GlassCard key={pack.id} style={styles.packCard} onPress={() => handleExtraPack(pack.id)}>
                      <View style={styles.packInfo}>
                        <Text style={styles.packCount}>
                          +{pack.lessonCount} {t.lessons}
                        </Text>
                        <Text style={styles.packPerLesson}>{perLesson} ₪ {t.perLesson}</Text>
                      </View>
                      <Text style={styles.packPrice}>{price} ₪</Text>
                    </GlassCard>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  close: { alignSelf: 'flex-start', marginBottom: spacing.md },
  title: { ...typography.title, color: colors.text, textAlign: 'right' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'right', marginTop: spacing.sm },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  tierCard: { position: 'relative' },
  tierSelected: { borderColor: colors.primary, borderWidth: 2 },
  tierHeader: { marginBottom: spacing.sm },
  tierBadges: { flexDirection: 'row', gap: 6, justifyContent: 'flex-end', marginBottom: spacing.sm },
  tierName: { ...typography.subtitle, color: colors.text, textAlign: 'right' },
  tierPricing: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end', gap: 6 },
  tierPrice: { fontSize: 32, fontWeight: '800', color: colors.primaryLight },
  tierPeriod: { ...typography.caption, color: colors.textSecondary },
  tierDetails: { alignItems: 'flex-end', marginTop: spacing.sm, gap: 2 },
  tierDetail: { ...typography.caption, color: colors.textSecondary },
  tierPerLesson: { ...typography.body, color: colors.text, fontWeight: '600' },
  tierSavings: { ...typography.caption, color: colors.success },
  radio: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  note: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  demoNote: { ...typography.caption, color: colors.warning, textAlign: 'center' },
  extraDesc: { ...typography.body, color: colors.textSecondary, textAlign: 'right' },
  noSub: { ...typography.body, color: colors.textMuted, textAlign: 'center', padding: spacing.lg },
  packCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  packInfo: { alignItems: 'flex-end' },
  packCount: { ...typography.subtitle, color: colors.text },
  packPerLesson: { ...typography.caption, color: colors.textSecondary },
  packPrice: { fontSize: 24, fontWeight: '800', color: colors.accent },
});
