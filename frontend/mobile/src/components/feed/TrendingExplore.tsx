import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

const HASHTAGS = [
  { tag: '#CampusLife', posts: 1240 },
  { tag: '#ReactNative', posts: 892 },
  { tag: '#AfrozaTalents', posts: 754 },
  { tag: '#Examens2026', posts: 631 },
  { tag: '#BDE', posts: 520 },
  { tag: '#Hackathon', posts: 318 },
];

const COMMUNITIES = [
  { id: 'c1', name: 'Dev Club', members: 1280, colors: theme.gradients.ocean },
  { id: 'c2', name: 'BDE Campus', members: 3450, colors: theme.gradients.mint },
  { id: 'c3', name: 'Design Lab', members: 642, colors: theme.gradients.aqua },
  { id: 'c4', name: 'Maths & IA', members: 980, colors: [theme.colors.primaryDeep, theme.colors.primary] as const },
];

const EVENTS = [
  { id: 'e1', title: 'Hackathon Afroza', date: 'Sam. 14 Juin', going: 218, icon: 'rocket-outline' as const },
  { id: 'e2', title: 'Soirée d’intégration', date: 'Ven. 20 Juin', going: 540, icon: 'sparkles-outline' as const },
  { id: 'e3', title: 'Conférence IA', date: 'Mar. 24 Juin', going: 132, icon: 'bulb-outline' as const },
];

const POPULAR = [
  { id: 'p1', tag: '#CampusLife', author: 'Alice', likes: 1240, colors: theme.gradients.ocean },
  { id: 'p2', tag: '#Hackathon', author: 'Dev Club', likes: 980, colors: theme.gradients.mint },
  { id: 'p3', tag: '#Design', author: 'Lina', likes: 754, colors: theme.gradients.aqua },
  { id: 'p4', tag: '#AfrozaTalents', author: 'BDE', likes: 631, colors: [theme.colors.primaryDeep, theme.colors.primary] as const },
];

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `${value}`;
}

function SectionTitle({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={18} color={theme.colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function TrendingExplore({ onOpenReels }: { onOpenReels?: () => void }) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingBottom: theme.navigation.barHeight + 24 }]}
    >
      <Animated.View entering={FadeInUp.duration(260)}>
        <SectionTitle icon="flame-outline" title="Hashtags populaires" />
        <View style={styles.hashtagWrap}>
          {HASHTAGS.map((item) => (
            <Pressable
              key={item.tag}
              accessibilityRole="button"
              accessibilityLabel={item.tag}
              onPress={() => hapticFeedback.selection()}
              style={({ pressed }) => [styles.hashtagPill, pressed && styles.pressed]}
            >
              <Text style={styles.hashtagText}>{item.tag}</Text>
              <Text style={styles.hashtagCount}>{formatCount(item.posts)}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(260)}>
        <SectionTitle icon="people-circle-outline" title="Communautés actives" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
          {COMMUNITIES.map((community) => (
            <Pressable
              key={community.id}
              accessibilityRole="button"
              accessibilityLabel={community.name}
              onPress={() => hapticFeedback.selection()}
              style={({ pressed }) => [styles.communityCard, pressed && styles.pressed]}
            >
              <LinearGradient colors={community.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.communityAvatar}>
                <Ionicons name="people" size={26} color={theme.colors.white} />
              </LinearGradient>
              <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
              <Text style={styles.communityMeta}>{formatCount(community.members)} membres</Text>
              <View style={styles.joinPill}>
                <Text style={styles.joinText}>Rejoindre</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(160).duration(260)}>
        <SectionTitle icon="calendar-outline" title="Événements populaires" />
        {EVENTS.map((event) => (
          <Pressable
            key={event.id}
            accessibilityRole="button"
            accessibilityLabel={event.title}
            onPress={() => hapticFeedback.selection()}
            style={({ pressed }) => [styles.eventRow, pressed && styles.pressed]}
          >
            <View style={styles.eventIcon}>
              <Ionicons name={event.icon} size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
              <Text style={styles.eventMeta}>{event.date} · {event.going} intéressés</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(240).duration(260)}>
        <SectionTitle icon="trending-up-outline" title="Publications populaires" />
        <View style={styles.grid}>
          {POPULAR.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Publication ${item.tag}`}
              onPress={() => {
                hapticFeedback.light();
                onOpenReels?.();
              }}
              style={({ pressed }) => [styles.gridTile, pressed && styles.pressed]}
            >
              <LinearGradient colors={item.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={StyleSheet.absoluteFill} />
              <View style={styles.gridTop}>
                <Ionicons name="play" size={13} color={theme.colors.white} />
                <Text style={styles.gridCount}>{formatCount(item.likes)}</Text>
              </View>
              <View style={styles.gridFooter}>
                <Text style={styles.gridTag} numberOfLines={1}>{item.tag}</Text>
                <Text style={styles.gridAuthor} numberOfLines={1}>{item.author}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  flex: { flex: 1 },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  hashtagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  hashtagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primarySoft,
  },
  hashtagText: {
    ...theme.typography.label,
    color: theme.colors.primaryDeep,
  },
  hashtagCount: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  hRow: {
    gap: theme.spacing.sm,
    paddingVertical: 2,
  },
  communityCard: {
    width: 130,
    alignItems: 'center',
    gap: 4,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  communityAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  communityName: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  communityMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  joinPill: {
    marginTop: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
  },
  joinText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  eventIcon: {
    width: 46,
    height: 46,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  eventMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  gridTile: {
    width: '48.5%',
    height: 180,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
  },
  gridTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radii.round,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  gridCount: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  gridFooter: {
    gap: 1,
  },
  gridTag: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  gridAuthor: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
});
