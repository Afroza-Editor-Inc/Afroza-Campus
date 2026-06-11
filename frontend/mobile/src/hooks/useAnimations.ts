import { useRef } from 'react';
import { Animated } from 'react-native';

export const useDoubleTapLike = (callback?: () => void) => {
  const lastTap = useRef<number>(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeDelta = now - lastTap.current;

    if (timeDelta < 500) {
      // Double tap détecté
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      callback?.();
    }

    lastTap.current = now;
  };

  return {
    handleDoubleTap,
    scaleAnim,
  };
};

// Hook pour l'animation de typing indicator
export const useTypingAnimations = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const createBounceAnimation = (dot: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(dot, {
        toValue: -10,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(dot, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);
  };

  return {
    dot1,
    dot2,
    dot3,
    createBounceAnimation,
  };
};

// Hook pour l'animation de scroll collapse/expand header
export const useCollapsibleHeader = (scrollY: Animated.Value) => {
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  return {
    headerTranslateY,
    headerOpacity,
  };
};

// Hook pour l'animation de skeleton loading
export const useSkeletonAnimation = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return {
    shimmerAnim,
    startAnimation,
  };
};
