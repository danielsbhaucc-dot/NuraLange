import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/ui/Background';
import { Badge, GlassButton, GlassCard, ProgressBar } from '@/components/ui/Glass';
import { he } from '@/constants/i18n';
import { LANGUAGES } from '@/constants/languages';
import { colors, spacing, typography } from '@/constants/theme';
import { canStartLesson } from '@/lib/pricing';
import { getDueItems } from '@/lib/spacedRepetition';
import { useAppStore } from '@/store/useAppStore';

const t = he.home;

export default function HomeScreen() {
  const targetLanguage = useAppStore((s) => s.targetLanguage);
  const subscription = useAppStore((s) => s.subscription);
  const streak = useAppStore((s) => s.streak);
  const learningItems = useAppStore((s) => s.learningItems);
  const conversationHistory = useAppStore((s) => s.conversationHistory);
  const currentScenario = useAppStore((s) => s.currentScenario);

  const targetLang = LANGUAGES.find((l) => l.code === targetLanguage);
  const dueWords = getDueItems(learningItems, 5);
  const lastConversation = conversationHistory[0];
  const hasPlan = canStartLesson(subscription);

  const startConversation = () => {
    if (!hasPlan) {
      router.push('/pricing');
      return;
    }
    router.push('/conversation');
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{t.greeting} 👋</Text>
              <Text style={styles.langRow}>
                {targetLang?.flag} לומדים {targetLang?.name}
              </Text>
            </View>
            {streak > 0 && (
              <GlassCard padding={12} style={styles.streakBadge}>
                <Text style={styles.streakNum}>{streak}</Text>
                <Text style={styles.streakLabel}>{t.streak}</Text>
              </GlassCard>
            )}
          </View>

          <GlassCard glow="primary" style={styles.heroCard} padding={spacing.lg}>
            <View style={styles.heroIcon}>
              <Ionicons name="mic-circle" size={56} color={colors.primaryLight} />
            </View>
            <Text style={styles.heroTitle}>{t.readyTitle}</Text>
            <Text style={styles.heroDesc}>{t.readyDesc}</Text>
            <GlassButton
              title={hasPlan ? t.startConversation : t.choosePlan}
              onPress={startConversation}
              size="lg"
              fullWidth
              icon={<Ionicons name="mic" size={22} color="#fff" />}
            />
          </GlassCard>

          {subscription && (
            <GlassCard style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{subscription.lessonsRemaining}</Text>
                  <Text style={styles.statLabel}>{t.lessonsLeft}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{subscription.minutesRemaining}</Text>
                  <Text style={styles.statLabel}>{t.minutesLeft}</Text>
                </View>
              </View>
              <ProgressBar
                value={subscription.minutesRemaining}
                max={subscription.minutesRemaining + subscription.lessonsRemaining * 10}
                color={colors.accent}
              />
            </GlassCard>
          )}

          {dueWords.length > 0 && (
            <GlassCard style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Ionicons name="refresh-circle" size={24} color={colors.accent} />
                <Text style={styles.reviewTitle}>{t.smartReview}</Text>
                <Badge text={`${dueWords.length}`} color={colors.accent} />
              </View>
              <Text style={styles.reviewDesc}>{t.nextReview}</Text>
              <View style={styles.wordChips}>
                {dueWords.map((w) => (
                  <View key={w.id} style={styles.chip}>
                    <Text style={styles.chipText}>{w.word}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          )}

          {lastConversation && (
            <GlassCard
              style={styles.lastCard}
              onPress={() => router.push({ pathname: '/score', params: { id: lastConversation.id } })}
            >
              <Text style={styles.lastTitle}>{t.continueLearning}</Text>
              <View style={styles.lastRow}>
                <Text style={styles.lastScenario}>
                  {he.scenarios.names[lastConversation.scenarioId]}
                </Text>
                <Text style={[styles.lastScore, { color: lastConversation.score.overall >= 70 ? colors.success : colors.warning }]}>
                  {lastConversation.score.overall}
                </Text>
              </View>
            </GlassCard>
          )}

          {currentScenario && (
            <GlassButton
              title={`${he.scenarios.start}: ${he.scenarios.names[currentScenario]}`}
              onPress={startConversation}
              variant="secondary"
              fullWidth
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  greeting: {
    ...typography.title,
    color: colors.text,
    textAlign: 'right',
  },
  langRow: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  streakBadge: { alignItems: 'center', minWidth: 64 },
  streakNum: { fontSize: 22, fontWeight: '800', color: colors.warning },
  streakLabel: { fontSize: 10, color: colors.textSecondary },
  heroCard: { alignItems: 'center', gap: spacing.md },
  heroIcon: { marginBottom: spacing.sm },
  heroTitle: { ...typography.subtitle, color: colors.text, textAlign: 'center' },
  heroDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
  statsCard: { gap: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border },
  reviewCard: { gap: spacing.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reviewTitle: { ...typography.subtitle, color: colors.text, flex: 1, textAlign: 'right' },
  reviewDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'right' },
  wordChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  chip: {
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  chipText: { color: colors.accent, fontWeight: '600', fontSize: 13 },
  lastCard: { gap: spacing.sm },
  lastTitle: { ...typography.caption, color: colors.textSecondary, textAlign: 'right' },
  lastRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastScenario: { ...typography.subtitle, color: colors.text },
  lastScore: { fontSize: 24, fontWeight: '800' },
});
