import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../theme';
import { useMessagesStore } from '../../../store/messagesStore';
import MessagingAvatar from '../components/MessagingAvatar';
import MessagingSheet from '../components/MessagingSheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MessagesStackParamList } from '../navigation/MessagesNavigator';

type Props = NativeStackScreenProps<MessagesStackParamList, 'NewDiscussion'>;

export default function NewDiscussionScreen({ navigation }: Props) {
  const [query, setQuery] = React.useState('');
  const [menuVisible, setMenuVisible] = React.useState(false);
  const contacts = useMessagesStore((state) => state.contacts.filter((contact) => contact.isOnAfroza));
  const openDirectConversation = useMessagesStore((state) => state.openDirectConversation);

  const filteredContacts = contacts.filter((contact) =>
    `${contact.name} ${contact.roleLabel}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const openSettings = () => {
    navigation.getParent()?.getParent()?.navigate('Settings' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>Nouvelle discussion</Text>
          <Pressable onPress={() => setMenuVisible(true)} style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text} />
          </Pressable>
        </View>

        <View style={styles.searchShell}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Chercher un contact Afroza"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.quickActionsRow}>
          <Pressable onPress={() => navigation.navigate('CreateGroup')} style={styles.quickCard}>
            <Ionicons name="people" size={20} color={theme.colors.primary} />
            <Text style={styles.quickTitle}>Nouveau groupe</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('CreateContact')} style={styles.quickCard}>
            <Ionicons name="person-add" size={20} color={theme.colors.primary} />
            <Text style={styles.quickTitle}>Nouveau contact</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const communityId = useMessagesStore.getState().createCommunityConversation();
              navigation.navigate('ChatRoom', { conversationId: communityId });
            }}
            style={styles.quickCard}
          >
            <Ionicons name="layers" size={20} color={theme.colors.primary} />
            <Text style={styles.quickTitle}>Nouvelle communaute</Text>
          </Pressable>
        </View>

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                const conversationId = openDirectConversation(item.id);
                if (conversationId) {
                  navigation.navigate('ChatRoom', { conversationId });
                }
              }}
              style={({ pressed }) => [styles.contactRow, pressed && styles.contactRowPressed]}
            >
              <MessagingAvatar
                uri={item.avatar}
                label={item.name}
                color={item.avatarColor}
                kind="direct"
                online={item.isOnline}
              />
              <View style={styles.contactText}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactMeta}>
                  {item.roleLabel} · {item.isOnline ? 'En ligne' : item.lastSeenLabel}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          )}
        />
      </View>

      <MessagingSheet
        visible={menuVisible}
        title="Options contacts"
        subtitle="Raccourcis de gestion"
        onClose={() => setMenuVisible(false)}
        options={[
          {
            key: 'settings',
            label: 'Parametres contacts',
            icon: 'settings-outline',
            onPress: openSettings,
          },
          {
            key: 'invite',
            label: 'Inviter un contact',
            icon: 'paper-plane-outline',
            onPress: () => navigation.navigate('CreateContact'),
          },
          {
            key: 'refresh',
            label: 'Actualiser',
            icon: 'refresh-outline',
            onPress: () => setQuery(''),
          },
          {
            key: 'help',
            label: 'Aide',
            icon: 'help-circle-outline',
            onPress: openSettings,
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    ...theme.typography.title3,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 54,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  quickCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    ...theme.shadows.card,
  },
  quickTitle: {
    ...theme.typography.label,
    lineHeight: 17,
  },
  listContent: {
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactRowPressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  contactText: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    ...theme.typography.title3,
    fontSize: 16,
  },
  contactMeta: {
    ...theme.typography.bodyMuted,
    fontSize: 13,
  },
});
