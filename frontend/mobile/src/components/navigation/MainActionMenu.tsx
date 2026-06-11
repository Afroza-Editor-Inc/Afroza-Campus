import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  Easing,
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

type ContentType = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: readonly [string, string];
  onPress: () => void;
};

type MainActionMenuProps = {
  visible: boolean;
  onClose: () => void;
};

export default function MainActionMenu({ visible, onClose }: MainActionMenuProps) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = React.useState(visible);
  const progress = useSharedValue(0);

  const contentTypes: ContentType[] = React.useMemo(
    () => [
      {
        key: 'story',
        label: 'Story',
        icon: 'aperture',
        colors: [theme.colors.accent, theme.colors.secondary] as const,
        onPress: () => navigation.getParent()?.navigate('PostCreate', { mode: 'story' }),
      },
      {
        key: 'reel',
        label: 'Reel',
        icon: 'film',
        colors: [theme.colors.primary, theme.colors.secondary] as const,
        onPress: () => navigation.getParent()?.navigate('PostCreate', { mode: 'reel' }),
      },
      {
        key: 'post',
        label: 'Publication',
        icon: 'image',
        colors: [theme.colors.primaryDeep, theme.colors.accent] as const,
        onPress: () => navigation.getParent()?.navigate('PostCreate', { mode: 'post' }),
      },
    ],
    [navigation]
  );

  const quickActions: Array<{
    key: string;
    label: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }> = React.useMemo(
    () => [
      {
        key: 'message',
        label: 'Nouvelle discussion',
        subtitle: 'Message privé instantané',
        icon: 'chatbubble-ellipses-outline',
        onPress: () => navigation.navigate('Messages', { screen: 'NewChat' }),
      },
      {
        key: 'group',
        label: 'Nouveau groupe',
        subtitle: 'Discussion collaborative',
        icon: 'people-outline',
        onPress: () => navigation.navigate('Messages', { screen: 'CreateGroup' }),
      },
    ],
    [navigation]
  );

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withSpring(1, { damping: 16, stiffness: 220 });
      return;
    }

    progress.value = withTiming(
      0,
      { duration: 200, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      }
    );
  }, [progress, visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 40 }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) + 72 },
            sheetStyle,
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Créer</Text>
          <Text style={styles.subtitle}>Partagez un moment avec le campus.</Text>

          <View style={styles.cardsRow}>
            {contentTypes.map((type, index) => (
              <Animated.View
                key={type.key}
                entering={FadeInDown.delay(80 + index * 70).springify().damping(16)}
                style={styles.cardWrap}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Créer ${type.label}`}
                  onPress={() => {
                    hapticFeedback.medium();
                    onClose();
                    type.onPress();
                  }}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                >
                  <LinearGradient
                    colors={type.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardIconWrap}>
                      <Ionicons name={type.icon} size={26} color={theme.colors.white} />
                    </View>
                  </LinearGradient>
                  <Text style={styles.cardLabel}>{type.label}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Démarrer</Text>
          {quickActions.map((action, index) => (
            <Animated.View key={action.key} entering={FadeInDown.delay(280 + index * 60)}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => {
                  hapticFeedback.medium();
                  onClose();
                  action.onPress();
                }}
                style={({ pressed }) => [styles.discussionRow, pressed && styles.actionPressed]}
              >
                <View style={styles.discussionIcon}>
                  <Ionicons name={action.icon} size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.textStrong,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    ...theme.shadows.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderStrong,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.title2,
    color: theme.colors.textStrong,
  },
  subtitle: {
    ...theme.typography.bodyMuted,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xxs,
    marginBottom: theme.spacing.lg,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  cardWrap: {
    flex: 1,
  },
  card: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  cardGradient: {
    width: '100%',
    height: 96,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    ...theme.typography.label,
    color: theme.colors.textStrong,
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  discussionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: theme.accessibility.minTouchTarget + 8,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    marginBottom: theme.spacing.sm,
  },
  discussionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  actionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});
