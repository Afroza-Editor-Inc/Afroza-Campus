import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import { Avatar } from '../components';
import { useMessagingStore } from '../store/useMessagingStore';
import { getConversationDisplayTitle } from '../services/formatters';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';

type Props = NativeStackScreenProps<MessagingStackParamList, 'ForwardMessage'>;

export default function ForwardMessageScreen({ route, navigation }: Props) {
  const { conversationId, messageId } = route.params;
  const conversations = useMessagingStore((state) => state.conversations);
  const messages = useMessagingStore((state) => state.messagesByConversation[conversationId] ?? []);
  const forwardMessage = useMessagingStore((state) => state.forwardMessage);

  const source = messages.find((message) => message.id === messageId);
  const [selected, setSelected] = React.useState<string[]>([]);

  const targets = conversations.filter(
    (conversation) => conversation.id !== conversationId && !conversation.isArchived
  );

  const toggle = (id: string) => {
    hapticFeedback.selection();
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const confirm = () => {
    if (!source || selected.length === 0) {
      hapticFeedback.error();
      return;
    }
    hapticFeedback.strong();
    selected.forEach((targetId) => forwardMessage(targetId, source));

    if (selected.length === 1) {
      navigation.replace('Chat', { conversationId: selected[0] });
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color={theme.colors.textStrong} />
        </Pressable>
        <Text style={styles.headerTitle}>Transférer à…</Text>
        <View style={styles.headerButton} />
      </View>

      {source ? (
        <View style={styles.preview}>
          <Ionicons name="arrow-redo-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.previewText} numberOfLines={1}>
            {source.text || source.attachments[0]?.label || 'Pièce jointe'}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={targets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const active = selected.includes(item.id);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => toggle(item.id)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <Avatar
                label={getConversationDisplayTitle(item)}
                uri={item.avatar}
                color={item.avatarColor}
                kind={item.kind}
                participantIds={item.participantIds}
                size={44}
              />
              <Text style={styles.rowTitle} numberOfLines={1}>
                {getConversationDisplayTitle(item)}
              </Text>
              <View style={[styles.checkbox, active && styles.checkboxActive]}>
                {active ? <Ionicons name="checkmark" size={16} color={theme.colors.white} /> : null}
              </View>
            </Pressable>
          );
        }}
      />

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Envoyer"
          onPress={confirm}
          style={({ pressed }) => [
            styles.submit,
            selected.length === 0 && styles.submitDisabled,
            pressed && selected.length > 0 && styles.submitPressed,
          ]}
        >
          <Ionicons name="send" size={18} color={theme.colors.white} />
          <Text style={styles.submitText}>
            Envoyer{selected.length > 0 ? ` (${selected.length})` : ''}
          </Text>
        </Pressable>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primarySoft,
  },
  previewText: {
    flex: 1,
    ...theme.typography.bodyMuted,
    color: theme.colors.primaryDeep,
  },
  list: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  rowPressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  rowTitle: {
    flex: 1,
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textStrong,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    minHeight: 52,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
  },
  submitDisabled: {
    backgroundColor: theme.colors.surfaceStrong,
  },
  submitPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  submitText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.white,
  },
});
