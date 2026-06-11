import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { Avatar, MessagingActionSheet, SearchBar } from '../components';
import { useFilteredContacts } from '../hooks/useMessagingSelectors';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { useMessagingStore } from '../store/useMessagingStore';
import { messagingSpacing, useMessagingPalette } from '../theme';
type Props = NativeStackScreenProps<MessagingStackParamList, 'NewChat'>;

export default function NewChatScreen({ navigation }: Props) {
  const palette = useMessagingPalette();
  const [query, setQuery] = React.useState('');
  const [menuVisible, setMenuVisible] = React.useState(false);
  const contacts = useFilteredContacts({ query });
  const openDirectConversation = useMessagingStore((state) => state.openDirectConversation);
  const createCommunityConversation = useMessagingStore((state) => state.createCommunityConversation);

  const openChat = React.useCallback(
    (contactId: string) => {
      const conversationId = openDirectConversation(contactId);

      if (conversationId) {
        navigation.navigate('Chat', { conversationId });
      }
    },
    [navigation, openDirectConversation]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.headerButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Ionicons name="chevron-back" size={22} color={palette.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Nouvelle discussion</Text>
          <Pressable
            onPress={() => setMenuVisible(true)}
            style={[styles.headerButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={palette.text} />
          </Pressable>
        </View>

        <SearchBar
          containerStyle={styles.searchBar}
          value={query}
          onChangeText={setQuery}
          placeholder="Chercher un contact"
        />

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: messagingSpacing.xs }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => (item.isOnAfroza ? openChat(item.id) : navigation.navigate('CreateContact'))}
              style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <Avatar
                label={item.name}
                uri={item.avatar}
                color={item.avatarColor}
                kind="direct"
                size={48}
                online={item.isOnline}
              />
              <View style={styles.rowBody}>
                <Text style={[styles.rowTitle, { color: palette.text }]}>{item.name}</Text>
                <Text style={[styles.rowSubtitle, { color: palette.textMuted }]} numberOfLines={1}>
                  {item.roleLabel} · {item.isOnline ? 'En ligne' : item.lastSeenLabel}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.textSoft} />
            </Pressable>
          )}
          ListHeaderComponent={
            <>
              {[
                {
                  id: 'new-group',
                  label: 'Nouveau groupe',
                  subtitle: 'Creer une discussion avec plusieurs membres',
                  icon: 'people-outline' as const,
                  onPress: () => navigation.navigate('CreateGroup'),
                },
                {
                  id: 'new-contact',
                  label: 'Nouveau contact',
                  subtitle: 'Ajouter un contact ou scanner un QR code',
                  icon: 'person-add-outline' as const,
                  onPress: () => navigation.navigate('CreateContact'),
                },
                {
                  id: 'new-community',
                  label: 'Nouvelle communaute',
                  subtitle: 'Ouvrir un espace de coordination etudiante',
                  icon: 'layers-outline' as const,
                  onPress: () => {
                    const conversationId = createCommunityConversation();
                    navigation.navigate('Chat', { conversationId });
                  },
                },
              ].map((item) => (
                <Pressable
                  key={item.id}
                  onPress={item.onPress}
                  style={[styles.row, styles.actionRow, { backgroundColor: palette.surface, borderColor: palette.border }]}
                >
                  <View style={[styles.leadingIcon, { backgroundColor: palette.surfaceMuted }]}>
                    <Ionicons name={item.icon} size={18} color={palette.activeStart} />
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={[styles.rowTitle, { color: palette.text }]}>{item.label}</Text>
                    <Text style={[styles.rowSubtitle, { color: palette.textMuted }]}>{item.subtitle}</Text>
                  </View>
                  {item.id === 'new-contact' ? (
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        navigation.navigate('QRCode', { mode: 'scan' });
                      }}
                      style={[styles.inlineButton, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}
                    >
                      <Ionicons name="qr-code-outline" size={16} color={palette.activeStart} />
                      <Text style={[styles.inlineButtonText, { color: palette.text }]}>QR</Text>
                    </Pressable>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={palette.textSoft} />
                  )}
                </Pressable>
              ))}

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>Contacts Afroza Campus</Text>
              </View>
            </>
          }
        />
      </View>

      <MessagingActionSheet
        title="Nouvelle discussion"
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={[
          { label: 'Inviter un contact', icon: 'person-add-outline', onPress: () => navigation.navigate('CreateContact') },
          { label: 'Scanner un QR', icon: 'qr-code-outline', onPress: () => navigation.navigate('QRCode', { mode: 'scan' }) },
          { label: 'Parametres contacts', icon: 'settings-outline', onPress: () => navigation.navigate('MessagingSettings') },
          { label: 'Aide', icon: 'help-circle-outline', onPress: () => navigation.navigate('MessagingHelp') },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    paddingBottom: messagingSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.title3,
  },
  searchBar: {
    marginBottom: messagingSpacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
  sectionHeader: {
    paddingTop: messagingSpacing.sm,
    paddingBottom: messagingSpacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  row: {
    minHeight: 60,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.sm,
  },
  actionRow: {
    marginBottom: messagingSpacing.xs,
  },
  leadingIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSubtitle: {
    ...theme.typography.bodyMuted,
    fontSize: 12,
  },
  inlineButton: {
    minWidth: 58,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  inlineButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
