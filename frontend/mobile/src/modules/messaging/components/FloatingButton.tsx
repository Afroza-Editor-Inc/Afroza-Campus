import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import { messagingGradient, useMessagingPalette } from '../theme';

type FloatingButtonProps = {
  bottomOffset?: number;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FloatingButtonComponent({ bottomOffset = 116, onPress }: FloatingButtonProps) {
  const palette = useMessagingPalette();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(280)}
      onPress={() => {
        hapticFeedback.medium();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 14, stiffness: 260 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 220 });
      }}
      style={[
        styles.fab,
        {
          bottom: bottomOffset,
          shadowColor: palette.shadow,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={messagingGradient}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.base}
      />
      <View style={styles.highlight} />
      <Ionicons name="create-outline" size={22} color={theme.colors.white} />
      <View style={styles.plusBadge}>
        <Ionicons name="add" size={14} color={theme.colors.white} />
      </View>
    </AnimatedPressable>
  );
}

export default React.memo(FloatingButtonComponent);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: theme.spacing.md,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
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
  plusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
