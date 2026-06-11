import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import EmojiPicker from 'rn-emoji-keyboard';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { useCallsStore } from '../../../store/callsStore';
import {
  messagingSpacing,
  useMessagingPalette,
} from '../theme';
import {
  Avatar,
  InputBar,
  MessagingAttachmentSheet,
  MessageBubble,
  MessagingActionSheet,
} from '../components';
import { useContactLookup, useConversation, useConversationMessages } from '../hooks/useMessagingSelectors';
import {
  ATTACHMENT_ROW_HEIGHT,
  COMPOSER_ROW_HEIGHT,
  EMOJI_PANEL_HEIGHT,
  REPLY_BANNER_HEIGHT,
} from '../constants/composerLayout';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import {
  createAttachmentFromAsset,
  createContactAttachment,
  createDocumentAttachment,
  createLocationAttachment,
  createVoiceAttachment,
} from '../services/media';
import {
  formatDayDivider,
  getAttachmentSummary,
  getConversationDisplayTitle,
} from '../services/formatters';
import { useMessagingStore } from '../store/useMessagingStore';
import type {
  ChatMessage,
  MessageAttachment,
  MessageReplyPreview,
} from '../types';

type Props = NativeStackScreenProps<MessagingStackParamList, 'Chat'>;

export default function ChatScreen({ route, navigation }: Props) {
  const { conversationId } = route.params;
  const insets = useSafeAreaInsets();
  const palette = useMessagingPalette();
  const contacts = useContactLookup();
  const conversation = useConversation(conversationId);
  const messages = useConversationMessages(conversationId);
  const currentUserId = useMessagingStore((state) => state.currentUserId);
  const sendMessage = useMessagingStore((state) => state.sendMessage);
  const setActiveConversation = useMessagingStore((state) => state.setActiveConversation);
  const markConversationRead = useMessagingStore((state) => state.markConversationRead);
  const toggleMessageReaction = useMessagingStore((state) => state.toggleMessageReaction);
  const toggleMessageStarred = useMessagingStore((state) => state.toggleMessageStarred);
  const deleteMessage = useMessagingStore((state) => state.deleteMessage);
  const editMessage = useMessagingStore((state) => state.editMessage);
  const toggleConversationMuted = useMessagingStore((state) => state.toggleConversationMuted);
  const toggleConversationPinned = useMessagingStore((state) => state.toggleConversationPinned);
  const toggleConversationBlocked = useMessagingStore((state) => state.toggleConversationBlocked);
  const deleteConversation = useMessagingStore((state) => state.deleteConversation);
  const [draft, setDraft] = React.useState('');
  const [pendingAttachments, setPendingAttachments] = React.useState<MessageAttachment[]>([]);
  const [replyTarget, setReplyTarget] = React.useState<MessageReplyPreview | null>(null);
  const [editingMessage, setEditingMessage] = React.useState<ChatMessage | null>(null);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [attachmentsVisible, setAttachmentsVisible] = React.useState(false);
  const [avatarPreviewVisible, setAvatarPreviewVisible] = React.useState(false);
  const [selectedMessage, setSelectedMessage] = React.useState<ChatMessage | null>(null);
  const [emojiPickerVisible, setEmojiPickerVisible] = React.useState(false);
  const [showScrollDown, setShowScrollDown] = React.useState(false);
  const [emojiPanelOpen, setEmojiPanelOpen] = React.useState(false);
  const listRef = React.useRef<FlatList<ReturnType<typeof buildListData>[number]>>(null);

  // Source unique du clavier : react-native-keyboard-controller.
  // - `keyboardSV` (UI thread) pilote la position du dock, frame-perfect avec le clavier.
  // - `isKeyboardVisible` / `keyboardHeightJs` (état JS, mis à jour au début/fin de transition
  //   seulement) servent à réserver l'espace de la liste et dimensionner le panneau emoji.
  const keyboardSV = useSharedValue(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);
  const [keyboardHeightJs, setKeyboardHeightJs] = React.useState(0);
  const [lastKeyboardHeight, setLastKeyboardHeight] = React.useState(0);

  const syncKeyboardState = React.useCallback((height: number) => {
    const visible = height > 0;
    setIsKeyboardVisible(visible);
    setKeyboardHeightJs(height);
    if (visible) {
      setLastKeyboardHeight(height);
    }
  }, []);

  useKeyboardHandler(
    {
      onStart: (event) => {
        'worklet';
        // Réserve l'espace liste dès le début de la transition (évite le message masqué).
        runOnJS(syncKeyboardState)(event.height);
      },
      onMove: (event) => {
        'worklet';
        keyboardSV.value = event.height;
      },
      onEnd: (event) => {
        'worklet';
        keyboardSV.value = event.height;
        runOnJS(syncKeyboardState)(event.height);
      },
    },
    [syncKeyboardState]
  );

  /**
   * Le panneau emoji prend exactement la hauteur du dernier clavier connu :
   * la bascule clavier ↔ emoji ne déplace donc plus le composer (continuité visuelle).
   */
  const emojiPanelHeight = React.useMemo(() => {
    const target = lastKeyboardHeight > 0 ? lastKeyboardHeight - insets.bottom : EMOJI_PANEL_HEIGHT;
    return Math.round(Math.min(Math.max(target, 250), 360));
  }, [insets.bottom, lastKeyboardHeight]);

  /** Hauteur totale du dock (bannières + composer + panneau emoji). */
  const dockContentHeight = React.useMemo(() => {
    let height = COMPOSER_ROW_HEIGHT;

    if (emojiPanelOpen) {
      height += emojiPanelHeight;
    }

    if (replyTarget || editingMessage) {
      height += REPLY_BANNER_HEIGHT;
    }

    if (pendingAttachments.length > 0) {
      height += ATTACHMENT_ROW_HEIGHT;
    }

    return height;
  }, [editingMessage, emojiPanelHeight, emojiPanelOpen, pendingAttachments.length, replyTarget]);

  /** Espace réservé sous la liste (FlatList inversée → paddingTop = bas visuel). */
  const listComposerClearance = React.useMemo(() => {
    const bottomGap = isKeyboardVisible ? keyboardHeightJs : insets.bottom;
    return dockContentHeight + bottomGap + 4;
  }, [dockContentHeight, insets.bottom, isKeyboardVisible, keyboardHeightJs]);

  // Le dock s'ancre toujours au-dessus de la safe-area et suit le clavier image par image.
  // Quand le panneau emoji est ouvert, le clavier est fermé (keyboardSV → 0) : le dock
  // revient à insets.bottom et le panneau emoji (même hauteur que le clavier) prend le relais
  // → le bord haut du composer reste exactement à la même position (zéro saut).
  const composerDockStyle = useAnimatedStyle(() => ({
    bottom: insets.bottom + Math.max(keyboardSV.value - insets.bottom, 0),
  }));

  React.useEffect(() => {
    if (!isKeyboardVisible || emojiPanelOpen) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, [emojiPanelOpen, isKeyboardVisible]);
  const {
    isRecording,
    recordingDurationLabel,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  React.useEffect(() => {
    setActiveConversation(conversationId);
    markConversationRead(conversationId);

    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, markConversationRead, setActiveConversation]);

  const listData = React.useMemo(() => buildListData(messages), [messages]);

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingState}>
          <Text style={styles.missingTitle}>Discussion introuvable</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.backPrimary}>
            <Text style={styles.backPrimaryText}>Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const directContact =
    conversation.kind === 'direct'
      ? contacts.find((contact) => contact.id === conversation.participantIds[0])
      : undefined;
  const conversationTitle = getConversationDisplayTitle(conversation);
  const wallpaperGradient =
    conversation.wallpaperKey === 'midnight'
      ? (['rgba(8,16,31,0.70)', 'rgba(0,114,255,0.06)', 'rgba(0,163,255,0.04)'] as const)
      : conversation.wallpaperKey === 'sunrise'
        ? (['rgba(0,114,255,0.05)', 'rgba(0,255,106,0.08)', 'rgba(255,255,255,0.00)'] as const)
        : (['rgba(0,114,255,0.07)', 'rgba(247,249,252,0)', 'rgba(0,255,106,0.06)'] as const);

  const pushAttachment = React.useCallback((attachment: MessageAttachment) => {
    setPendingAttachments((current) => [...current, attachment]);
  }, []);

  const removeAttachment = React.useCallback((attachmentId: string) => {
    setPendingAttachments((current) => current.filter((item) => item.id !== attachmentId));
  }, []);

  const handleSend = React.useCallback(() => {
    if (editingMessage) {
      if (draft.trim()) {
        editMessage(conversationId, editingMessage.id, draft);
      }
      setEditingMessage(null);
      setDraft('');
      return;
    }

    if (!draft.trim() && pendingAttachments.length === 0) {
      return;
    }

    sendMessage({
      conversationId,
      text: draft,
      attachments: pendingAttachments,
      replyTo: replyTarget ?? undefined,
    });
    setDraft('');
    setPendingAttachments([]);
    setReplyTarget(null);
  }, [conversationId, draft, editMessage, editingMessage, pendingAttachments, replyTarget, sendMessage]);

  const handleSendAttachment = React.useCallback(
    (attachment: MessageAttachment) => {
      sendMessage({ conversationId, attachments: [attachment] });
    },
    [conversationId, sendMessage]
  );

  const handleStartVoiceRecording = React.useCallback(async () => {
    const granted = await startRecording();

    if (!granted) {
      Alert.alert('Micro indisponible', 'Autorisez le micro pour envoyer une note vocale.');
    }
  }, [startRecording]);

  const handleStopVoiceRecording = React.useCallback(async () => {
    const attachment = await stopRecording();

    if (!attachment) {
      return;
    }

    sendMessage({
      conversationId,
      attachments: [attachment],
    });
  }, [conversationId, sendMessage, stopRecording]);

  const handleCancelVoiceRecording = React.useCallback(async () => {
    await cancelRecording();
  }, [cancelRecording]);

  const openLibrary = React.useCallback(
    async (mode: 'photo' | 'video') => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission requise', 'Autorisez l acces a la galerie pour joindre des medias.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mode === 'video' ? ['videos'] : ['images'],
        allowsEditing: mode === 'photo',
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        pushAttachment(createAttachmentFromAsset(result.assets[0]));
      }

      setAttachmentsVisible(false);
    },
    [pushAttachment]
  );

  const addAudioAttachment = React.useCallback(() => {
    pushAttachment(createVoiceAttachment({ durationMs: 18_000, sizeBytes: 320_000 }));
    setAttachmentsVisible(false);
  }, [pushAttachment]);

  // Caméra Afroza Campus : caméra intégrée dans l'app (aucune caméra système externe).
  const openCamera = React.useCallback(() => {
    setAttachmentsVisible(false);
    navigation.navigate('MessagingCamera', { conversationId });
  }, [conversationId, navigation]);

  const addDocumentAttachment = React.useCallback(() => {
    pushAttachment(createDocumentAttachment('Afroza-messaging-brief.pdf'));
    setAttachmentsVisible(false);
  }, [pushAttachment]);

  const addContactAttachment = React.useCallback(() => {
    const targetContact =
      contacts.find((item) => item.id === conversation.participantIds[0]) ?? contacts[0];

    if (!targetContact) {
      return;
    }

    pushAttachment(createContactAttachment(targetContact));
    setAttachmentsVisible(false);
  }, [contacts, conversation.participantIds, pushAttachment]);

  const addLocationAttachment = React.useCallback(() => {
    pushAttachment(createLocationAttachment());
    setAttachmentsVisible(false);
  }, [pushAttachment]);

  const addCallRecord = React.useCallback(
    (callType: 'voice' | 'video') => {
      useCallsStore.getState().addCall({
        id: `call_${Date.now()}`,
        participantId: conversation.id,
        participantName: conversationTitle,
        participantAvatar: conversation.avatar,
        type: 'outgoing',
        callType,
        timestamp: new Date(),
      });

      navigation.getParent()?.navigate('ActiveCall', {
        name: conversationTitle,
        callType,
        glyph: conversationTitle.slice(0, 1).toUpperCase(),
      });
    },
    [conversation.avatar, conversation.id, conversationTitle, navigation]
  );

  const openProfile = React.useCallback(() => {
    navigation.navigate('ConversationProfile', { conversationId });
  }, [conversationId, navigation]);

  const quoteMessage = React.useCallback(
    (message: ChatMessage) => {
      const isMine = message.senderId === currentUserId;
      const senderContact = contacts.find((contact) => contact.id === message.senderId);
      const snippet =
        message.text.trim() ||
        message.attachments.map((attachment) => getAttachmentSummary(attachment)).join(', ') ||
        'Pièce jointe';

      setReplyTarget({
        messageId: message.id,
        senderId: message.senderId,
        senderName: isMine ? 'Vous' : senderContact?.name ?? 'Membre',
        text: snippet,
        isMine,
      });
      setSelectedMessage(null);
    },
    [contacts, currentUserId]
  );

  const reactToMessage = React.useCallback(
    (emoji: string) => {
      if (!selectedMessage) {
        return;
      }

      toggleMessageReaction(conversationId, selectedMessage.id, emoji);
      setSelectedMessage(null);
    },
    [conversationId, selectedMessage, toggleMessageReaction]
  );

  const reactWithCustomEmoji = React.useCallback(
    (emoji: string) => {
      if (!selectedMessage) {
        return;
      }

      toggleMessageReaction(conversationId, selectedMessage.id, emoji);
      setEmojiPickerVisible(false);
      setSelectedMessage(null);
    },
    [conversationId, selectedMessage, toggleMessageReaction]
  );

  const copyMessage = React.useCallback(async (message: ChatMessage) => {
    const content =
      message.text.trim() ||
      message.attachments.map((attachment) => getAttachmentSummary(attachment)).join(', ');

    if (content) {
      await Clipboard.setStringAsync(content).catch(() => undefined);
    }
    setSelectedMessage(null);
  }, []);

  const shareMessage = React.useCallback(async (message: ChatMessage) => {
    const content =
      message.text.trim() ||
      message.attachments.map((attachment) => getAttachmentSummary(attachment)).join(', ');
    setSelectedMessage(null);

    if (!content) {
      return;
    }

    try {
      await Share.share({ message: content });
    } catch (error) {
      // partage annulé / indisponible
    }
  }, []);

  const startEditMessage = React.useCallback((message: ChatMessage) => {
    setReplyTarget(null);
    setEditingMessage(message);
    setDraft(message.text);
    setSelectedMessage(null);
  }, []);

  const cancelEdit = React.useCallback(() => {
    setEditingMessage(null);
    setDraft('');
  }, []);

  const forwardSelectedMessage = React.useCallback(
    (message: ChatMessage) => {
      setSelectedMessage(null);
      navigation.navigate('ForwardMessage', { conversationId, messageId: message.id });
    },
    [conversationId, navigation]
  );

  const starMessage = React.useCallback(
    (message: ChatMessage) => {
      toggleMessageStarred(conversationId, message.id);
      setSelectedMessage(null);
    },
    [conversationId, toggleMessageStarred]
  );

  const removeMessage = React.useCallback(
    (message: ChatMessage) => {
      Alert.alert('Supprimer le message', 'Cette action est définitive pour vous.', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteMessage(conversationId, message.id);
            setSelectedMessage(null);
          },
        },
      ]);
    },
    [conversationId, deleteMessage]
  );

  const handleMessageLongPress = React.useCallback((message: ChatMessage) => {
    setSelectedMessage(message);
  }, []);

  const handleListScroll = React.useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      setShowScrollDown(event.nativeEvent.contentOffset.y > 260);
    },
    []
  );

  const scrollToBottom = React.useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const renderMessage = React.useCallback(
    ({ item, index }: { item: ReturnType<typeof buildListData>[number]; index: number }) => (
      <View>
        <MessageBubble
          message={item.message}
          conversation={conversation}
          contacts={contacts}
          currentUserId={currentUserId}
          index={index}
          showSenderAvatar={item.showSenderAvatar}
          onLongPress={handleMessageLongPress}
          onReply={quoteMessage}
        />
        {item.showDayDivider ? (
          <View style={styles.dayDividerWrap}>
            <Text
              style={[
                styles.dayDividerText,
                { color: palette.textMuted, backgroundColor: palette.surfaceStrong },
              ]}
            >
              {formatDayDivider(item.message.createdAt)}
            </Text>
          </View>
        ) : null}
      </View>
    ),
    [contacts, conversation, currentUserId, handleMessageLongPress, palette, quoteMessage]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
        <View style={[styles.container, { backgroundColor: palette.background }]}>
          <LinearGradient
            colors={wallpaperGradient}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.threadWash}
          />
          <View style={[styles.chatGlow, { backgroundColor: palette.heroPrimary }]} pointerEvents="none" />
          <View
            style={[styles.chatGlowSecondary, { backgroundColor: palette.heroSecondary }]}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['rgba(0,114,255,0.08)', 'rgba(0,163,255,0.02)', 'rgba(0,255,106,0.08)']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.textureOrb}
          />

          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour"
              hitSlop={theme.accessibility.hitSlop}
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.headerBack, pressed && styles.iconBarePressed]}
            >
              <Ionicons name="chevron-back" size={26} color={palette.text} />
            </Pressable>

            <View style={styles.headerIdentity}>
              <Pressable onPress={() => setAvatarPreviewVisible(true)}>
                <Avatar
                  label={conversationTitle}
                  uri={conversation.avatar}
                  color={conversation.avatarColor}
                  kind={conversation.kind}
                  participantIds={conversation.participantIds}
                  size={38}
                  presence={conversation.kind === 'direct' ? conversation.presence : undefined}
                  verified={conversation.isVerified}
                />
              </Pressable>
              <Pressable onPress={openProfile} style={styles.headerTextWrap}>
                <Text style={[styles.headerTitle, { color: palette.text }]} numberOfLines={1}>
                  {conversationTitle}
                </Text>
                <View style={styles.headerStatusRow}>
                  {conversation.kind === 'direct' && !conversation.typingLabel ? (
                    <View
                      style={[
                        styles.presenceDot,
                        {
                          backgroundColor:
                            conversation.presence === 'online'
                              ? theme.colors.success
                              : conversation.presence === 'away'
                                ? theme.colors.warning
                                : theme.colors.muted,
                        },
                      ]}
                    />
                  ) : null}
                  <Text style={[styles.headerSubtitle, { color: palette.activeStart }]} numberOfLines={1}>
                    {conversation.typingLabel ?? directContact?.profileStatus ?? conversation.lastSeenLabel}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Appel vidéo"
                hitSlop={theme.accessibility.hitSlop}
                onPress={() => addCallRecord('video')}
                style={({ pressed }) => [styles.iconBare, pressed && styles.iconBarePressed]}
              >
                <Ionicons name="videocam-outline" size={24} color={palette.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Appel audio"
                hitSlop={theme.accessibility.hitSlop}
                onPress={() => addCallRecord('voice')}
                style={({ pressed }) => [styles.iconBare, pressed && styles.iconBarePressed]}
              >
                <Ionicons name="call-outline" size={21} color={palette.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Plus d'options"
                hitSlop={theme.accessibility.hitSlop}
                onPress={() => setMenuVisible(true)}
                style={({ pressed }) => [styles.iconBare, pressed && styles.iconBarePressed]}
              >
                <Ionicons name="ellipsis-vertical" size={20} color={palette.text} />
              </Pressable>
            </View>
          </View>

          <FlatList
            ref={listRef}
            data={listData}
            keyExtractor={(item) => item.message.id}
            inverted
            style={styles.list}
            contentContainerStyle={{
              paddingHorizontal: theme.spacing.md,
              paddingTop: listComposerClearance,
              paddingBottom: theme.spacing.md,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            onScroll={handleListScroll}
            scrollEventThrottle={32}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews
            renderItem={renderMessage}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Aucun message</Text>
                <Text style={styles.emptySubtitle}>Envoyez le premier message de cette discussion.</Text>
              </View>
            }
          />

          {showScrollDown ? (
            <Animated.View
              entering={FadeIn.duration(160)}
              exiting={FadeOut.duration(160)}
              style={[
                styles.scrollDownWrap,
                {
                  bottom:
                    dockContentHeight +
                    (isKeyboardVisible ? keyboardHeightJs : insets.bottom) +
                    4,
                },
              ]}
              pointerEvents="box-none"
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Revenir aux derniers messages"
                onPress={scrollToBottom}
                style={({ pressed }) => [
                  styles.scrollDownButton,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    shadowColor: palette.shadow,
                  },
                  pressed && styles.iconShellPressed,
                ]}
              >
                <Ionicons name="chevron-down" size={22} color={palette.activeStart} />
              </Pressable>
            </Animated.View>
          ) : null}

          <Animated.View
            style={[
              styles.composerDock,
              { backgroundColor: palette.background },
              composerDockStyle,
            ]}
          >
            {editingMessage ? (
              <View
                style={[
                  styles.replyBanner,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={[styles.replyAccent, { backgroundColor: theme.colors.warning }]} />
                <View style={styles.replyContent}>
                  <Text style={[styles.replyName, { color: theme.colors.warning }]} numberOfLines={1}>
                    Modifier le message
                  </Text>
                  <Text style={[styles.replyText, { color: palette.textMuted }]} numberOfLines={1}>
                    {editingMessage.text}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Annuler la modification"
                  hitSlop={theme.accessibility.hitSlop}
                  onPress={cancelEdit}
                  style={styles.replyClose}
                >
                  <Ionicons name="close" size={18} color={palette.textMuted} />
                </Pressable>
              </View>
            ) : null}

            {replyTarget ? (
              <View
                style={[
                  styles.replyBanner,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={[styles.replyAccent, { backgroundColor: palette.activeStart }]} />
                <View style={styles.replyContent}>
                  <Text style={[styles.replyName, { color: palette.activeStart }]} numberOfLines={1}>
                    Réponse à {replyTarget.senderName}
                  </Text>
                  <Text style={[styles.replyText, { color: palette.textMuted }]} numberOfLines={1}>
                    {replyTarget.text}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Annuler la réponse"
                  hitSlop={theme.accessibility.hitSlop}
                  onPress={() => setReplyTarget(null)}
                  style={styles.replyClose}
                >
                  <Ionicons name="close" size={18} color={palette.textMuted} />
                </Pressable>
              </View>
            ) : null}

            <InputBar
              dockMode
              value={draft}
              attachments={pendingAttachments}
              blocked={conversation.isBlocked}
              isRecording={isRecording}
              recordingDurationLabel={recordingDurationLabel}
              safeAreaBottom={insets.bottom}
              emojiPanelHeight={emojiPanelHeight}
              onChangeText={setDraft}
              onInsertSnippet={(value) => setDraft((current) => `${current}${current ? ' ' : ''}${value}`)}
              onAddAttachment={pushAttachment}
              onSendAttachment={handleSendAttachment}
              onRemoveAttachment={removeAttachment}
              onOpenAttachments={() => setAttachmentsVisible(true)}
              onOpenCamera={openCamera}
              onSend={handleSend}
              onStartVoiceRecording={handleStartVoiceRecording}
              onStopVoiceRecording={handleStopVoiceRecording}
              onCancelVoiceRecording={handleCancelVoiceRecording}
              onPanelVisibilityChange={setEmojiPanelOpen}
            />
          </Animated.View>
        </View>

      <MessagingAttachmentSheet
        visible={attachmentsVisible}
        onClose={() => setAttachmentsVisible(false)}
        actions={[
          {
            label: 'Photo',
            icon: 'image',
            color: theme.colors.accent,
            onPress: () => openLibrary('photo'),
          },
          {
            label: 'Caméra',
            icon: 'camera',
            color: theme.colors.primary,
            onPress: openCamera,
          },
          {
            label: 'Vidéo',
            icon: 'videocam',
            color: theme.colors.secondaryDeep,
            onPress: () => openLibrary('video'),
          },
          {
            label: 'Document',
            icon: 'document-text',
            color: theme.colors.primaryDeep,
            onPress: addDocumentAttachment,
          },
          {
            label: 'Audio',
            icon: 'musical-notes',
            color: theme.colors.secondary,
            onPress: addAudioAttachment,
          },
          {
            label: 'Localisation',
            icon: 'location',
            color: theme.colors.warning,
            onPress: addLocationAttachment,
          },
          {
            label: 'Contact',
            icon: 'person',
            color: theme.colors.success,
            onPress: addContactAttachment,
          },
        ]}
      />

      <MessagingActionSheet
        title="Actions discussion"
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={[
          {
            label: 'Infos du contact ou du groupe',
            icon: 'person-circle-outline',
            onPress: openProfile,
          },
          {
            label: 'Appel audio',
            icon: 'call-outline',
            onPress: () => addCallRecord('voice'),
          },
          {
            label: 'Appel vidéo',
            icon: 'videocam-outline',
            onPress: () => addCallRecord('video'),
          },
          {
            label: 'Rechercher',
            icon: 'search-outline',
            onPress: () => navigation.navigate('ConversationSearch', { conversationId }),
          },
          {
            label: 'Médias, liens et docs',
            icon: 'images-outline',
            onPress: () => navigation.navigate('ConversationMedia', { conversationId }),
          },
          {
            label: 'Fichiers partagés',
            icon: 'folder-outline',
            onPress: () => navigation.navigate('ConversationMedia', { conversationId }),
          },
          {
            label: conversation.isMuted ? 'Réactiver les notifications' : 'Désactiver les notifications',
            icon: conversation.isMuted ? 'notifications-outline' : 'notifications-off-outline',
            onPress: () => toggleConversationMuted(conversationId),
          },
          {
            label: conversation.isPinned ? 'Désépingler la discussion' : 'Épingler la discussion',
            icon: conversation.isPinned ? 'pin' : 'pin-outline',
            onPress: () => toggleConversationPinned(conversationId),
          },
          {
            label: 'Fond de discussion',
            icon: 'color-palette-outline',
            onPress: () => navigation.navigate('WallpaperPicker', { conversationId }),
          },
          {
            label: conversation.isBlocked ? 'Débloquer' : 'Bloquer',
            icon: 'ban-outline',
            tone: 'danger',
            onPress: () => toggleConversationBlocked(conversationId),
          },
          {
            label: 'Signaler',
            icon: 'flag-outline',
            tone: 'danger',
            onPress: () =>
              Alert.alert('Signaler la discussion', 'Merci, notre équipe va examiner ce signalement.'),
          },
          {
            label: 'Supprimer la discussion',
            icon: 'trash-outline',
            tone: 'danger',
            onPress: () =>
              Alert.alert('Supprimer la discussion', 'Cette action est définitive pour vous.', [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Supprimer',
                  style: 'destructive',
                  onPress: () => {
                    deleteConversation(conversationId);
                    navigation.goBack();
                  },
                },
              ]),
          },
        ]}
      />

      <Modal
        transparent
        visible={avatarPreviewVisible}
        animationType="fade"
        onRequestClose={() => setAvatarPreviewVisible(false)}
      >
        <View style={[styles.avatarPreviewOverlay, { backgroundColor: palette.overlay }]}>
          <Pressable
            onPress={() => setAvatarPreviewVisible(false)}
            style={[
              styles.avatarPreviewClose,
              { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
            ]}
          >
            <Ionicons name="close" size={20} color={palette.text} />
          </Pressable>

          <Pressable onPress={openProfile} style={styles.avatarPreviewCard}>
            {conversation.avatar ? (
              <Image source={{ uri: conversation.avatar }} style={styles.avatarPreviewImage} />
            ) : (
              <View
                style={[
                  styles.avatarFallbackWrap,
                  {
                    backgroundColor: palette.surfaceElevated,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Avatar
                  label={conversationTitle}
                  uri={conversation.avatar}
                  color={conversation.avatarColor}
                  kind={conversation.kind}
                  participantIds={conversation.participantIds}
                  size={140}
                  presence={conversation.kind === 'direct' ? conversation.presence : undefined}
                  verified={conversation.isVerified}
                />
              </View>
            )}
            <Text style={[styles.avatarPreviewTitle, { color: theme.colors.white }]}>
              {conversationTitle}
            </Text>
            <Text style={[styles.avatarPreviewSubtitle, { color: 'rgba(255,255,255,0.72)' }]}>
              Toucher pour ouvrir le profil
            </Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        transparent
        visible={selectedMessage !== null}
        animationType="fade"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <View style={styles.messageOverlay}>
          <BlurView
            intensity={palette.isDark ? 38 : 26}
            tint={palette.isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={[StyleSheet.absoluteFill, styles.messageOverlayTint]}
            onPress={() => setSelectedMessage(null)}
          />

          <Animated.View
            entering={FadeIn.duration(180)}
            style={[
              styles.floatingReactionBar,
              {
                backgroundColor: palette.menuBackground,
                borderColor: palette.border,
                shadowColor: palette.shadow,
              },
            ]}
          >
            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => reactToMessage(emoji)}
                style={({ pressed }) => [
                  styles.floatingReactionChip,
                  pressed && styles.floatingReactionChipPressed,
                ]}
              >
                <Text style={styles.floatingReactionEmoji}>{emoji}</Text>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toutes les réactions"
              onPress={() => setEmojiPickerVisible(true)}
              style={({ pressed }) => [
                styles.floatingReactionMore,
                { backgroundColor: palette.surfaceMuted },
                pressed && styles.floatingReactionChipPressed,
              ]}
            >
              <Ionicons name="add" size={18} color={palette.activeStart} />
            </Pressable>
          </Animated.View>

          <View
            style={[
              styles.messageSheet,
              styles.messageSheetPlacement,
              { backgroundColor: palette.menuBackground, borderColor: palette.border },
            ]}
          >
            {selectedMessage?.text ? (
              <View
                style={[
                  styles.messagePreview,
                  { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.messagePreviewText, { color: palette.text }]} numberOfLines={3}>
                  {selectedMessage.text}
                </Text>
              </View>
            ) : null}

            {([
              {
                label: 'Répondre',
                icon: 'arrow-undo-outline',
                onPress: () => selectedMessage && quoteMessage(selectedMessage),
              },
              {
                label: 'Copier',
                icon: 'copy-outline',
                onPress: () => selectedMessage && copyMessage(selectedMessage),
              },
              {
                label: 'Partager',
                icon: 'share-social-outline',
                onPress: () => selectedMessage && shareMessage(selectedMessage),
              },
              {
                label: 'Transférer',
                icon: 'arrow-redo-outline',
                onPress: () => selectedMessage && forwardSelectedMessage(selectedMessage),
              },
              ...(selectedMessage &&
              selectedMessage.senderId === currentUserId &&
              selectedMessage.text.trim().length > 0
                ? [
                    {
                      label: 'Modifier',
                      icon: 'create-outline',
                      onPress: () => selectedMessage && startEditMessage(selectedMessage),
                    },
                  ]
                : []),
              {
                label: selectedMessage?.isStarred ? 'Retirer des enregistrements' : 'Enregistrer',
                icon: selectedMessage?.isStarred ? 'star' : 'star-outline',
                onPress: () => selectedMessage && starMessage(selectedMessage),
              },
              {
                label: 'Supprimer',
                icon: 'trash-outline',
                destructive: true,
                onPress: () => selectedMessage && removeMessage(selectedMessage),
              },
            ] as Array<{
              label: string;
              icon: keyof typeof Ionicons.glyphMap;
              destructive?: boolean;
              onPress: () => void;
            }>).map((item, index, array) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={[
                  styles.sheetRow,
                  index !== array.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: palette.divider,
                  },
                ]}
              >
                <View
                  style={[
                    styles.sheetIcon,
                    {
                      backgroundColor: item.destructive
                        ? 'rgba(229,82,82,0.12)'
                        : palette.surfaceMuted,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={item.destructive ? theme.colors.danger : palette.activeStart}
                  />
                </View>
                <Text
                  style={[
                    styles.sheetRowText,
                    { color: item.destructive ? theme.colors.danger : palette.text },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <EmojiPicker
        open={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        onEmojiSelected={(emoji) => reactWithCustomEmoji(emoji.emoji)}
        enableSearchBar
        categoryPosition="top"
        theme={
          palette.isDark
            ? {
                backdrop: 'rgba(8,12,22,0.6)',
                knob: palette.activeStart,
                container: palette.menuBackground,
                header: palette.text,
                category: {
                  icon: palette.textMuted,
                  iconActive: palette.activeStart,
                  container: palette.surfaceMuted,
                  containerActive: palette.surfaceStrong,
                },
              }
            : undefined
        }
      />
    </SafeAreaView>
  );
}

function buildListData(messages: ReturnType<typeof useConversationMessages>) {
  const reversed = [...messages].reverse();

  return reversed.map((message, index) => {
    const nextMessage = reversed[index + 1];
    const nextIsSameSender = nextMessage?.senderId === message.senderId;
    const nextIsSameDay =
      nextMessage?.createdAt.toDateString() === message.createdAt.toDateString();

    return {
      message,
      showSenderAvatar: !nextIsSameSender || !nextIsSameDay,
      showDayDivider:
        !nextMessage ||
        nextMessage.createdAt.toDateString() !== message.createdAt.toDateString(),
    };
  });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  threadWash: {
    ...StyleSheet.absoluteFillObject,
  },
  chatGlow: {
    position: 'absolute',
    top: -80,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  chatGlowSecondary: {
    position: 'absolute',
    right: -48,
    bottom: 160,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.5,
  },
  textureOrb: {
    position: 'absolute',
    top: 110,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.3,
  },
  header: {
    minHeight: 48,
    paddingLeft: messagingSpacing.xs,
    paddingRight: theme.spacing.sm,
    paddingBottom: messagingSpacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBack: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBare: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBarePressed: {
    opacity: 0.55,
  },
  headerIdentity: {
    flex: 1,
    marginLeft: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTextWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconShell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShellPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
  searchBar: {
    marginHorizontal: theme.spacing.md,
    marginBottom: messagingSpacing.md,
    minHeight: 52,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
  },
  list: {
    flex: 1,
  },
  composerDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 20,
  },
  scrollDownWrap: {
    position: 'absolute',
    right: theme.spacing.md,
    zIndex: 15,
  },
  scrollDownButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  dayDividerWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dayDividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surfaceStrong,
    borderRadius: theme.radii.round,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emptyState: {
    marginTop: theme.spacing.xxl,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    ...theme.typography.title3,
  },
  emptySubtitle: {
    ...theme.typography.bodyMuted,
    textAlign: 'center',
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  missingTitle: {
    ...theme.typography.title2,
  },
  backPrimary: {
    minHeight: 50,
    minWidth: 128,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  backPrimaryText: {
    color: theme.colors.white,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.24)',
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
  },
  messageOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  floatingReactionBar: {
    position: 'absolute',
    alignSelf: 'center',
    top: '36%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  floatingReactionChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingReactionChipPressed: {
    transform: [{ scale: 1.14 }],
  },
  floatingReactionEmoji: {
    fontSize: 24,
  },
  floatingReactionMore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  messageOverlayTint: {
    backgroundColor: 'rgba(8, 12, 22, 0.18)',
  },
  messageSheetPlacement: {
    marginBottom: theme.spacing.xs,
  },
  sheet: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 6,
    ...theme.shadows.floating,
  },
  sheetTitle: {
    ...theme.typography.title3,
    marginBottom: theme.spacing.xs,
  },
  sheetRow: {
    minHeight: 48,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sheetIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetRowText: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  avatarPreviewOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  avatarPreviewClose: {
    position: 'absolute',
    top: 56,
    right: theme.spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  avatarPreviewCard: {
    alignItems: 'center',
    gap: messagingSpacing.sm,
  },
  avatarPreviewImage: {
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  avatarFallbackWrap: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreviewTitle: {
    ...theme.typography.title2,
    marginTop: messagingSpacing.md,
  },
  avatarPreviewSubtitle: {
    ...theme.typography.bodyMuted,
  },
  messageSheet: {
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    gap: 2,
    ...theme.shadows.floating,
  },
  replyBanner: {
    marginHorizontal: theme.spacing.md,
    marginBottom: 2,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyAccent: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  replyContent: {
    flex: 1,
    gap: 2,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '800',
  },
  replyText: {
    ...theme.typography.bodyMuted,
    fontSize: 13,
  },
  replyClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagePreview: {
    borderRadius: 18,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  messagePreviewText: {
    ...theme.typography.body,
    lineHeight: 20,
  },
});
