import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import ConversationRow from '../components/ConversationRow';
import MessagingSheet from '../components/MessagingSheet';
import { useMessagesStore } from '../../../store/messagesStore';
import type { ConversationFilter } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MessagesStackParamList } from '../navigation/MessagesNavigator';

const FILTERS: Array<{ key: ConversationFilter; label: string }> = [
  { key: 'all', label: 'Tous' },
  { key: 'unread', label: 'Non lus' },
  { key: 'favorites', label: 'Favoris' },
  { key: 'groups', label: 'Groupes' },
  { key: 'channels', label: 'Canaux' },
];

type Props = NativeStackScreenProps<MessagesStackParamList, 'Conversations'>;

export default function ConversationsScreen({ navigation }: Props) {
  const [query, setQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<ConversationFilter>('all');
  const [menuVisible, setMenuVisible] = React.useState(false);
  const conversations = useMessagesStore((state) =>
    state.getFilteredConversations(activeFilter, query)
  );
  const markAllAsRead = useMessagesStore((state) => state.markAllAsRead);
  const createCommunityConversation = useMessagesStore((state) => state.createCommunityConversation);
  const unreadCount = useMessagesStore((state) =>
    state.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0)
  );

  const openSettings = () => {
    navigation.getParent()?.getParent()?.navigate('Settings' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.heroGlow} />
        <View style={styles.heroGlowSecondary} />

        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../../../assets/logo.png')}
                resizeMode="contain"
                style={styles.logo}
              />
            </View>
            <View>
              <Text style={styles.brandTitle}>Afroza Campus</Text>
              <Text style={styles.brandSubtitle}>Messaging-first experience</Text>
            </View>
          </View>

          <Pressable onPress={() => setMenuVisible(true)} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text} />
          </Pressable>
        </View>

        <View style={styles.searchShell}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une conversation"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.statsCard}>
          <View>
            <Text style={styles.statsEyebrow}>Messagerie</Text>
            <Text style={styles.statsValue}>{unreadCount} messages a traiter</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('NewDiscussion')}
            style={styles.statsAction}
          >
            <Text style={styles.statsActionText}>Nouvelle discussion</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((filter) => {
            const active = activeFilter === filter.key;

            return (
              <Pressable
                key={filter.key}
                onPress={() => {
                  hapticFeedback.selection();
                  setActiveFilter(filter.key);
                }}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                {active ? (
                  <>
                    <View style={styles.filterBase} />
                    <View style={styles.filterBlend} />
                    <View style={styles.filterHighlight} />
                  </>
                ) : null}
                <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
          renderItem={({ item, index }) => (
            <ConversationRow
              conversation={item}
              index={index}
              onPress={() => {
                hapticFeedback.light();
                navigation.navigate('ChatRoom', { conversationId: item.id });
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucune conversation trouvee</Text>
              <Text style={styles.emptySubtitle}>
                Ajustez votre recherche ou lancez une nouvelle discussion.
              </Text>
            </View>
          }
        />

        <Pressable
          onPress={() => navigation.navigate('NewDiscussion')}
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.96 }] }]}
        >
          <View style={styles.fabBase} />
          <View style={styles.fabBlend} />
          <View style={styles.fabHighlight} />
          <Ionicons name="chatbox-ellipses" size={18} color={theme.colors.white} />
          <Ionicons name="add" size={17} color={theme.colors.white} />
        </Pressable>
      </View>

      <MessagingSheet
        visible={menuVisible}
        title="Actions messagerie"
        subtitle="Acces rapide a la boite de reception"
        onClose={() => setMenuVisible(false)}
        options={[
          {
            key: 'group',
            label: 'Nouveau groupe',
            icon: 'people-outline',
            onPress: () => navigation.navigate('CreateGroup'),
          },
          {
            key: 'community',
            label: 'Nouvelle communaute',
            icon: 'layers-outline',
            onPress: () => {
              const conversationId = createCommunityConversation();
              navigation.navigate('ChatRoom', { conversationId });
            },
          },
          {
            key: 'read',
            label: 'Marquer tout comme lu',
            icon: 'mail-open-outline',
            onPress: () => markAllAsRead(),
          },
          {
            key: 'settings',
            label: 'Parametres',
            icon: 'settings-outline',
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
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
  },
  heroGlow: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 114, 255, 0.10)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    top: 40,
    left: -80,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(0, 255, 106, 0.10)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  logo: {
    width: 34,
    height: 34,
  },
  brandTitle: {
    ...theme.typography.title2,
    fontSize: 22,
  },
  brandSubtitle: {
    ...theme.typography.bodyMuted,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.md,
    minHeight: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
  },
  statsCard: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsEyebrow: {
    ...theme.typography.label,
    color: theme.colors.textMutedOnDark,
    fontSize: 11,
  },
  statsValue: {
    marginTop: 4,
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  statsAction: {
    borderRadius: theme.radii.round,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  statsActionText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  filtersRow: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  filterChip: {
    minHeight: 38,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.round,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    borderColor: 'transparent',
  },
  filterBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primary,
  },
  filterBlend: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    right: -6,
    top: -8,
    backgroundColor: theme.colors.secondary,
    opacity: 0.28,
  },
  filterHighlight: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    left: -8,
    bottom: -10,
    backgroundColor: theme.colors.accent,
    opacity: 0.26,
  },
  filterLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  filterLabelActive: {
    color: theme.colors.white,
  },
  listContent: {
    paddingTop: theme.spacing.xs,
    paddingBottom: 120,
  },
  emptyState: {
    marginTop: theme.spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    ...theme.typography.title3,
  },
  emptySubtitle: {
    ...theme.typography.bodyMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
    ...theme.shadows.floating,
  },
  fabBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primary,
  },
  fabBlend: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    top: -20,
    right: -20,
    backgroundColor: theme.colors.secondary,
    opacity: 0.28,
  },
  fabHighlight: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    left: -18,
    bottom: -18,
    backgroundColor: theme.colors.accent,
    opacity: 0.22,
  },
});
