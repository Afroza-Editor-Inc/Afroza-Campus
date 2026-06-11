import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MainActionMenu from '../components/navigation/MainActionMenu';
import { useCallsStore } from '../store/callsStore';
import { useMessagesStore } from '../store/messagesStore';
import theme from '../theme';
import { tabIcons } from '../theme/icons';
import { hapticFeedback } from '../utils/haptics';
import type { MainTabParamList } from './BottomTabs';

type TabRouteName = keyof MainTabParamList;

const TAB_LABELS: Record<TabRouteName, string> = {
  Messages: 'Messages',
  Feed: 'Actualités',
  Communities: 'Communautés',
  Calls: 'Appels',
};

const BAR_HEIGHT = 64;
const FAB_SIZE = 58;
const CHIP_WIDTH = 52;
const CHIP_HEIGHT = 38;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function MagicBottomTab({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const fabScale = useSharedValue(1);
  const fabRotation = useSharedValue(0);
  const [actionMenuVisible, setActionMenuVisible] = React.useState(false);

  const unreadMessages = useMessagesStore((store) =>
    store.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0)
  );
  const missedCalls = useCallsStore((store) =>
    store.calls.filter((call) => call.type === 'missed').length
  );

  const badgeMap = React.useMemo<Record<TabRouteName, number>>(
    () => ({
      Messages: unreadMessages,
      Feed: 0,
      Communities: 0,
      Calls: missedCalls,
    }),
    [missedCalls, unreadMessages]
  );

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }, { rotate: `${fabRotation.value}deg` }],
  }));

  const openActionMenu = () => {
    hapticFeedback.medium();
    fabScale.value = withSequence(
      withTiming(0.88, { duration: 90 }),
      withSpring(1, { damping: 12, stiffness: 260 })
    );
    fabRotation.value = withSequence(
      withTiming(90, { duration: 180, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) })
    );
    setActionMenuVisible(true);
  };

  const wrapperHeight = BAR_HEIGHT + Math.max(insets.bottom, theme.spacing.sm) + theme.navigation.floatingOffset;

  const renderTab = (route: (typeof state.routes)[number], index: number) => {
    const routeName = route.name as TabRouteName;
    const icons = tabIcons[routeName];
    const focused = state.index === index;
    const options = descriptors[route.key].options;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!focused && !event.defaultPrevented) {
        hapticFeedback.selection();
        navigation.navigate(route.name);
      }
    };

    return (
      <TabItem
        key={route.key}
        accessibilityLabel={options.tabBarAccessibilityLabel ?? TAB_LABELS[routeName]}
        badgeCount={badgeMap[routeName]}
        focused={focused}
        activeIcon={icons.active}
        inactiveIcon={icons.inactive}
        onLongPress={() => {
          hapticFeedback.light();
          navigation.emit({ type: 'tabLongPress', target: route.key });
        }}
        onPress={onPress}
        testID={options.tabBarTestID}
      />
    );
  };

  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  return (
    <>
      <View style={[styles.wrapper, { height: wrapperHeight }]} pointerEvents="box-none">
        <View
          style={[
            styles.container,
            {
              bottom: Math.max(insets.bottom, theme.spacing.xs),
              left: theme.navigation.horizontalInset,
              right: theme.navigation.horizontalInset,
              height: BAR_HEIGHT,
            },
          ]}
        >
          <View style={styles.row}>
            {leftRoutes.map((route, index) => renderTab(route, index))}

            <View style={styles.fabSlot} pointerEvents="box-none">
              <Animated.View style={fabStyle}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Créer"
                  hitSlop={theme.accessibility.hitSlop}
                  onPress={openActionMenu}
                  onPressIn={() => {
                    fabScale.value = withTiming(0.92, { duration: 80 });
                  }}
                  onPressOut={() => {
                    fabScale.value = withSpring(1, { damping: 12, stiffness: 240 });
                  }}
                  style={styles.fabPressable}
                >
                  <LinearGradient
                    colors={theme.gradients.brand}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabGradient}
                  >
                    <View style={styles.fabHighlight} />
                    <Ionicons name="add" size={30} color={theme.colors.white} />
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>

            {rightRoutes.map((route, index) => renderTab(route, index + 2))}
          </View>
        </View>
      </View>

      <MainActionMenu visible={actionMenuVisible} onClose={() => setActionMenuVisible(false)} />
    </>
  );
}

function TabItem({
  accessibilityLabel,
  badgeCount,
  focused,
  activeIcon,
  inactiveIcon,
  onLongPress,
  onPress,
  testID,
}: {
  accessibilityLabel?: string;
  badgeCount: number;
  focused: boolean;
  activeIcon: React.ComponentProps<typeof Ionicons>['name'];
  inactiveIcon: React.ComponentProps<typeof Ionicons>['name'];
  onLongPress: () => void;
  onPress: () => void;
  testID?: string;
}) {
  const progress = useSharedValue(focused ? 1 : 0);
  const pressScale = useSharedValue(1);

  React.useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, progress]);

  const chipStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.6 + progress.value * 0.4 },
      { translateY: (1 - progress.value) * 4 },
    ],
  }));

  const activeIconStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const inactiveIconStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressScale.value }] }));

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={focused ? { selected: true } : {}}
      hitSlop={theme.accessibility.hitSlop}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => {
        pressScale.value = withTiming(0.9, { duration: 80 });
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, { damping: 12, stiffness: 240, mass: 0.6 });
      }}
      style={styles.item}
      testID={testID}
    >
      <Animated.View style={[styles.iconSlot, pressStyle]}>
        <AnimatedLinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.chip, chipStyle]}
        />

        <Animated.View style={[styles.iconLayer, inactiveIconStyle]}>
          <Ionicons name={inactiveIcon} size={24} color={theme.colors.textMuted} />
        </Animated.View>
        <Animated.View style={[styles.iconLayer, activeIconStyle]}>
          <Ionicons name={activeIcon} size={24} color={theme.colors.white} />
        </Animated.View>

        {badgeCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{formatBadgeCount(badgeCount)}</Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

function formatBadgeCount(count: number) {
  return count > 99 ? '99+' : String(count);
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'flex-end',
  },
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.99)',
    borderWidth: 1,
    borderColor: 'rgba(13, 25, 43, 0.06)',
    paddingHorizontal: theme.spacing.xs,
    ...theme.shadows.floating,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconSlot: {
    width: CHIP_WIDTH,
    height: CHIP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  iconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabSlot: {
    width: FAB_SIZE + theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPressable: {
    marginTop: -26,
    borderRadius: FAB_SIZE / 2,
    ...theme.shadows.glow,
  },
  fabGradient: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.colors.white,
    overflow: 'hidden',
  },
  fabHighlight: {
    position: 'absolute',
    top: 6,
    left: 10,
    width: 22,
    height: 10,
    borderRadius: theme.radii.round,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: theme.colors.badge,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
