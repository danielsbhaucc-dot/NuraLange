import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/ui/Background';
import { Badge, GlassCard } from '@/components/ui/Glass';
import { he } from '@/constants/i18n';
import { SCENARIOS } from '@/constants/languages';
import { colors, spacing, typography } from '@/constants/theme';
import { canStartLesson } from '@/lib/pricing';
import { useAppStore } from '@/store/useAppStore';

const t = he.scenarios;

export default function ScenariosScreen() {
  const setCurrentScenario = useAppStore((s) => s.setCurrentScenario);
  const subscription = useAppStore((s) => s.subscription);

  const startScenario = (id: (typeof SCENARIOS)[number]['id']) => {
    if (!canStartLesson(subscription)) {
      router.push('/pricing');
      return;
    }
    setCurrentScenario(id);
    router.push('/conversation');
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>

          <View style={styles.grid}>
            {SCENARIOS.map((scenario) => (
              <GlassCard
                key={scenario.id}
                style={styles.card}
                onPress={() => startScenario(scenario.id)}
                glow={scenario.difficulty >= 3 ? 'accent' : 'none'}
              >
                <Text style={styles.icon}>{scenario.icon}</Text>
                <Text style={styles.cardTitle}>{t.names[scenario.id]}</Text>
                <Text style={styles.cardDesc}>{t.descriptions[scenario.id]}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.difficulty}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={12}
                        color={i < scenario.difficulty ? colors.warning : colors.border}
                      />
                    ))}
                  </View>
                  <Text style={styles.duration}>
                    {scenario.durationMinutes} {t.duration}
                  </Text>
                </View>
                <View style={styles.tags}>
                  {scenario.tags.map((tag) => (
                    <Badge key={tag} text={tag} color={colors.primary} />
                  ))}
                </View>
              </GlassCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.title, color: colors.text, textAlign: 'right', marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'right', marginBottom: spacing.lg },
  grid: { gap: spacing.md },
  card: { gap: spacing.sm },
  icon: { fontSize: 36, textAlign: 'right' },
  cardTitle: { ...typography.subtitle, color: colors.text, textAlign: 'right' },
  cardDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'right', lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  difficulty: { flexDirection: 'row', gap: 2 },
  duration: { ...typography.caption, color: colors.textMuted },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', marginTop: spacing.sm },
});
