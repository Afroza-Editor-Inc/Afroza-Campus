import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import theme from '../../theme';

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                  */
/* -------------------------------------------------------------------------- */

type SkeletonProps = {
  width?: ViewStyle['width'];
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Bloc skeleton avec animation shimmer (pulsation d'opacité). */
export function Skeleton({ width = '100%', height = 16, radius = theme.radii.sm, style }: SkeletonProps) {
  const progress = useSharedValue(0.4);

  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={[styles.skeleton, { width, height, borderRadius: radius }, animatedStyle, style]}
    />
  );
}

export function SkeletonCircle({ size = 48 }: { size?: number }) {
  return <Skeleton width={size} height={size} radius={size / 2} />;
}

/** Skeleton d'une carte de publication (feed Actualités). */
export function PostCardSkeleton() {
  return (
    <View style={styles.postSkeleton}>
      <View style={styles.postSkeletonHeader}>
        <SkeletonCircle size={42} />
        <View style={styles.postSkeletonHeaderText}>
          <Skeleton width="45%" height={12} />
          <Skeleton width="25%" height={10} />
        </View>
      </View>
      <Skeleton width="100%" height={260} radius={theme.radii.lg} />
      <View style={styles.postSkeletonActions}>
        <Skeleton width={24} height={24} radius={12} />
        <Skeleton width={24} height={24} radius={12} />
        <Skeleton width={24} height={24} radius={12} />
      </View>
      <Skeleton width="80%" height={12} />
      <Skeleton width="55%" height={12} />
    </View>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.feedSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </View>
  );
}

/** Skeleton d'une ligne de liste (conversations, appels, membres…). */
export function ListItemSkeleton() {
  return (
    <View style={styles.listItemSkeleton}>
      <SkeletonCircle size={52} />
      <View style={styles.listItemText}>
        <Skeleton width="55%" height={13} />
        <Skeleton width="75%" height={11} />
      </View>
      <Skeleton width={36} height={11} />
    </View>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <ListItemSkeleton key={index} />
      ))}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* États (empty / error / loading / success)                                 */
/* -------------------------------------------------------------------------- */

type StateAction = { label: string; onPress: () => void };

type StateViewProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: StateAction;
  tone?: 'neutral' | 'error' | 'success';
  style?: StyleProp<ViewStyle>;
};

function StateView({ icon, title, subtitle, action, tone = 'neutral', style }: StateViewProps) {
  const tint =
    tone === 'error'
      ? theme.colors.danger
      : tone === 'success'
        ? theme.colors.secondary
        : theme.colors.primary;

  return (
    <Animated.View entering={FadeIn.duration(280)} style={[styles.stateRoot, style]}>
      <View style={[styles.stateIconWrap, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={30} color={tint} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stateSubtitle}>{subtitle}</Text> : null}
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.stateButton,
            { backgroundColor: tint },
            pressed && styles.statePressed,
          ]}
        >
          <Text style={styles.stateButtonText}>{action.label}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

export function EmptyState(props: Omit<StateViewProps, 'tone'>) {
  return <StateView {...props} tone="neutral" />;
}

export function ErrorState({
  title = 'Une erreur est survenue',
  subtitle = 'Vérifiez votre connexion puis réessayez.',
  icon = 'cloud-offline-outline',
  ...props
}: Partial<StateViewProps>) {
  return <StateView icon={icon} title={title} subtitle={subtitle} tone="error" {...props} />;
}

export function SuccessState({
  title = 'C\u2019est fait !',
  icon = 'checkmark-circle-outline',
  ...props
}: Partial<StateViewProps>) {
  return <StateView icon={icon} title={title} tone="success" {...props} />;
}

export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  return (
    <View style={styles.loadingRoot}>
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={styles.loadingLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.surfaceStrong,
  },
  feedSkeleton: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  postSkeleton: {
    gap: theme.spacing.sm,
  },
  postSkeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  postSkeletonHeaderText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  postSkeletonActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxs,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  listItemText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  stateRoot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.xs,
  },
  stateIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  stateTitle: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
    textAlign: 'center',
  },
  stateSubtitle: {
    ...theme.typography.bodyMuted,
    color: theme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  stateButton: {
    marginTop: theme.spacing.md,
    height: 44,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  stateButtonText: {
    ...theme.typography.label,
    color: theme.colors.white,
  },
  loadingRoot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  loadingLabel: {
    ...theme.typography.bodyMuted,
    color: theme.colors.textMuted,
  },
});
