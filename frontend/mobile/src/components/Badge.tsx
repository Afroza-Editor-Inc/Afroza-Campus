import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import Animated, { BounceIn, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  onPress?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  badgeCount?: number;
  dot?: boolean;
}

export function Badge({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  onPress,
  onDismiss,
  dismissible = false,
  animated = true,
  style,
  textStyle,
  badgeCount,
  dot = false,
}: BadgeProps) {
  const getColors = () => {
    const colors: Record<string, { bg: string; text: string }> = {
      primary: {
        bg: theme.colors.primary,
        text: theme.colors.white,
      },
      secondary: {
        bg: theme.colors.secondary,
        text: theme.colors.white,
      },
      success: {
        bg: theme.colors.success,
        text: theme.colors.white,
      },
      warning: {
        bg: '#FFA500',
        text: theme.colors.white,
      },
      danger: {
        bg: theme.colors.danger,
        text: theme.colors.white,
      },
      info: {
        bg: '#00BCD4',
        text: theme.colors.white,
      },
    };
    return colors[variant] || colors.primary;
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          fontSize: 12,
        };
      case 'md':
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          fontSize: 13,
        };
      case 'lg':
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          fontSize: 14,
        };
    }
  };

  const colors = getColors();
  const sizeStyle = getSizeStyle();

  const handleDismiss = () => {
    hapticFeedback.light();
    onDismiss?.();
  };

  const handlePress = () => {
    if (onPress) {
      hapticFeedback.light();
      onPress();
    }
  };

  if (dot) {
    return (
      <Animated.View
        entering={animated ? BounceIn.springify() : undefined}
        style={[
          styles.dot,
          {
            backgroundColor: colors.bg,
          },
          style,
        ]}
      />
    );
  }

  const BadgeContent = (
    <View style={[styles.content, { gap: theme.spacing.xs }]}>
      {icon && <Ionicons name={icon as any} size={14} color={colors.text} />}
      <Text
        style={[
          styles.label,
          {
            color: colors.text,
            fontSize: sizeStyle?.fontSize,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {badgeCount && (
        <View
          style={[
            styles.count,
            {
              backgroundColor: theme.colors.danger,
              minWidth: 18,
            },
          ]}
        >
          <Text style={styles.countText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
      {dismissible && (
        <Pressable onPress={handleDismiss} style={styles.dismissButton}>
          <Ionicons name="close" size={12} color={colors.text} />
        </Pressable>
      )}
    </View>
  );

  return (
    <Animated.View
      entering={animated ? FadeIn.delay(50) : undefined}
      style={[style]}
    >
      <Pressable
        onPress={handlePress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.badge,
          {
            backgroundColor: colors.bg,
            paddingHorizontal: sizeStyle?.paddingHorizontal,
            paddingVertical: sizeStyle?.paddingVertical,
          },
          pressed && styles.pressed,
        ]}
        android_ripple={{
          color: colors.text,
          radius: 24,
        }}
      >
        {BadgeContent}
      </Pressable>
    </Animated.View>
  );
}

// Chip - Badge avec tous les interactions
interface ChipProps extends Omit<BadgeProps, 'badgeCount'> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function Chip({
  label,
  variant = 'secondary',
  size = 'md',
  icon,
  onPress,
  onDismiss,
  dismissible = true,
  animated = true,
  style,
  textStyle,
  leading,
  trailing,
}: ChipProps) {
  const getColors = () => {
    const colors: Record<string, { bg: string; text: string; border: string }> =
      {
        primary: {
          bg: `${theme.colors.primary}20`,
          text: theme.colors.primary,
          border: theme.colors.primary,
        },
        secondary: {
          bg: `${theme.colors.secondary}20`,
          text: theme.colors.secondary,
          border: theme.colors.secondary,
        },
        success: {
          bg: `${theme.colors.success}20`,
          text: theme.colors.success,
          border: theme.colors.success,
        },
        warning: {
          bg: '#FFA50020',
          text: '#FFA500',
          border: '#FFA500',
        },
        danger: {
          bg: `${theme.colors.danger}20`,
          text: theme.colors.danger,
          border: theme.colors.danger,
        },
        info: {
          bg: '#00BCD420',
          text: '#00BCD4',
          border: '#00BCD4',
        },
      };
    return colors[variant] || colors.primary;
  };

  const colors = getColors();

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 4,
          fontSize: 12,
        };
      case 'md':
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 6,
          fontSize: 13,
        };
      case 'lg':
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: 8,
          fontSize: 14,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  const handlePress = () => {
    hapticFeedback.light();
    onPress?.();
  };

  const handleDismiss = () => {
    hapticFeedback.light();
    onDismiss?.();
  };

  return (
    <Animated.View entering={animated ? FadeIn.delay(50) : undefined}>
      <Pressable
        onPress={handlePress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.chip,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            paddingHorizontal: sizeStyle?.paddingHorizontal,
            paddingVertical: sizeStyle?.paddingVertical,
          },
          pressed && styles.chipPressed,
          style,
        ]}
        android_ripple={{
          color: colors.text,
          radius: 24,
          foreground: true,
        }}
      >
        <View style={[styles.chipContent, { gap: theme.spacing.xs }]}>
          {leading}
          {icon && <Ionicons name={icon as any} size={14} color={colors.text} />}
          <Text
            style={[
              styles.chipLabel,
              {
                color: colors.text,
                fontSize: sizeStyle?.fontSize,
              },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
          {trailing}
          {dismissible && (
            <Pressable
              onPress={handleDismiss}
              hitSlop={8}
              style={styles.chipCloseButton}
            >
              <Ionicons name="close" size={12} color={colors.text} />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  count: {
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.white,
  },
  dismissButton: {
    marginLeft: theme.spacing.xs,
  },
  chip: {
    borderRadius: theme.radii.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipLabel: {
    fontWeight: '600',
  },
  chipPressed: {
    opacity: 0.75,
  },
  chipCloseButton: {
    marginLeft: theme.spacing.xs / 2,
  },
});
