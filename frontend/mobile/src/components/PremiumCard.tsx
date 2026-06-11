import React, { useRef } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Animated,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  borderRadius?: 'sm' | 'md' | 'lg' | 'full';
  pressedOpacity?: number;
}

export function PremiumCard({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 'md',
  interactive = true,
  borderRadius = 'lg',
  pressedOpacity = 0.8,
}: PremiumCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!onPress || !interactive) return;

    hapticFeedback.light();

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const getPadding = () => {
    switch (padding) {
      case 'sm':
        return theme.spacing.sm;
      case 'md':
        return theme.spacing.md;
      case 'lg':
        return theme.spacing.lg;
    }
  };

  const getBorderRadius = () => {
    switch (borderRadius) {
      case 'sm':
        return theme.radii.sm;
      case 'md':
        return theme.radii.md;
      case 'lg':
        return theme.radii.lg;
      case 'full':
        return 9999;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: theme.colors.background,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.surface,
          ...Platform.select({
            ios: {
              shadowColor: theme.colors.text,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.colors.surface,
          ...Platform.select({
            ios: {
              shadowColor: theme.colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
            },
            android: {
              elevation: 3,
            },
          }),
        };
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        disabled={!onPress || !interactive}
        android_ripple={{
          color: theme.colors.primary,
          radius: 32,
          foreground: true,
        }}
      >
        <View
          style={[
            styles.card,
            {
              padding: getPadding(),
              borderRadius: getBorderRadius(),
            },
            getVariantStyle(),
            style,
          ]}
        >
          {children}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Variante avec icône d'action
export function PremiumCardWithAction({
  children,
  actionIcon,
  onActionPress,
  ...props
}: PremiumCardProps & {
  actionIcon?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.container}>
      <PremiumCard {...props}>
        {children}
      </PremiumCard>
      {actionIcon && (
        <Pressable
          onPress={() => {
            hapticFeedback.light();
            onActionPress?.();
          }}
          style={styles.actionButton}
          android_ripple={{ color: theme.colors.primary, radius: 20 }}
        >
          <Ionicons
            name={actionIcon as any}
            size={20}
            color={theme.colors.white}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  container: {
    position: 'relative',
  },
  actionButton: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
