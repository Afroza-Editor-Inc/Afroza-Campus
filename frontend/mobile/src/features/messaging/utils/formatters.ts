import type { ChatMessage, ConversationKind, MessageAttachment, MessagingContact, MessagingConversation } from '../types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function formatConversationTime(date: Date) {
  const now = Date.now();
  const diff = now - date.getTime();

  if (diff < DAY_IN_MS) {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (diff < DAY_IN_MS * 2) {
    return 'Hier';
  }

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function formatMessageTime(date: Date) {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDayDivider(date: Date) {
  const now = new Date();
  const sameDay =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  if (sameDay) {
    return 'Aujourd hui';
  }

  const yesterday = new Date(Date.now() - DAY_IN_MS);
  const isYesterday =
    yesterday.getDate() === date.getDate() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getFullYear() === date.getFullYear();

  if (isYesterday) {
    return 'Hier';
  }

  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function getInitials(label: string) {
  return label
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function kindLabel(kind: ConversationKind) {
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

export function kindIcon(kind: ConversationKind) {
  switch (kind) {
    case 'group':
      return 'people';
    case 'community':
      return 'layers';
    case 'channel':
      return 'megaphone';
    default:
      return 'person';
  }
}

export function attachmentSummary(attachment: MessageAttachment) {
  switch (attachment.type) {
    case 'image':
      return 'Photo';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Audio';
    case 'contact':
      return `Contact: ${attachment.label}`;
    case 'document':
    default:
      return attachment.label;
  }
}

export function buildMessagePreview(message: ChatMessage | undefined) {
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
    return attachmentSummary(message.attachments[0]);
  }

  return 'Message';
}

export function conversationStatusLabel(conversation: MessagingConversation) {
  if (conversation.kind === 'channel') {
    return conversation.lastSeenLabel;
  }

  if (conversation.typingLabel) {
    return conversation.typingLabel;
  }

  return conversation.lastSeenLabel;
}

export function senderNameForMessage(
  message: ChatMessage,
  contacts: MessagingContact[],
  currentUserId: string
) {
  if (message.senderId === currentUserId) {
    return 'Vous';
  }

  return contacts.find((contact) => contact.id === message.senderId)?.firstName ?? 'Membre';
}
