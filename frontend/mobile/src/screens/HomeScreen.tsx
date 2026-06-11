import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AppIcon, AppScreen, GlassCard, LogoBadge, SectionTitle } from '../components/ui';
import theme from '../theme';
import { mockPosts, mockStories } from '../data/mock';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const featuredPosts = mockPosts.slice(0, 4);

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <LogoBadge source={require('../assets/logo.png')} size={48} />
            <View>
              <Text style={styles.brandTitle}>Afroza Campus</Text>
              <Text style={styles.brandSubtitle}>Social feed étudiante nouvelle génération</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={() => navigation.navigate('PostCreate')}>
              <AppIcon name="add-circle-outline" size={22} color={theme.colors.text} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              <AppIcon name="heart-outline" size={21} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>

        <GlassCard style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Aujourd’hui sur le campus</Text>
          <Text style={styles.heroTitle}>Un feed immersif, premium et instantané.</Text>
          <Text style={styles.heroText}>
            Stories, posts, reels, contenus clubs et interactions sociales dans une expérience mobile
            inspirée d’Instagram.
          </Text>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>+12%</Text>
              <Text style={styles.metricLabel}>engagement</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>38</Text>
              <Text style={styles.metricLabel}>stories live</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>9</Text>
              <Text style={styles.metricLabel}>clubs actifs</Text>
            </View>
          </View>
        </GlassCard>

        <SectionTitle eyebrow="Stories" title="Stories du campus" action="Voir tout" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
          <Pressable style={styles.storyCreateCard}>
            <Image source={{ uri: mockStories[0].user.avatar }} style={styles.storyCreateAvatar} />
            <View style={styles.storyCreatePlus}>
              <AppIcon name="add" size={16} color={theme.colors.white} />
            </View>
            <Text style={styles.storyCreateText}>Votre story</Text>
          </Pressable>
          {mockStories.map((story) => (
            <View key={story.id} style={styles.storyCard}>
              <Image source={{ uri: story.image }} style={styles.storyImage} />
              <View style={styles.storyOverlay} />
              <View style={styles.storyAvatarWrap}>
                <Image source={{ uri: story.user.avatar }} style={styles.storyAvatar} />
              </View>
              <View style={styles.storyMeta}>
                <Text style={styles.storyName} numberOfLines={1}>
                  {story.user.name}
                </Text>
                <Text style={styles.storyTime}>{story.timestamp}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <SectionTitle eyebrow="Feed" title="Posts & reels" action="Pour vous" />
        <View style={styles.feed}>
          {featuredPosts.map((post) => (
            <GlassCard key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postUser}>
                  <Image source={{ uri: post.user.avatar }} style={styles.postAvatar} />
                  <View>
                    <Text style={styles.postName}>{post.user.name}</Text>
                    <Text style={styles.postHandle}>@{post.user.username} · {post.timestamp}</Text>
                  </View>
                </View>
                <AppIcon name="ellipsis-horizontal" size={18} color={theme.colors.textSoft} />
              </View>
              <View>
                <Image source={{ uri: post.image }} style={styles.postImage} />
                <View style={styles.reelPill}>
                  <AppIcon name="play" size={14} color={theme.colors.white} />
                  <Text style={styles.reelPillText}>Reel</Text>
                </View>
              </View>
              <Text style={styles.postCaption}>{post.caption}</Text>
              <View style={styles.postActions}>
                <View style={styles.actionItem}>
                  <AppIcon name="heart-outline" size={19} color={theme.colors.text} />
                  <Text style={styles.action}>{post.likes}</Text>
                </View>
                <View style={styles.actionItem}>
                  <AppIcon name="chatbubble-outline" size={18} color={theme.colors.text} />
                  <Text style={styles.action}>{post.comments}</Text>
                </View>
                <View style={styles.actionItem}>
                  <AppIcon name="paper-plane-outline" size={18} color={theme.colors.text} />
                  <Text style={styles.action}>Share</Text>
                </View>
                <View style={styles.actionItem}>
                  <AppIcon name="bookmark-outline" size={18} color={theme.colors.text} />
                  <Text style={styles.action}>Save</Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        <AppButton label="Créer une publication" icon="+" onPress={() => navigation.navigate('PostCreate')} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.sm,
  },
  scrollContent: {
    paddingBottom: 150,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  brandTitle: {
    ...theme.typography.title3,
  },
  brandSubtitle: {
    ...theme.typography.caption,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroCard: {
    backgroundColor: theme.colors.primary,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: theme.spacing.md,
  },
  heroEyebrow: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: theme.colors.white,
  },
  heroText: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.84)',
  },
  metrics: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metric: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.white,
  },
  metricLabel: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.72)',
  },
  storiesRow: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.lg,
  },
  storyCreateCard: {
    width: 92,
    height: 112,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  storyCreateAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  storyCreatePlus: {
    position: 'absolute',
    top: 54,
    right: 24,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  storyCreateText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  storyCard: {
    width: 132,
    height: 192,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceStrong,
  },
  storyImage: {
    ...StyleSheet.absoluteFillObject,
  },
  storyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 18, 36, 0.28)',
  },
  storyAvatarWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderRadius: 20,
  },
  storyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  storyMeta: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
  },
  storyName: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  storyTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  feed: {
    gap: theme.spacing.lg,
  },
  postCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  postName: {
    ...theme.typography.label,
  },
  postHandle: {
    ...theme.typography.caption,
  },
  postImage: {
    width: '100%',
    height: 280,
    borderRadius: theme.radii.md,
  },
  reelPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radii.round,
    backgroundColor: 'rgba(9,17,31,0.42)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reelPillText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  postCaption: {
    ...theme.typography.body,
  },
  postActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  action: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
});
