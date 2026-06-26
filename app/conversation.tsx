import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/ui/Background';
import { Badge, GlassButton, GlassCard } from '@/components/ui/Glass';
import { he } from '@/constants/i18n';
import { SCENARIOS } from '@/constants/languages';
import { colors, spacing, typography } from '@/constants/theme';
import {
  adjustDifficulty,
  calculateScore,
  createConversationContext,
  generateAIResponse,
  startConversation,
  type ConversationContext,
  type ConversationMessage,
} from '@/lib/aiEngine';
import { consumeLesson } from '@/lib/pricing';
import { speechService, type SpeechState } from '@/lib/speechService';
import { useAppStore } from '@/store/useAppStore';

const t = he.conversation;

export default function ConversationScreen() {
  const nativeLanguage = useAppStore((s) => s.nativeLanguage);
  const targetLanguage = useAppStore((s) => s.targetLanguage);
  const aiMode = useAppStore((s) => s.aiMode);
  const currentScenario = useAppStore((s) => s.currentScenario);
  const learningItems = useAppStore((s) => s.learningItems);
  const difficulty = useAppStore((s) => s.difficulty);
  const subscription = useAppStore((s) => s.subscription);
  const recordConversation = useAppStore((s) => s.recordConversation);
  const updateSubscription = useAppStore((s) => s.updateSubscription);

  const scenarioId = currentScenario ?? 'restaurant';
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const [ctx, setCtx] = useState<ConversationContext | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState(difficulty);
  const startTime = useRef(Date.now());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  const recognitionAvailable = speechService.isRecognitionAvailable();

  useEffect(() => {
    const context = createConversationContext(
      nativeLanguage,
      targetLanguage,
      aiMode,
      scenarioId,
      learningItems,
      currentDifficulty,
    );
    const opener = startConversation(context);
    context.conversationHistory = [opener];
    setCtx(context);
    setMessages([opener]);

    speechService.setCallbacks(
      (text) => handleUserMessage(text),
      (state) => setSpeechState(state),
    );

    speechService.speak(opener.content, targetLanguage);
  }, []);

  useEffect(() => {
    if (speechState === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [speechState, pulseAnim]);

  const handleUserMessage = useCallback(
    async (text: string) => {
      if (!ctx || !text.trim() || isProcessing) return;

      setIsProcessing(true);
      setSpeechState('processing');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const userMsg: ConversationMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      };

      const updatedCtx = {
        ...ctx,
        conversationHistory: [...ctx.conversationHistory, userMsg],
      };

      setMessages((prev) => [...prev, userMsg]);

      const newDifficulty = adjustDifficulty(currentDifficulty, text.split(' ').length > 3 ? 4 : 2);
      setCurrentDifficulty(newDifficulty);
      updatedCtx.difficulty = newDifficulty;

      const aiResponse = await generateAIResponse(updatedCtx, text);
      updatedCtx.conversationHistory = [...updatedCtx.conversationHistory, aiResponse];
      setCtx(updatedCtx);
      setMessages((prev) => [...prev, aiResponse]);

      await speechService.speak(aiResponse.content, targetLanguage);
      setIsProcessing(false);
    },
    [ctx, isProcessing, currentDifficulty, targetLanguage],
  );

  const handleSendText = () => {
    if (textInput.trim()) {
      handleUserMessage(textInput);
      setTextInput('');
    }
  };

  const handleMicPressIn = () => {
    if (!recognitionAvailable || isProcessing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    speechService.startListening(targetLanguage);
  };

  const handleMicPressOut = () => {
    speechService.stopListening();
  };

  const endConversation = () => {
    if (!ctx) return;

    const durationSeconds = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateScore(ctx, durationSeconds);
    const recordId = `conv_${Date.now()}`;

    recordConversation({
      id: recordId,
      scenarioId,
      score,
      durationSeconds,
      timestamp: Date.now(),
    });

    if (subscription) {
      updateSubscription(consumeLesson(subscription, scenario.durationMinutes));
    }

    router.replace({ pathname: '/score', params: { id: recordId } });
  };

  const stateLabel = {
    idle: t.yourTurn,
    listening: t.listening,
    processing: t.thinking,
    speaking: t.speaking,
  }[speechState];

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable onPress={endConversation} style={styles.endBtn}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.topCenter}>
            <Text style={styles.scenarioName}>{he.scenarios.names[scenarioId]}</Text>
            <Badge text={`${t.difficultyAdjusted} ${Math.round(currentDifficulty)}/5`} color={colors.accent} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
            >
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>{msg.content}</Text>
              {msg.correction && (
                <GlassCard style={styles.correction} padding={10}>
                  <Text style={styles.correctionLabel}>{t.correction}</Text>
                  <Text style={styles.correctionText}>{msg.correction}</Text>
                </GlassCard>
              )}
            </View>
          ))}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.controls}>
            <Text style={styles.stateLabel}>{stateLabel}</Text>

            {recognitionAvailable ? (
              <Pressable
                onPressIn={handleMicPressIn}
                onPressOut={handleMicPressOut}
                disabled={isProcessing || speechState === 'speaking'}
              >
                <Animated.View style={[styles.micButton, { transform: [{ scale: pulseAnim }] }]}>
                  <LinearGradientMic active={speechState === 'listening'} />
                  <Ionicons
                    name={speechState === 'listening' ? 'mic' : 'mic-outline'}
                    size={36}
                    color="#fff"
                  />
                </Animated.View>
              </Pressable>
            ) : (
              <View style={styles.textInputRow}>
                <TextInput
                  style={styles.input}
                  value={textInput}
                  onChangeText={setTextInput}
                  placeholder={t.placeholder}
                  placeholderTextColor={colors.textMuted}
                  textAlign="right"
                  onSubmitEditing={handleSendText}
                  editable={!isProcessing}
                />
                <GlassButton title={t.send} onPress={handleSendText} size="sm" disabled={isProcessing} />
              </View>
            )}

            {!recognitionAvailable && Platform.OS !== 'web' && (
              <Text style={styles.hint}>{t.webOnlySpeech}</Text>
            )}

            <GlassButton
              title={t.endConversation}
              onPress={endConversation}
              variant="ghost"
              size="sm"
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
}

function LinearGradientMic({ active }: { active: boolean }) {
  return (
    <LinearGradient
      colors={active ? ['#f87171', '#ef4444'] : [colors.primary, '#5b3fd4']}
      style={StyleSheet.absoluteFill}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  endBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topCenter: { flex: 1, alignItems: 'center', gap: 4 },
  scenarioName: { ...typography.subtitle, color: colors.text },
  messages: { flex: 1 },
  messagesContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg },
  bubble: { maxWidth: '85%', borderRadius: 20, padding: spacing.md },
  userBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomRightRadius: 4,
  },
  bubbleText: { ...typography.body, color: colors.text, textAlign: 'right', lineHeight: 24 },
  userText: { color: '#fff', textAlign: 'left' },
  correction: { marginTop: spacing.sm },
  correctionLabel: { fontSize: 11, color: colors.accent, fontWeight: '700', textAlign: 'right' },
  correctionText: { fontSize: 13, color: colors.textSecondary, textAlign: 'right', marginTop: 2 },
  controls: { alignItems: 'center', padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  stateLabel: { ...typography.caption, color: colors.textSecondary },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  textInputRow: { flexDirection: 'row', gap: spacing.sm, width: '100%', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  hint: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
