import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import theme from '../../../theme';
import type { ConversationCategoryItem } from '../types';
import { messagingGradient, messagingSpacing, useMessagingPalette } from '../theme';

type FilterTabsProps = {
  items: ConversationCategoryItem[];
  activeKey: ConversationCategoryItem['key'];
  onChange: (key: ConversationCategoryItem['key']) => void;
};

const TAB_ICONS: Partial<Record<ConversationCategoryItem['key'], keyof typeof Ionicons.glyphMap>> = {
  favorites: 'star-outline',
};

function FilterTabsComponent({ items, activeKey, onChange }: FilterTabsProps) {
  const palette = useMessagingPalette();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {items.map((item, index) => {
        const active = item.key === activeKey;
        const iconName = TAB_ICONS[item.key];

        return (
          <Animated.View key={item.key} entering={FadeInRight.delay(index * 45).duration(220)}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onChange(item.key)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: 'transparent',
                  borderColor: active ? 'transparent' : palette.pillIdleBorder,
                },
                pressed && styles.chipPressed,
              ]}
            >
              {active ? (
                <>
                  <LinearGradient
                    colors={messagingGradient}
                    end={{ x: 1, y: 0.5 }}
                    start={{ x: 0, y: 0.5 }}
                    style={styles.chipGradient}
                  />
                  <View style={[styles.chipGlow, { backgroundColor: palette.activeGlow }]} />
                </>
              ) : null}

              {iconName ? (
                <Ionicons
                  name={iconName}
                  size={16}
                  color={active ? theme.colors.white : palette.textMuted}
                />
              ) : null}

              <Text
                style={[
                  styles.label,
                  {
                    color: active ? theme.colors.white : palette.textMuted,
                    fontWeight: active ? '600' : '400',
                  },
                ]}
              >
                {item.label}
              </Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: active ? 'rgba(255,255,255,0.18)' : palette.surfaceStrong,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: active ? theme.colors.white : palette.textMuted },
                  ]}
                >
                  {item.count}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

export default React.memo(FilterTabsComponent);

const styles = StyleSheet.create({
  content: {
    gap: messagingSpacing.sm,
    paddingRight: theme.spacing.sm,
  },
  chip: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipPressed: {
    transform: [{ scale: 0.98 }],
  },
  chipGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  chipGlow: {
    position: 'absolute',
    top: -10,
    right: -6,
    width: 38,
    height: 38,
    borderRadius: 19,
    opacity: 0.22,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
