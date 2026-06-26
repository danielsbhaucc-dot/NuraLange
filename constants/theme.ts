export const colors = {
  background: '#060612',
  backgroundElevated: '#0c0c1f',
  surface: 'rgba(255, 255, 255, 0.06)',
  surfaceHover: 'rgba(255, 255, 255, 0.10)',
  border: 'rgba(255, 255, 255, 0.12)',
  borderBright: 'rgba(255, 255, 255, 0.22)',
  text: '#f0f0f8',
  textSecondary: 'rgba(240, 240, 248, 0.65)',
  textMuted: 'rgba(240, 240, 248, 0.40)',
  primary: '#7c5cff',
  primaryLight: '#a78bfa',
  primaryGlow: 'rgba(124, 92, 255, 0.35)',
  accent: '#22d3ee',
  accentGlow: 'rgba(34, 211, 238, 0.25)',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  scoreExcellent: '#34d399',
  scoreGood: '#60a5fa',
  scoreFair: '#fbbf24',
  scorePoor: '#f87171',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const typography = {
  hero: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  title: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  subtitle: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.5 },
} as const;

export const glass = {
  backgroundColor: 'rgba(255, 255, 255, 0.07)',
  borderColor: 'rgba(255, 255, 255, 0.14)',
  borderWidth: 1,
  overflow: 'hidden' as const,
};
