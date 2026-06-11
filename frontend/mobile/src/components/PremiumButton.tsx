import React, { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface PremiumButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: 'light' | 'medium' | 'strong';
}

export function PremiumButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  haptic = 'medium',
}: PremiumButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled || loading) return;

    // Haptic feedback
    if (haptic === 'light') hapticFeedback.light();
    if (haptic === 'medium') hapticFeedback.medium();
    if (haptic === 'strong') hapticFeedback.strong();

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
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

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primary,
          text: theme.colors.white,
          border: theme.colors.primary,
        };
      case 'secondary':
        return {
          bg: theme.colors.surface,
          text: theme.colors.primary,
          border: theme.colors.primary,
        };
      case 'tertiary':
        return {
          bg: 'transparent',
          text: theme.colors.primary,
          border: theme.colors.primary,
        };
      case 'danger':
        return {
          bg: theme.colors.danger,
          text: theme.colors.white,
          border: theme.colors.danger,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'md':
        return styles.sizeMd;
      case 'lg':
        return styles.sizeLg;
    }
  };

  const colors = getColors();
  const opacityStyle = disabled ? { opacity: 0.5 } : {};

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        fullWidth && { width: '100%' },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        hitSlop={theme.accessibility.hitSlop}
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          getSizeStyle(),
          { minHeight: theme.accessibility.minTouchTarget },
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
          },
          pressed && styles.pressed,
          opacityStyle,
          style,
        ]}
        android_ripple={{
          color: colors.text,
          radius: 24,
        }}
      >
        <View style={styles.content}>
          {icon && iconPosition === 'left' && !loading && (
            <Ionicons name={icon as any} size={18} color={colors.text} />
          )}

          {loading && (
            <Animated.View style={styles.loader}>
              <View style={[styles.loaderDot, { backgroundColor: colors.text }]} />
            </Animated.View>
          )}

          <Text
            style={[
              styles.label,
              typeof size !== 'undefined' && {
                fontSize: size === 'sm' ? 14 : size === 'md' ? 16 : 18,
              },
              { color: colors.text },
              textStyle,
            ]}
          >
            {label}
          </Text>

          {icon && iconPosition === 'right' && !loading && (
            <Ionicons name={icon as any} size={18} color={colors.text} />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
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
  sizeSm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  sizeMd: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sizeLg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  label: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  loader: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
