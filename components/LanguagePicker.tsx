import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface LanguagePickerProps {
  languages: Array<{ code: string; name: string; flag: string }>;
  selected: string;
  onSelect: (code: string) => void;
}

export function LanguagePicker({ languages, selected, onSelect }: LanguagePickerProps) {
  return (
    <View style={styles.grid}>
      {languages.map((lang) => {
        const isSelected = lang.code === selected;
        return (
          <Pressable
            key={lang.code}
            onPress={() => onSelect(lang.code)}
            style={[styles.item, isSelected && styles.itemSelected]}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text style={[styles.name, isSelected && styles.nameSelected]}>{lang.name}</Text>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.check} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

interface ModePickerProps {
  options: Array<{ id: string; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }>;
  selected: string;
  onSelect: (id: string) => void;
}

export function ModePicker({ options, selected, onSelect }: ModePickerProps) {
  return (
    <View style={styles.modeList}>
      {options.map((opt) => {
        const isSelected = opt.id === selected;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onSelect(opt.id)}
            style={[styles.modeItem, isSelected && styles.modeItemSelected]}
          >
            <View style={[styles.modeIcon, isSelected && styles.modeIconSelected]}>
              <Ionicons name={opt.icon} size={24} color={isSelected ? colors.primary : colors.textSecondary} />
            </View>
            <View style={styles.modeText}>
              <Text style={[styles.modeTitle, isSelected && styles.modeTitleSelected]}>{opt.title}</Text>
              <Text style={styles.modeDesc}>{opt.description}</Text>
            </View>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioDot} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(124, 92, 255, 0.12)',
  },
  flag: {
    fontSize: 24,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  nameSelected: {
    fontWeight: '700',
    color: colors.primaryLight,
  },
  check: {
    marginLeft: 'auto',
  },
  modeList: {
    gap: spacing.md,
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  modeItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(124, 92, 255, 0.1)',
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIconSelected: {
    backgroundColor: 'rgba(124, 92, 255, 0.2)',
  },
  modeText: {
    flex: 1,
  },
  modeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modeTitleSelected: {
    color: colors.primaryLight,
  },
  modeDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});
