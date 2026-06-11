import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SegmentedTabs from '../components/SegmentedTabs';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';
import { mockPosts, mockUsers } from '../data/mock';
import { Skeleton } from '../components/feedback';

type ProfileTab = 'posts' | 'reels' | 'saved';

const PROFILE_TABS = [
  { key: 'posts', label: 'Publications' },
  { key: 'reels', label: 'Reels' },
  { key: 'saved', label: 'Enregistrés' },
];

const HIGHLIGHTS = [
  { id: 'h1', label: 'Cours', icon: 'school-outline' as const },
  { id: 'h2', label: 'Projets', icon: 'rocket-outline' as const },
  { id: 'h3', label: 'Events', icon: 'calendar-outline' as const },
  { id: 'h4', label: 'Voyage', icon: 'airplane-outline' as const },
];

function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `${value}`;
}

export default function ProfileScreen({ navigation }: any) {
  const user = mockUsers[5];
  const [tab, setTab] = useState<ProfileTab>('posts');
  const [booting, setBooting] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const shareProfile = () => {
    hapticFeedback.light();
    Share.share({
      message: `Découvre le profil de ${user.name} sur Afroza Campus : @${user.username}`,
    }).catch(() => undefined);
  };

  const stats = [
    { label: 'Publications', value: formatCount(user.postsCount) },
    { label: 'Abonnés', value: formatCount(user.followers) },
    { label: 'Suivis', value: formatCount(user.following) },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => navigation.goBack()}
          style={styles.topButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.textStrong} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          @{user.username}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Paramètres"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => navigation.navigate('Settings')}
          style={styles.topButton}
        >
          <Ionicons name="settings-outline" size={22} color={theme.colors.textStrong} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cover}
        />

        <View style={styles.identity}>
          <View style={styles.avatarRingWrap}>
            <LinearGradient
              colors={theme.gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            </LinearGradient>
          </View>

          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <Pressable
                key={stat.label}
                onPress={hapticFeedback.selection}
                style={styles.statBlock}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.bioBlock}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>Lead mobile · Mentor campus</Text>
          <Text style={styles.bio}>
            Passionnée par les communautés tech et les produits utiles. Toujours partante pour un
            projet ou un café ☕
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Éditer le profil"
            onPress={hapticFeedback.light}
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
          >
            <Text style={styles.primaryActionText}>Éditer le profil</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Partager le profil"
            onPress={shareProfile}
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryActionText}>Partager</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlights}
        >
          {HIGHLIGHTS.map((item) => (
            <Pressable key={item.id} onPress={hapticFeedback.selection} style={styles.highlight}>
              <View style={styles.highlightCircle}>
                <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.highlightLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.tabsBar}>
          <SegmentedTabs items={PROFILE_TABS} activeKey={tab} onChange={(key) => setTab(key as ProfileTab)} />
        </View>

        <View style={styles.grid}>
          {booting
            ? Array.from({ length: 9 }).map((_, index) => (
                <View key={`sk-${index}`} style={styles.tile}>
                  <Skeleton width="100%" height="100%" radius={theme.radii.sm} />
                </View>
              ))
            : mockPosts.slice(0, 9).map((post, index) => (
            <Pressable
              key={post.id}
              accessibilityRole="button"
              accessibilityLabel={tab === 'reels' ? 'Ouvrir le reel' : 'Ouvrir la publication'}
              onPress={() => {
                hapticFeedback.selection();
                if (tab === 'reels') {
                  navigation.navigate('Reels', { startIndex: index % 4 });
                }
              }}
              style={styles.tile}
            >
              <Image source={{ uri: post.image }} style={styles.tileImage} />
              {tab === 'reels' ? (
                <View style={styles.tileBadge}>
                  <Ionicons name="play" size={11} color={theme.colors.white} />
                  <Text style={styles.tileBadgeText}>{formatCount(post.likes)}</Text>
                </View>
              ) : tab === 'saved' ? (
                <View style={styles.tileCorner}>
                  <Ionicons name="bookmark" size={14} color={theme.colors.white} />
                </View>
              ) : (
                <View style={styles.tileCorner}>
                  <Ionicons name="heart" size={13} color={theme.colors.white} />
                  <Text style={styles.tileBadgeText}>{formatCount(post.likes)}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  topButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    paddingBottom: theme.navigation.barHeight + theme.spacing.xl,
  },
  cover: {
    height: 96,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    marginTop: -36,
    gap: theme.spacing.md,
  },
  avatarRingWrap: {
    borderRadius: 48,
    backgroundColor: theme.colors.background,
    padding: 4,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: theme.spacing.xs,
  },
  statBlock: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  bioBlock: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    gap: 2,
  },
  name: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  role: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  bio: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  primaryAction: {
    flex: 1,
    height: 40,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    ...theme.typography.label,
    color: theme.colors.white,
  },
  secondaryAction: {
    flex: 1,
    height: 40,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    ...theme.typography.label,
    color: theme.colors.textStrong,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  highlights: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  highlight: {
    alignItems: 'center',
    gap: 4,
    width: 64,
  },
  highlightCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  tabsBar: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    gap: 3,
  },
  tile: {
    width: '32.6%',
    aspectRatio: 1,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceMuted,
  },
  tileImage: {
    ...StyleSheet.absoluteFillObject,
  },
  tileBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.round,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  tileBadgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  tileCorner: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: theme.radii.round,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});

