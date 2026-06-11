import React from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeInRight,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import { useMessagingPalette } from '../theme';

export type DrawerKey =
  | 'mon-profil'
  | 'modifier-profil'
  | 'messages-saved'
  | 'messages-archived'
  | 'messages-drafts'
  | 'media-photos'
  | 'media-videos'
  | 'media-documents'
  | 'settings-notifications'
  | 'settings-privacy'
  | 'settings-storage'
  | 'settings-appearance'
  | 'settings-security';

type DrawerItem = {
  key: DrawerKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint?: string;
};

type DrawerSection = {
  title: string;
  items: DrawerItem[];
};

const SECTIONS: DrawerSection[] = [
  {
    title: 'Profil',
    items: [
      { key: 'mon-profil', label: 'Mon profil', icon: 'person-outline', tint: '#0072FF' },
      { key: 'modifier-profil', label: 'Modifier le profil', icon: 'create-outline', tint: '#00A3FF' },
    ],
  },
  {
    title: 'Messages',
    items: [
      { key: 'messages-saved', label: 'Messages enregistrés', icon: 'bookmark-outline', tint: '#00C557' },
      { key: 'messages-archived', label: 'Conversations archivées', icon: 'archive-outline', tint: '#0456C7' },
      { key: 'messages-drafts', label: 'Brouillons', icon: 'document-text-outline', tint: '#13B0C9' },
    ],
  },
  {
    title: 'Médias',
    items: [
      { key: 'media-photos', label: 'Photos', icon: 'image-outline', tint: '#00A3FF' },
      { key: 'media-videos', label: 'Vidéos', icon: 'videocam-outline', tint: '#0072FF' },
      { key: 'media-documents', label: 'Documents', icon: 'folder-outline', tint: '#00C557' },
    ],
  },
  {
    title: 'Paramètres',
    items: [
      { key: 'settings-notifications', label: 'Notifications', icon: 'notifications-outline', tint: '#0072FF' },
      { key: 'settings-privacy', label: 'Confidentialité', icon: 'lock-closed-outline', tint: '#0456C7' },
      { key: 'settings-storage', label: 'Stockage', icon: 'server-outline', tint: '#13B0C9' },
      { key: 'settings-appearance', label: 'Apparence', icon: 'color-palette-outline', tint: '#00A3FF' },
      { key: 'settings-security', label: 'Sécurité', icon: 'shield-checkmark-outline', tint: '#00C557' },
    ],
  },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = Math.min(340, Math.round(SCREEN_WIDTH * 0.82));

type MessagingDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (key: DrawerKey) => void;
};

function MessagingDrawerComponent({ visible, onClose, onNavigate }: MessagingDrawerProps) {
  const palette = useMessagingPalette();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = React.useState(visible);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
      return;
    }
    progress.value = withTiming(0, { duration: 210, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(setMounted)(false);
    });
  }, [progress, visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value - 1) * PANEL_WIDTH }],
  }));

  const handlePress = (key: DrawerKey) => {
    hapticFeedback.selection();
    onClose();
    onNavigate(key);
  };

  if (!mounted) return null;

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
          <BlurView
            intensity={palette.isDark ? 42 : 28}
            tint={palette.isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, styles.overlayTint]} />
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            { width: PANEL_WIDTH, backgroundColor: palette.menuBackground },
            panelStyle,
          ]}
        >
          <View
            style={[
              styles.header,
              {
                paddingTop: insets.top + theme.spacing.md,
                borderBottomColor: palette.divider,
              },
            ]}
          >
            <Text style={[styles.headerTitle, { color: palette.text }]}>Menu Messagerie</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer le menu"
              hitSlop={theme.accessibility.hitSlop}
              onPress={onClose}
              style={({ pressed }) => [styles.headerClose, pressed && styles.pressed]}
            >
              <Ionicons name="close" size={22} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + theme.spacing.xl }]}
          >
            {SECTIONS.map((section, sectionIndex) => (
              <View key={section.title} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: palette.textMuted }]}>{section.title}</Text>
                {section.items.map((item, index) => (
                  <Animated.View
                    key={item.key}
                    entering={FadeInRight.delay(sectionIndex * 50 + index * 35).duration(220)}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      onPress={() => handlePress(item.key)}
                      style={({ pressed }) => [
                        styles.item,
                        pressed && { backgroundColor: palette.surfaceMuted, transform: [{ scale: 0.99 }] },
                      ]}
                    >
                      <View style={[styles.itemIcon, { backgroundColor: palette.surfaceMuted }]}>
                        <Ionicons name={item.icon} size={20} color={item.tint ?? palette.activeStart} />
                      </View>
                      <Text style={[styles.itemLabel, { color: palette.text }]} numberOfLines={1}>
                        {item.label}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={palette.textSoft} />
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default React.memo(MessagingDrawerComponent);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  overlayTint: {
    backgroundColor: 'rgba(6, 13, 26, 0.32)',
  },
  panel: {
    height: '100%',
    borderTopRightRadius: theme.radii.xl,
    borderBottomRightRadius: theme.radii.xl,
    overflow: 'hidden',
    ...theme.shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  scroll: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});
