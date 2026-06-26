import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguagePicker, ModePicker } from '@/components/LanguagePicker';
import { AppBackground } from '@/components/ui/Background';
import { GlassButton } from '@/components/ui/Glass';
import { he } from '@/constants/i18n';
import { LANGUAGES } from '@/constants/languages';
import { colors, spacing, typography } from '@/constants/theme';
import type { LanguageCode } from '@/constants/languages';
import type { AIMode } from '@/lib/aiEngine';
import { useAppStore } from '@/store/useAppStore';

const t = he.onboarding;

export default function OnboardingScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [nativeLang, setNativeLang] = useState<LanguageCode>('he');
  const [targetLang, setTargetLang] = useState<LanguageCode>('en');
  const [aiMode, setAiMode] = useState<AIMode>('bilingual');

  const steps = [
  {
    title: t.step1Title,
    desc: t.step1Desc,
    content: (
      <LanguagePicker
        languages={LANGUAGES.map((l) => ({ code: l.code, name: l.name, flag: l.flag }))}
        selected={nativeLang}
        onSelect={(c) => setNativeLang(c as LanguageCode)}
      />
    ),
  },
  {
    title: t.step2Title,
    desc: t.step2Desc,
    content: (
      <LanguagePicker
        languages={LANGUAGES.filter((l) => l.code !== nativeLang).map((l) => ({
          code: l.code,
          name: l.name,
          flag: l.flag,
        }))}
        selected={targetLang}
        onSelect={(c) => setTargetLang(c as LanguageCode)}
      />
    ),
  },
  {
    title: t.step3Title,
    desc: t.step3Desc,
    content: (
      <ModePicker
        options={[
          {
            id: 'bilingual',
            title: t.modeBilingual,
            description: t.modeBilingualDesc,
            icon: 'language',
          },
          {
            id: 'target_only',
            title: t.modeTargetOnly,
            description: t.modeTargetOnlyDesc,
            icon: 'mic',
          },
        ]}
        selected={aiMode}
        onSelect={(id) => setAiMode(id as AIMode)}
      />
    ),
  },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding(nativeLang, targetLang, aiMode);
      router.replace('/(tabs)');
    }
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <View style={styles.hero}>
              <Text style={styles.logo}>{he.app.name}</Text>
              <Text style={styles.tagline}>{he.app.tagline}</Text>
              <Text style={styles.subtitle}>{he.app.subtitle}</Text>
            </View>
          )}

          <View style={styles.dots}>
            {steps.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          <Text style={styles.title}>{steps[step].title}</Text>
          <Text style={styles.desc}>{steps[step].desc}</Text>

          <View style={styles.content}>{steps[step].content}</View>
        </ScrollView>

        <View style={styles.footer}>
          <GlassButton
            title={step < steps.length - 1 ? t.continue : t.start}
            onPress={handleNext}
            size="lg"
            fullWidth
            icon={<Ionicons name="arrow-back" size={20} color="#fff" style={{ transform: [{ scaleX: -1 }] }} />}
          />
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  logo: {
    ...typography.hero,
    color: colors.primaryLight,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.lg,
  },
  content: {
    marginTop: spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
