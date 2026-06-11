import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import {
  formatConversationTimestamp,
  getConversationDisplayTitle,
  getConversationStatusLabel,
} from '../services/formatters';
import { messagingSpacing, useMessagingPalette } from '../theme';
import type { MessagingConversation } from '../types';
import Avatar from './Avatar';

type SwipeAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
};

type ConversationItemProps = {
  conversation: MessagingConversation;
  index: number;
  onLongPress?: () => void;
  onPress: () => void;
  onAvatarPress?: () => void;
  onTogglePin?: () => void;
  onToggleMute?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
};

function ConversationItemComponent({
  conversation,
  index,
  onLongPress,
  onPress,
  onAvatarPress,
  onTogglePin,
  onToggleMute,
  onArchive,
  onDelete,
}: ConversationItemProps) {
  const palette = useMessagingPalette();
  const swipeableRef = React.useRef<Swipeable>(null);
  const presence = conversation.kind === 'direct' ? conversation.presence : undefined;
  const title = getConversationDisplayTitle(conversation);
  const preview = getConversationStatusLabel(conversation);

  const close = () => swipeableRef.current?.close();

  const leftActions: SwipeAction[] = onTogglePin
    ? [
        {
          icon: conversation.isPinned ? 'pin' : 'pin-outline',
          label: conversation.isPinned ? 'Désépingler' : 'Épingler',
          color: theme.colors.primary,
          onPress: () => {
            onTogglePin?.();
            close();
          },
        },
      ]
    : [];

  const rightActions: SwipeAction[] = [
    onToggleMute && {
      icon: conversation.isMuted ? 'volume-high-outline' : 'volume-mute-outline',
      label: conversation.isMuted ? 'Activer' : 'Muet',
      color: theme.colors.secondaryDeep,
      onPress: () => {
        onToggleMute?.();
        close();
      },
    },
    onArchive && {
      icon: 'archive-outline' as const,
      label: 'Archiver',
      color: theme.colors.warning,
      onPress: () => {
        onArchive?.();
        close();
      },
    },
    onDelete && {
      icon: 'trash-outline' as const,
      label: 'Suppr.',
      color: theme.colors.danger,
      onPress: () => {
        onDelete?.();
        close();
      },
    },
  ].filter(Boolean) as SwipeAction[];

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') =>
    actions.length === 0
      ? undefined
      : () => (
          <View style={[styles.actionsWrap, side === 'left' ? styles.actionsLeft : styles.actionsRight]}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => {
                  hapticFeedback.selection();
                  action.onPress();
                }}
                style={[styles.action, { backgroundColor: action.color }]}
              >
                <Ionicons name={action.icon} size={20} color={theme.colors.white} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        );

  const hasSwipe = leftActions.length > 0 || rightActions.length > 0;

  const rowContent = (
    <View style={[styles.row, { backgroundColor: palette.background }]}>
        <Pressable
          hitSlop={6}
          onPress={onAvatarPress}
          style={({ pressed }) => [styles.avatarPressable, pressed && styles.pressed]}
        >
          <Avatar
            label={title}
            uri={conversation.avatar}
            color={conversation.avatarColor}
            kind={conversation.kind}
            participantIds={conversation.participantIds}
            presence={presence}
            size={50}
            verified={conversation.isVerified}
          />
        </Pressable>

        <Pressable
          android_ripple={{ color: 'rgba(0, 0, 0, 0.04)' }}
          onLongPress={onLongPress}
          onPress={onPress}
          style={({ pressed }) => [
            styles.contentPressable,
            {
              backgroundColor: pressed ? palette.surfaceMuted : 'transparent',
            },
          ]}
        >
          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text numberOfLines={1} style={[styles.title, { color: palette.text }]}>
                {title}
              </Text>
              <Text
                style={[
                  styles.time,
                  { color: conversation.unreadCount > 0 ? palette.activeStart : palette.textSoft },
                ]}
              >
                {formatConversationTimestamp(conversation.updatedAt)}
              </Text>
            </View>

            <View style={styles.bottomRow}>
              <Text
                numberOfLines={1}
                style={[
                  styles.preview,
                  {
                    color:
                      conversation.typingLabel || conversation.unreadCount > 0
                        ? palette.text
                        : palette.textMuted,
                    fontWeight:
                      conversation.typingLabel || conversation.unreadCount > 0 ? '600' : '500',
                  },
                ]}
              >
                {preview}
              </Text>

              <View style={styles.meta}>
                {conversation.isMuted ? (
                  <Ionicons name="volume-mute-outline" size={14} color={palette.textSoft} />
                ) : null}
                {conversation.isPinned ? (
                  <Ionicons name="pin" size={12} color={palette.textSoft} />
                ) : null}
                {conversation.unreadCount > 0 ? (
                  <Animated.View
                    entering={ZoomIn.springify().damping(16).stiffness(190)}
                    style={[styles.badge, { backgroundColor: palette.unread }]}
                  >
                    <Text style={[styles.badgeText, { color: palette.unreadText }]}>
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Text>
                  </Animated.View>
                ) : null}
              </View>
            </View>
          </View>
        </Pressable>
      </View>
  );

  return (
    <Animated.View entering={FadeInDown.delay(index * 18).duration(190)}>
      {hasSwipe ? (
        <Swipeable
          ref={swipeableRef}
          friction={2}
          overshootLeft={false}
          overshootRight={false}
          renderLeftActions={renderActions(leftActions, 'left')}
          renderRightActions={renderActions(rightActions, 'right')}
        >
          {rowContent}
        </Swipeable>
      ) : (
        rowContent
      )}
    </Animated.View>
  );
}

export default React.memo(ConversationItemComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  avatarPressable: {
    borderRadius: 999,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  contentPressable: {
    flex: 1,
    minHeight: 74,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingRight: messagingSpacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.md,
  },
  preview: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.sm,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  actionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsLeft: {
    paddingLeft: theme.spacing.xs,
  },
  actionsRight: {
    paddingRight: theme.spacing.xs,
  },
  action: {
    width: 72,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginVertical: 4,
    marginHorizontal: 3,
    borderRadius: theme.radii.md,
  },
  actionLabel: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
