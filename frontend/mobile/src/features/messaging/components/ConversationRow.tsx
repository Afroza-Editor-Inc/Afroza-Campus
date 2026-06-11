import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import theme from '../../../theme';
import type { MessagingConversation } from '../types';
import { conversationStatusLabel, formatConversationTime, kindLabel } from '../utils/formatters';
import MessagingAvatar from './MessagingAvatar';

type ConversationRowProps = {
  conversation: MessagingConversation;
  onPress: () => void;
  index: number;
};

export default function ConversationRow({
  conversation,
  onPress,
  index,
}: ConversationRowProps) {
  const showOnline = conversation.presence === 'online' && conversation.kind === 'direct';

  return (
    <Animated.View entering={FadeInDown.delay(index * 35).duration(260)}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <MessagingAvatar
          uri={conversation.avatar}
          label={conversation.title}
          color={conversation.avatarColor}
          kind={conversation.kind}
          online={showOnline}
          verified={conversation.isVerified}
        />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {conversation.title}
            </Text>
            <Text
              style={[
                styles.time,
                conversation.unreadCount > 0 && { color: theme.colors.primary, fontWeight: '800' },
              ]}
            >
              {formatConversationTime(conversation.updatedAt)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.kindPill}>
              <View style={[styles.kindGlow, { backgroundColor: conversation.avatarColor }]} />
              <Text style={styles.kindLabel}>{kindLabel(conversation.kind)}</Text>
            </View>

            {conversation.isFavorite ? <Text style={styles.metaFlag}>Favori</Text> : null}
            {conversation.isMuted ? <Text style={styles.metaFlag}>Muet</Text> : null}
          </View>

          <View style={styles.footerRow}>
            <Text
              style={[
                styles.preview,
                conversation.unreadCount > 0 && { color: theme.colors.text, fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {conversationStatusLabel(conversation)}
            </Text>

            {conversation.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>

          {conversation.previewText ? (
            <Text style={styles.previewSubline} numberOfLines={1}>
              {conversation.previewText}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: theme.colors.surfaceMuted,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title3,
    flex: 1,
    fontSize: 17,
  },
  time: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kindPill: {
    overflow: 'hidden',
    borderRadius: theme.radii.round,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: theme.colors.surfaceStrong,
  },
  kindGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  kindLabel: {
    ...theme.typography.label,
    color: theme.colors.primaryDeep,
    fontSize: 11,
  },
  metaFlag: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  preview: {
    flex: 1,
    ...theme.typography.bodyMuted,
  },
  previewSubline: {
    ...theme.typography.bodyMuted,
    fontSize: 13,
    color: theme.colors.muted,
  },
  unreadBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  unreadText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
});
