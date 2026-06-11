import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { hapticFeedback } from '../../../utils/haptics';
import { messagingSpacing, useMessagingPalette } from '../theme';
import type { MessagingConversation } from '../types';

export type QuickSectionKey =
  | 'all'
  | 'unread'
  | 'favorites'
  | 'groups'
  | 'channels'
  | 'communities'
  | 'archived';

type SectionDef = {
  key: QuickSectionKey;
  label: string;
  tint: string;
};

const SECTIONS: SectionDef[] = [
  { key: 'all', label: 'Tous', tint: '#0072FF' },
  { key: 'unread', label: 'Non lus', tint: '#00A3FF' },
  { key: 'favorites', label: 'Favoris', tint: '#00C557' },
  { key: 'groups', label: 'Groupes', tint: '#0456C7' },
  { key: 'channels', label: 'Canaux', tint: '#13B0C9' },
  { key: 'communities', label: 'Communautés', tint: '#00A3FF' },
  { key: 'archived', label: 'Archivés', tint: '#7A8699' },
];

function countFor(conversations: MessagingConversation[], key: QuickSectionKey) {
  switch (key) {
    case 'all':
      return conversations.filter((c) => !c.isArchived).length;
    case 'unread':
      return conversations.filter((c) => !c.isArchived && c.unreadCount > 0).length;
    case 'favorites':
      return conversations.filter((c) => !c.isArchived && c.isFavorite).length;
    case 'groups':
      return conversations.filter((c) => !c.isArchived && c.kind === 'group').length;
    case 'channels':
      return conversations.filter((c) => !c.isArchived && c.kind === 'channel').length;
    case 'communities':
      return conversations.filter((c) => !c.isArchived && c.kind === 'community').length;
    case 'archived':
      return conversations.filter((c) => c.isArchived).length;
    default:
      return 0;
  }
}

type QuickSectionsProps = {
  conversations: MessagingConversation[];
  activeKey: QuickSectionKey;
  onSelect: (key: QuickSectionKey) => void;
};

function QuickSectionsComponent({ conversations, activeKey, onSelect }: QuickSectionsProps) {
  const palette = useMessagingPalette();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {SECTIONS.map((section, index) => {
        const active = section.key === activeKey;
        const count = countFor(conversations, section.key);
        return (
          <Animated.View key={section.key} entering={FadeInRight.delay(index * 45).duration(220)}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${section.label}, ${count}`}
              accessibilityState={{ selected: active }}
              onPress={() => {
                hapticFeedback.selection();
                onSelect(section.key);
              }}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: active ? `${section.tint}16` : palette.surfaceMuted,
                  borderColor: active ? section.tint : 'transparent',
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  { color: active ? section.tint : palette.textMuted },
                ]}
                numberOfLines={1}
              >
                {section.label}
              </Text>
              {count > 0 ? (
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: active ? section.tint : palette.surfaceStrong },
                  ]}
                >
                  <Text
                    style={[styles.countText, { color: active ? '#FFFFFF' : palette.textMuted }]}
                  >
                    {count > 99 ? '99+' : count}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

export default React.memo(QuickSectionsComponent);

const styles = StyleSheet.create({
  content: {
    gap: 6,
    paddingVertical: 2,
    paddingRight: messagingSpacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
});
