import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Text,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onAttachMedia?: () => void;
  onAttachVoice?: () => void;
  isLoading?: boolean;
}

const EMOJI_PICKER = ['😀', '😂', '❤️', '😍', '🔥', '👍', '🙏', '😎'];

export function MessageInput({
  onSendMessage,
  onAttachMedia,
  onAttachVoice,
  isLoading,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setShowEmoji(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(message + emoji);
  };

  const canSend = message.trim().length > 0;

  return (
    <View style={styles.container}>
      {showEmoji && (
        <View style={styles.emojiPicker}>
          {EMOJI_PICKER.map((emoji, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleEmojiSelect(emoji)}
              style={styles.emojiButton}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.inputRow}>
        {/* Attachment Buttons */}
        <Pressable style={styles.actionButton} onPress={onAttachMedia}>
          <Ionicons
            name="image-outline"
            size={20}
            color={theme.colors.primary}
          />
        </Pressable>

        <Pressable style={styles.actionButton} onPress={onAttachVoice}>
          <Ionicons
            name="mic-outline"
            size={20}
            color={theme.colors.primary}
          />
        </Pressable>

        {/* Text Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            placeholderTextColor={theme.colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <Pressable
            style={styles.emojiButton2}
            onPress={() => setShowEmoji(!showEmoji)}
          >
            <Ionicons
              name="happy-outline"
              size={18}
              color={theme.colors.primary}
            />
          </Pressable>
        </View>

        {/* Send Button */}
        <Pressable
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend || isLoading}
        >
          <Ionicons
            name="send"
            size={18}
            color={canSend ? theme.colors.white : theme.colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  emojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceMuted,
    gap: theme.spacing.sm,
  },
  emojiButton: {
    padding: theme.spacing.sm,
  },
  emoji: {
    fontSize: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.md,
    minHeight: 40,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },
  emojiButton2: {
    padding: theme.spacing.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.glow,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.surfaceMuted,
    opacity: 0.5,
  },
});
