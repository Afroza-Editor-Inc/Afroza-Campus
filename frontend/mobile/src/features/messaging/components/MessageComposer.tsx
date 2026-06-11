import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../theme';
import type { MessageAttachment } from '../types';

const QUICK_REACTIONS = ['Salut', 'On y va', 'Bravo', 'Merci'];
const QUICK_GIFS = ['GIF: Campus vibe', 'GIF: Sprint done'];
const QUICK_STICKERS = ['Sticker: Fire', 'Sticker: Clap'];

type MessageComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  blocked?: boolean;
  attachments: MessageAttachment[];
  onRemoveAttachment: (attachmentId: string) => void;
  onOpenAttachments: () => void;
  onOpenCamera: () => void;
  onSend: () => void;
  onVoiceNote: () => void;
  onInsertSnippet: (value: string) => void;
};

export default function MessageComposer({
  value,
  onChangeText,
  blocked,
  attachments,
  onRemoveAttachment,
  onOpenAttachments,
  onOpenCamera,
  onSend,
  onVoiceNote,
  onInsertSnippet,
}: MessageComposerProps) {
  const [panelVisible, setPanelVisible] = React.useState(false);
  const hasContent = value.trim().length > 0 || attachments.length > 0;

  return (
    <View style={styles.wrap}>
      {attachments.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.attachmentsRow}
        >
          {attachments.map((attachment) => (
            <View key={attachment.id} style={styles.attachmentChip}>
              <Text style={styles.attachmentChipText} numberOfLines={1}>
                {attachment.label}
              </Text>
              <Pressable onPress={() => onRemoveAttachment(attachment.id)}>
                <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {panelVisible ? (
        <View style={styles.quickPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {QUICK_REACTIONS.map((item) => (
              <Pressable
                key={item}
                onPress={() => onInsertSnippet(item)}
                style={styles.quickPill}
              >
                <Text style={styles.quickPillText}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {[...QUICK_GIFS, ...QUICK_STICKERS].map((item) => (
              <Pressable
                key={item}
                onPress={() => onInsertSnippet(item)}
                style={[styles.quickPill, styles.quickPillSoft]}
              >
                <Text style={styles.quickPillText}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {blocked ? (
        <View style={styles.blockedBanner}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.danger} />
          <Text style={styles.blockedText}>Discussion bloquee. Debloquez-la depuis le menu.</Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <Pressable onPress={() => setPanelVisible((current) => !current)} style={styles.iconButton}>
          <Ionicons name="happy-outline" size={21} color={theme.colors.primary} />
        </Pressable>

        <Pressable onPress={onOpenAttachments} style={styles.iconButton}>
          <Ionicons name="attach" size={21} color={theme.colors.primary} />
        </Pressable>

        <Pressable onPress={onOpenCamera} style={styles.iconButton}>
          <Ionicons name="camera-outline" size={21} color={theme.colors.primary} />
        </Pressable>

        <View style={styles.inputShell}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Votre message"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            multiline
            editable={!blocked}
          />
        </View>

        <Pressable
          onPress={hasContent ? onSend : onVoiceNote}
          style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}
          disabled={blocked}
        >
          <Ionicons
            name={hasContent ? 'send' : 'mic'}
            size={18}
            color={theme.colors.white}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.xs,
  },
  attachmentsRow: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  attachmentChip: {
    maxWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
  },
  attachmentChipText: {
    ...theme.typography.label,
    flexShrink: 1,
  },
  quickPanel: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },
  quickRow: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  quickPill: {
    borderRadius: theme.radii.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: theme.colors.primarySoft,
  },
  quickPillSoft: {
    backgroundColor: theme.colors.surfaceStrong,
  },
  quickPillText: {
    ...theme.typography.label,
    color: theme.colors.primaryDeep,
    fontSize: 12,
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
    backgroundColor: 'rgba(229, 82, 82, 0.1)',
  },
  blockedText: {
    ...theme.typography.bodyMuted,
    flex: 1,
    color: theme.colors.danger,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 2,
    paddingBottom: theme.spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  inputShell: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
  },
  input: {
    ...theme.typography.body,
    maxHeight: 96,
    paddingVertical: theme.spacing.sm,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
});
