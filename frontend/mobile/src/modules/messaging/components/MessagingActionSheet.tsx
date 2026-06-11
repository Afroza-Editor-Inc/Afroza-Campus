import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import { messagingSpacing, useMessagingPalette } from '../theme';

type ActionItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tone?: 'default' | 'danger';
};

type MessagingActionSheetProps = {
  title?: string;
  visible: boolean;
  items: ActionItem[];
  onClose: () => void;
};

export default function MessagingActionSheet({
  title,
  visible,
  items,
  onClose,
}: MessagingActionSheetProps) {
  const palette = useMessagingPalette();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = React.useState(visible);
  const progress = useSharedValue(0);

  const panelTopOffset = Math.max(insets.top, theme.spacing.md) + 48;
  const panelMaxHeight = windowHeight - panelTopOffset - Math.max(insets.bottom, theme.spacing.md) - theme.spacing.md;

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
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

  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * -10 },
      { scale: 0.96 + progress.value * 0.04 },
    ],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
          <BlurView
            intensity={palette.isDark ? 48 : 34}
            tint={palette.isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.overlay,
              { backgroundColor: palette.isDark ? 'rgba(6,10,20,0.30)' : 'rgba(12,18,30,0.16)' },
            ]}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: palette.menuBackground,
              borderColor: palette.border,
              shadowColor: palette.shadow,
              marginTop: panelTopOffset,
              maxHeight: panelMaxHeight,
            },
            panelStyle,
          ]}
        >
          {title ? (
            <Text style={[styles.title, { color: palette.textMuted }]}>{title}</Text>
          ) : null}

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: messagingSpacing.xs }}
          >
          {items.map((item, index) => {
            const isDanger = item.tone === 'danger';

            return (
              <Pressable
                key={`${item.label}_${index}`}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => {
                  hapticFeedback.selection();
                  onClose();
                  item.onPress();
                }}
                style={({ pressed }) => [
                  styles.row,
                  index !== items.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: palette.divider,
                  },
                  pressed && { backgroundColor: palette.surfaceMuted },
                ]}
              >
                <View
                  style={[
                    styles.iconWrap,
                    {
                      backgroundColor: isDanger ? 'rgba(229,82,82,0.12)' : palette.surfaceMuted,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={isDanger ? theme.colors.danger : palette.activeStart}
                  />
                </View>

                <Text
                  style={[styles.label, { color: isDanger ? theme.colors.danger : palette.text }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>

                <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
              </Pressable>
            );
          })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 12, 22, 0.42)',
  },
  panel: {
    width: 280,
    marginRight: theme.spacing.md,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: messagingSpacing.xs,
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: messagingSpacing.xs,
  },
  row: {
    minHeight: theme.accessibility.minTouchTarget + 8,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});
