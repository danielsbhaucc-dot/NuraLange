import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, glass, radius, spacing } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  intensity?: number;
  glow?: 'primary' | 'accent' | 'none';
  padding?: number;
}

export function GlassCard({
  children,
  style,
  onPress,
  intensity = 40,
  glow = 'none',
  padding = spacing.md,
}: GlassCardProps) {
  const content = (
    <View style={[styles.wrapper, glow !== 'none' && styles[`glow_${glow}`], style]}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={[styles.inner, { padding }]}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }
  return content;
}

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function GlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  fullWidth = false,
}: GlassButtonProps) {
  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18 },
  };

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.buttonBase,
          fullWidth && styles.fullWidth,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <LinearGradient
          colors={[colors.primary, '#5b3fd4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientButton,
            {
              paddingVertical: sizeStyles[size].paddingVertical,
              paddingHorizontal: sizeStyles[size].paddingHorizontal,
            },
          ]}
        >
          {icon}
          <Text style={[styles.buttonText, { fontSize: sizeStyles[size].fontSize }]}>{title}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.buttonBase,
        styles.secondaryButton,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
        {
          paddingVertical: sizeStyles[size].paddingVertical,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
        },
      ]}
    >
      {icon}
      <Text
        style={[
          styles.secondaryText,
          { fontSize: sizeStyles[size].fontSize },
          variant === 'ghost' && styles.ghostText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

export function ScoreRing({ score, size = 120, label }: ScoreRingProps) {
  const color =
    score >= 85
      ? colors.scoreExcellent
      : score >= 70
        ? colors.scoreGood
        : score >= 50
          ? colors.scoreFair
          : colors.scorePoor;

  return (
    <View style={[styles.scoreRing, { width: size, height: size }]}>
      <View
        style={[
          styles.scoreRingBorder,
          { width: size, height: size, borderRadius: size / 2, borderColor: color },
        ]}
      />
      <Text style={[styles.scoreValue, { color, fontSize: size * 0.3 }]}>{score}</Text>
      {label && <Text style={styles.scoreLabel}>{label}</Text>}
    </View>
  );
}

export function ProgressBar({ value, max = 100, color = colors.primary }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Badge({ text, color = colors.primary }: { text: string; color?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}44` }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...glass,
    borderRadius: radius.lg,
    backgroundColor: Platform.OS === 'web' ? glass.backgroundColor : 'transparent',
  },
  inner: {
    borderRadius: radius.lg,
  },
  glow_primary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  glow_accent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonBase: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  ghostText: {
    color: colors.textSecondary,
  },
  disabled: {
    opacity: 0.4,
  },
  scoreRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingBorder: {
    position: 'absolute',
    borderWidth: 4,
    opacity: 0.6,
  },
  scoreValue: {
    fontWeight: '800',
  },
  scoreLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
