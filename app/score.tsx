import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/ui/Background';
import { Badge, GlassButton, GlassCard, ProgressBar, ScoreRing } from '@/components/ui/Glass';
import { he } from '@/constants/i18n';
import { colors, spacing, typography } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

const t = he.score;

export default function ScoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationHistory = useAppStore((s) => s.conversationHistory);
  const record = conversationHistory.find((c) => c.id === id) ?? conversationHistory[0];

  if (!record) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safe}>
          <Text style={styles.empty}>{he.common.loading}</Text>
          <GlassButton title={he.common.back} onPress={() => router.replace('/(tabs)')} fullWidth />
        </SafeAreaView>
      </AppBackground>
    );
  }

  const { score } = record;
  const metrics = [
    { key: 'fluency', label: t.fluency, value: score.fluency },
    { key: 'accuracy', label: t.accuracy, value: score.accuracy },
    { key: 'vocabulary', label: t.vocabulary, value: score.vocabulary },
    { key: 'confidence', label: t.confidence, value: score.confidence },
    { key: 'naturalness', label: t.naturalness, value: score.naturalness },
  ];

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.scenario}>{he.scenarios.names[record.scenarioId]}</Text>

          <View style={styles.scoreHero}>
            <ScoreRing score={score.overall} size={140} label={t.overall} />
          </View>

          <GlassCard style={styles.metricsCard}>
            {metrics.map((m) => (
              <View key={m.key} style={styles.metricRow}>
                <Text style={styles.metricValue}>{m.value}</Text>
                <View style={styles.metricBar}>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <ProgressBar value={m.value} color={m.value >= 70 ? colors.success : colors.warning} />
                </View>
              </View>
            ))}
          </GlassCard>

          {score.mistakes.length > 0 && (
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>{t.mistakes}</Text>
              {score.mistakes.map((m, i) => (
                <View key={i} style={styles.mistakeRow}>
                  <View style={styles.mistakeContent}>
                    <Text style={styles.mistakeWord}>{m.word}</Text>
                    <Text style={styles.mistakeCorrection}>→ {m.correction}</Text>
                    <Text style={styles.mistakeContext}>{m.context}</Text>
                  </View>
                  <Ionicons name="bookmark" size={20} color={colors.accent} />
                </View>
              ))}
              <Text style={styles.naturalInsert}>{t.naturalInsert}</Text>
            </GlassCard>
          )}

          {(score.newWords.length > 0 || score.reviewedWords.length > 0) && (
            <GlassCard style={styles.section}>
              {score.reviewedWords.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>{t.reviewedWords}</Text>
                  <View style={styles.chips}>
                    {score.reviewedWords.map((w) => (
                      <Badge key={w} text={w} color={colors.accent} />
                    ))}
                  </View>
                </>
              )}
            </GlassCard>
          )}

          <GlassCard glow="primary">
            <View style={styles.nextStepHeader}>
              <Ionicons name="arrow-forward-circle" size={24} color={colors.primaryLight} />
              <Text style={styles.sectionTitle}>{t.nextStep}</Text>
            </View>
            <Text style={styles.nextStepText}>{score.nextStep}</Text>
          </GlassCard>

          <GlassButton
            title={t.continue}
            onPress={() => router.replace('/(tabs)')}
            size="lg"
            fullWidth
          />
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  empty: { ...typography.body, color: colors.text, textAlign: 'center', margin: spacing.lg },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  scenario: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  scoreHero: { alignItems: 'center', marginVertical: spacing.lg },
  metricsCard: { gap: spacing.md },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  metricValue: { fontSize: 20, fontWeight: '800', color: colors.text, width: 36, textAlign: 'center' },
  metricBar: { flex: 1, gap: 4 },
  metricLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'right' },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.subtitle, color: colors.text, textAlign: 'right', flex: 1 },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  mistakeContent: { flex: 1, alignItems: 'flex-end' },
  mistakeWord: { ...typography.subtitle, color: colors.error },
  mistakeCorrection: { ...typography.body, color: colors.success },
  mistakeContext: { ...typography.caption, color: colors.textMuted },
  naturalInsert: { ...typography.caption, color: colors.accent, textAlign: 'right', fontStyle: 'italic' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  nextStepHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  nextStepText: { ...typography.body, color: colors.textSecondary, textAlign: 'right', lineHeight: 24 },
});
