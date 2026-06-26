import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';

interface BackgroundProps {
  children: React.ReactNode;
}

export function AppBackground({ children }: BackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1f', '#060612', '#0d0820']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orb, styles.orbPrimary]} />
      <View style={[styles.orb, styles.orbAccent]} />
      <View style={[styles.orb, styles.orbBottom]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPrimary: {
    width: 300,
    height: 300,
    top: -80,
    right: -100,
    backgroundColor: colors.primaryGlow,
    opacity: 0.5,
  },
  orbAccent: {
    width: 200,
    height: 200,
    top: 200,
    left: -60,
    backgroundColor: colors.accentGlow,
    opacity: 0.35,
  },
  orbBottom: {
    width: 250,
    height: 250,
    bottom: 100,
    right: -50,
    backgroundColor: 'rgba(124, 92, 255, 0.15)',
    opacity: 0.4,
  },
});
