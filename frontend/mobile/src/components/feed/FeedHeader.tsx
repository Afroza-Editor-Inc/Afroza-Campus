import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

export type FeedTabKey = 'forYou' | 'following' | 'communities' | 'trending';

export const FEED_TABS: Array<{ key: FeedTabKey; label: string }> = [
  { key: 'forYou', label: 'Pour vous' },
  { key: 'following', label: 'Abonnements' },
  { key: 'communities', label: 'Communautés' },
  { key: 'trending', label: 'Tendances' },
];

type FeedHeaderProps = {
  activeTab: FeedTabKey;
  onTabChange: (key: FeedTabKey) => void;
  onCamera: () => void;
  onProfile: () => void;
  onNotifications: () => void;
  onMenu: () => void;
  profileName?: string;
  hasNotifications?: boolean;
};

function HeaderIcon({
  icon,
  label,
  onPress,
  showDot,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showDot?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={theme.accessibility.hitSlop}
      onPress={() => {
        hapticFeedback.selection();
        onPress();
      }}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
    >
      <Ionicons name={icon} size={21} color={theme.colors.textStrong} />
      {showDot ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

function FeedTabsComponent({ activeTab, onTabChange }: { activeTab: FeedTabKey; onTabChange: (key: FeedTabKey) => void }) {
  return (
    <View style={styles.tabsRow}>
      {FEED_TABS.map((tab) => (
        <FeedTab key={tab.key} label={tab.label} active={tab.key === activeTab} onPress={() => onTabChange(tab.key)} />
      ))}
    </View>
  );
}

function FeedTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const progress = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [active, progress]);

  const underlineStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: 0.4 + progress.value * 0.6 }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={active ? { selected: true } : {}}
      hitSlop={theme.accessibility.hitSlop}
      onPress={() => {
        if (!active) hapticFeedback.selection();
        onPress();
      }}
      style={styles.tab}
    >
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelMuted]} numberOfLines={1}>
        {label}
      </Text>
      <Animated.View style={underlineStyle}>
        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.underline}
        />
      </Animated.View>
    </Pressable>
  );
}

export default function FeedHeader({
  activeTab,
  onTabChange,
  onCamera,
  onProfile,
  onNotifications,
  onMenu,
  profileName = 'Awa Sow',
  hasNotifications,
}: FeedHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Appareil photo"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => {
            hapticFeedback.selection();
            onCamera();
          }}
          style={({ pressed }) => [styles.cameraButton, pressed && styles.iconPressed]}
        >
          <Ionicons name="camera-outline" size={24} color={theme.colors.textStrong} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Changer de compte"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => {
            hapticFeedback.selection();
            onProfile();
          }}
          style={({ pressed }) => [styles.accountSwitch, pressed && styles.accountPressed]}
        >
          <Text style={styles.accountName} numberOfLines={1}>{profileName}</Text>
          <Ionicons name="chevron-down" size={18} color={theme.colors.textStrong} />
        </Pressable>

        <View style={styles.actions}>
          <HeaderIcon
            icon="notifications-outline"
            label="Notifications"
            onPress={onNotifications}
            showDot={hasNotifications}
          />
          <HeaderIcon icon="menu-outline" label="Menu" onPress={onMenu} />
        </View>
      </View>

      <FeedTabsComponent activeTab={activeTab} onTabChange={onTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountSwitch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  accountPressed: {
    opacity: 0.7,
  },
  accountName: {
    ...theme.typography.title3,
    fontWeight: '800',
    color: theme.colors.textStrong,
    maxWidth: '70%',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  iconPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.badge,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceMuted,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  tab: {
    alignItems: 'center',
    gap: 7,
    paddingVertical: theme.spacing.xs,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: theme.colors.textStrong,
    fontWeight: '800',
  },
  tabLabelMuted: {
    color: theme.colors.textMuted,
  },
  underline: {
    width: 22,
    height: 3,
    borderRadius: theme.radii.round,
  },
});
