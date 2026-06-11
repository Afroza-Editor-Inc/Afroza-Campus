import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../../theme';
import { getConversationDisplayTitle } from '../services/formatters';
import { messagingGradient, messagingSpacing, useMessagingPalette } from '../theme';
import type { MessagingConversation } from '../types';
import Avatar from './Avatar';

type ActiveNowRailProps = {
  conversations: MessagingConversation[];
  onPressConversation: (conversationId: string) => void;
};

const AVATAR_SIZE = 56;
const RING_SIZE = 66;
const GAP_SIZE = 60;

function firstName(label: string) {
  return label.trim().split(/\s+/)[0] ?? label;
}

/** État statut/story dérivé de manière déterministe à partir de l'id. */
function hasStatusRing(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % 2 === 0;
}

function ActiveNowRailComponent({ conversations, onPressConversation }: ActiveNowRailProps) {
  const palette = useMessagingPalette();

  const activeContacts = React.useMemo(
    () =>
      conversations
        .filter((item) => item.kind === 'direct' && item.presence === 'online')
        .slice(0, 12),
    [conversations]
  );

  if (activeContacts.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: palette.text }]}>Actifs maintenant</Text>
        <View style={[styles.countPill, { backgroundColor: palette.surfaceMuted }]}>
          <View style={[styles.dot, { backgroundColor: palette.activeStart }]} />
          <Text style={[styles.countText, { color: palette.textMuted }]}>{activeContacts.length}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
      >
        {activeContacts.map((item, index) => {
          const title = getConversationDisplayTitle(item);
          const hasStory = hasStatusRing(item.id);

          return (
            <Animated.View key={item.id} entering={FadeInRight.delay(index * 40).duration(220)}>
              <Pressable
                accessibilityLabel={`Discuter avec ${title}`}
                onPress={() => onPressConversation(item.id)}
                style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              >
                {hasStory ? (
                  <LinearGradient
                    colors={messagingGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ring}
                  >
                    <View style={[styles.ringGap, { backgroundColor: palette.background }]}>
                      <Avatar
                        label={title}
                        uri={item.avatar}
                        color={item.avatarColor}
                        kind={item.kind}
                        participantIds={item.participantIds}
                        size={AVATAR_SIZE}
                        verified={item.isVerified}
                      />
                    </View>
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      styles.ring,
                      styles.ringSolid,
                      { borderColor: palette.activeStart, backgroundColor: palette.background },
                    ]}
                  >
                    <Avatar
                      label={title}
                      uri={item.avatar}
                      color={item.avatarColor}
                      kind={item.kind}
                      participantIds={item.participantIds}
                      size={AVATAR_SIZE}
                      verified={item.isVerified}
                    />
                  </View>
                )}
                <Text numberOfLines={1} style={[styles.name, { color: palette.textMuted }]}>
                  {firstName(title)}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default React.memo(ActiveNowRailComponent);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: messagingSpacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.sm,
    paddingHorizontal: theme.spacing.xs,
    marginBottom: messagingSpacing.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radii.round,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  railContent: {
    gap: messagingSpacing.md,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  item: {
    width: 66,
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSolid: {
    borderWidth: 2.5,
  },
  ringGap: {
    width: GAP_SIZE,
    height: GAP_SIZE,
    borderRadius: GAP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 64,
    textAlign: 'center',
  },
});
