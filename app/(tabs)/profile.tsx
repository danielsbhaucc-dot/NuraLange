import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguagePicker, ModePicker } from '@/components/LanguagePicker';
import { AppBackground } from '@/components/ui/Background';
import { Badge, GlassButton, GlassCard } from '@/components/ui/Glass';
import { he } from '@/constants/i18n';
import { LANGUAGES } from '@/constants/languages';
import { colors, spacing, typography } from '@/constants/theme';
import type { LanguageCode } from '@/constants/languages';
import type { AIMode } from '@/lib/aiEngine';
import { SUBSCRIPTION_TIERS } from '@/lib/pricing';
import { useAppStore } from '@/store/useAppStore';

const t = he.profile;
const tp = he.pricing;

export default function ProfileScreen() {
  const nativeLanguage = useAppStore((s) => s.nativeLanguage);
  const targetLanguage = useAppStore((s) => s.targetLanguage);
  const aiMode = useAppStore((s) => s.aiMode);
  const subscription = useAppStore((s) => s.subscription);
  const setLanguages = useAppStore((s) => s.setLanguages);
  const setAIMode = useAppStore((s) => s.setAIMode);
  const [editing, setEditing] = useState(false);

  const tier = subscription ? SUBSCRIPTION_TIERS.find((t) => t.id === subscription.tierId) : null;
  const nativeLang = LANGUAGES.find((l) => l.code === nativeLanguage);
  const targetLang = LANGUAGES.find((l) => l.code === targetLanguage);

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t.title}</Text>

          <GlassCard style={styles.avatarCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={colors.primaryLight} />
            </View>
            <Text style={styles.avatarName}>לומד/ת {targetLang?.flag}</Text>
            <Badge text={t.comingSoon} color={colors.primary} />
          </GlassCard>

          <GlassCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.settings}</Text>
              <GlassButton
                title={editing ? he.common.save : t.editLanguages}
                onPress={() => setEditing(!editing)}
                variant="ghost"
                size="sm"
              />
            </View>

            {editing ? (
              <>
                <Text style={styles.label}>{t.nativeLanguage}</Text>
                <LanguagePicker
                  languages={LANGUAGES.map((l) => ({ code: l.code, name: l.name, flag: l.flag }))}
                  selected={nativeLanguage}
                  onSelect={(c) => setLanguages(c as LanguageCode, targetLanguage)}
                />
                <Text style={[styles.label, { marginTop: spacing.md }]}>{t.targetLanguage}</Text>
                <LanguagePicker
                  languages={LANGUAGES.filter((l) => l.code !== nativeLanguage).map((l) => ({
                    code: l.code,
                    name: l.name,
                    flag: l.flag,
                  }))}
                  selected={targetLanguage}
                  onSelect={(c) => setLanguages(nativeLanguage, c as LanguageCode)}
                />
                <Text style={[styles.label, { marginTop: spacing.md }]}>{t.aiMode}</Text>
                <ModePicker
                  options={[
                    {
                      id: 'bilingual',
                      title: he.onboarding.modeBilingual,
                      description: he.onboarding.modeBilingualDesc,
                      icon: 'language',
                    },
                    {
                      id: 'target_only',
                      title: he.onboarding.modeTargetOnly,
                      description: he.onboarding.modeTargetOnlyDesc,
                      icon: 'mic',
                    },
                  ]}
                  selected={aiMode}
                  onSelect={(id) => setAIMode(id as AIMode)}
                />
              </>
            ) : (
              <>
                <SettingRow label={t.nativeLanguage} value={`${nativeLang?.flag} ${nativeLang?.name}`} />
                <SettingRow label={t.targetLanguage} value={`${targetLang?.flag} ${targetLang?.name}`} />
                <SettingRow
                  label={t.aiMode}
                  value={aiMode === 'bilingual' ? he.onboarding.modeBilingual : he.onboarding.modeTargetOnly}
                />
              </>
            )}
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>{t.subscription}</Text>
            {tier ? (
              <>
                <SettingRow label={tp.tiers[tier.id as keyof typeof tp.tiers]} value={`${tier.monthlyPriceILS} ₪ ${he.pricing.perMonth}`} />
                <SettingRow label={he.home.lessonsLeft} value={`${subscription!.lessonsRemaining}`} />
                <SettingRow label={he.home.minutesLeft} value={`${subscription!.minutesRemaining}`} />
              </>
            ) : (
              <Text style={styles.noSub}>{he.home.noPlan}</Text>
            )}
            <GlassButton
              title={tier ? tp.extraLessons : he.home.choosePlan}
              onPress={() => router.push('/pricing')}
              variant="secondary"
              fullWidth
            />
          </GlassCard>

          <Text style={styles.version}>{t.version} 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingValue}>{value}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { ...typography.title, color: colors.text, textAlign: 'right', marginBottom: spacing.sm },
  avatarCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 92, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarName: { ...typography.subtitle, color: colors.text },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.subtitle, color: colors.text, textAlign: 'right' },
  label: { ...typography.caption, color: colors.textSecondary, textAlign: 'right' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: { ...typography.body, color: colors.textSecondary },
  settingValue: { ...typography.body, color: colors.text, fontWeight: '600' },
  noSub: { ...typography.body, color: colors.textMuted, textAlign: 'right' },
  version: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
