export type ConversationKind = 'direct' | 'group' | 'community' | 'channel';

export type ConversationCategory = 'all' | 'unread' | 'favorites' | 'groups' | 'channels';

export type PresenceState = 'online' | 'offline' | 'away';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type AttachmentType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'contact'
  | 'location'
  | 'gif'
  | 'sticker';

export type CameraMode = 'photo' | 'video';

export type CameraFlashMode = 'auto' | 'on' | 'off';

export type NotificationPreference = 'all' | 'mentions' | 'muted';

export type MediaVisibility = 'visible' | 'hidden';

export type DisappearingMode = 'off' | '24h' | '7d' | '90d';

export type ConversationMemberRole = 'owner' | 'admin' | 'member';

export type QrEntryMode = 'scan' | 'profile' | 'device';

export type EmojiPanelTab = 'emoji' | 'gif' | 'sticker';
export type WallpaperKey = 'lagoon' | 'sunrise' | 'midnight';

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface MessageReplyPreview {
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
  isMine: boolean;
}

export interface ConversationMember {
  contactId: string;
  role: ConversationMemberRole;
  joinedLabel: string;
}

export interface LinkedDevice {
  id: string;
  name: string;
  platform: string;
  browser: string;
  location: string;
  lastSeenLabel: string;
  isActive: boolean;
}

export interface MessagingContact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumber: string;
  countryCode: string;
  avatar?: string;
  avatarColor: string;
  isOnAfroza: boolean;
  isFavorite: boolean;
  isOnline: boolean;
  lastSeenLabel: string;
  roleLabel: string;
  about: string;
  profileStatus?: string;
  campusLabel?: string;
}

export interface MessageAttachment {
  id: string;
  type: AttachmentType;
  label: string;
  uri?: string;
  mimeType?: string;
  sizeBytes?: number;
  sizeLabel?: string;
  durationMs?: number;
  durationLabel?: string;
  contactId?: string;
  accentColor?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  attachments: MessageAttachment[];
  createdAt: Date;
  status: MessageStatus;
  isStarred?: boolean;
  reactions?: MessageReaction[];
  replyTo?: MessageReplyPreview;
  editedAt?: Date;
}

export interface MessagingConversation {
  id: string;
  title: string;
  kind: ConversationKind;
  participantIds: string[];
  avatar?: string;
  avatarColor: string;
  subtitle: string;
  about: string;
  memberCount?: number;
  unreadCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  presence: PresenceState;
  lastSeenLabel: string;
  updatedAt: Date;
  previewText: string;
  typingLabel?: string;
  description?: string;
  members?: ConversationMember[];
  notificationPreference?: NotificationPreference;
  mediaVisibility?: MediaVisibility;
  storageLabel?: string;
  encryptionLabel?: string;
  disappearingMode?: DisappearingMode;
  lockEnabled?: boolean;
  privacyLabel?: string;
  localNickname?: string;
  wallpaperKey?: WallpaperKey;
}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
}

export interface CreateGroupInput {
  title: string;
  participantIds: string[];
  avatar?: string;
}

export interface SendMessageInput {
  conversationId: string;
  text?: string;
  attachments?: MessageAttachment[];
  replyTo?: MessageReplyPreview;
}

export interface MessagingUiState {
  activeConversationId: string | null;
  conversationQuery: string;
  conversationCategory: ConversationCategory;
  isConversationSearchExpanded: boolean;
  emojiPanelTab: EmojiPanelTab;
  recentEmojis: string[];
  defaultWallpaperKey: WallpaperKey;
}

export interface ConversationCategoryItem {
  key: ConversationCategory;
  label: string;
  count: number;
}

export interface MessagingRealtimeAdapter {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTyping: (conversationId: string, isTyping: boolean) => Promise<void>;
  sendReadReceipt: (conversationId: string, messageId: string) => Promise<void>;
  subscribe: (listener: (event: string, payload: unknown) => void) => () => void;
}
