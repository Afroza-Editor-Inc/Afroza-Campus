import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { SearchBar } from '../components';
import { useConversation, useConversationMessages } from '../hooks/useMessagingSelectors';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { formatMessageTimestamp, getMessageSearchText } from '../services/formatters';
import { messagingSpacing, useMessagingPalette } from '../theme';

type Props = NativeStackScreenProps<MessagingStackParamList, 'ConversationSearch'>;

export default function ConversationSearchScreen({ route, navigation }: Props) {
  const { conversationId } = route.params;
  const palette = useMessagingPalette();
  const conversation = useConversation(conversationId);
  const messages = useConversationMessages(conversationId);
  const [query, setQuery] = React.useState('');

  const filteredMessages = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return messages.slice().reverse();
    }

    return messages
      .filter((message) => getMessageSearchText(message).includes(normalizedQuery))
      .slice()
      .reverse();
  }, [messages, query]);

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
          <View style={styles.headerBody}>
            <Text style={[styles.headerTitle, { color: palette.text }]}>Recherche</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textMuted }]} numberOfLines={1}>
              {conversation?.title ?? 'Discussion'}
            </Text>
          </View>
        </View>

        <SearchBar value={query} onChangeText={setQuery} placeholder="Rechercher dans la discussion" />

        <FlatList
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: messagingSpacing.sm }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.resultCard, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <Text style={[styles.resultText, { color: palette.text }]} numberOfLines={3}>
                {item.text.trim() || 'Piece jointe partagee'}
              </Text>
              <Text style={[styles.resultMeta, { color: palette.textMuted }]}>
                {formatMessageTimestamp(item.createdAt)}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={[styles.emptyCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Text style={[styles.emptyTitle, { color: palette.text }]}>Aucun resultat</Text>
              <Text style={[styles.emptyText, { color: palette.textMuted }]}>
                Ajustez votre recherche pour retrouver un message ou une piece jointe.
              </Text>
            </View>
          }
        />
      </View>
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
    paddingBottom: messagingSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBody: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.title3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    flex: 1,
    marginTop: messagingSpacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
  resultCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: theme.spacing.md,
    gap: 6,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  resultMeta: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: 6,
    marginTop: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.title3,
  },
  emptyText: {
    ...theme.typography.bodyMuted,
  },
});
