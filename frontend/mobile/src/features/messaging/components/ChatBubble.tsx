import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../theme';
import type { ChatMessage, MessagingContact, MessagingConversation } from '../types';
import { attachmentSummary, formatMessageTime, senderNameForMessage } from '../utils/formatters';

type ChatBubbleProps = {
  message: ChatMessage;
  conversation: MessagingConversation;
  contacts: MessagingContact[];
  currentUserId: string;
  index: number;
};

export default function ChatBubble({
  message,
  conversation,
  contacts,
  currentUserId,
  index,
}: ChatBubbleProps) {
  const isMine = message.senderId === currentUserId;
  const showSender = !isMine && conversation.kind !== 'direct';

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 18).duration(200)}
      style={[styles.row, isMine && styles.rowMine]}
    >
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        {showSender ? (
          <Text style={styles.senderLabel}>
            {senderNameForMessage(message, contacts, currentUserId)}
          </Text>
        ) : null}

        {message.attachments.map((attachment) => (
          <View key={attachment.id} style={styles.attachmentCard}>
            {attachment.type === 'image' && attachment.uri ? (
              <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
            ) : null}

            <View style={styles.attachmentHeader}>
              <View
                style={[
                  styles.attachmentIcon,
                  attachment.accentColor ? { backgroundColor: attachment.accentColor } : null,
                ]}
              >
                <Ionicons
                  name={
                    attachment.type === 'audio'
                      ? 'mic'
                      : attachment.type === 'contact'
                        ? 'person'
                        : attachment.type === 'video'
                          ? 'videocam'
                          : attachment.type === 'image'
                            ? 'image'
                            : 'document'
                  }
                  size={16}
                  color={theme.colors.white}
                />
              </View>
              <View style={styles.attachmentTextWrap}>
                <Text style={styles.attachmentTitle} numberOfLines={1}>
                  {attachmentSummary(attachment)}
                </Text>
                <Text style={styles.attachmentMeta}>
                  {attachment.durationLabel ?? attachment.sizeLabel ?? 'Pret a ouvrir'}
                </Text>
              </View>
              {attachment.type === 'audio' ? (
                <Pressable style={styles.playButton}>
                  <Ionicons name="play" size={16} color={theme.colors.primary} />
                </Pressable>
              ) : null}
            </View>
          </View>
        ))}

        {message.text.trim().length > 0 ? (
          <Text style={[styles.messageText, isMine && styles.messageTextMine]}>{message.text}</Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, isMine && styles.metaTextMine]}>
            {formatMessageTime(message.createdAt)}
          </Text>
          {isMine ? (
            <Ionicons
              name={message.status === 'read' ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={message.status === 'read' ? theme.colors.white : 'rgba(255,255,255,0.74)'}
            />
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: 22,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 8,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 8,
  },
  senderLabel: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.primary,
  },
  messageText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  messageTextMine: {
    color: theme.colors.white,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  metaTextMine: {
    color: 'rgba(255,255,255,0.78)',
  },
  attachmentCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  attachmentImage: {
    width: '100%',
    height: 170,
    borderRadius: 14,
  },
  attachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  attachmentIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  attachmentTextWrap: {
    flex: 1,
    gap: 1,
  },
  attachmentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  attachmentMeta: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
