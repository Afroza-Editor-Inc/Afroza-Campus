import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  SlideInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import { messagingGradient, useMessagingPalette } from '../theme';

export type FabActionKey = 'chat' | 'group' | 'community' | 'channel';

type FabAction = {
  key: FabActionKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
};

const ACTIONS: FabAction[] = [
  { key: 'chat', label: 'Nouvelle conversation', icon: 'chatbubble-ellipses-outline', tint: '#0072FF' },
  { key: 'group', label: 'Nouveau groupe', icon: 'people-outline', tint: '#00A3FF' },
  { key: 'community', label: 'Nouvelle communauté', icon: 'planet-outline', tint: '#00C557' },
  { key: 'channel', label: 'Nouveau canal', icon: 'megaphone-outline', tint: '#0456C7' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type MessagingFabProps = {
  bottomOffset?: number;
  onAction: (key: FabActionKey) => void;
};

function MessagingFabComponent({ bottomOffset = 116, onAction }: MessagingFabProps) {
  const palette = useMessagingPalette();
  const [open, setOpen] = React.useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const toggle = () => {
    hapticFeedback.medium();
    setOpen((value) => {
      const next = !value;
      rotation.value = withTiming(next ? 1 : 0, { duration: 220 });
      return next;
    });
  };

  const close = () => {
    rotation.value = withTiming(0, { duration: 180 });
    setOpen(false);
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 45}deg` }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      {open ? (
        <Animated.View
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(160)}
          style={styles.backdrop}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>
      ) : null}

      <View style={[styles.container, { bottom: bottomOffset }]} pointerEvents="box-none">
        {open ? (
          <View style={styles.actions}>
            {ACTIONS.map((action, index) => (
              <Animated.View
                key={action.key}
                entering={SlideInDown.delay(index * 45).duration(220)}
                exiting={FadeOut.duration(120)}
                style={styles.actionRow}
              >
                <View style={[styles.actionLabelWrap, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <Text style={[styles.actionLabel, { color: palette.text }]}>{action.label}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  onPress={() => {
                    hapticFeedback.selection();
                    close();
                    onAction(action.key);
                  }}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: action.tint },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name={action.icon} size={20} color={theme.colors.white} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        ) : null}

        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={open ? 'Fermer le menu de création' : 'Créer'}
          onPress={toggle}
          onPressIn={() => {
            scale.value = withTiming(0.94, { duration: 120 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 12, stiffness: 260 });
          }}
          style={[styles.fab, { shadowColor: palette.shadow }, buttonStyle]}
        >
          <LinearGradient
            colors={messagingGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.highlight} />
          <Animated.View style={iconStyle}>
            <Ionicons name="add" size={28} color={theme.colors.white} />
          </Animated.View>
        </AnimatedPressable>
      </View>
    </>
  );
}

export default React.memo(MessagingFabComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 12, 22, 0.32)',
  },
  container: {
    position: 'absolute',
    right: theme.spacing.md,
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  actions: {
    gap: theme.spacing.sm,
    alignItems: 'flex-end',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionLabelWrap: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radii.round,
    borderWidth: 1,
    ...theme.shadows.card,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    alignSelf: 'flex-end',
  },
  highlight: {
    position: 'absolute',
    top: -22,
    right: -16,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
