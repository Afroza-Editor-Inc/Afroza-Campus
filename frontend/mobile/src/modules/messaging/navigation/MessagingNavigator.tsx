import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from '../screens/CameraScreen';
import ChatScreen from '../screens/ChatScreen';
import ConversationMediaScreen from '../screens/ConversationMediaScreen';
import ConversationPreferencesScreen from '../screens/ConversationPreferencesScreen';
import ConversationProfileScreen from '../screens/ConversationProfileScreen';
import ConversationSearchScreen from '../screens/ConversationSearchScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import CreateContactScreen from '../screens/CreateContactScreen';
import ForwardMessageScreen from '../screens/ForwardMessageScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import LinkedDevicesScreen from '../screens/LinkedDevicesScreen';
import MessagingSectionScreen from '../screens/MessagingSectionScreen';
import MessagingHelpScreen from '../screens/MessagingHelpScreen';
import MessagingSettingsScreen from '../screens/MessagingSettingsScreen';
import NewChatScreen from '../screens/NewChatScreen';
import QRCodeScreen from '../screens/QRCodeScreen';
import StarredMessagesScreen from '../screens/StarredMessagesScreen';
import WallpaperPickerScreen from '../screens/WallpaperPickerScreen';
import type { QrEntryMode } from '../types';

export type MessagingStackParamList = {
  Conversations: undefined;
  NewChat: undefined;
  CreateContact: undefined;
  CreateGroup: undefined;
  Chat: { conversationId: string };
  MessagingCamera: { conversationId: string };
  ForwardMessage: { conversationId: string; messageId: string };
  ConversationProfile: { conversationId: string };
  ConversationSearch: { conversationId: string };
  ConversationMedia: { conversationId: string };
  ConversationPreferences: { conversationId: string };
  WallpaperPicker: { conversationId: string };
  LinkedDevices: undefined;
  StarredMessages: undefined;
  MessagingSection: {
    variant:
      | 'notifications'
      | 'storage'
      | 'locked'
      | 'disappearing'
      | 'privacy'
      | 'wallpapers'
      | 'report';
  };
  MessagingSettings: undefined;
  MessagingHelp: undefined;
  QRCode: { mode?: QrEntryMode } | undefined;
};

const Stack = createNativeStackNavigator<MessagingStackParamList>();

export default function MessagingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Conversations"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Conversations" component={ConversationsScreen} />
      <Stack.Screen name="NewChat" component={NewChatScreen} />
      <Stack.Screen name="CreateContact" component={CreateContactScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Group screenOptions={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}>
        <Stack.Screen name="MessagingCamera" component={CameraScreen} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
        <Stack.Screen name="ForwardMessage" component={ForwardMessageScreen} />
      </Stack.Group>
      <Stack.Screen name="ConversationProfile" component={ConversationProfileScreen} />
      <Stack.Screen name="ConversationSearch" component={ConversationSearchScreen} />
      <Stack.Screen name="ConversationMedia" component={ConversationMediaScreen} />
      <Stack.Screen name="ConversationPreferences" component={ConversationPreferencesScreen} />
      <Stack.Screen name="WallpaperPicker" component={WallpaperPickerScreen} />
      <Stack.Screen name="LinkedDevices" component={LinkedDevicesScreen} />
      <Stack.Screen name="StarredMessages" component={StarredMessagesScreen} />
      <Stack.Screen name="MessagingSection" component={MessagingSectionScreen} />
      <Stack.Screen name="MessagingSettings" component={MessagingSettingsScreen} />
      <Stack.Screen name="MessagingHelp" component={MessagingHelpScreen} />
      <Stack.Screen name="QRCode" component={QRCodeScreen} />
    </Stack.Navigator>
  );
}
