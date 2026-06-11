import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

interface MessageBubbleProps {
  message: string;
  isSent: boolean;
  timestamp: Date;
  isRead?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  onLongPress?: () => void;
  onReact?: (emoji: string) => void;
  reactions?: Array<{ emoji: string; count: number; userIds: string[] }>;
  userName?: string;
  userAvatar?: string;
  isGroupChat?: boolean;
}

export function MessageBubble({
  message,
  isSent,
  timestamp,
  isRead,
  mediaUrl,
  mediaType,
  onLongPress,
  onReact,
  reactions,
  userName,
  userAvatar,
  isGroupChat,
}: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const bubbleStyle: ViewStyle = {
    backgroundColor: isSent ? theme.colors.primary : theme.colors.surfaceMuted,
    alignSelf: isSent ? 'flex-end' : 'flex-start',
  };

  const textColor = isSent ? theme.colors.white : theme.colors.text;

  return (
    <View style={[styles.container, { alignItems: isSent ? 'flex-end' : 'flex-start' }]}>
      {isGroupChat && !isSent && (
        <View style={styles.userRow}>
          {userAvatar && (
            <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
          )}
          <Text style={styles.userName}>{userName}</Text>
        </View>
      )}

      <Pressable
        onLongPress={onLongPress}
        style={[styles.bubble, bubbleStyle]}
      >
        {mediaUrl && (
          <Image
            source={{ uri: mediaUrl }}
            style={[
              styles.media,
              mediaType === 'video' && styles.mediaVideo,
            ]}
          />
        )}

        {message && (
          <Text style={[styles.messageText, { color: textColor }]}>
            {message}
          </Text>
        )}

        {!mediaUrl && (
          <View style={styles.footer}>
            <Text style={[styles.timestamp, { color: textColor, opacity: 0.7 }]}>
              {formatTime(timestamp)}
            </Text>
            {isSent && isRead && (
              <Ionicons name="checkmark-done" size={14} color={textColor} />
            )}
          </View>
        )}
      </Pressable>

      {reactions && reactions.length > 0 && (
        <View style={styles.reactionsRow}>
          {reactions.map((reaction, idx) => (
            <Pressable
              key={idx}
              style={styles.reactionBubble}
              onPress={() => onReact?.(reaction.emoji)}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              {reaction.count > 1 && (
                <Text style={styles.reactionCount}>{reaction.count}</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    ...theme.shadows.card,
  },
  media: {
    width: 200,
    height: 200,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.xs,
  },
  mediaVideo: {
    opacity: 0.8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
  },
});
