import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { formatConversationTimestamp, getConversationDisplayTitle } from '../services/formatters';
import { useMessagingStore } from '../store/useMessagingStore';
import { messagingSpacing, useMessagingPalette } from '../theme';
import { EmptyState } from '../../../components/feedback';

type Props = NativeStackScreenProps<MessagingStackParamList, 'StarredMessages'>;

export default function StarredMessagesScreen({ navigation }: Props) {
  const palette = useMessagingPalette();
  const starredMessages = useMessagingStore((state) => state.getStarredMessages());

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
            <Text style={[styles.headerTitle, { color: palette.text }]}>Messages favoris</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>
              Retrouver rapidement les messages importants
            </Text>
          </View>
        </View>

        <FlatList
          data={starredMessages}
          keyExtractor={(item) => item.message.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: messagingSpacing.sm }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('Chat', { conversationId: item.conversation.id })}
              style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <View style={styles.cardTopRow}>
                <Text style={[styles.conversationTitle, { color: palette.text }]} numberOfLines={1}>
                  {getConversationDisplayTitle(item.conversation)}
                </Text>
                <Ionicons name="star" size={16} color={palette.activeStart} />
              </View>
              <Text style={[styles.messageText, { color: palette.text }]} numberOfLines={3}>
                {item.message.text.trim() || 'Piece jointe marquee comme favorite'}
              </Text>
              <Text style={[styles.meta, { color: palette.textMuted }]}>
                {formatConversationTimestamp(item.message.createdAt)}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="star-outline"
              title="Aucun message favori"
              subtitle="Les messages épinglés ou marqués comme favoris apparaîtront ici."
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: theme.spacing.md },
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
  headerBody: { flex: 1 },
  headerTitle: {
    ...theme.typography.title3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingTop: messagingSpacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: theme.spacing.md,
    gap: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  conversationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
});
