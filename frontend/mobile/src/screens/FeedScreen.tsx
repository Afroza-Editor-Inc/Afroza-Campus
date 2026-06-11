import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFeedStore } from '../store/feedStore';
import { hapticFeedback } from '../utils/haptics';
import theme from '../theme';
import {
  InteractivePostCard,
  StoriesBar,
  ReelsCarousel,
  FeedHeader,
  TrendingExplore,
  FeedSearchOverlay,
  type FeedTabKey,
} from '../components/feed';
import ModuleMenu, { type ModuleMenuSection } from '../components/navigation/ModuleMenu';
import { FeedSkeleton, EmptyState } from '../components/feedback';

const EMPTY_COPY: Record<FeedTabKey, { icon: 'newspaper-outline' | 'people-outline'; title: string; subtitle: string }> = {
  forYou: {
    icon: 'newspaper-outline',
    title: 'Aucune publication',
    subtitle: 'Suivez des camarades et des communautés pour voir leurs actualités ici.',
  },
  following: {
    icon: 'people-outline',
    title: 'Aucun abonnement',
    subtitle: 'Abonnez-vous à des étudiants pour retrouver leurs publications.',
  },
  communities: {
    icon: 'people-outline',
    title: 'Aucune communauté',
    subtitle: 'Rejoignez des communautés pour suivre leurs actualités.',
  },
  trending: {
    icon: 'newspaper-outline',
    title: 'Rien en tendance',
    subtitle: 'Revenez plus tard pour découvrir les sujets populaires.',
  },
};

export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const { posts, loading, setLoading, toggleLike, toggleSave } = useFeedStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTabKey>('forYou');
  const [searchVisible, setSearchVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  const menuSections: ModuleMenuSection[] = React.useMemo(
    () => [
      {
        title: 'Mon contenu',
        items: [
          { key: 'search', label: 'Rechercher', icon: 'search-outline', onPress: () => setSearchVisible(true) },
          { key: 'saved', label: 'Publications enregistrées', icon: 'bookmark-outline', onPress: () => navigation.navigate('Profile') },
          { key: 'drafts', label: 'Brouillons', icon: 'document-outline', onPress: () => navigation.navigate('PostCreate', { mode: 'post' }) },
          { key: 'history', label: 'Historique', icon: 'time-outline', onPress: () => navigation.navigate('Profile') },
        ],
      },
      {
        title: 'Créateur',
        items: [
          { key: 'tools', label: 'Outils créateur', icon: 'color-wand-outline', onPress: () => navigation.navigate('Reels', { startIndex: 0 }) },
          { key: 'settings', label: 'Paramètres', icon: 'settings-outline', onPress: () => navigation.navigate('Settings') },
        ],
      },
    ],
    [navigation]
  );

  const loadFeed = React.useCallback(async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }, [setLoading]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const visiblePosts = React.useMemo(
    () => posts.filter((post) => !hiddenIds.has(post.id)),
    [posts, hiddenIds]
  );

  const handlePostLike = React.useCallback((postId: string) => toggleLike(postId), [toggleLike]);
  const handlePostSave = React.useCallback((postId: string) => toggleSave(postId), [toggleSave]);

  const handlePostComment = React.useCallback(
    (postId: string) => {
      hapticFeedback.light();
      const post = posts.find((item) => item.id === postId);
      navigation.navigate('PostComments', { postId, postAuthor: post?.userName });
    },
    [navigation, posts]
  );

  const handlePostShare = React.useCallback(async (postId: string) => {
    try {
      await Share.share({ message: `Découvre cette publication sur Afroza Campus (#${postId})` });
    } catch {
      // partage annulé
    }
  }, []);

  const handlePostHide = React.useCallback((postId: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setRefreshing(false);
  }, []);

  const renderPost = React.useCallback(
    ({ item }: { item: any }) => (
      <View style={styles.postWrapper}>
        <InteractivePostCard
          post={item}
          onLike={handlePostLike}
          onComment={handlePostComment}
          onShare={handlePostShare}
          onSave={handlePostSave}
          onHide={handlePostHide}
        />
      </View>
    ),
    [handlePostLike, handlePostComment, handlePostShare, handlePostSave, handlePostHide]
  );

  const renderFeedHeader = React.useCallback(
    () => (
      <View style={styles.headerWrapper}>
        <StoriesBar />
        {activeTab === 'forYou' ? <ReelsCarousel /> : null}
      </View>
    ),
    [activeTab]
  );

  const renderEmpty = React.useCallback(() => {
    if (loading) {
      return <FeedSkeleton count={3} />;
    }
    const copy = EMPTY_COPY[activeTab];
    return <EmptyState icon={copy.icon} title={copy.title} subtitle={copy.subtitle} />;
  }, [loading, activeTab]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FeedHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCamera={() => navigation.navigate('PostCreate', { mode: 'story' })}
        onProfile={() => navigation.navigate('Profile')}
        onNotifications={() => navigation.navigate('Notifications')}
        onMenu={() => setMenuVisible(true)}
        hasNotifications
      />

      {activeTab === 'trending' ? (
        <TrendingExplore onOpenReels={() => navigation.navigate('Reels', { startIndex: 0 })} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={loading ? [] : visiblePosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderFeedHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              progressBackgroundColor={theme.colors.surface}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContainer}
          scrollEventThrottle={16}
        />
      )}

      <FeedSearchOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} />

      <ModuleMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        moduleLabel="Actualités"
        moduleIcon="play-circle-outline"
        sections={menuSections}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerWrapper: {
    backgroundColor: theme.colors.background,
  },
  feedContainer: {
    paddingBottom: theme.navigation.barHeight + theme.spacing.lg,
  },
  postWrapper: {
    paddingHorizontal: theme.spacing.md,
  },
});
