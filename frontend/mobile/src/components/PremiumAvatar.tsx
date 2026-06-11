import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ImageStyle,
  ViewStyle,
  Pressable,
} from 'react-native';
import Animated, { ZoomIn, FadeIn } from 'react-native-reanimated';
import theme from '../theme';

interface PremiumAvatarProps {
  source?: { uri: string };
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
  border?: boolean;
  borderColor?: string;
  borderWidth?: number;
  online?: boolean;
  onPress?: () => void;
  badge?: boolean;
  badgeColor?: string;
  style?: ViewStyle;
}

export function PremiumAvatar({
  source,
  initials = 'U',
  size = 'md',
  backgroundColor = theme.colors.primary,
  border = false,
  borderColor = theme.colors.white,
  borderWidth = 2,
  online = false,
  onPress,
  badge = false,
  badgeColor = theme.colors.success,
  style,
}: PremiumAvatarProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return { width: 28, height: 28, fontSize: 12 };
      case 'sm':
        return { width: 36, height: 36, fontSize: 14 };
      case 'md':
        return { width: 48, height: 48, fontSize: 16 };
      case 'lg':
        return { width: 64, height: 64, fontSize: 18 };
      case 'xl':
        return { width: 80, height: 80, fontSize: 20 };
    }
  };

  const sizeStyles = getSizeStyles();
  const borderRadius = sizeStyles.width / 2;

  const onlineIndicatorSize = sizeStyles.width * 0.35;

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Animated.View
        entering={ZoomIn.springify()}
        style={[
          styles.container,
          {
            width: sizeStyles.width,
            height: sizeStyles.height,
            borderRadius,
            backgroundColor,
            borderWidth: border ? borderWidth : 0,
            borderColor,
          },
          style,
        ]}
      >
        {source ? (
          <Image
            source={source}
            style={[
              styles.image,
              {
                borderRadius,
                width: '100%',
                height: '100%',
              },
            ]}
          />
        ) : (
          <Text
            style={[
              styles.initialsText,
              {
                fontSize: sizeStyles.fontSize,
                color: backgroundColor === theme.colors.primary ? theme.colors.white : theme.colors.text,
              },
            ]}
          >
            {initials}
          </Text>
        )}

        {/* Online Indicator */}
        {online && (
          <Animated.View
            entering={FadeIn.delay(100)}
            style={[
              styles.onlineIndicator,
              {
                width: onlineIndicatorSize,
                height: onlineIndicatorSize,
                borderRadius: onlineIndicatorSize / 2,
                backgroundColor: badgeColor,
                borderWidth: 2,
                borderColor: theme.colors.white,
              },
            ]}
          />
        )}

        {/* Badge */}
        {badge && (
          <Animated.View
            entering={ZoomIn.delay(100)}
            style={[
              styles.badge,
              {
                backgroundColor: badgeColor,
              },
            ]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

// Group Avatar - Multiple avatars
interface PremiumAvatarGroupProps {
  avatars: Array<{ uri?: string; initials?: string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumAvatarGroup({
  avatars,
  max = 3,
  size = 'md',
}: PremiumAvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const getSizeValue = () => {
    switch (size) {
      case 'sm':
        return 36;
      case 'md':
        return 48;
      case 'lg':
        return 64;
    }
  };

  const sizeValue = getSizeValue();
  const overlapValue = sizeValue * 0.35;

  return (
    <View
      style={[
        styles.group,
        {
          width: sizeValue + (displayAvatars.length - 1) * (sizeValue - overlapValue),
          height: sizeValue,
        },
      ]}
    >
      {displayAvatars.map((avatar, idx) => (
        <View
          key={idx}
          style={[
            {
              position: 'absolute',
              left: idx * (sizeValue - overlapValue),
              zIndex: displayAvatars.length - idx,
            },
          ]}
        >
          <PremiumAvatar
            source={avatar.uri ? { uri: avatar.uri } : undefined}
            initials={avatar.initials || 'U'}
            size={size}
            border
          />
        </View>
      ))}

      {remaining > 0 && (
        <View
          style={[
            {
              position: 'absolute',
              left: displayAvatars.length * (sizeValue - overlapValue),
              zIndex: 0,
            },
          ]}
        >
          <PremiumAvatar
            initials={`+${remaining}`}
            size={size}
            backgroundColor={theme.colors.textMuted}
            border
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.primary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsText: {
    fontWeight: '700',
    color: theme.colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  group: {
    position: 'relative',
  },
});
