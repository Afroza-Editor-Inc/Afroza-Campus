import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeOutUp,
  ZoomIn,
} from 'react-native-reanimated';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';
import { AnimatedReactionPicker } from './AnimatedReactionPicker';

interface MessageBubbleAdvancedProps {
  message: string;
  isSent: boolean;
  timestamp: Date;
  isRead?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  reactions?: Array<{ emoji: string; count: number; userIds: string[] }>;
  onLongPress?: () => void;
  onReact?: (emoji: string) => void;
  userName?: string;
  index?: number;
}

export function MessageBubbleAdvanced({
  message,
  isSent,
  timestamp,
  isRead,
  mediaUrl,
  mediaType,
  reactions,
  onReact,
  onLongPress,
  userName,
  index = 0,
}: MessageBubbleAdvancedProps) {
  const [reactionPickerVisible, setReactionPickerVisible] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);

  const handleLongPress = () => {
    hapticFeedback.medium();
    onLongPress?.();
    setReactionPickerVisible(true);
  };

  const handleReaction = (emoji: string) => {
    setSelectedReaction(emoji);
    onReact?.(emoji);

    // Reset après animation
    setTimeout(() => setSelectedReaction(null), 500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={[styles.container, isSent && styles.containerSent]}
    >
      {/* Message Bubble */}
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={({ pressed }) => [
          styles.bubble,
          isSent ? styles.bubbleSent : styles.bubbleReceived,
          pressed && styles.bubblePressed,
        ]}
        android_ripple={{
          color: isSent ? theme.colors.primary : theme.colors.textMuted,
          radius: 50,
          borderless: true,
        }}
      >
        {/* Avatar pour message reçu */}
        {!isSent && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName ? userName[0].toUpperCase() : 'U'}
            </Text>
          </View>
        )}

        {/* Contenu */}
        <View style={styles.bubbleContent}>
          {mediaUrl && mediaType === 'image' && (
            <Image
              source={{ uri: mediaUrl }}
              style={styles.mediaImage}
            />
          )}

          <Text
            style={[
              styles.messageText,
              isSent && styles.messageTextSent,
            ]}
          >
            {message}
          </Text>

          {/* Métadonnées */}
          <View style={styles.metadata}>
            <Text style={[styles.timestamp, isSent && styles.timestampSent]}>
              {formatTime(timestamp)}
            </Text>
            {isSent && (
              <Ionicons
                name={isRead ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={isRead ? theme.colors.primary : theme.colors.textMuted}
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </Pressable>

      {/* Réactions */}
      {reactions && reactions.length > 0 && (
        <Animated.View entering={ZoomIn.delay(100)} style={styles.reactionsContainer}>
          {reactions.map((reaction, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleReaction(reaction.emoji)}
              style={({ pressed }) => [
                styles.reactionBubble,
                selectedReaction === reaction.emoji && styles.reactionBubbleSelected,
                pressed && { transform: [{ scale: 1.15 }] },
              ]}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              {reaction.count > 1 && (
                <Text style={styles.reactionCount}>{reaction.count}</Text>
              )}
            </Pressable>
          ))}
          <Pressable
            onPress={() => setReactionPickerVisible(true)}
            style={[styles.reactionBubble, styles.addReactionButton]}
          >
            <Ionicons name="add" size={12} color={theme.colors.primary} />
          </Pressable>
        </Animated.View>
      )}

      {/* Emoji Picker */}
      <AnimatedReactionPicker
        visible={reactionPickerVisible}
        onSelectEmoji={handleReaction}
        onClose={() => setReactionPickerVisible(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'flex-end',
  },
  containerSent: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bubbleSent: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubblePressed: {
    opacity: 0.8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  bubbleContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: theme.colors.text,
  },
  messageTextSent: {
    color: theme.colors.white,
  },
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  timestampSent: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  readIcon: {
    marginLeft: 2,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    flexWrap: 'wrap',
    gap: 4,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reactionBubbleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  addReactionButton: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    paddingHorizontal: 6,
  },
});
