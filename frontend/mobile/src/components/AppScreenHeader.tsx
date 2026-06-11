import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppIcon } from './ui';
import UserAvatarButton from './UserAvatarButton';
import theme from '../theme';
import { headerIcons, iconSizes } from '../theme/icons';
import { hapticFeedback } from '../utils/haptics';

type AppScreenHeaderProps = {
  title: string;
  eyebrow?: string;
  showNotifications?: boolean;
  showProfile?: boolean;
  onMenuPress?: () => void;
};

export default function AppScreenHeader({
  title,
  eyebrow,
  showNotifications = true,
  showProfile = true,
  onMenuPress,
}: AppScreenHeaderProps) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.actions}>
        {onMenuPress ? (
          <Pressable
            accessibilityLabel="Menu"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => {
              hapticFeedback.light();
              onMenuPress();
            }}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <AppIcon name={headerIcons.more} size={iconSizes.header} color={theme.colors.textStrong} />
          </Pressable>
        ) : null}

        {showNotifications ? (
          <Pressable
            accessibilityLabel="Notifications"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => {
              hapticFeedback.light();
              navigation.navigate('Notifications');
            }}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <AppIcon
              name={headerIcons.notifications}
              size={iconSizes.header}
              color={theme.colors.textStrong}
            />
          </Pressable>
        ) : null}

        {showProfile ? <UserAvatarButton size={34} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: theme.accessibility.minTouchTarget + 8,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconButton: {
    minWidth: theme.accessibility.minTouchTarget,
    minHeight: theme.accessibility.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.round,
  },
  pressed: {
    opacity: 0.75,
  },
});
