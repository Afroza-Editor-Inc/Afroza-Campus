import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline?: boolean;
  isGroup?: boolean;
  participants?: number;
}

interface ConversationListItemProps {
  conversation: Conversation;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ConversationListItem({
  conversation,
  onPress,
  onLongPress,
}: ConversationListItemProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {conversation.avatar ? (
          <Image
            source={{ uri: conversation.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              styles.avatarPlaceholder,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>
              {getInitials(conversation.name)}
            </Text>
          </View>
        )}
        {conversation.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text style={styles.time}>
            {formatTime(conversation.timestamp)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>

        {conversation.isGroup && conversation.participants && (
          <View style={styles.groupInfo}>
            <Ionicons
              name="people-outline"
              size={12}
              color={theme.colors.textMuted}
            />
            <Text style={styles.groupInfoText}>
              {conversation.participants} participants
            </Text>
          </View>
        )}
      </View>

      {/* Menu */}
      <Pressable style={styles.menu}>
        <Ionicons
          name="ellipsis-vertical"
          size={16}
          color={theme.colors.textMuted}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  containerPressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  content: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  groupInfoText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  menu: {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
  },
});
