import type { MessagingRealtimeAdapter } from '../types';

export const mockMessagingRealtimeAdapter: MessagingRealtimeAdapter = {
  connect: async () => undefined,
  disconnect: async () => undefined,
  sendTyping: async () => undefined,
  sendReadReceipt: async () => undefined,
  subscribe: () => () => undefined,
};

