import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

type StoryKind = 'me' | 'contact' | 'community';

interface Story {
  id: string;
  userName: string;
  userAvatar?: string;
  hasUnseenStory: boolean;
  kind: StoryKind;
}

const STORY_RING = theme.gradients.brand;

const stories: Story[] = [
  { id: 'my', userName: 'Votre story', hasUnseenStory: false, kind: 'me' },
  { id: '1', userName: 'Alice', hasUnseenStory: true, kind: 'contact' },
  { id: '2', userName: 'Bob', hasUnseenStory: true, kind: 'contact' },
  { id: 'c1', userName: 'Dev Club', hasUnseenStory: true, kind: 'community' },
  { id: '3', userName: 'Charlie', hasUnseenStory: false, kind: 'contact' },
  { id: 'c2', userName: 'BDE Campus', hasUnseenStory: false, kind: 'community' },
  { id: '4', userName: 'Diana', hasUnseenStory: true, kind: 'contact' },
];

const RING_SIZE = 66;
const AVATAR_SIZE = 58;

function StoryAvatar({ story }: { story: Story }) {
  const isMine = story.kind === 'me';
  const isCommunity = story.kind === 'community';
  const avatarRadius = isCommunity ? 16 : AVATAR_SIZE / 2;

  const inner = (
    <View style={[styles.avatarInner, { borderRadius: avatarRadius }]}>
      {story.userAvatar ? (
        <Image source={{ uri: story.userAvatar }} style={[styles.avatarImage, { borderRadius: avatarRadius }]} />
      ) : (
        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarFallback}
        >
          {isMine ? null : isCommunity ? (
            <Ionicons name="people" size={24} color={theme.colors.white} />
          ) : (
            <Text style={styles.avatarText}>{story.userName[0].toUpperCase()}</Text>
          )}
        </LinearGradient>
      )}
      {isMine ? (
        <View style={styles.addStoryIcon}>
          <Ionicons name="add" size={16} color={theme.colors.white} />
        </View>
      ) : null}
      {isCommunity ? (
        <View style={styles.communityBadge}>
          <Ionicons name="people" size={10} color={theme.colors.white} />
        </View>
      ) : null}
    </View>
  );

  const ringRadius = isCommunity ? 20 : RING_SIZE / 2;
  const innerRadius = isCommunity ? 18 : (RING_SIZE - 4) / 2;

  if (story.hasUnseenStory) {
    return (
      <LinearGradient
        colors={isCommunity ? theme.gradients.mint : STORY_RING}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.ring, { borderRadius: ringRadius }]}
      >
        <View style={[styles.ringInnerBorder, { borderRadius: innerRadius }]}>{inner}</View>
      </LinearGradient>
    );
  }

  return <View style={[styles.ring, styles.ringSeen, { borderRadius: ringRadius }]}>{inner}</View>;
}

export function StoriesBar() {
  const navigation = useNavigation<any>();

  const handlePress = (story: Story, viewerIndex: number) => {
    hapticFeedback.light();
    if (story.kind === 'me') {
      navigation.navigate('PostCreate', { mode: 'story' });
      return;
    }
    navigation.navigate('StoryViewer', {
      startIndex: viewerIndex,
      userName: story.userName,
      kind: story.kind,
    });
  };

  let viewerIndex = -1;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stories.map((story) => {
          if (story.kind !== 'me') {
            viewerIndex += 1;
          }
          const indexForViewer = Math.max(0, viewerIndex);
          return (
            <Pressable
              key={story.id}
              accessibilityRole="button"
              accessibilityLabel={story.userName}
              onPress={() => handlePress(story, indexForViewer)}
              style={({ pressed }) => [styles.storyItem, pressed && styles.storyItemPressed]}
            >
              <StoryAvatar story={story} />
              <Text style={styles.storyUserName} numberOfLines={1}>
                {story.userName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  storyItem: {
    alignItems: 'center',
    width: 74,
    gap: theme.spacing.xxs,
  },
  storyItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSeen: {
    backgroundColor: theme.colors.borderStrong,
  },
  ringInnerBorder: {
    width: RING_SIZE - 4,
    height: RING_SIZE - 4,
    borderRadius: (RING_SIZE - 4) / 2,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  addStoryIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyUserName: {
    ...theme.typography.caption,
    color: theme.colors.text,
    textAlign: 'center',
    maxWidth: 72,
  },
});
