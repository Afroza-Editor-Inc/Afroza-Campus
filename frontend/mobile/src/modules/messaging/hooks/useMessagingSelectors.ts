import React from 'react';
import { CATEGORY_LABELS, getConversationCategoryCount, matchesContactQuery } from '../services/formatters';
import { useMessagingStore } from '../store/useMessagingStore';
import type { ConversationCategoryItem, MessagingContact } from '../types';

const CATEGORY_ORDER: ConversationCategoryItem['key'][] = [
  'all',
  'unread',
  'favorites',
  'groups',
  'channels',
];

export function useConversationCategories() {
  const conversations = useMessagingStore((state) => state.conversations);

  return React.useMemo(
    () =>
      CATEGORY_ORDER.map((key) => ({
        key,
        label: CATEGORY_LABELS[key],
        count: getConversationCategoryCount(conversations, key),
      })),
    [conversations]
  );
}

export function useFilteredConversations() {
  return useMessagingStore((state) => state.getFilteredConversations());
}

export function useConversation(conversationId: string) {
  return useMessagingStore((state) => state.getConversationById(conversationId));
}

export function useConversationMessages(conversationId: string) {
  return useMessagingStore((state) => state.getMessagesByConversation(conversationId));
}

export function useContactLookup() {
  return useMessagingStore((state) => state.contacts);
}

export function useFilteredContacts({
  query,
  afrozaOnly = false,
}: {
  query: string;
  afrozaOnly?: boolean;
}) {
  const contacts = useMessagingStore((state) => state.contacts);

  return React.useMemo(
    () =>
      contacts.filter((contact) => {
        if (afrozaOnly && !contact.isOnAfroza) {
          return false;
        }

        return matchesContactQuery(contact, query);
      }),
    [afrozaOnly, contacts, query]
  );
}

export function useSuggestedContacts(limit = 4) {
  const contacts = useMessagingStore((state) => state.contacts);

  return React.useMemo<MessagingContact[]>(
    () =>
      contacts
        .filter((contact) => contact.isOnAfroza)
        .sort((left, right) => Number(right.isOnline) - Number(left.isOnline))
        .slice(0, limit),
    [contacts, limit]
  );
}

