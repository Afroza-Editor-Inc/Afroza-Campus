import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppIcon, AppScreen, GlassCard, SectionTitle } from '../components/ui';
import theme from '../theme';
import { mockChannels, mockGroups, mockPosts, mockUsers } from '../data/mock';

type TabKey = 'discover' | 'people' | 'communities';

export default function SearchScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [query, setQuery] = useState('');

  const users = mockUsers.filter((user) => `${user.name} ${user.username}`.toLowerCase().includes(query.toLowerCase()));
  const communities = [...mockGroups, ...mockChannels].filter((item) =>
    `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const discover = mockPosts.filter((post) =>
    `${post.caption} ${post.user.name}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SectionTitle eyebrow="Explorer" title="Recherche & découverte" />
        <View style={styles.searchBar}>
          <AppIcon name="search" size={18} color={theme.colors.primary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Chercher des étudiants, clubs, canaux"
            placeholderTextColor={theme.colors.textSoft}
            style={styles.searchInput}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
          {['Trending posts', 'Reels campus', 'Clubs design', 'Jobs & stages'].map((item) => (
            <View key={item} style={styles.trendingChip}>
              <Text style={styles.trendingChipText}>{item}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.tabs}>
          {[
            { key: 'discover', label: 'Pour vous' },
            { key: 'people', label: 'Étudiants' },
            { key: 'communities', label: 'Communautés' },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key as TabKey)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'discover' ? (
          <View style={styles.discoveryGrid}>
            {discover.slice(0, 6).map((post, index) => (
              <GlassCard key={post.id} style={[styles.discoveryCard, index % 3 === 0 && styles.discoveryTall]}>
                <Image source={{ uri: post.image }} style={styles.discoveryImage} />
                <View style={styles.discoveryOverlay} />
                <View style={styles.discoveryMeta}>
                  <Text style={styles.discoveryName}>{post.user.name}</Text>
                  <Text style={styles.discoveryCaption} numberOfLines={2}>
                    {post.caption}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </View>
        ) : null}

        {activeTab === 'people' ? (
          <View style={styles.list}>
            {users.map((user) => (
              <GlassCard key={user.id} style={styles.listCard}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <View style={styles.listText}>
                  <Text style={styles.listTitle}>{user.name}</Text>
                  <Text style={styles.listSubtitle}>@{user.username} · {user.bio}</Text>
                </View>
                <View style={styles.followChip}>
                  <Text style={styles.followChipText}>Suivre</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        ) : null}

        {activeTab === 'communities' ? (
          <View style={styles.list}>
            {communities.map((item) => (
              <GlassCard key={item.id} style={styles.listCard}>
                <Image source={{ uri: item.avatar }} style={styles.communityAvatar} />
                <View style={styles.listText}>
                  <Text style={styles.listTitle}>{item.name}</Text>
                  <Text style={styles.listSubtitle}>{item.description}</Text>
                </View>
                <View style={styles.joinChip}>
                  <Text style={styles.joinChipText}>Rejoindre</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.md,
  },
  scrollContent: {
    paddingBottom: 150,
    gap: theme.spacing.lg,
  },
  searchBar: {
    minHeight: 56,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  trendingRow: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  trendingChip: {
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  trendingChipText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: theme.colors.white,
  },
  discoveryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  discoveryCard: {
    width: '47%',
    height: 170,
    padding: 0,
    overflow: 'hidden',
  },
  discoveryTall: {
    height: 240,
  },
  discoveryImage: {
    ...StyleSheet.absoluteFillObject,
  },
  discoveryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 17, 31, 0.22)',
  },
  discoveryMeta: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    gap: 2,
  },
  discoveryName: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  discoveryCaption: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    gap: theme.spacing.md,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  communityAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  listText: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    ...theme.typography.title3,
    fontSize: 16,
  },
  listSubtitle: {
    ...theme.typography.bodyMuted,
  },
  followChip: {
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  followChipText: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  joinChip: {
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.secondarySoft,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  joinChipText: {
    ...theme.typography.label,
    color: theme.colors.secondaryDeep,
  },
});
