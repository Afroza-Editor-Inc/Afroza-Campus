import type {
  ChatMessage,
  ConversationCategory,
  ConversationKind,
  DisappearingMode,
  MessageAttachment,
  MediaVisibility,
  MessagingContact,
  MessagingConversation,
  NotificationPreference,
} from '../types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const CATEGORY_LABELS: Record<ConversationCategory, string> = {
  all: 'Tous',
  unread: 'Non lus',
  favorites: 'Favoris',
  groups: 'Groupes',
  channels: 'Canaux',
};

export function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

export function formatConversationTimestamp(date: Date) {
  const diff = Date.now() - date.getTime();

  if (diff < DAY_IN_MS) {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (diff < DAY_IN_MS * 2) {
    return 'Hier';
  }

  if (diff < DAY_IN_MS * 7) {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  }

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function formatMessageTimestamp(date: Date) {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDayDivider(date: Date) {
  const now = new Date();

  if (now.toDateString() === date.toDateString()) {
    return 'Aujourd hui';
  }

  const yesterday = new Date(Date.now() - DAY_IN_MS);

  if (yesterday.toDateString() === date.toDateString()) {
    return 'Hier';
  }

  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) {
    return undefined;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDuration(durationMs?: number) {
  if (!durationMs || durationMs <= 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function getInitials(label: string) {
  return label
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function getConversationKindLabel(kind: ConversationKind) {
  switch (kind) {
    case 'group':
      return 'Groupe';
    case 'community':
      return 'Communaute';
    case 'channel':
      return 'Canal';
    default:
      return 'Direct';
  }
}

export function getConversationDisplayTitle(conversation: MessagingConversation) {
  return conversation.localNickname?.trim() || conversation.title;
}

export function getNotificationPreferenceLabel(preference: NotificationPreference = 'all') {
  switch (preference) {
    case 'mentions':
      return 'Mentions seulement';
    case 'muted':
      return 'En sourdine';
    default:
      return 'Toutes les notifications';
  }
}

export function getMediaVisibilityLabel(visibility: MediaVisibility = 'visible') {
  return visibility === 'hidden' ? 'Masques dans la galerie' : 'Visibles dans la galerie';
}

export function getDisappearingModeLabel(mode: DisappearingMode = 'off') {
  switch (mode) {
    case '24h':
      return '24 heures';
    case '7d':
      return '7 jours';
    case '90d':
      return '90 jours';
    default:
      return 'Desactives';
  }
}

export function getConversationKindIcon(kind: ConversationKind) {
  switch (kind) {
    case 'group':
      return 'people-outline';
    case 'community':
      return 'layers-outline';
    case 'channel':
      return 'megaphone-outline';
    default:
      return 'person-outline';
  }
}

export function getAttachmentSummary(attachment: MessageAttachment) {
  switch (attachment.type) {
    case 'image':
      return attachment.label || 'Photo';
    case 'gif':
      return attachment.label || 'GIF';
    case 'sticker':
      return attachment.label || 'Sticker';
    case 'video':
      return attachment.label || 'Video';
    case 'audio':
      return attachment.label || 'Voice note';
    case 'contact':
      return `Contact: ${attachment.label}`;
    case 'location':
      return attachment.label || 'Localisation partagee';
    case 'document':
      return attachment.label || 'Document';
    default:
      return attachment.label || 'Message';
  }
}

export function buildMessagePreview(message?: ChatMessage) {
  if (!message) {
    return 'Demarrer une conversation';
  }

  if (message.text.trim().length > 0) {
    return message.text.trim();
  }

  if (message.attachments.length > 1) {
    return `${message.attachments.length} pieces jointes`;
  }

  if (message.attachments.length === 1) {
    return getAttachmentSummary(message.attachments[0]);
  }

  return 'Message';
}

export function getConversationStatusLabel(conversation: MessagingConversation) {
  if (conversation.typingLabel) {
    return conversation.typingLabel;
  }

  if (conversation.kind === 'channel') {
    return conversation.lastSeenLabel;
  }

  return conversation.previewText || conversation.lastSeenLabel;
}

export function getSenderLabel(
  message: ChatMessage,
  contacts: MessagingContact[],
  currentUserId: string
) {
  if (message.senderId === currentUserId) {
    return 'Vous';
  }

  return contacts.find((contact) => contact.id === message.senderId)?.firstName ?? 'Membre';
}

export function matchesConversationQuery(
  conversation: MessagingConversation,
  query: string,
  category: ConversationCategory
) {
  if (conversation.isArchived) {
    return false;
  }

  const normalizedQuery = normalizeText(query);
  const haystack = normalizeText(
    `${conversation.title} ${conversation.localNickname ?? ''} ${conversation.subtitle} ${conversation.about} ${conversation.description ?? ''} ${conversation.previewText}`
  );
  const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
  const matchesCategory =
    category === 'all' ||
    (category === 'unread' && conversation.unreadCount > 0) ||
    (category === 'favorites' && conversation.isFavorite) ||
    (category === 'groups' &&
      (conversation.kind === 'group' || conversation.kind === 'community')) ||
    (category === 'channels' && conversation.kind === 'channel');

  return matchesQuery && matchesCategory;
}

export function matchesContactQuery(contact: MessagingContact, query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  return normalizeText(`${contact.name} ${contact.roleLabel} ${contact.phoneNumber}`).includes(
    normalizedQuery
  );
}

export function getConversationCategoryCount(
  conversations: MessagingConversation[],
  category: ConversationCategory
) {
  if (category === 'all') {
    return conversations.length;
  }

  return conversations.filter((conversation) =>
    matchesConversationQuery(conversation, '', category)
  ).length;
}

export function buildConversationSort(left: MessagingConversation, right: MessagingConversation) {
  if (left.isPinned !== right.isPinned) {
    return left.isPinned ? -1 : 1;
  }

  return right.updatedAt.getTime() - left.updatedAt.getTime();
}

export function getMessageSearchText(message: ChatMessage) {
  return normalizeText(
    `${message.text} ${message.attachments.map((attachment) => getAttachmentSummary(attachment)).join(' ')}`
  );
}
