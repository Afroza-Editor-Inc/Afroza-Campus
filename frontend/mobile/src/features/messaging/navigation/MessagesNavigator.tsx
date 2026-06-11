import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConversationsScreen from '../screens/ConversationsScreen';
import NewDiscussionScreen from '../screens/NewDiscussionScreen';
import CreateContactScreen from '../screens/CreateContactScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';

export type MessagesStackParamList = {
  Conversations: undefined;
  NewDiscussion: undefined;
  CreateContact: undefined;
  CreateGroup: undefined;
  ChatRoom: { conversationId: string };
};

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export default function MessagesNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Conversations"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Conversations" component={ConversationsScreen} />
      <Stack.Screen name="NewDiscussion" component={NewDiscussionScreen} />
      <Stack.Screen name="CreateContact" component={CreateContactScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
}
