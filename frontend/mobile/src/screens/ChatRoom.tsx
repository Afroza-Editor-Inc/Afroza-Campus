import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import theme from '../theme';
import Header from '../components/Header';
import { mockUsers, mockMessages } from '../data/mock';

export default function ChatRoom({ route, navigation }: any) {
  const { roomId = 'general', userName = 'Alice Dupont' } = route?.params || {};
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');
  
  // Find the user for this chat
  const chatUser = mockUsers.find((u) => u.name === userName) || mockUsers[0];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: String(messages.length + 1),
      sender: mockUsers[0], // Current user (simplified)
      text: inputText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const renderMessage = ({ item }: any) => (
    <View style={[styles.messageContainer, item.isMe && styles.messageContainerMe]}>
      {!item.isMe && (
        <View style={styles.avat}>
          <Text style={styles.avatarText}>
            {item.sender.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.isMe ? styles.messageBubbleMe : styles.messageBubbleThem,
        ]}
      >
        <Text style={[styles.messageText, item.isMe && styles.messageTextMe]}>
          {item.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            item.isMe ? styles.messageTimeMy : styles.messageTimeOther,
          ]}
        >
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerName}>{chatUser.name}</Text>
          <Text style={styles.headerStatus}>En ligne</Text>
        </View>
        <View style={styles.headerActions}>
          <Text style={styles.actionIcon}>⋯</Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onEndReachedThreshold={0.1}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Votre message..."
            placeholderTextColor={theme.colors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  backButton: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerStatus: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
  headerActions: {
    padding: theme.spacing.sm,
  },
  actionIcon: {
    fontSize: 20,
    color: theme.colors.muted,
  },
  messagesList: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  messageContainerMe: {
    justifyContent: 'flex-end',
  },
  avat: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
  },
  messageBubbleMe: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleThem: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  messageTimeMy: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimeOther: {
    color: theme.colors.muted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  attachButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  attachIcon: {
    fontSize: 20,
    color: theme.colors.primary,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
    color: theme.colors.primary,
  },
});
