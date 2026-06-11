import React from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { useCallsStore } from '../../../store/callsStore';
import { Avatar } from '../components';
import { useContactLookup, useConversation, useConversationMessages } from '../hooks/useMessagingSelectors';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import {
  getConversationDisplayTitle,
  getConversationKindLabel,
  getDisappearingModeLabel,
  getMediaVisibilityLabel,
  getNotificationPreferenceLabel,
} from '../services/formatters';
import { useMessagingStore } from '../store/useMessagingStore';
import { messagingGradient, messagingSpacing, useMessagingPalette } from '../theme';

type Props = NativeStackScreenProps<MessagingStackParamList, 'ConversationProfile'>;

function Row({
  label,
  value,
  icon,
  onPress,
  danger,
}: {
  label: string;
  value?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  danger?: boolean;
}) {
  const palette = useMessagingPalette();

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: danger ? 'rgba(229,82,82,0.12)' : palette.surfaceMuted },
        ]}
      >
        <Ionicons name={icon} size={18} color={danger ? theme.colors.danger : palette.activeStart} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: danger ? theme.colors.danger : palette.text }]}>{label}</Text>
        {value ? <Text style={[styles.rowValue, { color: palette.textMuted }]}>{value}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={palette.textSoft} />
    </Pressable>
  );
}

function Section({
  children,
  palette,
}: {
  children: React.ReactNode;
  palette: ReturnType<typeof useMessagingPalette>;
}) {
  return (
    <View style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      {children}
    </View>
  );
}

export default function ConversationProfileScreen({ route, navigation }: Props) {
  const { conversationId } = route.params;
  const palette = useMessagingPalette();
  const contacts = useContactLookup();
  const conversations = useMessagingStore((state) => state.conversations);
  const conversation = useConversation(conversationId);
  const messages = useConversationMessages(conversationId);
  const toggleConversationBlocked = useMessagingStore((state) => state.toggleConversationBlocked);
  const toggleConversationMediaVisibility = useMessagingStore((state) => state.toggleConversationMediaVisibility);
  const cycleConversationNotifications = useMessagingStore((state) => state.cycleConversationNotifications);
  const cycleConversationDisappearingMode = useMessagingStore((state) => state.cycleConversationDisappearingMode);
  const addConversationMembers = useMessagingStore((state) => state.addConversationMembers);
  const removeConversationMember = useMessagingStore((state) => state.removeConversationMember);
  const updateConversationMemberRole = useMessagingStore((state) => state.updateConversationMemberRole);
  const openDirectConversation = useMessagingStore((state) => state.openDirectConversation);
  const [avatarPreviewVisible, setAvatarPreviewVisible] = React.useState(false);
  const [memberSheet, setMemberSheet] = React.useState<{ contactId: string; name: string; role: string } | null>(null);
  const [addMembersVisible, setAddMembersVisible] = React.useState(false);
  const [pendingMemberIds, setPendingMemberIds] = React.useState<string[]>([]);

  const directContact = React.useMemo(
    () =>
      conversation?.kind === 'direct'
        ? contacts.find((contact) => contact.id === conversation.participantIds[0])
        : undefined,
    [contacts, conversation]
  );

  const commonGroups = React.useMemo(() => {
    if (!directContact) {
      return [];
    }

    return conversations.filter(
      (item) =>
        item.id !== conversationId &&
        (item.kind === 'group' || item.kind === 'community') &&
        item.participantIds.includes(directContact.id)
    );
  }, [conversationId, conversations, directContact]);

  const addCallRecord = React.useCallback(
    (callType: 'voice' | 'video') => {
      if (!conversation) {
        return;
      }

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
    [conversation]
  );

  if (!conversation) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: palette.text }]}>Profil introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayTitle = getConversationDisplayTitle(conversation);
  const username = directContact
    ? `@${`${directContact.firstName}.${directContact.lastName}`.toLowerCase().replace(/\s+/g, '')}`
    : undefined;
  const isCollective =
    conversation.kind === 'group' || conversation.kind === 'community' || conversation.kind === 'channel';
  const recentAttachments = React.useMemo(
    () =>
      messages
        .flatMap((message) => message.attachments)
        .filter(
          (attachment) =>
            Boolean(attachment.uri) &&
            (attachment.type === 'image' || attachment.type === 'gif' || attachment.type === 'sticker')
        )
        .slice(-6)
        .reverse(),
    [messages]
  );
  const memberContacts = React.useMemo(
    () =>
      (conversation.members ?? [])
        .map((member) => {
          const contact = contacts.find((item) => item.id === member.contactId);

          if (!contact) {
            return null;
          }

          return { contact, role: member.role };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [contacts, conversation.members]
  );

  const candidateContacts = React.useMemo(
    () => contacts.filter((contact) => !conversation.participantIds.includes(contact.id)),
    [contacts, conversation.participantIds]
  );

  const togglePendingMember = (contactId: string) =>
    setPendingMemberIds((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId]
    );

  const confirmAddMembers = () => {
    if (pendingMemberIds.length > 0) {
      addConversationMembers(conversation.id, pendingMemberIds);
    }
    setPendingMemberIds([]);
    setAddMembersVisible(false);
  };

  const handleRemoveMember = (contactId: string, name: string) => {
    setMemberSheet(null);
    Alert.alert('Retirer le membre', `Retirer ${name} de ce groupe ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: () => removeConversationMember(conversation.id, contactId),
      },
    ]);
  };

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
          <Text style={[styles.headerTitle, { color: palette.text }]}>Profil</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Section palette={palette}>
            <View style={styles.hero}>
              <Pressable onPress={() => setAvatarPreviewVisible(true)}>
                <Avatar
                  label={displayTitle}
                  uri={conversation.avatar}
                  color={conversation.avatarColor}
                  kind={conversation.kind}
                  participantIds={conversation.participantIds}
                  size={104}
                  presence={conversation.kind === 'direct' ? conversation.presence : undefined}
                  verified={conversation.isVerified}
                />
              </Pressable>

              <Text style={[styles.heroTitle, { color: palette.text }]}>{displayTitle}</Text>
              {username ? <Text style={[styles.heroUsername, { color: palette.textMuted }]}>{username}</Text> : null}

              {isCollective ? (
                <Text style={[styles.heroMeta, { color: palette.textMuted }]}>
                  {conversation.memberCount ?? conversation.participantIds.length} membres · {getConversationKindLabel(conversation.kind)}
                </Text>
              ) : (
                <>
                  <Text style={[styles.heroMeta, { color: palette.textMuted }]}>
                    {directContact?.countryCode} {directContact?.phoneNumber}
                  </Text>
                  <Text style={[styles.heroMeta, { color: palette.activeStart }]}>
                    {directContact?.isOnline ? 'En ligne' : directContact?.lastSeenLabel ?? conversation.lastSeenLabel}
                  </Text>
                  <Text style={[styles.heroBio, { color: palette.textMuted }]}>
                    {directContact?.about ?? conversation.about}
                  </Text>
                </>
              )}
            </View>
          </Section>

          <Section palette={palette}>
            <View style={styles.quickActions}>
              {[
                {
                  label: 'Message',
                  icon: 'chatbubble-outline' as const,
                  onPress: () => navigation.navigate('Chat', { conversationId: conversation.id }),
                },
                { label: 'Audio', icon: 'call-outline' as const, onPress: () => addCallRecord('voice') },
                { label: 'Video', icon: 'videocam-outline' as const, onPress: () => addCallRecord('video') },
              ].map((item) => (
                <Pressable key={item.label} onPress={item.onPress} style={styles.quickActionWrap}>
                  <LinearGradient
                    colors={messagingGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name={item.icon} size={18} color={theme.colors.white} />
                    <Text style={styles.quickActionTextOnGradient}>{item.label}</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </Section>

          <Section palette={palette}>
            <Pressable
              style={styles.sectionHeaderRow}
              onPress={() => navigation.navigate('ConversationMedia', { conversationId: conversation.id })}
            >
              <Text style={[styles.sectionTitle, { color: palette.textSoft }]}>Médias partagés</Text>
              <Text style={[styles.sectionAction, { color: palette.activeStart }]}>Voir tout</Text>
            </Pressable>

            {recentAttachments.length > 0 ? (
              <View style={styles.mediaRow}>
                {recentAttachments.map((attachment) => (
                  <View
                    key={attachment.id}
                    style={[styles.mediaThumbWrap, { backgroundColor: palette.surfaceMuted }]}
                  >
                    <Image source={{ uri: attachment.uri }} style={styles.mediaThumb} />
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.rowValue, { color: palette.textMuted }]}>
                Aucun média partagé pour le moment.
              </Text>
            )}

            <Row
              label="Documents et liens"
              icon="document-text-outline"
              onPress={() => navigation.navigate('ConversationMedia', { conversationId: conversation.id })}
            />
          </Section>

          {!isCollective ? (
            <>
              <Section palette={palette}>
                <Text style={[styles.sectionTitle, { color: palette.textSoft }]}>Discussion</Text>
                <Row
                  label="Medias"
                  value={getMediaVisibilityLabel(conversation.mediaVisibility)}
                  icon="images-outline"
                  onPress={() => toggleConversationMediaVisibility(conversation.id)}
                />
                <Row
                  label="Groupes en commun"
                  value={
                    commonGroups.length > 0
                      ? commonGroups.map((item) => item.title).slice(0, 2).join(', ')
                      : 'Aucun groupe en commun'
                  }
                  icon="people-outline"
                />
                <Row
                  label="Notifications"
                  value={getNotificationPreferenceLabel(conversation.notificationPreference)}
                  icon="notifications-outline"
                  onPress={() => cycleConversationNotifications(conversation.id)}
                />
                <Row
                  label="Messages ephemeres"
                  value={getDisappearingModeLabel(conversation.disappearingMode)}
                  icon="timer-outline"
                  onPress={() => cycleConversationDisappearingMode(conversation.id)}
                />
                <Row label="Confidentialite" value={conversation.privacyLabel} icon="lock-closed-outline" />
              </Section>

              <Section palette={palette}>
                <Text style={[styles.sectionTitle, { color: palette.textSoft }]}>Securite</Text>
                <Row
                  label={conversation.isBlocked ? 'Debloquer ce contact' : 'Bloquer ce contact'}
                  icon="hand-left-outline"
                  danger={conversation.isBlocked}
                  onPress={() => toggleConversationBlocked(conversation.id)}
                />
                <Row
                  label="Signaler"
                  icon="flag-outline"
                  danger
                  onPress={() => Alert.alert('Signaler', 'Le flow de signalement est pret pour la moderation.')}
                />
              </Section>
            </>
          ) : (
            <>
              <Section palette={palette}>
                <Text style={[styles.sectionTitle, { color: palette.textSoft }]}>Infos du groupe</Text>
                <Row label="Description" value={conversation.description ?? conversation.about} icon="information-circle-outline" />
                <Row label="Notifications" value={getNotificationPreferenceLabel(conversation.notificationPreference)} icon="notifications-outline" />
                <Row label="Messages ephemeres" value={getDisappearingModeLabel(conversation.disappearingMode)} icon="timer-outline" />
                <Row label="Confidentialite" value={conversation.privacyLabel} icon="lock-closed-outline" />
              </Section>

              <Section palette={palette}>
                <Text style={[styles.sectionTitle, { color: palette.textSoft }]}>
                  Membres · {conversation.memberCount ?? memberContacts.length}
                </Text>

                {conversation.kind !== 'channel' ? (
                  <Pressable
                    onPress={() => {
                      setPendingMemberIds([]);
                      setAddMembersVisible(true);
                    }}
                    style={styles.row}
                  >
                    <View style={[styles.rowIcon, { backgroundColor: palette.surfaceMuted }]}>
                      <Ionicons name="person-add-outline" size={18} color={palette.activeStart} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={[styles.rowLabel, { color: palette.activeStart }]}>
                        Ajouter des membres
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.textSoft} />
                  </Pressable>
                ) : null}

                {memberContacts.map(({ contact, role }) => (
                  <Pressable
                    key={contact.id}
                    onPress={() =>
                      setMemberSheet({ contactId: contact.id, name: contact.name, role })
                    }
                    style={styles.memberRow}
                  >
                    <Avatar
                      label={contact.name}
                      uri={contact.avatar}
                      color={contact.avatarColor}
                      kind="direct"
                      size={42}
                      online={contact.isOnline}
                    />
                    <View style={styles.memberText}>
                      <Text style={[styles.memberName, { color: palette.text }]}>{contact.name}</Text>
                      <Text style={[styles.memberMeta, { color: palette.textMuted }]}>
                        {role === 'owner' ? 'Propriétaire' : role === 'admin' ? 'Admin' : 'Membre'}
                      </Text>
                    </View>
                    {role === 'owner' ? (
                      <Ionicons name="shield-checkmark" size={16} color={theme.colors.primary} />
                    ) : (
                      <Ionicons name="ellipsis-horizontal" size={18} color={palette.textSoft} />
                    )}
                  </Pressable>
                ))}
              </Section>
            </>
          )}
        </ScrollView>
      </View>

      <Modal transparent visible={avatarPreviewVisible} animationType="fade" onRequestClose={() => setAvatarPreviewVisible(false)}>
        <View style={[styles.previewOverlay, { backgroundColor: palette.overlay }]}>
          <Pressable
            onPress={() => setAvatarPreviewVisible(false)}
            style={[styles.previewClose, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Ionicons name="close" size={18} color={palette.text} />
          </Pressable>

          <View style={[styles.previewCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            {conversation.avatar ? (
              <Image source={{ uri: conversation.avatar }} style={styles.previewImage} />
            ) : (
              <Avatar
                label={displayTitle}
                uri={conversation.avatar}
                color={conversation.avatarColor}
                kind={conversation.kind}
                participantIds={conversation.participantIds}
                size={180}
                presence={conversation.kind === 'direct' ? conversation.presence : undefined}
                verified={conversation.isVerified}
              />
            )}
            <Text style={[styles.previewTitle, { color: palette.text }]}>{displayTitle}</Text>
            <Text style={[styles.previewSubtitle, { color: palette.textMuted }]}>
              Photo HD et actions rapides de conversation
            </Text>
          </View>
        </View>
      </Modal>

      {/* Member action sheet */}
      <Modal
        transparent
        visible={memberSheet !== null}
        animationType="fade"
        onRequestClose={() => setMemberSheet(null)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setMemberSheet(null)}>
          <View style={[styles.sheet, { backgroundColor: palette.menuBackground, borderColor: palette.border }]}>
            <Text style={[styles.sheetTitle, { color: palette.text }]}>{memberSheet?.name}</Text>

            {memberSheet?.role !== 'admin' && memberSheet?.role !== 'owner' ? (
              <Pressable
                style={styles.sheetRow}
                onPress={() => {
                  if (memberSheet) {
                    updateConversationMemberRole(conversation.id, memberSheet.contactId, 'admin');
                  }
                  setMemberSheet(null);
                }}
              >
                <Ionicons name="shield-outline" size={20} color={palette.activeStart} />
                <Text style={[styles.sheetRowText, { color: palette.text }]}>Promouvoir admin</Text>
              </Pressable>
            ) : memberSheet?.role === 'admin' ? (
              <Pressable
                style={styles.sheetRow}
                onPress={() => {
                  if (memberSheet) {
                    updateConversationMemberRole(conversation.id, memberSheet.contactId, 'member');
                  }
                  setMemberSheet(null);
                }}
              >
                <Ionicons name="shield-half-outline" size={20} color={palette.activeStart} />
                <Text style={[styles.sheetRowText, { color: palette.text }]}>Rétrograder en membre</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={styles.sheetRow}
              onPress={() => {
                if (memberSheet) {
                  const contactId = memberSheet.contactId;
                  setMemberSheet(null);
                  const target = openDirectConversation(contactId);
                  if (target) {
                    navigation.navigate('Chat', { conversationId: target });
                  }
                }
              }}
            >
              <Ionicons name="chatbubble-outline" size={20} color={palette.activeStart} />
              <Text style={[styles.sheetRowText, { color: palette.text }]}>Envoyer un message</Text>
            </Pressable>

            {memberSheet?.role !== 'owner' ? (
              <Pressable
                style={styles.sheetRow}
                onPress={() => memberSheet && handleRemoveMember(memberSheet.contactId, memberSheet.name)}
              >
                <Ionicons name="person-remove-outline" size={20} color={theme.colors.danger} />
                <Text style={[styles.sheetRowText, { color: theme.colors.danger }]}>Retirer du groupe</Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Modal>

      {/* Add members */}
      <Modal
        transparent
        visible={addMembersVisible}
        animationType="slide"
        onRequestClose={() => setAddMembersVisible(false)}
      >
        <View style={styles.addOverlay}>
          <View style={[styles.addSheet, { backgroundColor: palette.background }]}>
            <View style={styles.addHeader}>
              <Pressable onPress={() => setAddMembersVisible(false)} style={styles.headerButtonPlain}>
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
              <Text style={[styles.headerTitle, { color: palette.text }]}>Ajouter des membres</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.addList} showsVerticalScrollIndicator={false}>
              {candidateContacts.length === 0 ? (
                <Text style={[styles.emptyHint, { color: palette.textMuted }]}>
                  Tous vos contacts sont déjà dans ce groupe.
                </Text>
              ) : (
                candidateContacts.map((contact) => {
                  const active = pendingMemberIds.includes(contact.id);
                  return (
                    <Pressable
                      key={contact.id}
                      onPress={() => togglePendingMember(contact.id)}
                      style={styles.memberRow}
                    >
                      <Avatar
                        label={contact.name}
                        uri={contact.avatar}
                        color={contact.avatarColor}
                        kind="direct"
                        size={42}
                        online={contact.isOnline}
                      />
                      <View style={styles.memberText}>
                        <Text style={[styles.memberName, { color: palette.text }]}>{contact.name}</Text>
                        <Text style={[styles.memberMeta, { color: palette.textMuted }]}>
                          {contact.roleLabel}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.checkbox,
                          { borderColor: palette.border },
                          active && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                        ]}
                      >
                        {active ? <Ionicons name="checkmark" size={16} color={theme.colors.white} /> : null}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            <Pressable
              onPress={confirmAddMembers}
              style={[
                styles.addSubmit,
                {
                  backgroundColor:
                    pendingMemberIds.length > 0 ? theme.colors.primary : palette.surfaceStrong,
                },
              ]}
            >
              <Text style={styles.addSubmitText}>
                Ajouter{pendingMemberIds.length > 0 ? ` (${pendingMemberIds.length})` : ''}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  headerSpacer: { width: 40 },
  content: { paddingBottom: theme.spacing.xxl, gap: messagingSpacing.sm },
  section: {
    borderRadius: 22,
    borderWidth: 1,
    padding: theme.spacing.md,
    gap: messagingSpacing.sm,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
  },
  heroTitle: {
    ...theme.typography.title2,
    textAlign: 'center',
  },
  heroUsername: {
    ...theme.typography.bodyMuted,
  },
  heroMeta: {
    ...theme.typography.bodyMuted,
    textAlign: 'center',
  },
  heroBio: {
    ...theme.typography.bodyMuted,
    textAlign: 'center',
  },
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: messagingSpacing.sm,
  },
  mediaThumbWrap: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaThumb: {
    width: '100%',
    height: '100%',
  },
  quickActions: {
    flexDirection: 'row',
    gap: messagingSpacing.sm,
  },
  quickActionWrap: {
    flex: 1,
  },
  quickActionGradient: {
    minHeight: 48,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionTextOnGradient: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.white,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '800',
  },
  row: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.sm,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowValue: {
    ...theme.typography.bodyMuted,
    fontSize: 12,
  },
  memberRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.md,
  },
  memberText: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...theme.typography.title2,
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
    borderRadius: 30,
  },
  previewTitle: {
    ...theme.typography.title2,
    textAlign: 'center',
  },
  previewSubtitle: {
    ...theme.typography.bodyMuted,
    textAlign: 'center',
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
    padding: theme.spacing.md,
  },
  sheet: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    gap: 4,
  },
  sheetTitle: {
    ...theme.typography.title3,
    marginBottom: theme.spacing.xs,
  },
  sheetRow: {
    minHeight: theme.accessibility.minTouchTarget + 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  sheetRowText: {
    fontSize: 15,
    fontWeight: '600',
  },
  addOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  addSheet: {
    height: '82%',
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  addHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  headerButtonPlain: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addList: {
    paddingVertical: theme.spacing.sm,
    gap: 4,
  },
  emptyHint: {
    ...theme.typography.bodyMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSubmit: {
    minHeight: 52,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  addSubmitText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.white,
  },
});
