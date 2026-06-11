import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';

type StoryViewerParams = {
  StoryViewer:
    | { startIndex?: number; userName?: string; kind?: 'contact' | 'community' }
    | undefined;
};

type StorySlide = {
  id: string;
  userName: string;
  gradient: readonly [string, string, ...string[]];
  caption: string;
  image?: string;
};

const SLIDES: StorySlide[] = [
  {
    id: '1',
    userName: 'Alice',
    gradient: ['#0072FF', '#00A3FF'],
    caption: 'Révisions de groupe à la BU 📚',
  },
  {
    id: '2',
    userName: 'Bob',
    gradient: ['#00A3FF', '#00FF6A'],
    caption: 'Match de foot ce soir ⚽',
  },
  {
    id: '4',
    userName: 'Diana',
    gradient: ['#00C557', '#80FF00'],
    caption: 'Nouveau projet design en cours ✨',
  },
];

const STORY_DURATION = 5000;
const { width, height } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<StoryViewerParams, 'StoryViewer'>>();
  const [index, setIndex] = React.useState(
    Math.min(route.params?.startIndex ?? 0, SLIDES.length - 1)
  );
  const progress = useSharedValue(0);

  const goNext = React.useCallback(() => {
    setIndex((current) => {
      if (current >= SLIDES.length - 1) {
        navigation.goBack();
        return current;
      }
      return current + 1;
    });
  }, [navigation]);

  const goPrev = React.useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: STORY_DURATION, easing: Easing.linear },
      (finished) => {
        if (finished) {
          runOnJS(goNext)();
        }
      }
    );
  }, [index, goNext, progress]);

  const slide = SLIDES[index];
  const isCommunity = route.params?.kind === 'community';
  const headerName = index === 0 && route.params?.userName ? route.params.userName : slide.userName;

  return (
    <View style={styles.root}>
      <Animated.View
        key={slide.id}
        entering={FadeIn.duration(280)}
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient colors={slide.gradient} style={StyleSheet.absoluteFill} />
        {slide.image ? (
          <Image source={{ uri: slide.image }} style={StyleSheet.absoluteFill} />
        ) : null}
      </Animated.View>

      <SafeAreaView style={styles.safe}>
        <View style={styles.progressRow}>
          {SLIDES.map((item, i) => (
            <View key={item.id} style={styles.progressTrack}>
              <ProgressBar active={i === index} done={i < index} progress={progress} />
            </View>
          ))}
        </View>

        <View style={styles.header}>
          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerAvatar, isCommunity && styles.headerAvatarCommunity]}
          >
            {isCommunity ? (
              <Ionicons name="people" size={18} color={theme.colors.white} />
            ) : (
              <Text style={styles.headerAvatarText}>{headerName[0]}</Text>
            )}
          </LinearGradient>
          <Text style={styles.headerName}>{headerName}</Text>
          {isCommunity ? (
            <View style={styles.kindBadge}>
              <Text style={styles.kindBadgeText}>Communauté</Text>
            </View>
          ) : null}
          <Text style={styles.headerTime}>il y a 2h</Text>
          <View style={{ flex: 1 }} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color={theme.colors.white} />
          </Pressable>
        </View>

        {/* Tap zones for navigation */}
        <View style={styles.tapZones} pointerEvents="box-none">
          <Pressable
            style={styles.tapLeft}
            onPress={() => {
              hapticFeedback.selection();
              goPrev();
            }}
          />
          <Pressable
            style={styles.tapRight}
            onPress={() => {
              hapticFeedback.selection();
              goNext();
            }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.caption}>{slide.caption}</Text>
          <View style={styles.replyRow}>
            <View style={styles.replyInput}>
              <Text style={styles.replyPlaceholder}>Envoyer un message…</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="J'aime"
              onPress={hapticFeedback.light}
              style={styles.footerIcon}
            >
              <Ionicons name="heart-outline" size={26} color={theme.colors.white} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Partager"
              onPress={hapticFeedback.light}
              style={styles.footerIcon}
            >
              <Ionicons name="paper-plane-outline" size={24} color={theme.colors.white} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ProgressBar({
  active,
  done,
  progress,
}: {
  active: boolean;
  done: boolean;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    width: done ? '100%' : active ? `${progress.value * 100}%` : '0%',
  }));

  return <Animated.View style={[styles.progressFill, style]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    width,
    height,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarCommunity: {
    borderRadius: 10,
  },
  headerAvatarText: {
    color: theme.colors.white,
    fontWeight: '800',
  },
  kindBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: theme.radii.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  kindBadgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  headerName: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  headerTime: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 2,
  },
  footer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  caption: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 6,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  replyInput: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  replyPlaceholder: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  footerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
