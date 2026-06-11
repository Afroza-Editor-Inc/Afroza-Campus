import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

interface ReactionPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  visible: boolean;
}

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👍', '🙏', '😎', '🎉', '✨'];
const REACTIONS_CATEGORIES = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💖'],
  hands: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟'],
  gestures: ['💋', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👂', '🐾', '👍', '👎'],
};

export function AnimatedReactionPicker({ visible, onSelectEmoji, onClose }: ReactionPickerProps) {
  if (!visible) return null;

  const handleSelectEmoji = (emoji: string) => {
    hapticFeedback.light();
    onSelectEmoji(emoji);
    onClose();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.overlay} onPress={onClose} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {QUICK_REACTIONS.map((emoji, idx) => (
          <Pressable
            key={idx}
            style={({ pressed }) => [
              styles.emojiButton,
              pressed && styles.emojiButtonPressed,
            ]}
            onPress={() => handleSelectEmoji(emoji)}
            android_ripple={{ color: theme.colors.primary, radius: 20 }}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  overlay: {
    position: 'absolute',
    top: -500,
    left: -500,
    right: -500,
    bottom: -500,
  },
  scrollContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.xs,
  },
  emojiButtonPressed: {
    backgroundColor: theme.colors.primary,
    transform: [{ scale: 1.1 }],
  },
  emoji: {
    fontSize: 24,
  },
});
