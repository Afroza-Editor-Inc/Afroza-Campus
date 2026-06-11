import { create } from 'zustand';
import {
  buildConversationSort,
  buildMessagePreview,
  matchesConversationQuery,
} from '../services/formatters';
import {
  CURRENT_USER_ID,
  seedConnectedDevices,
  seedContacts,
  seedConversations,
  seedMessagesByConversation,
} from '../services/mockData';
import type {
  ChatMessage,
  ConversationCategory,
  ConversationMemberRole,
  CreateContactInput,
  CreateGroupInput,
  DisappearingMode,
  EmojiPanelTab,
  LinkedDevice,
  MediaVisibility,
  MessageAttachment,
  MessagingContact,
  MessagingConversation,
  MessagingUiState,
  NotificationPreference,
  SendMessageInput,
  WallpaperKey,
} from '../types';

type DeliveryStatus = Extract<ChatMessage['status'], 'sent' | 'delivered' | 'read'>;

type MessagingState = {
  currentUserId: string;
  contacts: MessagingContact[];
  conversations: MessagingConversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  connectedDevices: LinkedDevice[];
  ui: MessagingUiState;
  setConversationCategory: (category: ConversationCategory) => void;
  setConversationQuery: (query: string) => void;
  setConversationSearchExpanded: (expanded: boolean) => void;
  setEmojiPanelTab: (tab: EmojiPanelTab) => void;
  pushRecentEmoji: (emoji: string) => void;
  setDefaultWallpaperKey: (wallpaperKey: WallpaperKey) => void;
  setActiveConversation: (conversationId: string | null) => void;
  getConversationById: (conversationId: string) => MessagingConversation | undefined;
  getMessagesByConversation: (conversationId: string) => ChatMessage[];
  getMessages: (conversationId: string) => ChatMessage[];
  getFilteredConversations: (
    category?: ConversationCategory,
    query?: string
  ) => MessagingConversation[];
  openDirectConversation: (contactId: string) => string;
  createCommunityConversation: () => string;
  createContact: (input: CreateContactInput) => string;
  createGroupConversation: (input: CreateGroupInput) => string;
  sendMessage: (input: SendMessageInput) => void;
  markConversationRead: (conversationId: string) => void;
  markConversationUnread: (conversationId: string) => void;
  markAllConversationsRead: () => void;
  toggleConversationFavorite: (conversationId: string) => void;
  toggleConversationPinned: (conversationId: string) => void;
  toggleConversationArchived: (conversationId: string) => void;
  toggleConversationMuted: (conversationId: string) => void;
  toggleConversationBlocked: (conversationId: string) => void;
  cycleConversationNotifications: (conversationId: string) => void;
  toggleConversationMediaVisibility: (conversationId: string) => void;
  cycleConversationDisappearingMode: (conversationId: string) => void;
  toggleConversationLock: (conversationId: string) => void;
  setConversationWallpaper: (
    conversationId: string,
    wallpaperKey: MessagingConversation['wallpaperKey']
  ) => void;
  renameConversationLocal: (conversationId: string, localNickname: string) => void;
  addConversationMembers: (conversationId: string, contactIds: string[]) => void;
  removeConversationMember: (conversationId: string, contactId: string) => void;
  updateConversationMemberRole: (
    conversationId: string,
    contactId: string,
    role: ConversationMemberRole
  ) => void;
  toggleMessageStarred: (conversationId: string, messageId: string) => void;
  toggleMessageReaction: (conversationId: string, messageId: string, emoji: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  editMessage: (conversationId: string, messageId: string, text: string) => void;
  forwardMessage: (targetConversationId: string, message: ChatMessage) => void;
  getStarredMessages: () => Array<{ conversation: MessagingConversation; message: ChatMessage }>;
  connectDevice: (deviceName?: string) => string;
  disconnectDevice: (deviceId: string) => void;
  deleteConversation: (conversationId: string) => void;
  markAsRead: (conversationId: string) => void;
  markAllAsRead: () => void;
  toggleFavorite: (conversationId: string) => void;
  togglePinned: (conversationId: string) => void;
  toggleArchived: (conversationId: string) => void;
  markUnread: (conversationId: string) => void;
  toggleMuted: (conversationId: string) => void;
  toggleBlocked: (conversationId: string) => void;
};

const replyTimers = new Map<string, ReturnType<typeof setTimeout>>();
const deliveryTimers = new Map<string, ReturnType<typeof setTimeout>[]>();

const replyPool = {
  direct: [
    'Bien recu. Je te fais un retour juste apres le cours.',
    'Top. On avance la-dessus cet apres-midi.',
    'Parfait, envoie et je prends la suite.',
  ],
  group: [
    'Je prends la tache UI.',
    'Ok pour moi, on verrouille cette version.',
    'Je viens de relire, ca me semble solide.',
  ],
  community: [
    'Bonne idee, on peut l annoncer dans le hub.',
    'Je relaie ca a la commu tout de suite.',
    'On peut organiser un thread dedie a ce sujet.',
  ],
};

function sortConversations(conversations: MessagingConversation[]) {
  return [...conversations].sort(buildConversationSort);
}

function updateConversation(
  conversations: MessagingConversation[],
  conversationId: string,
  updater: (conversation: MessagingConversation) => MessagingConversation
) {
  return sortConversations(
    conversations.map((conversation) =>
      conversation.id === conversationId ? updater(conversation) : conversation
    )
  );
}

function nextConversationId(prefix: string) {
  return `${prefix}_${Date.now()}`;
}

const NOTIFICATION_SEQUENCE: NotificationPreference[] = ['all', 'mentions', 'muted'];
const DISAPPEARING_SEQUENCE: DisappearingMode[] = ['off', '24h', '7d', '90d'];

function cycleItem<T>(items: readonly T[], currentValue: T | undefined, fallback: T) {
  const currentIndex = items.indexOf(currentValue ?? fallback);

  if (currentIndex === -1) {
    return fallback;
  }

  return items[(currentIndex + 1) % items.length];
}

function createConversationDefaults(
  kind: MessagingConversation['kind'],
  defaultWallpaperKey: WallpaperKey = 'lagoon'
) {
  return {
    notificationPreference: 'all' as NotificationPreference,
    mediaVisibility: 'visible' as MediaVisibility,
    storageLabel: kind === 'direct' ? '320 MB' : '1.4 GB',
    encryptionLabel: 'Chiffrement de bout en bout actif',
    disappearingMode: 'off' as DisappearingMode,
    lockEnabled: false,
    privacyLabel:
      kind === 'direct' ? 'Visible pour vos contacts' : 'Parametres reserves aux admins',
    wallpaperKey: defaultWallpaperKey,
  };
}

function buildOutgoingMessage(input: SendMessageInput, currentUserId: string): ChatMessage {
  return {
    id: `message_${Date.now()}`,
    conversationId: input.conversationId,
    senderId: currentUserId,
    text: input.text?.trim() ?? '',
    attachments: input.attachments ?? [],
    createdAt: new Date(),
    status: 'sending',
    replyTo: input.replyTo,
  };
}

function patchMessageStatus(
  messagesByConversation: Record<string, ChatMessage[]>,
  conversationId: string,
  messageId: string,
  status: DeliveryStatus
) {
  return {
    ...messagesByConversation,
    [conversationId]: (messagesByConversation[conversationId] ?? []).map((message) =>
      message.id === messageId ? { ...message, status } : message
    ),
  };
}

function clearConversationTimers(conversationId: string) {
  const replyTimer = replyTimers.get(conversationId);

  if (replyTimer) {
    clearTimeout(replyTimer);
    replyTimers.delete(conversationId);
  }
}

function clearMessageTimers(messageId: string) {
  const timers = deliveryTimers.get(messageId);

  if (!timers) {
    return;
  }

  timers.forEach(clearTimeout);
  deliveryTimers.delete(messageId);
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  currentUserId: CURRENT_USER_ID,
  contacts: seedContacts,
  conversations: sortConversations(seedConversations),
  messagesByConversation: seedMessagesByConversation,
  connectedDevices: seedConnectedDevices,
  ui: {
    activeConversationId: null,
    conversationQuery: '',
    conversationCategory: 'all',
    isConversationSearchExpanded: false,
    emojiPanelTab: 'emoji',
    recentEmojis: ['👍', '❤️', '😂', '🎓'],
    defaultWallpaperKey: 'lagoon',
  },

  setConversationCategory: (conversationCategory) =>
    set((state) => ({
      ui: {
        ...state.ui,
        conversationCategory,
      },
    })),

  setConversationQuery: (conversationQuery) =>
    set((state) => ({
      ui: {
        ...state.ui,
        conversationQuery,
      },
    })),

  setConversationSearchExpanded: (isConversationSearchExpanded) =>
    set((state) => ({
      ui: {
        ...state.ui,
        isConversationSearchExpanded,
      },
    })),

  setEmojiPanelTab: (emojiPanelTab) =>
    set((state) => ({
      ui: {
        ...state.ui,
        emojiPanelTab,
      },
    })),

  pushRecentEmoji: (emoji) =>
    set((state) => ({
      ui: {
        ...state.ui,
        recentEmojis: [emoji, ...state.ui.recentEmojis.filter((item) => item !== emoji)].slice(0, 18),
      },
    })),

  setDefaultWallpaperKey: (defaultWallpaperKey) =>
    set((state) => ({
      ui: {
        ...state.ui,
        defaultWallpaperKey,
      },
    })),

  setActiveConversation: (activeConversationId) =>
    set((state) => ({
      ui: {
        ...state.ui,
        activeConversationId,
      },
      conversations: activeConversationId
        ? updateConversation(state.conversations, activeConversationId, (conversation) => ({
            ...conversation,
            unreadCount: 0,
          }))
        : state.conversations,
    })),

  getConversationById: (conversationId) =>
    get().conversations.find((conversation) => conversation.id === conversationId),

  getMessagesByConversation: (conversationId) => get().messagesByConversation[conversationId] ?? [],

  getMessages: (conversationId) => get().messagesByConversation[conversationId] ?? [],

  getFilteredConversations: (category, query) => {
    const {
      conversations,
      ui: { conversationCategory, conversationQuery },
    } = get();

    return conversations.filter((conversation) =>
      matchesConversationQuery(
        conversation,
        query ?? conversationQuery,
        category ?? conversationCategory
      )
    );
  },

  openDirectConversation: (contactId) => {
    const existingConversation = get().conversations.find(
      (conversation) =>
        conversation.kind === 'direct' &&
        conversation.participantIds.length === 1 &&
        conversation.participantIds[0] === contactId
    );

    if (existingConversation) {
      return existingConversation.id;
    }

    const contact = get().contacts.find((item) => item.id === contactId);

    if (!contact) {
      return '';
    }

    const conversationId = nextConversationId('conv_direct');
    const welcomeMessage: ChatMessage = {
      id: `message_${Date.now()}_seed`,
      conversationId,
      senderId: contact.id,
      text: 'Bienvenue sur Afroza Campus. Lance la discussion quand tu veux.',
      attachments: [],
      createdAt: new Date(),
      status: 'read',
    };

    const conversation: MessagingConversation = {
      id: conversationId,
      title: contact.name,
      kind: 'direct',
      participantIds: [contact.id],
      avatar: contact.avatar,
      avatarColor: contact.avatarColor,
      subtitle: contact.roleLabel,
      about: contact.about,
      unreadCount: 0,
      isFavorite: contact.isFavorite,
      isPinned: false,
      isArchived: false,
      isMuted: false,
      isBlocked: false,
      isVerified: false,
      presence: contact.isOnline ? 'online' : 'offline',
      lastSeenLabel: contact.isOnline ? 'En ligne' : contact.lastSeenLabel,
      updatedAt: welcomeMessage.createdAt,
      previewText: buildMessagePreview(welcomeMessage),
      ...createConversationDefaults('direct', get().ui.defaultWallpaperKey),
    };

    set((state) => ({
      conversations: sortConversations([conversation, ...state.conversations]),
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [welcomeMessage],
      },
    }));

    return conversationId;
  },

  createCommunityConversation: () => {
    const conversationId = nextConversationId('conv_community');
    const message: ChatMessage = {
      id: `message_${Date.now()}_community`,
      conversationId,
      senderId: 'contact_3',
      text: 'Nouvelle communaute creee. Invite les etudiants et partage le contexte.',
      attachments: [],
      createdAt: new Date(),
      status: 'read',
    };

    const conversation: MessagingConversation = {
      id: conversationId,
      title: 'Nouvelle communaute',
      kind: 'community',
      participantIds: ['contact_3', 'contact_6'],
      avatarColor: '#00FF6A',
      subtitle: 'Communaute campus',
      about: 'Espace collaboratif pret a etre personnalise.',
      memberCount: 2,
      unreadCount: 0,
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      isMuted: false,
      isBlocked: false,
      isVerified: false,
      presence: 'online',
      lastSeenLabel: '2 membres',
      updatedAt: message.createdAt,
      previewText: buildMessagePreview(message),
      description: 'Nouvelle communaute Afroza Campus prete pour l onboarding.',
      members: [
        { contactId: 'contact_3', role: 'owner', joinedLabel: 'Fondatrice' },
        { contactId: 'contact_6', role: 'admin', joinedLabel: 'Admin operations' },
      ],
      ...createConversationDefaults('community', get().ui.defaultWallpaperKey),
    };

    set((state) => ({
      conversations: sortConversations([conversation, ...state.conversations]),
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [message],
      },
    }));

    return conversationId;
  },

  createContact: (input) => {
    const contactId = nextConversationId('contact');
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();

    const contact: MessagingContact = {
      id: contactId,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      phoneNumber: input.phoneNumber.trim(),
      countryCode: input.countryCode.trim(),
      avatarColor: '#0072FF',
      isOnAfroza: true,
      isFavorite: false,
      isOnline: false,
      lastSeenLabel: 'Nouveau sur Afroza',
      roleLabel: 'Contact',
      about: 'Nouveau contact Afroza Campus.',
      profileStatus: 'Pret a demarrer sur Afroza.',
      campusLabel: 'Nouveau contact',
    };

    set((state) => ({
      contacts: [contact, ...state.contacts],
    }));

    return contactId;
  },

  createGroupConversation: (input) => {
    const participantIds = [...new Set(input.participantIds)].filter(Boolean);
    const conversationId = nextConversationId('conv_group');
    const message: ChatMessage = {
      id: `message_${Date.now()}_group`,
      conversationId,
      senderId: CURRENT_USER_ID,
      text: 'Groupe cree. Vous pouvez lancer la coordination ici.',
      attachments: [],
      createdAt: new Date(),
      status: 'read',
    };

    const conversation: MessagingConversation = {
      id: conversationId,
      title: input.title.trim(),
      kind: 'group',
      participantIds,
      avatar: input.avatar,
      avatarColor: '#00A3FF',
      subtitle: `${participantIds.length} membres`,
      about: 'Groupe prive Afroza Campus.',
      memberCount: participantIds.length,
      unreadCount: 0,
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      isMuted: false,
      isBlocked: false,
      isVerified: false,
      presence: 'online',
      lastSeenLabel: `${participantIds.length} membres`,
      updatedAt: message.createdAt,
      previewText: buildMessagePreview(message),
      description: 'Groupe prive Afroza Campus.',
      members: participantIds.map((participantId, index) => ({
        contactId: participantId,
        role: index === 0 ? 'owner' : 'member',
        joinedLabel: index === 0 ? 'Ajoute au demarrage' : 'Ajoute a la creation',
      })),
      ...createConversationDefaults('group', get().ui.defaultWallpaperKey),
    };

    set((state) => ({
      conversations: sortConversations([conversation, ...state.conversations]),
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [message],
      },
    }));

    return conversationId;
  },

  sendMessage: ({ conversationId, text, attachments, replyTo }) => {
    const conversation = get().conversations.find((item) => item.id === conversationId);

    if (!conversation || conversation.isBlocked) {
      return;
    }

    const trimmedText = text?.trim() ?? '';
    const nextAttachments = attachments ?? [];

    if (!trimmedText && nextAttachments.length === 0) {
      return;
    }

    const outgoingMessage = buildOutgoingMessage(
      { conversationId, text: trimmedText, attachments: nextAttachments, replyTo },
      get().currentUserId
    );

    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), outgoingMessage],
      },
      conversations: updateConversation(state.conversations, conversationId, (item) => ({
        ...item,
        previewText: buildMessagePreview(outgoingMessage),
        updatedAt: outgoingMessage.createdAt,
        typingLabel: undefined,
      })),
    }));

    const statusTimers = (['sent', 'delivered', 'read'] as const).map((status, index) =>
      setTimeout(() => {
        set((state) => ({
          messagesByConversation: patchMessageStatus(
            state.messagesByConversation,
            conversationId,
            outgoingMessage.id,
            status
          ),
        }));
      }, [250, 800, 1600][index])
    );

    deliveryTimers.set(outgoingMessage.id, statusTimers);

    if (conversation.kind === 'channel') {
      return;
    }

    clearConversationTimers(conversationId);

    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (item) => ({
        ...item,
        typingLabel: `${item.title.split(' ')[0]} est en train d ecrire`,
      })),
    }));

    const pool =
      conversation.kind === 'group'
        ? replyPool.group
        : conversation.kind === 'community'
          ? replyPool.community
          : replyPool.direct;

    const replySenderId = conversation.participantIds[0] ?? 'contact_1';
    const replyTimer = setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: `message_${Date.now()}_reply`,
        conversationId,
        senderId: replySenderId,
        text: pool[Math.floor(Math.random() * pool.length)],
        attachments: [],
        createdAt: new Date(),
        status: 'read',
      };

      set((state) => {
        const isActive = state.ui.activeConversationId === conversationId;

        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), replyMessage],
          },
          conversations: updateConversation(state.conversations, conversationId, (item) => ({
            ...item,
            previewText: buildMessagePreview(replyMessage),
            updatedAt: replyMessage.createdAt,
            typingLabel: undefined,
            unreadCount: isActive ? 0 : item.unreadCount + 1,
          })),
        };
      });

      replyTimers.delete(conversationId);
    }, 1750);

    replyTimers.set(conversationId, replyTimer);
  },

  markConversationRead: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (item) => ({
        ...item,
        unreadCount: 0,
      })),
    })),

  markConversationUnread: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        unreadCount: Math.max(1, conversation.unreadCount),
      })),
      ui: {
        ...state.ui,
        activeConversationId:
          state.ui.activeConversationId === conversationId ? null : state.ui.activeConversationId,
      },
    })),

  markAllConversationsRead: () =>
    set((state) => ({
      conversations: state.conversations.map((conversation) => ({
        ...conversation,
        unreadCount: 0,
      })),
    })),

  toggleConversationFavorite: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        isFavorite: !conversation.isFavorite,
      })),
    })),

  toggleConversationPinned: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        isPinned: !conversation.isPinned,
      })),
    })),

  toggleConversationArchived: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        isArchived: !conversation.isArchived,
      })),
      ui: {
        ...state.ui,
        activeConversationId:
          state.ui.activeConversationId === conversationId ? null : state.ui.activeConversationId,
      },
    })),

  toggleConversationMuted: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        isMuted: !conversation.isMuted,
      })),
    })),

  toggleConversationBlocked: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        isBlocked: !conversation.isBlocked,
      })),
    })),

  cycleConversationNotifications: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        notificationPreference: cycleItem(
          NOTIFICATION_SEQUENCE,
          conversation.notificationPreference,
          'all'
        ),
        isMuted:
          cycleItem(NOTIFICATION_SEQUENCE, conversation.notificationPreference, 'all') === 'muted',
      })),
    })),

  toggleConversationMediaVisibility: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        mediaVisibility: conversation.mediaVisibility === 'hidden' ? 'visible' : 'hidden',
      })),
    })),

  cycleConversationDisappearingMode: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        disappearingMode: cycleItem(
          DISAPPEARING_SEQUENCE,
          conversation.disappearingMode,
          'off'
        ),
      })),
    })),

  toggleConversationLock: (conversationId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        lockEnabled: !conversation.lockEnabled,
      })),
    })),

  setConversationWallpaper: (conversationId, wallpaperKey) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        wallpaperKey,
      })),
    })),

  renameConversationLocal: (conversationId, localNickname) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        localNickname: localNickname.trim() || undefined,
      })),
    })),

  addConversationMembers: (conversationId, contactIds) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => {
        const existing = new Set(conversation.participantIds);
        const added = contactIds.filter((id) => !existing.has(id));

        if (added.length === 0) {
          return conversation;
        }

        const nextParticipantIds = [...conversation.participantIds, ...added];
        const nextMembers = [
          ...(conversation.members ?? []),
          ...added.map((contactId) => ({
            contactId,
            role: 'member' as ConversationMemberRole,
            joinedLabel: 'Ajouté récemment',
          })),
        ];

        return {
          ...conversation,
          participantIds: nextParticipantIds,
          members: nextMembers,
          memberCount: nextParticipantIds.length,
          subtitle: `${nextParticipantIds.length} membres`,
          lastSeenLabel: `${nextParticipantIds.length} membres`,
        };
      }),
    })),

  removeConversationMember: (conversationId, contactId) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => {
        const nextParticipantIds = conversation.participantIds.filter((id) => id !== contactId);
        const nextMembers = (conversation.members ?? []).filter(
          (member) => member.contactId !== contactId
        );

        return {
          ...conversation,
          participantIds: nextParticipantIds,
          members: nextMembers,
          memberCount: nextParticipantIds.length,
          subtitle: `${nextParticipantIds.length} membres`,
          lastSeenLabel: `${nextParticipantIds.length} membres`,
        };
      }),
    })),

  updateConversationMemberRole: (conversationId, contactId, role) =>
    set((state) => ({
      conversations: updateConversation(state.conversations, conversationId, (conversation) => ({
        ...conversation,
        members: (conversation.members ?? []).map((member) =>
          member.contactId === contactId ? { ...member, role } : member
        ),
      })),
    })),

  toggleMessageStarred: (conversationId, messageId) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] ?? []).map((message) =>
          message.id === messageId ? { ...message, isStarred: !message.isStarred } : message
        ),
      },
    })),

  toggleMessageReaction: (conversationId, messageId, emoji) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] ?? []).map((message) => {
          if (message.id !== messageId) {
            return message;
          }

          const currentUserId = state.currentUserId;
          const reactions = [...(message.reactions ?? [])];
          const reactionIndex = reactions.findIndex((reaction) => reaction.emoji === emoji);

          if (reactionIndex === -1) {
            return {
              ...message,
              reactions: [...reactions, { emoji, userIds: [currentUserId] }],
            };
          }

          const nextUserIds = reactions[reactionIndex].userIds.includes(currentUserId)
            ? reactions[reactionIndex].userIds.filter((userId) => userId !== currentUserId)
            : [...reactions[reactionIndex].userIds, currentUserId];

          if (nextUserIds.length === 0) {
            return {
              ...message,
              reactions: reactions.filter((reaction) => reaction.emoji !== emoji),
            };
          }

          reactions[reactionIndex] = {
            ...reactions[reactionIndex],
            userIds: nextUserIds,
          };

          return {
            ...message,
            reactions,
          };
        }),
      },
    })),

  deleteMessage: (conversationId, messageId) => {
    clearMessageTimers(messageId);

    set((state) => {
      const nextList = (state.messagesByConversation[conversationId] ?? []).filter(
        (message) => message.id !== messageId
      );
      const lastMessage = nextList[nextList.length - 1];

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: nextList,
        },
        conversations: lastMessage
          ? updateConversation(state.conversations, conversationId, (item) => ({
              ...item,
              previewText: buildMessagePreview(lastMessage),
              updatedAt: lastMessage.createdAt,
            }))
          : state.conversations,
      };
    });
  },

  editMessage: (conversationId, messageId, text) => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    set((state) => {
      const list = state.messagesByConversation[conversationId] ?? [];
      const nextList = list.map((message) =>
        message.id === messageId ? { ...message, text: trimmed, editedAt: new Date() } : message
      );
      const lastMessage = nextList[nextList.length - 1];

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: nextList,
        },
        conversations:
          lastMessage && lastMessage.id === messageId
            ? updateConversation(state.conversations, conversationId, (item) => ({
                ...item,
                previewText: buildMessagePreview(lastMessage),
              }))
            : state.conversations,
      };
    });
  },

  forwardMessage: (targetConversationId, message) => {
    get().sendMessage({
      conversationId: targetConversationId,
      text: message.text,
      attachments: message.attachments,
    });
  },

  getStarredMessages: () => {
    const { conversations, messagesByConversation } = get();

    return conversations.flatMap((conversation) =>
      (messagesByConversation[conversation.id] ?? [])
        .filter((message) => message.isStarred)
        .map((message) => ({ conversation, message }))
    );
  },

  connectDevice: (deviceName) => {
    const deviceId = nextConversationId('device');
    const nextDevice: LinkedDevice = {
      id: deviceId,
      name: deviceName?.trim() || 'Nouveau navigateur lie',
      platform: 'Web',
      browser: 'Afroza Web',
      location: 'Connexion via QR',
      lastSeenLabel: 'Actif maintenant',
      isActive: true,
    };

    set((state) => ({
      connectedDevices: [
        nextDevice,
        ...state.connectedDevices.map((device) => ({ ...device, isActive: false })),
      ],
    }));

    return deviceId;
  },

  disconnectDevice: (deviceId) =>
    set((state) => {
      const filteredDevices = state.connectedDevices.filter((device) => device.id !== deviceId);

      if (filteredDevices.length === 0) {
        return { connectedDevices: filteredDevices };
      }

      if (filteredDevices.some((device) => device.isActive)) {
        return { connectedDevices: filteredDevices };
      }

      return {
        connectedDevices: filteredDevices.map((device, index) =>
          index === 0 ? { ...device, isActive: true } : device
        ),
      };
    }),

  deleteConversation: (conversationId) =>
    set((state) => {
      const nextMessages = { ...state.messagesByConversation };
      const deletedMessages = nextMessages[conversationId] ?? [];

      delete nextMessages[conversationId];
      clearConversationTimers(conversationId);
      deletedMessages.forEach((message) => clearMessageTimers(message.id));

      return {
        conversations: state.conversations.filter((conversation) => conversation.id !== conversationId),
        messagesByConversation: nextMessages,
        ui: {
          ...state.ui,
          activeConversationId:
            state.ui.activeConversationId === conversationId ? null : state.ui.activeConversationId,
        },
      };
    }),

  markAsRead: (conversationId) => get().markConversationRead(conversationId),

  markUnread: (conversationId) => get().markConversationUnread(conversationId),

  markAllAsRead: () => get().markAllConversationsRead(),

  toggleFavorite: (conversationId) => get().toggleConversationFavorite(conversationId),

  togglePinned: (conversationId) => get().toggleConversationPinned(conversationId),

  toggleArchived: (conversationId) => get().toggleConversationArchived(conversationId),

  toggleMuted: (conversationId) => get().toggleConversationMuted(conversationId),

  toggleBlocked: (conversationId) => get().toggleConversationBlocked(conversationId),
}));
