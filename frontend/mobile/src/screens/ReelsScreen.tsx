import React from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';
import { useReelsStore, type Reel } from '../store/reelsStore';

type ReelsParams = {
  Reels: { startIndex?: number } | undefined;
};

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `${value}`;
}

function ReelItem({
  reel,
  active,
  height,
}: {
  reel: Reel;
  active: boolean;
  height: number;
}) {
  const videoRef = React.useRef<Video>(null);
  const toggleLike = useReelsStore((state) => state.toggleLike);
  const toggleSave = useReelsStore((state) => state.toggleSave);
  const [paused, setPaused] = React.useState(false);
  const [muted, setMuted] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active && !paused) {
      video.playAsync().catch(() => undefined);
    } else {
      video.pauseAsync().catch(() => undefined);
    }
  }, [active, paused]);

  const togglePlay = () => {
    hapticFeedback.selection();
    setPaused((value) => !value);
  };

  const onLike = () => {
    hapticFeedback.light();
    toggleLike(reel.id);
  };

  const onShare = async () => {
    hapticFeedback.light();
    try {
      await Share.share({ message: `Regarde ce reel de ${reel.userName} sur Afroza Campus !` });
    } catch {
      // annulé
    }
  };

  return (
    <View style={[styles.reel, { height }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={togglePlay}>
        <Video
          ref={videoRef}
          source={{ uri: reel.videoUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted={muted}
          shouldPlay={active && !paused}
          useNativeControls={false}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.75)']}
          style={StyleSheet.absoluteFill}
        />
        {paused ? (
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={64} color="rgba(255,255,255,0.85)" />
          </View>
        ) : null}
      </Pressable>

      {/* Action rail */}
      <View style={styles.rail}>
        <RailButton
          icon={reel.isLiked ? 'heart' : 'heart-outline'}
          color={reel.isLiked ? theme.colors.badge : theme.colors.white}
          label={formatCount(reel.likes)}
          onPress={onLike}
        />
        <RailButton icon="chatbubble-outline" label={formatCount(reel.comments)} onPress={hapticFeedback.light} />
        <RailButton icon="paper-plane-outline" label={formatCount(reel.shares)} onPress={onShare} />
        <RailButton
          icon={reel.isSaved ? 'bookmark' : 'bookmark-outline'}
          color={reel.isSaved ? theme.colors.accent : theme.colors.white}
          label="Enreg."
          onPress={() => {
            hapticFeedback.light();
            toggleSave(reel.id);
          }}
        />
        <RailButton
          icon={muted ? 'volume-mute' : 'volume-high'}
          label={muted ? 'Muet' : 'Son'}
          onPress={() => {
            hapticFeedback.selection();
            setMuted((value) => !value);
          }}
        />
      </View>

      {/* Bottom meta */}
      <View style={styles.meta}>
        <View style={styles.authorRow}>
          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.authorAvatar}
          >
            <Text style={styles.authorAvatarText}>{reel.userName[0]}</Text>
          </LinearGradient>
          <Text style={styles.authorName}>{reel.userName}</Text>
          <Text style={styles.authorHandle}>{reel.userHandle}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Suivre"
            onPress={hapticFeedback.light}
            style={styles.followButton}
          >
            <Text style={styles.followText}>Suivre</Text>
          </Pressable>
        </View>
        <Text style={styles.caption} numberOfLines={2}>
          {reel.caption}
        </Text>
        <View style={styles.audioRow}>
          <Ionicons name="musical-notes" size={14} color={theme.colors.white} />
          <Text style={styles.audioText} numberOfLines={1}>
            {reel.audioLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

function RailButton({
  icon,
  label,
  color = theme.colors.white,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.railButton, pressed && styles.railButtonPressed]}
    >
      <Ionicons name={icon} size={30} color={color} />
      <Text style={styles.railLabel}>{label}</Text>
    </Pressable>
  );
}

export default function ReelsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ReelsParams, 'Reels'>>();
  const reels = useReelsStore((state) => state.reels);
  const [activeIndex, setActiveIndex] = React.useState(
    Math.min(route.params?.startIndex ?? 0, reels.length - 1)
  );
  const [containerHeight, setContainerHeight] = React.useState(SCREEN_HEIGHT);

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 80 }).current;
  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  return (
    <View
      style={styles.root}
      onLayout={(event) => setContainerHeight(event.nativeEvent.layout.height)}
    >
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ReelItem reel={item} active={index === activeIndex} height={containerHeight} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={containerHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        initialScrollIndex={activeIndex}
        getItemLayout={(_, index) => ({
          length: containerHeight,
          offset: containerHeight * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        windowSize={3}
        maxToRenderPerBatch={2}
        removeClippedSubviews
      />

      <SafeAreaView style={styles.topBar} pointerEvents="box-none" edges={['top']}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer les reels"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Ionicons name="chevron-back" size={28} color={theme.colors.white} />
        </Pressable>
        <Text style={styles.topTitle}>Reels</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Créer un reel"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => {
            hapticFeedback.light();
            navigation.navigate('PostCreate');
          }}
          style={styles.closeButton}
        >
          <Ionicons name="camera-outline" size={26} color={theme.colors.white} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    width: SCREEN_WIDTH,
  },
  reel: {
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rail: {
    position: 'absolute',
    right: theme.spacing.sm,
    bottom: 120,
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  railButton: {
    alignItems: 'center',
    gap: 4,
  },
  railButtonPressed: {
    transform: [{ scale: 0.9 }],
  },
  railLabel: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  meta: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 110,
    paddingRight: 80,
    gap: theme.spacing.xs,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  authorAvatarText: {
    color: theme.colors.white,
    fontWeight: '800',
  },
  authorName: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  authorHandle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  followButton: {
    marginLeft: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.round,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  followText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  caption: {
    color: theme.colors.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  audioText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
});
