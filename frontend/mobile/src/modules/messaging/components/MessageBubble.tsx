import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Audio, type AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInUp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import theme from '../../../theme';
import {
  formatMessageTimestamp,
  getAttachmentSummary,
  getSenderLabel,
} from '../services/formatters';
import { messagingGradient, messagingSpacing, useMessagingPalette } from '../theme';
import type { ChatMessage, MessagingContact, MessagingConversation } from '../types';
import Avatar from './Avatar';

type MessageBubbleProps = {
  message: ChatMessage;
  conversation: MessagingConversation;
  contacts: MessagingContact[];
  currentUserId: string;
  index: number;
  showSenderAvatar?: boolean;
  onLongPress?: (message: ChatMessage) => void;
  onReply?: (message: ChatMessage) => void;
};

function getVoiceCardWidth(durationLabel?: string) {
  const [minutesRaw = '0', secondsRaw = '0'] = (durationLabel ?? '00:00').split(':');
  const seconds = Number(minutesRaw) * 60 + Number(secondsRaw);

  if (!Number.isFinite(seconds)) {
    return 182;
  }

  return Math.min(244, Math.max(168, 158 + seconds * 2.4));
}

function AudioAttachmentCard({ attachment, isMine }: { attachment: ChatMessage['attachments'][number]; isMine: boolean }) {
  const palette = useMessagingPalette();
  const soundRef = React.useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const cardWidth = React.useMemo(() => getVoiceCardWidth(attachment.durationLabel), [attachment.durationLabel]);

  const teardown = React.useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => undefined);
      soundRef.current = null;
    }
  }, []);

  const onStatusUpdate = React.useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      return;
    }

    setIsPlaying(Boolean(status.isPlaying));

    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  }, []);

  const togglePlayback = React.useCallback(async () => {
    if (!attachment.uri) {
      return;
    }

    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();

        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          return;
        }

        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: attachment.uri },
        { shouldPlay: true },
        onStatusUpdate
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [attachment.uri, onStatusUpdate]);

  React.useEffect(
    () => () => {
      teardown().catch(() => undefined);
    },
    [teardown]
  );

  return (
    <View
      style={[
        styles.audioCard,
        {
          backgroundColor: isMine ? 'rgba(255,255,255,0.16)' : palette.surfaceMuted,
          width: cardWidth,
        },
      ]}
    >
      <Pressable onPress={togglePlayback} disabled={!attachment.uri} style={styles.audioButton}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={theme.colors.primary} />
      </Pressable>
      <View style={styles.audioTextWrap}>
        <Text style={[styles.attachmentTitle, { color: isMine ? theme.colors.white : palette.text }]}>
          {attachment.label}
        </Text>
        <Text style={[styles.attachmentMeta, { color: isMine ? 'rgba(255,255,255,0.76)' : palette.textMuted }]}>
          {attachment.durationLabel ?? attachment.sizeLabel ?? 'Audio'}
        </Text>
      </View>
      <View style={styles.waveWrap}>
        {Array.from({ length: 9 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.waveBar,
              {
                height: 9 + ((index * 6) % 18),
                opacity: 0.32 + index * 0.06,
                backgroundColor: isMine ? theme.colors.white : palette.activeStart,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function AttachmentCard({
  attachment,
  isMine,
}: {
  attachment: ChatMessage['attachments'][number];
  isMine: boolean;
}) {
  const palette = useMessagingPalette();

  if (attachment.type === 'audio') {
    return <AudioAttachmentCard attachment={attachment} isMine={isMine} />;
  }

  if ((attachment.type === 'image' || attachment.type === 'gif' || attachment.type === 'sticker') && attachment.uri) {
    return (
      <View style={styles.mediaCard}>
        <Image source={{ uri: attachment.uri }} style={styles.mediaImage} />
        {attachment.type === 'gif' ? (
          <View style={styles.gifBadge}>
            <Text style={styles.gifBadgeText}>GIF</Text>
          </View>
        ) : null}
        <View style={styles.mediaCaption}>
          <Text
            style={[styles.attachmentTitle, { color: isMine ? theme.colors.white : palette.text }]}
            numberOfLines={1}
          >
            {attachment.label}
          </Text>
          <Text style={[styles.attachmentMeta, { color: isMine ? 'rgba(255,255,255,0.76)' : palette.textMuted }]}>
            {attachment.sizeLabel ?? (attachment.type === 'sticker' ? 'Sticker' : 'Photo')}
          </Text>
        </View>
      </View>
    );
  }

  if (attachment.type === 'video' && attachment.uri) {
    return (
      <View style={styles.mediaCard}>
        <Video
          source={{ uri: attachment.uri }}
          style={styles.mediaImage}
          resizeMode={ResizeMode.COVER}
          isMuted
          shouldPlay={false}
        />
        <View style={styles.videoBadge}>
          <Ionicons name="play" size={16} color={theme.colors.white} />
        </View>
        <View style={styles.mediaCaption}>
          <Text
            style={[styles.attachmentTitle, { color: isMine ? theme.colors.white : palette.text }]}
            numberOfLines={1}
          >
            {attachment.label}
          </Text>
          <Text style={[styles.attachmentMeta, { color: isMine ? 'rgba(255,255,255,0.76)' : palette.textMuted }]}>
            {attachment.durationLabel ?? attachment.sizeLabel ?? 'Video'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.genericCard,
        {
          backgroundColor: isMine ? 'rgba(255,255,255,0.16)' : palette.surfaceMuted,
        },
      ]}
    >
      <View
        style={[
          styles.genericIcon,
          attachment.accentColor ? { backgroundColor: attachment.accentColor } : null,
        ]}
      >
        <Ionicons
          name={
            attachment.type === 'document'
              ? 'document-text-outline'
              : attachment.type === 'contact'
                ? 'person-outline'
                : attachment.type === 'location'
                  ? 'location-outline'
                : 'attach-outline'
          }
          size={16}
          color={theme.colors.white}
        />
      </View>
      <View style={styles.genericText}>
        <Text
          style={[styles.attachmentTitle, { color: isMine ? theme.colors.white : palette.text }]}
          numberOfLines={1}
        >
          {getAttachmentSummary(attachment)}
        </Text>
        <Text style={[styles.attachmentMeta, { color: isMine ? 'rgba(255,255,255,0.76)' : palette.textMuted }]}>
          {attachment.durationLabel ?? attachment.sizeLabel ?? 'Pret a ouvrir'}
        </Text>
      </View>
    </View>
  );
}

function ReplyQuote({
  reply,
  isMine,
}: {
  reply: NonNullable<ChatMessage['replyTo']>;
  isMine: boolean;
}) {
  const palette = useMessagingPalette();
  const accent = isMine ? 'rgba(255,255,255,0.85)' : palette.activeStart;
  const nameColor = isMine ? theme.colors.white : palette.activeStart;
  const textColor = isMine ? 'rgba(255,255,255,0.82)' : palette.textMuted;
  const background = isMine ? 'rgba(255,255,255,0.16)' : palette.surfaceMuted;

  return (
    <View style={[styles.replyQuote, { backgroundColor: background }]}>
      <View style={[styles.replyQuoteAccent, { backgroundColor: accent }]} />
      <View style={styles.replyQuoteBody}>
        <Text style={[styles.replyQuoteName, { color: nameColor }]} numberOfLines={1}>
          {reply.senderName}
        </Text>
        <Text style={[styles.replyQuoteText, { color: textColor }]} numberOfLines={2}>
          {reply.text}
        </Text>
      </View>
    </View>
  );
}

function ReactionsRow({
  currentUserId,
  reactions,
}: {
  currentUserId: string;
  reactions: NonNullable<ChatMessage['reactions']>;
}) {
  const palette = useMessagingPalette();

  return (
    <View style={styles.reactionsRow}>
      {reactions.map((reaction) => {
        const mine = reaction.userIds.includes(currentUserId);

        return (
          <View
            key={reaction.emoji}
            style={[
              styles.reactionChip,
              {
                backgroundColor: mine ? palette.surfaceStrong : palette.surfaceMuted,
                borderColor: mine ? palette.activeStart : palette.border,
              },
            ]}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text style={[styles.reactionCount, { color: palette.textMuted }]}>{reaction.userIds.length}</Text>
          </View>
        );
      })}
    </View>
  );
}

function MessageBubbleComponent({
  message,
  conversation,
  contacts,
  currentUserId,
  index,
  showSenderAvatar = false,
  onLongPress,
  onReply,
}: MessageBubbleProps) {
  const palette = useMessagingPalette();
  const isMine = message.senderId === currentUserId;
  const showGroupChrome = !isMine && conversation.kind !== 'direct' && conversation.kind !== 'channel';
  const showSenderLabel = showGroupChrome;
  const senderContact = contacts.find((contact) => contact.id === message.senderId);
  const messageContentColor = isMine ? theme.colors.white : palette.text;
  const metaColor = isMine ? 'rgba(255,255,255,0.76)' : palette.textMuted;
  const hasReactions = Boolean(message.reactions?.length);

  const translateX = useSharedValue(0);
  const REPLY_THRESHOLD = 56;

  const handleReply = React.useCallback(() => {
    onReply?.(message);
  }, [message, onReply]);

  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(Boolean(onReply))
        .activeOffsetX([14, 9999])
        .failOffsetY([-12, 12])
        .onUpdate((event) => {
          translateX.value = Math.min(Math.max(event.translationX, 0), 84);
        })
        .onEnd(() => {
          if (translateX.value > REPLY_THRESHOLD) {
            runOnJS(handleReply)();
          }
          translateX.value = withTiming(0, { duration: 160 });
        }),
    [handleReply, onReply, translateX]
  );

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const replyIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, REPLY_THRESHOLD], [0, 1], 'clamp'),
    transform: [
      { scale: interpolate(translateX.value, [0, REPLY_THRESHOLD], [0.6, 1], 'clamp') },
    ],
  }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View>
        <Animated.View style={[styles.replyHint, replyIconStyle]} pointerEvents="none">
          <View style={[styles.replyHintCircle, { backgroundColor: palette.surfaceStrong }]}>
            <Ionicons name="arrow-undo" size={16} color={palette.activeStart} />
          </View>
        </Animated.View>
        <Animated.View style={swipeStyle}>
          <Animated.View
            entering={FadeInUp.delay(Math.min(index * 12, 120)).duration(140)}
            style={[styles.row, isMine && styles.rowMine]}
          >
      {showGroupChrome ? (
        <View style={styles.leadingColumn}>
          {showSenderAvatar && senderContact ? (
            <Avatar
              label={senderContact.name}
              uri={senderContact.avatar}
              color={senderContact.avatarColor}
              kind="direct"
              size={30}
              online={false}
            />
          ) : (
            <View style={styles.leadingSpacer} />
          )}
        </View>
      ) : null}

      <View style={[styles.bubbleBlock, isMine && styles.bubbleBlockMine]}>
        <Pressable delayLongPress={180} onLongPress={() => onLongPress?.(message)} style={({ pressed }) => [pressed && styles.bubblePressed]}>
          {isMine ? (
            <LinearGradient colors={messagingGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bubbleMine}>
              {showSenderLabel ? (
                <Text style={[styles.senderLabel, { color: 'rgba(255,255,255,0.80)' }]}>
                  {getSenderLabel(message, contacts, currentUserId)}
                </Text>
              ) : null}

              {message.replyTo ? <ReplyQuote reply={message.replyTo} isMine /> : null}

              {message.attachments.map((attachment) => (
                <AttachmentCard key={attachment.id} attachment={attachment} isMine />
              ))}

              {message.text.trim().length > 0 ? (
                <Text style={[styles.text, { color: messageContentColor }]}>{message.text}</Text>
              ) : null}

              <View style={styles.metaRow}>
                {message.editedAt ? (
                  <Text style={[styles.metaText, { color: metaColor }]}>modifié</Text>
                ) : null}
                <Text style={[styles.metaText, { color: metaColor }]}>{formatMessageTimestamp(message.createdAt)}</Text>
                <Ionicons
                  name={message.status === 'read' ? 'checkmark-done' : message.status === 'delivered' ? 'checkmark-done-outline' : 'checkmark'}
                  size={14}
                  color={message.status === 'read' ? '#D6F0FF' : metaColor}
                />
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.bubbleOther, { backgroundColor: palette.surface, borderColor: palette.border, shadowColor: palette.shadow }]}>
              {showSenderLabel ? (
                <Text style={[styles.senderLabel, { color: senderContact?.avatarColor ?? palette.activeStart }]}>
                  {getSenderLabel(message, contacts, currentUserId)}
                </Text>
              ) : null}

              {message.replyTo ? <ReplyQuote reply={message.replyTo} isMine={false} /> : null}

              {message.attachments.map((attachment) => (
                <AttachmentCard key={attachment.id} attachment={attachment} isMine={false} />
              ))}

              {message.text.trim().length > 0 ? (
                <Text style={[styles.text, { color: messageContentColor }]}>{message.text}</Text>
              ) : null}

              <View style={styles.metaRow}>
                {message.editedAt ? (
                  <Text style={[styles.metaText, { color: metaColor }]}>modifié</Text>
                ) : null}
                <Text style={[styles.metaText, { color: metaColor }]}>{formatMessageTimestamp(message.createdAt)}</Text>
              </View>
            </View>
          )}
        </Pressable>

        {hasReactions ? (
          <ReactionsRow currentUserId={currentUserId} reactions={message.reactions ?? []} />
        ) : null}
      </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

export default React.memo(MessageBubbleComponent);

const styles = StyleSheet.create({
  replyHint: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyHintCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  leadingColumn: {
    width: 34,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingBottom: 4,
  },
  leadingSpacer: {
    width: 30,
    height: 30,
  },
  bubbleBlock: {
    maxWidth: '84%',
  },
  bubbleBlockMine: {
    alignItems: 'flex-end',
  },
  bubbleMine: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
    borderTopRightRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    shadowColor: '#0072FF',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  bubblePressed: {
    transform: [{ scale: 0.985 }],
  },
  bubbleOther: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  senderLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 1,
  },
  metaText: {
    fontSize: 10.5,
    fontWeight: '600',
    opacity: 0.88,
  },
  mediaCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  mediaImage: {
    width: '100%',
    height: 182,
  },
  mediaCaption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  videoBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    minWidth: 38,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(7,17,31,0.58)',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifBadgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  attachmentTitle: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  attachmentMeta: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontWeight: '500',
  },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  audioButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  audioTextWrap: {
    flex: 1,
    gap: 2,
  },
  waveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 2.5,
    borderRadius: 999,
    backgroundColor: theme.colors.white,
  },
  genericCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    padding: 10,
  },
  genericIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  genericText: {
    flex: 1,
    gap: 2,
  },
  replyQuote: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 2,
  },
  replyQuoteAccent: {
    width: 3,
  },
  replyQuoteBody: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 1,
  },
  replyQuoteName: {
    fontSize: 12,
    fontWeight: '800',
  },
  replyQuoteText: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reactionChip: {
    minHeight: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '700',
  },
});
