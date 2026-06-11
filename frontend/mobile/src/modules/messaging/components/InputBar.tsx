import React from 'react';
import {
  Image,
  InteractionManager,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { EmojiKeyboard } from 'rn-emoji-keyboard';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import { useMessagingStore } from '../store/useMessagingStore';
import { EMOJI_PANEL_HEIGHT, PANEL_TRANSITION_MS } from '../constants/composerLayout';
import { messagingGradient, messagingSpacing, useMessagingPalette } from '../theme';
import type { EmojiPanelTab, MessageAttachment } from '../types';

const SHEET_TABS: Array<{ key: EmojiPanelTab; label: string; icon?: string }> = [
  { key: 'emoji', label: 'Emojis', icon: '😊' },
  { key: 'gif', label: 'GIF' },
  { key: 'sticker', label: 'Stickers' },
];

const QUICK_GIFS = [
  {
    id: 'gif_focus',
    label: 'Focus mode',
    uri: 'https://media.tenor.com/S61VCO73mOAAAAAC/work-hard.gif',
  },
  {
    id: 'gif_team',
    label: 'Team win',
    uri: 'https://media.tenor.com/0AVbKGY_MxMAAAAC/lets-go-excited.gif',
  },
  {
    id: 'gif_campus',
    label: 'Campus vibes',
    uri: 'https://media.tenor.com/FN6kL4F1sMIAAAAC/happy-dance.gif',
  },
  {
    id: 'gif_ship',
    label: 'Ship it',
    uri: 'https://media.tenor.com/8M1SizP0R5QAAAAC/approved-nice.gif',
  },
  {
    id: 'gif_clap',
    label: 'Bravo',
    uri: 'https://media.tenor.com/Z4eXgQ7TbVkAAAAC/clapping.gif',
  },
  {
    id: 'gif_thumbsup',
    label: 'Top',
    uri: 'https://media.tenor.com/1Nv9c1Kg7g8AAAAC/thumbs-up.gif',
  },
];

const QUICK_STICKERS = [
  {
    id: 'sticker_proud',
    label: 'Proud of this',
    uri: 'https://placehold.co/320x320/0072FF/FFFFFF/png?text=Proud',
  },
  {
    id: 'sticker_locked',
    label: 'Locked in',
    uri: 'https://placehold.co/320x320/00C557/FFFFFF/png?text=Locked+In',
  },
  {
    id: 'sticker_study',
    label: 'Study sprint',
    uri: 'https://placehold.co/320x320/0E3E87/FFFFFF/png?text=Study',
  },
  {
    id: 'sticker_afroza',
    label: 'Afroza mood',
    uri: 'https://placehold.co/320x320/172235/FFFFFF/png?text=Afroza',
  },
  {
    id: 'sticker_gg',
    label: 'GG',
    uri: 'https://placehold.co/320x320/00A3FF/FFFFFF/png?text=GG',
  },
  {
    id: 'sticker_fire',
    label: 'On fire',
    uri: 'https://placehold.co/320x320/E55252/FFFFFF/png?text=Fire',
  },
];

type AssetItem = { id: string; label: string; uri: string };

type InputBarProps = {
  value: string;
  attachments: MessageAttachment[];
  blocked?: boolean;
  isRecording: boolean;
  recordingDurationLabel: string;
  bottomInset?: number;
  safeAreaBottom?: number;
  /** Hauteur du panneau emoji — calée sur la hauteur du clavier pour la continuité visuelle. */
  emojiPanelHeight?: number;
  /** Le parent gère le positionnement clavier (dock absolu). */
  dockMode?: boolean;
  onChangeText: (value: string) => void;
  onInsertSnippet: (value: string) => void;
  onAddAttachment: (attachment: MessageAttachment) => void;
  onSendAttachment?: (attachment: MessageAttachment) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onOpenAttachments: () => void;
  onOpenCamera: () => void;
  onSend: () => void;
  onStartVoiceRecording: () => Promise<boolean | void> | boolean | void;
  onStopVoiceRecording: () => Promise<void> | void;
  onCancelVoiceRecording?: () => Promise<void> | void;
  onPanelVisibilityChange?: (visible: boolean) => void;
};

function AssetGrid({
  items,
  type,
  favoriteIds,
  onSelect,
  onToggleFavorite,
}: {
  items: AssetItem[];
  type: 'gif' | 'sticker';
  favoriteIds: string[];
  onSelect: (item: AssetItem) => void;
  onToggleFavorite: (item: AssetItem, type: 'gif' | 'sticker') => void;
}) {
  const palette = useMessagingPalette();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.assetGrid}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onSelect(item)}
          style={[styles.assetCard, { backgroundColor: palette.surface, borderColor: palette.border }]}
        >
          <Image source={{ uri: item.uri }} style={styles.assetImage} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favoriteIds.includes(item.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'
            }
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onToggleFavorite(item, type);
            }}
            style={[styles.assetFavorite, { backgroundColor: palette.menuBackground }]}
          >
            <Ionicons
              name={favoriteIds.includes(item.id) ? 'star' : 'star-outline'}
              size={15}
              color={favoriteIds.includes(item.id) ? theme.colors.warning : palette.textMuted}
            />
          </Pressable>
          <View style={styles.assetMeta}>
            <Text style={[styles.assetLabel, { color: palette.text }]} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={[styles.assetCaption, { color: palette.textMuted }]}>
              {type === 'gif' ? 'Animé' : 'Pack Afroza'}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function VoiceWave({ color }: { color: string }) {
  const phase = useSharedValue(0);

  React.useEffect(() => {
    phase.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [phase]);

  return (
    <View style={styles.waveRow}>
      {Array.from({ length: 22 }).map((_, index) => (
        <WaveBar key={index} index={index} phase={phase} color={color} />
      ))}
    </View>
  );
}

function WaveBar({
  index,
  phase,
  color,
}: {
  index: number;
  phase: ReturnType<typeof useSharedValue<number>>;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const base = 4 + ((index * 7) % 16);
    const wobble = interpolate(phase.value, [0, 1], [0.5, 1.4]);
    const offset = ((index % 4) + 1) / 4;
    return {
      height: base * (0.6 + wobble * offset),
    };
  });

  return <Animated.View style={[styles.waveBar, { backgroundColor: color }, style]} />;
}

function mergeAssetsById(items: AssetItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

const EMOJI_KEYBOARD_STYLES = {
  container: {
    flex: 1,
    borderRadius: 0,
    // Neutralise l'ombre/elevation interne lourde de la librairie (rendu « flottant »).
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  searchBar: {
    container: {
      height: 32,
      borderRadius: 10,
      marginHorizontal: 8,
      marginTop: 4,
      marginBottom: 2,
      paddingHorizontal: 10,
    },
    text: { fontSize: 14 },
  },
  category: {
    container: {
      paddingHorizontal: 6,
      paddingVertical: 4,
      gap: 2,
      alignItems: 'center' as const,
    },
    icon: { fontSize: 21 },
  },
};

const InlineEmojiKeyboard = React.memo(function InlineEmojiKeyboard({
  isDark,
  palette,
  onEmojiSelected,
}: {
  isDark: boolean;
  palette: ReturnType<typeof useMessagingPalette>;
  onEmojiSelected: (emoji: string) => void;
}) {
  const keyboardTheme = React.useMemo(
    () =>
      isDark
        ? {
            backdrop: 'transparent',
            knob: palette.activeStart,
            container: palette.menuBackground,
            header: palette.text,
            skinTonesContainer: palette.surfaceMuted,
            category: {
              icon: palette.textMuted,
              iconActive: palette.activeStart,
              container: 'transparent',
              containerActive: palette.surfaceStrong,
            },
            search: {
              background: palette.surface,
              text: palette.text,
              placeholder: palette.textMuted,
              icon: palette.textMuted,
            },
          }
        : {
            backdrop: 'transparent',
            knob: palette.activeStart,
            container: palette.menuBackground,
            category: {
              icon: palette.textMuted,
              iconActive: palette.activeStart,
              container: 'transparent',
              containerActive: palette.surfaceStrong,
            },
            search: {
              background: palette.surface,
              text: palette.text,
              placeholder: palette.textMuted,
              icon: palette.textMuted,
            },
          },
    [
      isDark,
      palette.activeStart,
      palette.menuBackground,
      palette.surface,
      palette.surfaceMuted,
      palette.surfaceStrong,
      palette.text,
      palette.textMuted,
    ]
  );

  return (
    <EmojiKeyboard
      onEmojiSelected={(emoji) => onEmojiSelected(emoji.emoji)}
      enableSearchBar
      enableRecentlyUsed
      enableCategoryChangeAnimation={false}
      enableSearchAnimation={false}
      categoryPosition="bottom"
      emojiSize={25}
      // Précharge davantage d'emojis dès l'ouverture → suppression de l'effet « chargement progressif ».
      defaultHeight="75%"
      // Le dock gère déjà la safe area : on évite un padding bas en double dans le panneau.
      disableSafeArea
      styles={EMOJI_KEYBOARD_STYLES}
      theme={keyboardTheme}
    />
  );
});

export default function InputBarComponent({
  value,
  attachments,
  blocked,
  isRecording,
  recordingDurationLabel,
  bottomInset = 0,
  safeAreaBottom = 0,
  emojiPanelHeight = EMOJI_PANEL_HEIGHT,
  dockMode = false,
  onChangeText,
  onInsertSnippet,
  onAddAttachment,
  onSendAttachment,
  onRemoveAttachment,
  onOpenAttachments,
  onOpenCamera,
  onSend,
  onStartVoiceRecording,
  onStopVoiceRecording,
  onCancelVoiceRecording,
  onPanelVisibilityChange,
}: InputBarProps) {
  const palette = useMessagingPalette();
  const inputRef = React.useRef<TextInput>(null);
  const [voiceLocked, setVoiceLocked] = React.useState(false);
  const emojiPanelTab = useMessagingStore((state) => state.ui.emojiPanelTab);
  const setEmojiPanelTab = useMessagingStore((state) => state.setEmojiPanelTab);
  const pushRecentEmoji = useMessagingStore((state) => state.pushRecentEmoji);
  const [sheetVisible, setSheetVisible] = React.useState(false);
  const [panelPrimed, setPanelPrimed] = React.useState(false);
  const panelHeight = useSharedValue(0);
  const [panelQuery, setPanelQuery] = React.useState('');
  const [recentGifIds, setRecentGifIds] = React.useState<string[]>([]);
  const [recentStickerIds, setRecentStickerIds] = React.useState<string[]>([]);
  const [favoriteGifIds, setFavoriteGifIds] = React.useState<string[]>([]);
  const [favoriteStickerIds, setFavoriteStickerIds] = React.useState<string[]>([]);
  const hasContent = value.trim().length > 0 || attachments.length > 0;

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  const CANCEL_THRESHOLD = -90;
  const LOCK_THRESHOLD = -80;

  const triggerStartVoiceRecording = React.useCallback(() => {
    hapticFeedback.medium();
    setVoiceLocked(false);
    onStartVoiceRecording();
  }, [onStartVoiceRecording]);

  // Un simple clic ne déclenche AUCUN enregistrement (cf. WhatsApp moderne) :
  // seul le maintien (long press via le pan gesture) démarre la note vocale.
  const handleMicTap = React.useCallback(() => {
    if (blocked || isRecording) {
      return;
    }
    hapticFeedback.light();
  }, [blocked, isRecording]);

  const finishVoice = React.useCallback(
    (translationX: number, translationY: number) => {
      dragX.value = withTiming(0, { duration: 140 });
      dragY.value = withTiming(0, { duration: 140 });

      if (translationY < LOCK_THRESHOLD) {
        hapticFeedback.selection();
        setVoiceLocked(true);
        return;
      }

      if (translationX < CANCEL_THRESHOLD) {
        hapticFeedback.error();
        onCancelVoiceRecording?.();
        return;
      }

      onStopVoiceRecording();
    },
    [dragX, dragY, onCancelVoiceRecording, onStopVoiceRecording]
  );

  const voicePanGesture = Gesture.Pan()
    .enabled(!hasContent && !blocked)
    .activateAfterLongPress(220)
    .onStart(() => {
      runOnJS(triggerStartVoiceRecording)();
    })
    .onUpdate((event) => {
      dragX.value = Math.min(0, event.translationX);
      dragY.value = Math.min(0, event.translationY);
    })
    .onEnd((event) => {
      runOnJS(finishVoice)(event.translationX, event.translationY);
    });

  const cancelHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dragX.value, [CANCEL_THRESHOLD, 0], [0.2, 1]),
    transform: [{ translateX: Math.max(dragX.value, -60) }],
  }));

  const lockHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dragY.value, [LOCK_THRESHOLD, 0], [0.3, 1]),
    transform: [{ translateY: Math.max(dragY.value * 0.4, -28) }],
  }));

  const micButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.max(dragX.value, -80) },
      { translateY: Math.max(dragY.value, -90) },
      { scale: 1 + interpolate(dragY.value, [LOCK_THRESHOLD, 0], [0.15, 0], 'clamp') },
    ],
  }));

  const stopLockedRecording = React.useCallback(() => {
    setVoiceLocked(false);
    onStopVoiceRecording();
  }, [onStopVoiceRecording]);

  const cancelLockedRecording = React.useCallback(() => {
    hapticFeedback.error();
    setVoiceLocked(false);
    onCancelVoiceRecording?.();
  }, [onCancelVoiceRecording]);

  React.useEffect(() => {
    if (!isRecording) {
      setVoiceLocked(false);
    }
  }, [isRecording]);

  const filteredGifs = React.useMemo(() => {
    const normalizedQuery = panelQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return mergeAssetsById([
        ...favoriteGifIds.flatMap((id) => QUICK_GIFS.filter((item) => item.id === id)),
        ...recentGifIds.flatMap((id) => QUICK_GIFS.filter((item) => item.id === id)),
        ...QUICK_GIFS,
      ]);
    }

    return QUICK_GIFS.filter((item) => item.label.toLowerCase().includes(normalizedQuery));
  }, [favoriteGifIds, panelQuery, recentGifIds]);

  const filteredStickers = React.useMemo(() => {
    const normalizedQuery = panelQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return mergeAssetsById([
        ...favoriteStickerIds.flatMap((id) => QUICK_STICKERS.filter((item) => item.id === id)),
        ...recentStickerIds.flatMap((id) => QUICK_STICKERS.filter((item) => item.id === id)),
        ...QUICK_STICKERS,
      ]);
    }

    return QUICK_STICKERS.filter((item) => item.label.toLowerCase().includes(normalizedQuery));
  }, [favoriteStickerIds, panelQuery, recentStickerIds]);

  React.useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setPanelPrimed(true);
    });

    return () => task.cancel();
  }, []);

  React.useEffect(() => {
    panelHeight.value = withTiming(sheetVisible ? emojiPanelHeight : 0, {
      duration: PANEL_TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [emojiPanelHeight, panelHeight, sheetVisible]);

  const panelAnimStyle = useAnimatedStyle(() => ({
    height: panelHeight.value,
    opacity: panelHeight.value > 8 ? 1 : 0,
  }));

  const openPanel = React.useCallback(() => {
    hapticFeedback.selection();

    if (sheetVisible) {
      setSheetVisible(false);
      setTimeout(() => inputRef.current?.focus(), Math.round(PANEL_TRANSITION_MS * 0.55));
      return;
    }

    Keyboard.dismiss();
    setSheetVisible(true);
  }, [sheetVisible]);

  const closePanel = React.useCallback(() => {
    setSheetVisible(false);
  }, []);

  React.useEffect(() => {
    if (sheetVisible) {
      onPanelVisibilityChange?.(true);
      return;
    }

    const timer = setTimeout(() => {
      onPanelVisibilityChange?.(false);
    }, PANEL_TRANSITION_MS);

    return () => clearTimeout(timer);
  }, [onPanelVisibilityChange, sheetVisible]);

  const handleEmojiPress = React.useCallback(
    (emoji: string) => {
      pushRecentEmoji(emoji);
      onInsertSnippet(emoji);
      // Le panneau reste ouvert pour enchaîner les emojis (UX WhatsApp).
    },
    [onInsertSnippet, pushRecentEmoji]
  );

  const handleAssetPress = React.useCallback(
    (item: AssetItem, type: 'gif' | 'sticker') => {
      hapticFeedback.light();
      if (type === 'gif') {
        setRecentGifIds((current) => [item.id, ...current.filter((id) => id !== item.id)].slice(0, 8));
      } else {
        setRecentStickerIds((current) =>
          [item.id, ...current.filter((id) => id !== item.id)].slice(0, 8)
        );
      }

      const attachment: MessageAttachment = {
        id: `${type}_${Date.now()}`,
        type,
        label: item.label,
        uri: item.uri,
        sizeLabel: type === 'gif' ? 'Animé' : 'Pack Afroza',
      };

      // GIF & stickers partent immédiatement (UX WhatsApp/Instagram).
      if (onSendAttachment) {
        onSendAttachment(attachment);
      } else {
        onAddAttachment(attachment);
      }
      setSheetVisible(false);
    },
    [onAddAttachment, onSendAttachment]
  );

  const toggleAssetFavorite = React.useCallback((item: AssetItem, type: 'gif' | 'sticker') => {
    hapticFeedback.selection();
    const toggle = (current: string[]) =>
      current.includes(item.id) ? current.filter((id) => id !== item.id) : [item.id, ...current].slice(0, 12);

    if (type === 'gif') {
      setFavoriteGifIds(toggle);
    } else {
      setFavoriteStickerIds(toggle);
    }
  }, []);

  // En dockMode le parent (ChatScreen) gère entièrement la safe-area via la position
  // du dock → aucun padding bas ici, sinon on cumulerait la safe-area en double.
  const wrapPaddingBottom = dockMode
    ? 0
    : sheetVisible
      ? Math.max(safeAreaBottom, 2)
      : Math.max(bottomInset, 2);

  return (
    <View
      style={[
        styles.wrap,
        dockMode && styles.wrapDock,
        {
          backgroundColor: palette.background,
          borderTopColor: palette.border,
          paddingBottom: wrapPaddingBottom,
        },
      ]}
    >
      {attachments.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachmentsRow}>
          {attachments.map((attachment) => (
            <View
              key={attachment.id}
              style={[styles.attachmentChip, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}
            >
              <Text style={[styles.attachmentChipText, { color: palette.text }]} numberOfLines={1}>
                {attachment.label}
              </Text>
              <Pressable onPress={() => onRemoveAttachment(attachment.id)}>
                <Ionicons name="close-circle" size={16} color={palette.textMuted} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {blocked ? (
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.danger} />
          <Text style={[styles.infoText, { color: theme.colors.danger }]}>Discussion bloquee.</Text>
        </View>
      ) : null}

      {isRecording && voiceLocked ? (
        <Animated.View
          entering={FadeIn.duration(160)}
          style={[styles.lockedBar, { backgroundColor: palette.surface, borderColor: palette.border }]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Annuler la note vocale"
            onPress={cancelLockedRecording}
            style={({ pressed }) => [styles.lockedTrash, pressed && styles.sendPressed]}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
          </Pressable>

          <View style={styles.recordingDot} />
          <Text style={[styles.recordingTimer, { color: palette.text }]}>{recordingDurationLabel}</Text>

          <View style={styles.lockedWave}>
            <VoiceWave color={palette.activeStart} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Envoyer la note vocale"
            onPress={stopLockedRecording}
            style={({ pressed }) => [styles.sendWrap, pressed && styles.sendPressed]}
          >
            <View style={styles.sendButton}>
              <Ionicons name="send" size={18} color={theme.colors.white} />
            </View>
          </Pressable>
        </Animated.View>
      ) : (
        <View style={styles.row}>
          {isRecording ? (
            <View style={[styles.recordingBar, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <View style={styles.recordingDot} />
              <Text style={[styles.recordingTimer, { color: palette.text }]}>{recordingDurationLabel}</Text>
              <View style={styles.recordingWaveWrap}>
                <VoiceWave color={palette.activeStart} />
              </View>
              <Animated.View style={[styles.cancelHint, cancelHintStyle]}>
                <Ionicons name="chevron-back" size={16} color={palette.textMuted} />
                <Text style={[styles.cancelHintText, { color: palette.textMuted }]}>Glisser pour annuler</Text>
              </Animated.View>
            </View>
          ) : (
            <View
              style={[
                styles.composerShell,
                dockMode && styles.composerShellDock,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                  shadowColor: palette.shadow,
                },
              ]}
            >
              <Pressable
                accessibilityLabel={sheetVisible ? 'Revenir au clavier' : 'Ouvrir les emojis'}
                onPress={openPanel}
                hitSlop={8}
                style={styles.iconButton}
              >
                {sheetVisible ? (
                  <MaterialIcons name="keyboard" size={20} color={palette.activeStart} />
                ) : (
                  <Ionicons name="happy-outline" size={20} color={palette.activeStart} />
                )}
              </Pressable>

              <TextInput
                ref={inputRef}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => {
                  if (sheetVisible) {
                    closePanel();
                  }
                }}
                placeholder="Message..."
                placeholderTextColor={palette.textMuted}
                style={[styles.input, { color: palette.text }]}
                multiline
                maxLength={1200}
                editable={!blocked}
              />

              <Pressable onPress={onOpenAttachments} hitSlop={8} style={styles.iconButton}>
                <Ionicons name="attach" size={18} color={palette.activeStart} />
              </Pressable>
              <Pressable onPress={onOpenCamera} hitSlop={8} style={styles.iconButton}>
                <Ionicons name="camera-outline" size={18} color={palette.activeStart} />
              </Pressable>
            </View>
          )}

          {hasContent && !isRecording ? (
            <Pressable onPress={onSend} disabled={blocked} style={({ pressed }) => [styles.sendWrap, pressed && styles.sendPressed]}>
              <View style={styles.sendButton}>
                <Ionicons name="send" size={18} color={theme.colors.white} />
              </View>
            </Pressable>
          ) : (
            <View style={styles.micTrack}>
              {isRecording ? (
                <Animated.View
                  style={[styles.lockChip, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }, lockHintStyle]}
                >
                  <Ionicons name="lock-closed" size={14} color={palette.activeStart} />
                  <Ionicons name="chevron-up" size={12} color={palette.textMuted} />
                </Animated.View>
              ) : null}
              <GestureDetector gesture={voicePanGesture}>
                <Animated.View style={[styles.sendWrap, micButtonStyle]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Maintenir pour enregistrer une note vocale"
                    accessibilityHint="Maintenez pour enregistrer, glissez vers le haut pour verrouiller, vers la gauche pour annuler"
                    disabled={blocked || hasContent || isRecording}
                    onPress={handleMicTap}
                    style={[styles.sendButton, isRecording && styles.recordingMic]}
                  >
                    <Ionicons name="mic" size={18} color={theme.colors.white} />
                  </Pressable>
                </Animated.View>
              </GestureDetector>
            </View>
          )}
        </View>
      )}

      {panelPrimed ? (
        <Animated.View
          pointerEvents={sheetVisible ? 'auto' : 'none'}
          style={[
            styles.emojiPanel,
            panelAnimStyle,
            {
              backgroundColor: palette.menuBackground,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={[styles.tabBar, { borderBottomColor: palette.divider }]}>
            {SHEET_TABS.map((tab) => {
              const active = emojiPanelTab === tab.key;

              return (
                <Pressable
                  key={tab.key}
                  onPress={() => {
                    hapticFeedback.selection();
                    setPanelQuery('');
                    setEmojiPanelTab(tab.key);
                  }}
                  style={({ pressed }) => [styles.tabItem, pressed && styles.tabItemPressed]}
                >
                  <View style={styles.tabLabelRow}>
                    {tab.icon ? <Text style={styles.tabEmoji}>{tab.icon}</Text> : null}
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: active ? palette.text : palette.textMuted },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </View>
                  {active ? (
                    <View style={[styles.tabIndicator, { backgroundColor: palette.activeStart }]} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {emojiPanelTab === 'emoji' ? (
            <View style={styles.emojiKeyboardWrap}>
              <InlineEmojiKeyboard
                isDark={palette.isDark}
                palette={palette}
                onEmojiSelected={handleEmojiPress}
              />
            </View>
          ) : (
            <View style={styles.assetPanelBody}>
              <View style={[styles.panelSearch, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <Ionicons name="search" size={14} color={palette.textMuted} />
                <TextInput
                  value={panelQuery}
                  onChangeText={setPanelQuery}
                  placeholder={emojiPanelTab === 'gif' ? 'Rechercher un GIF' : 'Rechercher un sticker'}
                  placeholderTextColor={palette.textMuted}
                  style={[styles.panelSearchInput, { color: palette.text }]}
                />
              </View>

              {emojiPanelTab === 'gif' ? (
                <AssetGrid
                  items={filteredGifs}
                  type="gif"
                  favoriteIds={favoriteGifIds}
                  onSelect={(item) => handleAssetPress(item, 'gif')}
                  onToggleFavorite={toggleAssetFavorite}
                />
              ) : (
                <AssetGrid
                  items={filteredStickers}
                  type="sticker"
                  favoriteIds={favoriteStickerIds}
                  onSelect={(item) => handleAssetPress(item, 'sticker')}
                  onToggleFavorite={toggleAssetFavorite}
                />
              )}
            </View>
          )}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
  },
  wrapDock: {
    paddingTop: 0,
  },
  attachmentsRow: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 4,
    gap: messagingSpacing.sm,
  },
  attachmentChip: {
    maxWidth: 180,
    minHeight: 32,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentChipText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  infoRow: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: messagingSpacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '700',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  recordingBar: {
    flex: 1,
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.sm,
    overflow: 'hidden',
  },
  recordingTimer: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    minWidth: 48,
  },
  recordingWaveWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  cancelHint: {
    position: 'absolute',
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cancelHintText: {
    fontSize: 12,
    fontWeight: '600',
  },
  micTrack: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockChip: {
    position: 'absolute',
    top: -44,
    width: 32,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  recordingMic: {
    backgroundColor: '#EF4444',
  },
  lockedBar: {
    marginHorizontal: theme.spacing.md,
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.sm,
  },
  lockedTrash: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedWave: {
    flex: 1,
    overflow: 'hidden',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 28,
  },
  waveBar: {
    width: 3,
    borderRadius: 999,
  },
  row: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  composerShell: {
    flex: 1,
    minHeight: 38,
    maxHeight: 124,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: 2,
    paddingRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  composerShellDock: {
    shadowOpacity: 0,
    elevation: 0,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '500',
    paddingTop: Platform.OS === 'ios' ? 6 : 4,
    paddingBottom: Platform.OS === 'ios' ? 6 : 4,
    paddingHorizontal: 2,
    maxHeight: 92,
    textAlignVertical: 'center',
  },
  sendWrap: {
    marginBottom: 0,
  },
  sendPressed: {
    transform: [{ scale: 0.97 }],
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: messagingGradient[0],
  },
  emojiPanel: {
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: theme.spacing.sm,
  },
  tabItem: {
    flex: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  tabItemPressed: {
    opacity: 0.72,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabEmoji: {
    fontSize: 13,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '18%',
    right: '18%',
    height: 2,
    borderRadius: 1,
  },
  emojiKeyboardWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  assetPanelBody: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: 4,
  },
  panelSearch: {
    minHeight: 32,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  panelSearchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 6,
  },
  assetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: messagingSpacing.sm,
    paddingBottom: 6,
  },
  assetCard: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  assetFavorite: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  assetImage: {
    width: '100%',
    height: 112,
  },
  assetMeta: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  assetLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  assetCaption: {
    fontSize: 12,
    fontWeight: '500',
  },
});
