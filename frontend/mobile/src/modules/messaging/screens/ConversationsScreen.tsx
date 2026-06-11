import React from 'react';
import { FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { useCallsStore } from '../../../store/callsStore';
import { hapticFeedback } from '../../../utils/haptics';
import {
  ActiveNowRail,
  Avatar,
  ConversationItem,
  MessagingActionSheet,
  MessagingDrawer,
  MessagingFab,
  MessagingSearchOverlay,
  QuickSections,
  type DrawerKey,
  type FabActionKey,
  type QuickSectionKey,
} from '../components';
import { EmptyState, ListSkeleton } from '../../../components/feedback';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { getConversationDisplayTitle } from '../services/formatters';
import { useMessagingStore } from '../store/useMessagingStore';
import { messagingSpacing, useMessagingPalette } from '../theme';
import type { MessagingConversation } from '../types';

type Props = NativeStackScreenProps<MessagingStackParamList, 'Conversations'>;

const EMPTY_STATES: Record<
  QuickSectionKey,
  { icon: 'chatbubble-ellipses-outline' | 'mail-unread-outline' | 'star-outline' | 'people-outline' | 'megaphone-outline' | 'planet-outline' | 'archive-outline'; title: string; subtitle: string }
> = {
  all: {
    icon: 'chatbubble-ellipses-outline',
    title: 'Aucune discussion',
    subtitle: 'Démarrez une conversation avec le bouton + en bas à droite.',
  },
  unread: {
    icon: 'mail-unread-outline',
    title: 'Tout est lu',
    subtitle: 'Vous êtes à jour, aucun message non lu.',
  },
  favorites: {
    icon: 'star-outline',
    title: 'Aucun favori',
    subtitle: 'Marquez vos discussions importantes comme favorites.',
  },
  groups: {
    icon: 'people-outline',
    title: 'Aucun groupe',
    subtitle: 'Créez un groupe pour collaborer avec votre promo.',
  },
  channels: {
    icon: 'megaphone-outline',
    title: 'Aucun canal',
    subtitle: 'Suivez des canaux pour rester informé du campus.',
  },
  communities: {
    icon: 'planet-outline',
    title: 'Aucune communauté',
    subtitle: 'Rejoignez des communautés étudiantes pour échanger.',
  },
  archived: {
    icon: 'archive-outline',
    title: 'Aucune archive',
    subtitle: 'Les conversations archivées apparaîtront ici.',
  },
};

export default function ConversationsScreen({ navigation }: Props) {
  const palette = useMessagingPalette();
  const allConversations = useMessagingStore((state) => state.conversations);
  const ui = useMessagingStore((state) => state.ui);
  const [section, setSection] = React.useState<QuickSectionKey>('all');

  const conversations = React.useMemo(() => {
    const query = ui.conversationQuery.trim().toLowerCase();
    return allConversations
      .filter((conversation) => {
        if (section === 'archived') {
          if (!conversation.isArchived) return false;
        } else if (conversation.isArchived) {
          return false;
        }
        if (section === 'unread' && conversation.unreadCount === 0) return false;
        if (section === 'favorites' && !conversation.isFavorite) return false;
        if (section === 'groups' && conversation.kind !== 'group') return false;
        if (section === 'channels' && conversation.kind !== 'channel') return false;
        if (section === 'communities' && conversation.kind !== 'community') return false;
        if (query.length > 0) {
          const haystack = `${getConversationDisplayTitle(conversation)} ${conversation.previewText ?? ''} ${conversation.subtitle ?? ''}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort(
        (left, right) =>
          Number(right.isPinned) - Number(left.isPinned) ||
          right.updatedAt.getTime() - left.updatedAt.getTime()
      );
  }, [allConversations, section, ui.conversationQuery]);
  const markConversationRead = useMessagingStore((state) => state.markConversationRead);
  const markConversationUnread = useMessagingStore((state) => state.markConversationUnread);
  const toggleConversationFavorite = useMessagingStore((state) => state.toggleConversationFavorite);
  const toggleConversationPinned = useMessagingStore((state) => state.toggleConversationPinned);
  const toggleConversationArchived = useMessagingStore((state) => state.toggleConversationArchived);
  const toggleConversationMuted = useMessagingStore((state) => state.toggleConversationMuted);
  const deleteConversation = useMessagingStore((state) => state.deleteConversation);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [selectedConversation, setSelectedConversation] = React.useState<MessagingConversation | null>(null);
  const [avatarPreviewConversation, setAvatarPreviewConversation] =
    React.useState<MessagingConversation | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [booting, setBooting] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const openConversation = React.useCallback(
    (conversationId: string) => {
      hapticFeedback.light();
      navigation.navigate('Chat', { conversationId });
    },
    [navigation]
  );

  const handleFabAction = React.useCallback(
    (key: FabActionKey) => {
      switch (key) {
        case 'chat':
          navigation.navigate('NewChat');
          break;
        case 'group':
          navigation.navigate('CreateGroup');
          break;
        case 'community':
        case 'channel':
          navigation.getParent()?.navigate('Communities');
          break;
      }
    },
    [navigation]
  );

  const handleDrawerNavigate = React.useCallback(
    (key: DrawerKey) => {
      switch (key) {
        case 'mon-profil':
        case 'modifier-profil':
          navigation.getParent()?.navigate('Profile');
          break;
        case 'messages-saved':
          navigation.navigate('StarredMessages');
          break;
        case 'messages-archived':
          setSection('archived');
          break;
        case 'messages-drafts':
          navigation.navigate('NewChat');
          break;
        case 'media-photos':
        case 'media-videos':
        case 'media-documents':
          navigation.navigate('MessagingSection', { variant: 'storage' });
          break;
        case 'settings-notifications':
          navigation.navigate('MessagingSection', { variant: 'notifications' });
          break;
        case 'settings-privacy':
          navigation.navigate('MessagingSection', { variant: 'privacy' });
          break;
        case 'settings-storage':
          navigation.navigate('MessagingSection', { variant: 'storage' });
          break;
        case 'settings-appearance':
          navigation.navigate('MessagingSettings');
          break;
        case 'settings-security':
          navigation.navigate('MessagingSection', { variant: 'locked' });
          break;
      }
    },
    [navigation]
  );

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  const renderConversation = React.useCallback(
    ({ item, index }: { item: MessagingConversation; index: number }) => (
      <ConversationItem
        conversation={item}
        index={index}
        onPress={() => openConversation(item.id)}
        onLongPress={() => setSelectedConversation(item)}
        onAvatarPress={() => setAvatarPreviewConversation(item)}
        onTogglePin={() => toggleConversationPinned(item.id)}
        onToggleMute={() => toggleConversationMuted(item.id)}
        onArchive={() => toggleConversationArchived(item.id)}
        onDelete={() => deleteConversation(item.id)}
      />
    ),
    [
      openConversation,
      toggleConversationPinned,
      toggleConversationMuted,
      toggleConversationArchived,
      deleteConversation,
    ]
  );

  const conversationSeparator = React.useCallback(
    () => <View style={{ height: messagingSpacing.xs }} />,
    []
  );

  const previewTitle = avatarPreviewConversation
    ? getConversationDisplayTitle(avatarPreviewConversation)
    : '';

  const launchCall = React.useCallback(
    (callType: 'voice' | 'video', conversation: MessagingConversation) => {
      useCallsStore.getState().addCall({
        id: `call_${Date.now()}`,
        participantId: conversation.id,
        participantName: getConversationDisplayTitle(conversation),
        participantAvatar: conversation.avatar,
        type: 'outgoing',
        callType,
        timestamp: new Date(),
      });
    },
    []
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.header}>
          <View style={styles.brandWrap}>
            <Image
              source={require('../../../assets/logo.png')}
              resizeMode="contain"
              style={styles.logo}
            />
            <Text style={[styles.brandTitle, { color: palette.text }]}>Afroza Campus</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profil"
              hitSlop={theme.accessibility.hitSlop}
              onPress={() => {
                hapticFeedback.selection();
                navigation.getParent()?.navigate('Profile');
              }}
              style={({ pressed }) => [styles.headerIcon, pressed && styles.headerIconPressed]}
            >
              <Ionicons name="person-circle-outline" size={27} color={palette.text} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              hitSlop={theme.accessibility.hitSlop}
              onPress={() => {
                hapticFeedback.selection();
                navigation.getParent()?.navigate('Notifications');
              }}
              style={({ pressed }) => [styles.headerIcon, pressed && styles.headerIconPressed]}
            >
              <Ionicons name="notifications-outline" size={24} color={palette.text} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Menu messagerie"
              hitSlop={theme.accessibility.hitSlop}
              onPress={() => {
                hapticFeedback.selection();
                setMenuVisible(true);
              }}
              style={({ pressed }) => [styles.headerIcon, pressed && styles.headerIconPressed]}
            >
              <Ionicons name="menu-outline" size={26} color={palette.text} />
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Rechercher"
          onPress={() => {
            hapticFeedback.selection();
            setSearchVisible(true);
          }}
          style={({ pressed }) => [
            styles.searchTrigger,
            { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
            pressed && styles.searchTriggerPressed,
          ]}
        >
          <Ionicons name="search" size={17} color={palette.textMuted} />
          <Text style={[styles.searchPlaceholder, { color: palette.textMuted }]} numberOfLines={1}>
            Rechercher
          </Text>
        </Pressable>

        <View style={styles.tabsWrap}>
          <QuickSections conversations={allConversations} activeKey={section} onSelect={setSection} />
        </View>

        <FlatList
          data={booting ? [] : conversations}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={palette.activeStart}
              colors={[palette.activeStart]}
            />
          }
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          removeClippedSubviews
          ListHeaderComponent={
            ui.conversationQuery.trim().length === 0 ? (
              <ActiveNowRail conversations={allConversations} onPressConversation={openConversation} />
            ) : null
          }
          ItemSeparatorComponent={conversationSeparator}
          renderItem={renderConversation}
          ListEmptyComponent={
            booting ? (
              <ListSkeleton count={7} />
            ) : (
              <EmptyState
                icon={EMPTY_STATES[section].icon}
                title={EMPTY_STATES[section].title}
                subtitle={
                  ui.conversationQuery.trim().length > 0
                    ? 'Aucune conversation ne correspond à cette recherche.'
                    : EMPTY_STATES[section].subtitle
                }
              />
            )
          }
        />

        <MessagingFab bottomOffset={theme.navigation.barHeight - 18} onAction={handleFabAction} />
      </View>

      <MessagingDrawer
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={handleDrawerNavigate}
      />

      <MessagingSearchOverlay
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />

      <MessagingActionSheet
        title={selectedConversation ? getConversationDisplayTitle(selectedConversation) : 'Discussion'}
        visible={selectedConversation !== null}
        onClose={() => setSelectedConversation(null)}
        items={
          selectedConversation
            ? [
                { label: 'Ouvrir', icon: 'chatbubble-outline', onPress: () => openConversation(selectedConversation.id) },
                {
                  label: selectedConversation.unreadCount > 0 ? 'Marquer comme lu' : 'Marquer comme non lu',
                  icon: selectedConversation.unreadCount > 0 ? 'mail-open-outline' : 'mail-unread-outline',
                  onPress: () =>
                    selectedConversation.unreadCount > 0
                      ? markConversationRead(selectedConversation.id)
                      : markConversationUnread(selectedConversation.id),
                },
                {
                  label: selectedConversation.isPinned ? 'Desepingler' : 'Epingler',
                  icon: selectedConversation.isPinned ? 'pin' : 'pin-outline',
                  onPress: () => toggleConversationPinned(selectedConversation.id),
                },
                {
                  label: selectedConversation.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
                  icon: selectedConversation.isFavorite ? 'star' : 'star-outline',
                  onPress: () => toggleConversationFavorite(selectedConversation.id),
                },
                {
                  label: selectedConversation.isMuted ? 'Activer les notifications' : 'Mettre en sourdine',
                  icon: 'volume-mute-outline',
                  onPress: () => toggleConversationMuted(selectedConversation.id),
                },
                { label: 'Archiver', icon: 'archive-outline', onPress: () => toggleConversationArchived(selectedConversation.id) },
                { label: 'Supprimer', icon: 'trash-outline', tone: 'danger', onPress: () => deleteConversation(selectedConversation.id) },
              ]
            : []
        }
      />

      <Modal
        visible={avatarPreviewConversation !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarPreviewConversation(null)}
      >
        <View style={[styles.previewOverlay, { backgroundColor: palette.overlay }]}>
          <Pressable
            onPress={() => setAvatarPreviewConversation(null)}
            style={[styles.previewClose, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Ionicons name="close" size={18} color={palette.text} />
          </Pressable>

          <View style={[styles.previewCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            {avatarPreviewConversation?.avatar ? (
              <Image source={{ uri: avatarPreviewConversation.avatar }} style={styles.previewImage} />
            ) : avatarPreviewConversation ? (
              <Avatar
                label={previewTitle}
                uri={avatarPreviewConversation.avatar}
                color={avatarPreviewConversation.avatarColor}
                kind={avatarPreviewConversation.kind}
                participantIds={avatarPreviewConversation.participantIds}
                size={180}
                presence={avatarPreviewConversation.kind === 'direct' ? avatarPreviewConversation.presence : undefined}
                verified={avatarPreviewConversation.isVerified}
              />
            ) : null}

            {avatarPreviewConversation ? (
              <>
                <Text style={[styles.previewTitle, { color: palette.text }]}>{previewTitle}</Text>
                <View style={styles.previewActions}>
                  {[
                    { label: 'Message', icon: 'chatbubble-outline' as const, onPress: () => openConversation(avatarPreviewConversation.id) },
                    { label: 'Appel', icon: 'call-outline' as const, onPress: () => launchCall('voice', avatarPreviewConversation) },
                    { label: 'Video', icon: 'videocam-outline' as const, onPress: () => launchCall('video', avatarPreviewConversation) },
                    {
                      label: 'Profil',
                      icon: 'person-circle-outline' as const,
                      onPress: () =>
                        navigation.navigate('ConversationProfile', {
                          conversationId: avatarPreviewConversation.id,
                        }),
                    },
                  ].map((item) => (
                    <Pressable
                      key={item.label}
                      onPress={() => {
                        setAvatarPreviewConversation(null);
                        item.onPress();
                      }}
                      style={[styles.previewAction, { backgroundColor: palette.surfaceMuted }]}
                    >
                      <Ionicons name={item.icon} size={18} color={palette.activeStart} />
                      <Text style={[styles.previewActionText, { color: palette.text }]}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
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
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
  },
  brandTitle: {
    ...theme.typography.title3,
    fontWeight: '800',
    lineHeight: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconPressed: {
    opacity: 0.55,
  },
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    height: 40,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: messagingSpacing.xs,
    marginBottom: messagingSpacing.sm,
  },
  searchTriggerPressed: {
    opacity: 0.7,
  },
  searchPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  tabsWrap: {
    marginBottom: messagingSpacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl + 32,
  },
  previewOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  previewClose: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  previewImage: {
    width: 220,
    height: 220,
    borderRadius: 28,
  },
  previewTitle: {
    ...theme.typography.title2,
    textAlign: 'center',
  },
  previewActions: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: messagingSpacing.sm,
  },
  previewAction: {
    width: '48%',
    minHeight: 46,
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  previewActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
