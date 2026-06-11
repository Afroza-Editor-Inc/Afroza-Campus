export type ConversationKind = 'direct' | 'group' | 'community' | 'channel';

export type ConversationFilter = 'all' | 'unread' | 'favorites' | 'groups' | 'channels';

export type PresenceState = 'online' | 'offline' | 'away';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type AttachmentType =
  | 'text'
  | 'image'
  | 'audio'
  | 'document'
  | 'contact'
  | 'location'
  | 'video'
  | 'gif'
  | 'sticker';

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
}

export interface MessageAttachment {
  id: string;
  type: AttachmentType;
  uri?: string;
  label: string;
  sizeLabel?: string;
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
  isMuted: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  presence: PresenceState;
  lastSeenLabel: string;
  updatedAt: Date;
  previewText: string;
  typingLabel?: string;
}

export interface CreateContactPayload {
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
}

export interface CreateGroupPayload {
  title: string;
  participantIds: string[];
  avatar?: string;
}
