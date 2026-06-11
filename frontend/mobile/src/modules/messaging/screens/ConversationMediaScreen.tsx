import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { useConversation, useConversationMessages } from '../hooks/useMessagingSelectors';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { formatConversationTimestamp, getAttachmentSummary } from '../services/formatters';
import { messagingSpacing, useMessagingPalette } from '../theme';
import { EmptyState, Skeleton } from '../../../components/feedback';

type Props = NativeStackScreenProps<MessagingStackParamList, 'ConversationMedia'>;

export default function ConversationMediaScreen({ route, navigation }: Props) {
  const { conversationId } = route.params;
  const palette = useMessagingPalette();
  const conversation = useConversation(conversationId);
  const messages = useConversationMessages(conversationId);

  const [filter, setFilter] = React.useState<'media' | 'docs'>('media');
  const [booting, setBooting] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const items = React.useMemo(
    () =>
      messages.flatMap((message) =>
        message.attachments.map((attachment) => ({
          id: `${message.id}_${attachment.id}`,
          createdAt: message.createdAt,
          attachment,
        }))
      ),
    [messages]
  );

  const mediaTypes = ['image', 'gif', 'sticker', 'video'];
  const filteredItems = React.useMemo(
    () =>
      items
        .filter((item) =>
          filter === 'media'
            ? mediaTypes.includes(item.attachment.type)
            : !mediaTypes.includes(item.attachment.type)
        )
        .reverse(),
    [items, filter]
  );

  const segments: Array<{ key: 'media' | 'docs'; label: string }> = [
    { key: 'media', label: 'Médias' },
    { key: 'docs', label: 'Documents' },
  ];

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
            <Text style={[styles.headerTitle, { color: palette.text }]}>Médias partagés</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textMuted }]} numberOfLines={1}>
              {conversation?.title ?? 'Discussion'}
            </Text>
          </View>
        </View>

        <View style={[styles.segments, { backgroundColor: palette.surfaceMuted }]}>
          {segments.map((segment) => {
            const active = filter === segment.key;
            return (
              <Pressable
                key={segment.key}
                onPress={() => setFilter(segment.key)}
                style={[styles.segment, active && { backgroundColor: palette.surface }]}
              >
                <Text style={[styles.segmentText, { color: active ? palette.activeStart : palette.textMuted }]}>
                  {segment.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={booting ? [] : filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              {item.attachment.uri &&
              (item.attachment.type === 'image' ||
                item.attachment.type === 'gif' ||
                item.attachment.type === 'sticker') ? (
                <Image source={{ uri: item.attachment.uri }} style={styles.image} />
              ) : (
                <View style={[styles.fallback, { backgroundColor: palette.surfaceMuted }]}>
                  <Ionicons
                    name={item.attachment.type === 'video' ? 'videocam-outline' : 'document-text-outline'}
                    size={22}
                    color={palette.activeStart}
                  />
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={1}>
                  {getAttachmentSummary(item.attachment)}
                </Text>
                <Text style={[styles.cardMeta, { color: palette.textMuted }]}>
                  {formatConversationTimestamp(item.createdAt)}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            booting ? (
              <View style={styles.skeletonGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} width="48%" height={172} radius={22} style={styles.skeletonCard} />
                ))}
              </View>
            ) : (
              <EmptyState
                icon={filter === 'media' ? 'images-outline' : 'document-text-outline'}
                title={filter === 'media' ? 'Aucun média partagé' : 'Aucun document partagé'}
                subtitle="Les images, GIFs, stickers et documents de cette discussion apparaîtront ici."
              />
            )
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
  segments: {
    flexDirection: 'row',
    borderRadius: theme.radii.round,
    padding: 4,
    gap: 4,
    marginBottom: messagingSpacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: theme.radii.round,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: messagingSpacing.sm,
    paddingBottom: theme.spacing.xxl,
    gap: messagingSpacing.sm,
  },
  column: {
    gap: messagingSpacing.sm,
  },
  card: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 132,
  },
  fallback: {
    width: '100%',
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: messagingSpacing.sm,
  },
  skeletonCard: {
    marginBottom: messagingSpacing.sm,
  },
});
