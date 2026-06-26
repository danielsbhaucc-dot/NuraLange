import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/ui/Background';
import { Badge, GlassCard, ProgressBar, ScoreRing } from '@/components/ui/Glass';
import { he } from '@/constants/i18n';
import { colors, spacing, typography } from '@/constants/theme';
import {
  getRecurringMistakes,
  masteryPercentage,
} from '@/lib/spacedRepetition';
import { useAppStore } from '@/store/useAppStore';

const t = he.progress;

function getWeekStats(history: ReturnType<typeof useAppStore.getState>['conversationHistory']) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = history.filter((c) => c.timestamp >= weekAgo);
  const prevWeek = history.filter(
    (c) => c.timestamp >= weekAgo - 7 * 24 * 60 * 60 * 1000 && c.timestamp < weekAgo,
  );

  const avg = (arr: typeof history) =>
    arr.length > 0 ? Math.round(arr.reduce((s, c) => s + c.score.overall, 0) / arr.length) : 0;

  return {
    conversations: thisWeek.length,
    minutes: Math.round(thisWeek.reduce((s, c) => s + c.durationSeconds, 0) / 60),
    avgScore: avg(thisWeek),
    prevAvgScore: avg(prevWeek),
    improvement: avg(thisWeek) - avg(prevWeek),
  };
}

export default function ProgressScreen() {
  const learningItems = useAppStore((s) => s.learningItems);
  const conversationHistory = useAppStore((s) => s.conversationHistory);

  const stats = getWeekStats(conversationHistory);
  const recurring = getRecurringMistakes(learningItems);
  const mastery = masteryPercentage(learningItems);
  const mastered = learningItems.filter((i) => i.status === 'mastered').length;
  const learning = learningItems.filter((i) => i.status === 'learning' || i.status === 'review').length;

  const recommendation =
    recurring.length > 0
      ? `התמקדו במילים: ${recurring.slice(0, 3).map((r) => r.word).join(', ')} — הן חוזרות בשגיאות`
      : stats.avgScore < 70
        ? 'נסו תרחיש קל יותר ודברו יותר במשפטים מלאים'
        : 'אתם בקצב מעולה! נסו תרחיש ברמה גבוהה יותר';

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t.weeklyReport}</Text>

          <GlassCard glow="primary" style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <ScoreRing score={stats.avgScore || 0} size={90} label={t.avgScore} />
              <View style={styles.reportStats}>
                <View style={styles.reportStat}>
                  <Text style={styles.reportValue}>{stats.conversations}</Text>
                  <Text style={styles.reportLabel}>{t.totalConversations}</Text>
                </View>
                <View style={styles.reportStat}>
                  <Text style={styles.reportValue}>{stats.minutes}</Text>
                  <Text style={styles.reportLabel}>{t.totalMinutes}</Text>
                </View>
                {stats.improvement !== 0 && (
                  <Badge
                    text={`${stats.improvement > 0 ? '+' : ''}${stats.improvement}% ${t.improvement}`}
                    color={stats.improvement > 0 ? colors.success : colors.error}
                  />
                )}
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.masteryCard}>
            <Text style={styles.sectionTitle}>{t.masteredWords}</Text>
            <View style={styles.masteryRow}>
              <Text style={styles.masteryValue}>{mastery}%</Text>
              <Text style={styles.masteryDetail}>
                {mastered} {t.masteredWords.toLowerCase()} · {learning} {t.learningWords}
              </Text>
            </View>
            <ProgressBar value={mastery} color={colors.success} />
          </GlassCard>

          <GlassCard style={styles.mistakesCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={22} color={colors.warning} />
              <Text style={styles.sectionTitle}>{t.recurringMistakes}</Text>
            </View>
            {recurring.length === 0 ? (
              <Text style={styles.emptyText}>{t.noMistakes}</Text>
            ) : (
              recurring.slice(0, 5).map((item) => (
                <View key={item.id} style={styles.mistakeRow}>
                  <View style={styles.mistakeInfo}>
                    <Text style={styles.mistakeWord}>{item.word}</Text>
                    <Text style={styles.mistakeTranslation}>{item.translation}</Text>
                  </View>
                  <Badge text={`×${item.mistakeCount}`} color={colors.error} />
                </View>
              ))
            )}
          </GlassCard>

          <GlassCard glow="accent">
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={22} color={colors.accent} />
              <Text style={styles.sectionTitle}>{t.recommendation}</Text>
            </View>
            <Text style={styles.recommendation}>{recommendation}</Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { ...typography.title, color: colors.text, textAlign: 'right', marginBottom: spacing.md },
  reportCard: { gap: spacing.md },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  reportStats: { flex: 1, gap: spacing.sm, alignItems: 'flex-end' },
  reportStat: { alignItems: 'flex-end' },
  reportValue: { fontSize: 24, fontWeight: '800', color: colors.text },
  reportLabel: { fontSize: 12, color: colors.textSecondary },
  masteryCard: { gap: spacing.sm },
  sectionTitle: { ...typography.subtitle, color: colors.text, textAlign: 'right', flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  masteryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  masteryValue: { fontSize: 32, fontWeight: '800', color: colors.success },
  masteryDetail: { ...typography.caption, color: colors.textSecondary },
  mistakesCard: { gap: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'right' },
  mistakeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mistakeInfo: { alignItems: 'flex-end' },
  mistakeWord: { ...typography.subtitle, color: colors.text },
  mistakeTranslation: { ...typography.caption, color: colors.textSecondary },
  recommendation: { ...typography.body, color: colors.textSecondary, textAlign: 'right', lineHeight: 24 },
});
