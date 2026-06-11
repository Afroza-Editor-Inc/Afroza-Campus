import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';

export type SegmentedTabItem = {
  key: string;
  label: string;
  badge?: number;
};

type SegmentedTabsProps = {
  items: SegmentedTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  scrollable?: boolean;
};

/**
 * Onglets segmentés partagés (Communautés, Appels, …).
 * Style pilule premium aligné sur le design system Afroza.
 */
export default function SegmentedTabs({
  items,
  activeKey,
  onChange,
  scrollable = true,
}: SegmentedTabsProps) {
  const content = items.map((item) => {
    const active = item.key === activeKey;

    return (
      <Pressable
        key={item.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        hitSlop={theme.accessibility.hitSlop}
        onPress={() => {
          if (!active) {
            hapticFeedback.selection();
            onChange(item.key);
          }
        }}
        style={({ pressed }) => [
          styles.tab,
          active ? styles.tabActive : styles.tabIdle,
          pressed && styles.tabPressed,
        ]}
      >
        <Text style={[styles.label, active ? styles.labelActive : styles.labelIdle]}>
          {item.label}
        </Text>
        {item.badge && item.badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  });

  if (!scrollable) {
    return <View style={[styles.wrap, styles.wrapStatic]}>{content}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.wrap}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  wrapStatic: {
    flexWrap: 'wrap',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
    minHeight: 38,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.round,
    borderWidth: 1,
  },
  tabIdle: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  label: {
    ...theme.typography.label,
  },
  labelIdle: {
    color: theme.colors.textMuted,
  },
  labelActive: {
    color: theme.colors.white,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: theme.colors.badge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
});
