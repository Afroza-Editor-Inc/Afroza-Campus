import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { useConversation } from '../hooks/useMessagingSelectors';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import {
  getDisappearingModeLabel,
  getMediaVisibilityLabel,
  getNotificationPreferenceLabel,
} from '../services/formatters';
import { useMessagingStore } from '../store/useMessagingStore';
import { messagingSpacing, useMessagingPalette } from '../theme';

type Props = NativeStackScreenProps<MessagingStackParamList, 'ConversationPreferences'>;

function PreferenceRow({
  icon,
  label,
  value,
  danger,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const palette = useMessagingPalette();

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: danger ? 'rgba(229,82,82,0.12)' : palette.surfaceMuted,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={danger ? theme.colors.danger : palette.activeStart} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, { color: danger ? theme.colors.danger : palette.text }]}>{label}</Text>
        {value ? <Text style={[styles.rowValue, { color: palette.textMuted }]}>{value}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={palette.textSoft} />
    </Pressable>
  );
}

export default function ConversationPreferencesScreen({ route, navigation }: Props) {
  const { conversationId } = route.params;
  const palette = useMessagingPalette();
  const conversation = useConversation(conversationId);
  const cycleConversationNotifications = useMessagingStore((state) => state.cycleConversationNotifications);
  const toggleConversationMediaVisibility = useMessagingStore((state) => state.toggleConversationMediaVisibility);
  const cycleConversationDisappearingMode = useMessagingStore((state) => state.cycleConversationDisappearingMode);
  const toggleConversationLock = useMessagingStore((state) => state.toggleConversationLock);
  const toggleConversationBlocked = useMessagingStore((state) => state.toggleConversationBlocked);
  const deleteConversation = useMessagingStore((state) => state.deleteConversation);

  if (!conversation) {
    return null;
  }

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
            <Text style={[styles.headerTitle, { color: palette.text }]}>Preferences</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textMuted }]} numberOfLines={1}>
              Reglages de {conversation.title}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <PreferenceRow
            icon="notifications-outline"
            label="Notifications"
            value={getNotificationPreferenceLabel(conversation.notificationPreference)}
            onPress={() => cycleConversationNotifications(conversation.id)}
          />
          <PreferenceRow
            icon="images-outline"
            label="Visibilite des medias"
            value={getMediaVisibilityLabel(conversation.mediaVisibility)}
            onPress={() => toggleConversationMediaVisibility(conversation.id)}
          />
          <PreferenceRow
            icon="timer-outline"
            label="Messages ephemeres"
            value={getDisappearingModeLabel(conversation.disappearingMode)}
            onPress={() => cycleConversationDisappearingMode(conversation.id)}
          />
          <PreferenceRow
            icon="lock-closed-outline"
            label="Verrouillage local"
            value={conversation.lockEnabled ? 'Active' : 'Desactive'}
            onPress={() => toggleConversationLock(conversation.id)}
          />
        </View>

        <View style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <PreferenceRow
            icon="hand-left-outline"
            label={conversation.isBlocked ? 'Debloquer le contact' : 'Bloquer le contact'}
            value={conversation.isBlocked ? 'Interaction suspendue' : 'Masquer les messages entrants'}
            danger={conversation.isBlocked}
            onPress={() => toggleConversationBlocked(conversation.id)}
          />
          <PreferenceRow
            icon="trash-outline"
            label="Effacer la discussion"
            value="Supprimer tous les messages de cette conversation"
            danger
            onPress={() => {
              deleteConversation(conversation.id);
              navigation.popToTop();
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    gap: messagingSpacing.md,
  },
  header: {
    paddingBottom: messagingSpacing.xs,
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
  section: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    minHeight: 68,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.md,
  },
  rowIcon: {
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
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowValue: {
    fontSize: 12,
    fontWeight: '500',
  },
});
