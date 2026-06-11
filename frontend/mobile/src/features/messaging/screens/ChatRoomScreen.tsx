import React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import theme from '../../../theme';
import { useMessagesStore } from '../../../store/messagesStore';
import { useCallsStore } from '../../../store/callsStore';
import MessagingAvatar from '../components/MessagingAvatar';
import MessagingSheet from '../components/MessagingSheet';
import MessageComposer from '../components/MessageComposer';
import ChatBubble from '../components/ChatBubble';
import type { MessageAttachment } from '../types';
import { formatDayDivider } from '../utils/formatters';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MessagesStackParamList } from '../navigation/MessagesNavigator';

type Props = NativeStackScreenProps<MessagesStackParamList, 'ChatRoom'>;
type FlashMode = 'auto' | 'on' | 'off';
type CaptureMode = 'photo' | 'video';

export default function ChatRoomScreen({ route, navigation }: Props) {
  const { conversationId } = route.params;
  const insets = useSafeAreaInsets();
  const currentUserId = useMessagesStore((state) => state.currentUserId);
  const contacts = useMessagesStore((state) => state.contacts);
  const conversation = useMessagesStore((state) => state.getConversationById(conversationId));
  const messages = useMessagesStore((state) => state.getMessages(conversationId));
  const sendMessage = useMessagesStore((state) => state.sendMessage);
  const setActiveConversation = useMessagesStore((state) => state.setActiveConversation);
  const markAsRead = useMessagesStore((state) => state.markAsRead);
  const toggleMuted = useMessagesStore((state) => state.toggleMuted);
  const toggleBlocked = useMessagesStore((state) => state.toggleBlocked);
  const deleteConversation = useMessagesStore((state) => state.deleteConversation);
  const [draft, setDraft] = React.useState('');
  const [pendingAttachments, setPendingAttachments] = React.useState<MessageAttachment[]>([]);
  const [chatMenuVisible, setChatMenuVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [attachmentsVisible, setAttachmentsVisible] = React.useState(false);
  const [cameraVisible, setCameraVisible] = React.useState(false);
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [flashMode, setFlashMode] = React.useState<FlashMode>('auto');
  const [captureMode, setCaptureMode] = React.useState<CaptureMode>('photo');
  const [cameraType, setCameraType] = React.useState(ImagePicker.CameraType.back);
  const listRef = React.useRef<FlatList>(null);

  React.useEffect(() => {
    setActiveConversation(conversationId);
    markAsRead(conversationId);

    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, markAsRead, setActiveConversation]);

  // ✅ Scroll au dernier message avec cleanup propre
  React.useEffect(() => {
    let frameId: number | null = null;

    if (messages.length > 0) {
      frameId = requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: false });
      });
    }

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [messages.length]);

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

  const filteredMessages = searchQuery.trim()
    ? messages.filter((message) =>
        `${message.text} ${message.attachments.map((attachment) => attachment.label).join(' ')}`
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      )
    : messages;

  const handleSend = () => {
    if (!draft.trim() && pendingAttachments.length === 0) {
      return;
    }

    sendMessage({
      conversationId,
      text: draft,
      attachments: pendingAttachments,
    });
    setDraft('');
    setPendingAttachments([]);
  };

  const handleVoiceNote = () => {
    sendMessage({
      conversationId,
      attachments: [
        {
          id: `audio_${Date.now()}`,
          type: 'audio',
          label: 'Voice note',
          durationLabel: '00:18',
          accentColor: theme.colors.secondaryDeep,
        },
      ],
    });
  };

  const addAttachment = (attachment: MessageAttachment) => {
    setPendingAttachments((current) => [...current, attachment]);
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission requise', 'Autorisez l acces a la galerie pour joindre des medias.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: captureMode === 'video' ? ['videos'] : ['images'],
      allowsEditing: captureMode === 'photo',
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      addAttachment({
        id: `gallery_${Date.now()}`,
        type: asset.type === 'video' ? 'video' : 'image',
        uri: asset.uri,
        label: asset.fileName ?? (asset.type === 'video' ? 'Video campus' : 'Photo campus'),
        sizeLabel: asset.fileSize
          ? `${Math.max(1, Math.round(asset.fileSize / 1024 / 1024))} MB`
          : undefined,
      });
    }

    setAttachmentsVisible(false);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission requise', 'Autorisez la camera pour capturer un media.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: captureMode === 'video' ? ['videos'] : ['images'],
      allowsEditing: captureMode === 'photo',
      quality: 0.8,
      cameraType,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      addAttachment({
        id: `camera_${Date.now()}`,
        type: asset.type === 'video' ? 'video' : 'image',
        uri: asset.uri,
        label: asset.fileName ?? (asset.type === 'video' ? 'Capture video' : 'Capture photo'),
        sizeLabel: asset.fileSize
          ? `${Math.max(1, Math.round(asset.fileSize / 1024 / 1024))} MB`
          : undefined,
      });
    }

    setCameraVisible(false);
  };

  const sendDocumentStub = () => {
    addAttachment({
      id: `doc_${Date.now()}`,
      type: 'document',
      label: 'Projet-messaging-spec.pdf',
      sizeLabel: '2 MB',
      accentColor: theme.colors.primaryDeep,
    });
    setAttachmentsVisible(false);
  };

  const sendContactStub = () => {
    const targetContact = contacts.find((item) => item.id === conversation.participantIds[0]) ?? contacts[0];

    if (!targetContact) {
      return;
    }

    addAttachment({
      id: `contact_${Date.now()}`,
      type: 'contact',
      label: targetContact.name,
      contactId: targetContact.id,
      accentColor: targetContact.avatarColor,
    });
    setAttachmentsVisible(false);
  };

  const addCallRecord = (callType: 'voice' | 'video') => {
    useCallsStore.getState().addCall({
      id: `call_${Date.now()}`,
      participantId: conversation.id,
      participantName: conversation.title,
      participantAvatar: conversation.avatar,
      type: 'outgoing',
      callType,
      timestamp: new Date(),
    });

    Alert.alert(
      callType === 'voice' ? 'Appel audio' : 'Appel video',
      'Interaction prete pour integration RTC/WebRTC.'
    );
  };

  const renderMessage = ({ item, index }: { item: typeof filteredMessages[number]; index: number }) => {
    const previous = filteredMessages[index - 1];
    const showDayDivider =
      !previous ||
      previous.createdAt.toDateString() !== item.createdAt.toDateString();

    return (
      <View>
        {showDayDivider ? (
          <View style={styles.dayDividerWrap}>
            <Text style={styles.dayDividerText}>{formatDayDivider(item.createdAt)}</Text>
          </View>
        ) : null}

        <ChatBubble
          message={item}
          conversation={conversation}
          contacts={contacts}
          currentUserId={currentUserId}
          index={index}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>

          <Pressable onPress={() => setProfileVisible(true)} style={styles.headerIdentity}>
            <MessagingAvatar
              uri={conversation.avatar}
              label={conversation.title}
              color={conversation.avatarColor}
              kind={conversation.kind}
              online={conversation.presence === 'online' && conversation.kind === 'direct'}
              verified={conversation.isVerified}
              size={48}
            />
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {conversation.title}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {conversation.typingLabel ?? conversation.lastSeenLabel}
              </Text>
            </View>
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable onPress={() => addCallRecord('voice')} style={styles.iconShell}>
              <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
            </Pressable>
            <Pressable onPress={() => addCallRecord('video')} style={styles.iconShell}>
              <Ionicons name="videocam-outline" size={20} color={theme.colors.primary} />
            </Pressable>
            <Pressable onPress={() => setChatMenuVisible(true)} style={styles.iconShell}>
              <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>

        {searchVisible ? (
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher dans la discussion"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.searchInput}
            />
            <Pressable onPress={() => setSearchVisible(false)}>
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </Pressable>
          </View>
        ) : null}

        <FlatList
          ref={listRef}
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        <MessageComposer
          value={draft}
          onChangeText={setDraft}
          blocked={conversation.isBlocked}
          attachments={pendingAttachments}
          onRemoveAttachment={(attachmentId) =>
            setPendingAttachments((current) =>
              current.filter((attachment) => attachment.id !== attachmentId)
            )
          }
          onOpenAttachments={() => setAttachmentsVisible(true)}
          onOpenCamera={() => setCameraVisible(true)}
          onSend={handleSend}
          onVoiceNote={handleVoiceNote}
          onInsertSnippet={(value) => setDraft((current) => `${current} ${value}`.trim())}
        />
      </View>

      <MessagingSheet
        visible={attachmentsVisible}
        title="Pieces jointes"
        subtitle="Galerie, camera, documents ou contact"
        onClose={() => setAttachmentsVisible(false)}
        options={[
          { key: 'gallery', label: 'Galerie', icon: 'images-outline', onPress: openGallery },
          {
            key: 'camera',
            label: 'Camera',
            icon: 'camera-outline',
            onPress: () => {
              setAttachmentsVisible(false);
              setCameraVisible(true);
            },
          },
          {
            key: 'document',
            label: 'Documents',
            icon: 'document-outline',
            onPress: sendDocumentStub,
          },
          { key: 'contact', label: 'Contact', icon: 'person-outline', onPress: sendContactStub },
        ]}
      />

      <MessagingSheet
        visible={chatMenuVisible}
        title="Options conversation"
        subtitle={conversation.title}
        onClose={() => setChatMenuVisible(false)}
        options={[
          {
            key: 'profile',
            label: 'Voir profil',
            icon: 'person-circle-outline',
            onPress: () => setProfileVisible(true),
          },
          {
            key: 'search',
            label: 'Rechercher',
            icon: 'search-outline',
            onPress: () => setSearchVisible(true),
          },
          {
            key: 'notifications',
            label: conversation.isMuted ? 'Reactiver notifications' : 'Couper notifications',
            icon: conversation.isMuted ? 'notifications-outline' : 'notifications-off-outline',
            onPress: () => toggleMuted(conversationId),
          },
          {
            key: 'block',
            label: conversation.isBlocked ? 'Debloquer' : 'Bloquer',
            icon: 'ban-outline',
            onPress: () => toggleBlocked(conversationId),
          },
          {
            key: 'delete',
            label: 'Supprimer discussion',
            icon: 'trash-outline',
            tone: 'danger',
            onPress: () => {
              deleteConversation(conversationId);
              navigation.goBack();
            },
          },
        ]}
      />

      <MessagingSheet
        visible={profileVisible}
        title="Profil discussion"
        subtitle={conversation.about}
        onClose={() => setProfileVisible(false)}
        options={[
          {
            key: 'audio',
            label: 'Appel audio',
            icon: 'call-outline',
            onPress: () => addCallRecord('voice'),
          },
          {
            key: 'video',
            label: 'Appel video',
            icon: 'videocam-outline',
            onPress: () => addCallRecord('video'),
          },
          {
            key: 'favorite',
            label: 'Basculer favori',
            icon: 'star-outline',
            onPress: () => useMessagesStore.getState().toggleFavorite(conversationId),
          },
        ]}
      >
        <View style={styles.profileCard}>
          <MessagingAvatar
            uri={conversation.avatar}
            label={conversation.title}
            color={conversation.avatarColor}
            kind={conversation.kind}
            online={conversation.presence === 'online' && conversation.kind === 'direct'}
            verified={conversation.isVerified}
            size={76}
          />
          <View style={styles.profileText}>
            <Text style={styles.profileTitle}>{conversation.title}</Text>
            <Text style={styles.profileSubtitle}>{conversation.lastSeenLabel}</Text>
            <Text style={styles.profileAbout}>{conversation.about}</Text>
          </View>
        </View>
      </MessagingSheet>

      <MessagingSheet
        visible={cameraVisible}
        title="Camera integree"
        subtitle="Photo, video, galerie et reglages rapides"
        onClose={() => setCameraVisible(false)}
        options={[
          {
            key: 'capture',
            label: captureMode === 'photo' ? 'Capturer maintenant' : 'Filmer maintenant',
            icon: captureMode === 'photo' ? 'camera' : 'videocam',
            onPress: openCamera,
          },
          {
            key: 'gallery',
            label: 'Acces galerie',
            icon: 'images-outline',
            onPress: openGallery,
          },
        ]}
      >
        <View style={styles.cameraPanel}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cameraControls}
          >
            <Pressable
              onPress={() => setCaptureMode('photo')}
              style={[styles.cameraChip, captureMode === 'photo' && styles.cameraChipActive]}
            >
              <Text
                style={[
                  styles.cameraChipText,
                  captureMode === 'photo' && styles.cameraChipTextActive,
                ]}
              >
                Photo
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setCaptureMode('video')}
              style={[styles.cameraChip, captureMode === 'video' && styles.cameraChipActive]}
            >
              <Text
                style={[
                  styles.cameraChipText,
                  captureMode === 'video' && styles.cameraChipTextActive,
                ]}
              >
                Video
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setCameraType((current) =>
                  current === ImagePicker.CameraType.back
                    ? ImagePicker.CameraType.front
                    : ImagePicker.CameraType.back
                )
              }
              style={styles.cameraChip}
            >
              <Text style={styles.cameraChipText}>
                {cameraType === ImagePicker.CameraType.back ? 'Camera arriere' : 'Camera avant'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setFlashMode((current) =>
                  current === 'auto' ? 'on' : current === 'on' ? 'off' : 'auto'
                )
              }
              style={styles.cameraChip}
            >
              <Text style={styles.cameraChipText}>Flash {flashMode}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </MessagingSheet>

      <View style={{ height: Math.max(insets.bottom - 4, 0) }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTextWrap: {
    flex: 1,
    gap: 3,
  },
  headerTitle: {
    ...theme.typography.title3,
    fontSize: 16,
  },
  headerSubtitle: {
    ...theme.typography.bodyMuted,
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconShell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: 52,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
  },
  messagesContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  dayDividerWrap: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  dayDividerText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.round,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceMuted,
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  profileTitle: {
    ...theme.typography.title3,
  },
  profileSubtitle: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  profileAbout: {
    ...theme.typography.bodyMuted,
  },
  cameraPanel: {
    gap: theme.spacing.sm,
  },
  cameraControls: {
    gap: theme.spacing.sm,
  },
  cameraChip: {
    minHeight: 38,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraChipActive: {
    backgroundColor: theme.colors.primary,
  },
  cameraChipText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  cameraChipTextActive: {
    color: theme.colors.white,
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  missingTitle: {
    ...theme.typography.title3,
  },
  backPrimary: {
    minWidth: 110,
    minHeight: 48,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPrimaryText: {
    color: theme.colors.white,
    fontWeight: '800',
  },
});
