import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

export type FloatingMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

export type FloatingMenuSection = {
  title?: string;
  items: FloatingMenuItem[];
};

type FloatingAnchorMenuProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  sections: FloatingMenuSection[];
  anchor?: 'right' | 'top-right' | 'top-left';
};

export default function FloatingAnchorMenu({
  visible,
  onClose,
  title,
  subtitle,
  sections,
  anchor = 'right',
}: FloatingAnchorMenuProps) {
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
      { duration: 180, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      }
    );
  }, [progress, visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.42,
  }));

  const panelStyle = useAnimatedStyle(() => {
    const offset = anchor === 'right' ? (1 - progress.value) * 16 : (1 - progress.value) * -12;
    return {
      opacity: progress.value,
      transform: [
        anchor === 'right' ? { translateX: offset } : { translateY: offset },
        { scale: 0.96 + progress.value * 0.04 },
      ],
    };
  });

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
            styles.panel,
            anchor === 'right'
              ? styles.panelRight
              : anchor === 'top-left'
                ? styles.panelTopLeft
                : styles.panelTopRight,
            {
              marginTop: Math.max(insets.top, theme.spacing.md) + 52,
              marginBottom: Math.max(insets.bottom, theme.spacing.md),
              ...(anchor === 'top-left'
                ? { marginLeft: theme.spacing.md }
                : { marginRight: theme.spacing.md }),
            },
            panelStyle,
          ]}
        >
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          {sections.map((section, sectionIndex) => (
            <View key={section.title ?? `section-${sectionIndex}`} style={sectionIndex > 0 && styles.sectionGap}>
              {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}
              <View style={styles.card}>
                {section.items.map((item, itemIndex) => (
                  <Pressable
                    key={item.label}
                    accessibilityRole="button"
                    onPress={() => {
                      hapticFeedback.selection();
                      onClose();
                      item.onPress();
                    }}
                    style={({ pressed }) => [
                      styles.row,
                      itemIndex < section.items.length - 1 && styles.rowBorder,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        item.destructive && { backgroundColor: theme.colors.danger },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={item.destructive ? theme.colors.white : theme.colors.primary}
                      />
                    </View>
                    <Text
                      style={[styles.rowLabel, item.destructive && { color: theme.colors.danger }]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.textStrong,
  },
  panel: {
    position: 'absolute',
    maxWidth: 300,
    minWidth: 248,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadows.floating,
  },
  panelRight: {
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
  },
  panelTopRight: {
    top: 0,
    right: 0,
  },
  panelTopLeft: {
    top: 0,
    left: 0,
  },
  title: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
    marginBottom: theme.spacing.xxs,
  },
  subtitle: {
    ...theme.typography.bodyMuted,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  sectionGap: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: theme.accessibility.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowPressed: {
    backgroundColor: theme.colors.surfaceStrong,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textStrong,
    fontWeight: '600',
  },
});
