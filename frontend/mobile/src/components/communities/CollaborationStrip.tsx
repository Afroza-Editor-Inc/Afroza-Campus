import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

export type CollaborationShortcut = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
};

const DEFAULT_SHORTCUTS: CollaborationShortcut[] = [
  { key: 'projects', label: 'Projets', icon: 'rocket-outline', tint: theme.colors.primary },
  { key: 'studies', label: 'Études', icon: 'school-outline', tint: theme.colors.accent },
  { key: 'organization', label: 'Organisation', icon: 'calendar-outline', tint: theme.colors.secondaryDeep },
  { key: 'resources', label: 'Ressources', icon: 'folder-open-outline', tint: theme.colors.primaryDeep },
];

type CollaborationStripProps = {
  shortcuts?: CollaborationShortcut[];
  onSelect?: (key: string) => void;
};

/**
 * Accès rapide aux espaces collaboratifs (inspiration Notion/Slack).
 * Prépare l'UX collaboration / études / organisation sans router dédié pour l'instant.
 */
export default function CollaborationStrip({
  shortcuts = DEFAULT_SHORTCUTS,
  onSelect,
}: CollaborationStripProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {shortcuts.map((shortcut) => (
          <Pressable
            key={shortcut.key}
            accessibilityRole="button"
            accessibilityLabel={shortcut.label}
            onPress={() => {
              hapticFeedback.selection();
              onSelect?.(shortcut.key);
            }}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${shortcut.tint}1A` }]}>
              <Ionicons name={shortcut.icon} size={22} color={shortcut.tint} />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {shortcut.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.spacing.sm,
  },
  row: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
  item: {
    width: 84,
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  itemPressed: {
    backgroundColor: theme.colors.surfaceMuted,
    transform: [{ scale: 0.97 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '700',
  },
});
