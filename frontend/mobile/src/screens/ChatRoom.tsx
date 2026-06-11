import React from 'react';
import ChatScreen from '../modules/messaging/screens/ChatScreen';
import { useMessagesStore } from '../store/messagesStore';

export default function ChatRoom(props: any) {
  const fallbackConversationId = useMessagesStore((state) => state.conversations[0]?.id);
  const conversationId = props?.route?.params?.conversationId ?? fallbackConversationId;

  if (!conversationId) {
    return null;
  }

  return (
    <ChatScreen
      {...props}
      route={{
        ...props.route,
        params: {
          ...props.route?.params,
          conversationId,
        },
      }}
    />
  );
}
