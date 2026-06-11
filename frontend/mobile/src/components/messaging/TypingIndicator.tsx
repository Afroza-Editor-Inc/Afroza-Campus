import React from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import theme from '../../theme';

export function TypingIndicator() {
  const dot1 = React.useRef(new Animated.Value(0)).current;
  const dot2 = React.useRef(new Animated.Value(0)).current;
  const dot3 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animations: { stop: () => void }[] = [];

    const createAnimation = (dot: Animated.Value, delay: number) => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      );
      anim.start();
      animations.push(anim);
    };

    createAnimation(dot1, 0);
    createAnimation(dot2, 200);
    createAnimation(dot3, 400);

    // ✅ Cleanup : arrêter toutes les animations au démontage
    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, []);

  const dotStyle = (dot: Animated.Value) => ({
    opacity: dot,
    transform: [
      {
        scale: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bubble,
          { backgroundColor: theme.colors.surfaceMuted },
        ]}
      >
        <Animated.View style={[styles.dot, dotStyle(dot1)]} />
        <Animated.View style={[styles.dot, dotStyle(dot2)]} />
        <Animated.View style={[styles.dot, dotStyle(dot3)]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.md,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textMuted,
  },
});
