import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import { messagingSpacing, useMessagingPalette } from '../theme';

type AttachmentAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
};

type MessagingAttachmentSheetProps = {
  visible: boolean;
  onClose: () => void;
  actions: AttachmentAction[];
};

export default function MessagingAttachmentSheet({
  visible,
  onClose,
  actions,
}: MessagingAttachmentSheetProps) {
  const palette = useMessagingPalette();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = React.useState(visible);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
      return;
    }

    progress.value = withTiming(
      0,
      { duration: 160, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      }
    );
  }, [progress, visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 20 }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.overlay }]} />
        <Pressable style={styles.overlayTap} onPress={onClose} />

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.menuBackground,
              borderColor: palette.border,
              paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
              shadowColor: palette.shadow,
            },
            sheetStyle,
          ]}
        >
          <View style={[styles.handle, { backgroundColor: palette.divider }]} />
          <Text style={[styles.title, { color: palette.text }]}>Partager</Text>

          <View style={styles.grid}>
            {actions.map((action, index) => (
              <Animated.View
                key={action.label}
                entering={FadeInDown.delay(index * 35).duration(220)}
                style={styles.gridCell}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  onPress={() => {
                    hapticFeedback.selection();
                    onClose();
                    action.onPress();
                  }}
                  style={({ pressed }) => [styles.actionItem, pressed && styles.actionPressed]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: action.color }]}>
                    <Ionicons name={action.icon} size={24} color={theme.colors.white} />
                  </View>
                  <Text style={[styles.actionLabel, { color: palette.text }]} numberOfLines={1}>
                    {action.label}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTap: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    borderWidth: 1,
    paddingTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: theme.radii.round,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.label,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: theme.spacing.sm,
  },
  gridCell: {
    width: '25%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  actionItem: {
    alignItems: 'center',
    gap: messagingSpacing.xs + 2,
  },
  actionPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.94 }],
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
