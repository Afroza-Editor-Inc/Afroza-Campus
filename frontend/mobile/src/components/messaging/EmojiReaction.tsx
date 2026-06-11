import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

interface EmojiReactionProps {
  emoji: string;
  count: number;
  isSelected?: boolean;
  onPress?: () => void;
}

export function EmojiReaction({
  emoji,
  count,
  isSelected,
  onPress,
}: EmojiReactionProps) {
  return (
    <Pressable
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}
      onPress={onPress}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      {count > 1 && <Text style={styles.count}>{count}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  containerSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
});
