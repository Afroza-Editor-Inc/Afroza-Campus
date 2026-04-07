import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import theme from '../theme';
import { mockUsers, mockGroups, mockChannels, mockPosts } from '../data/mock';

type SearchTab = 'users' | 'groups' | 'posts';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('users');

  // Filter results based on search query and active tab
  const filteredResults = useMemo(() => {
    const query = searchQuery.toLowerCase();

    switch (activeTab) {
      case 'users':
        return mockUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query)
        );

      case 'groups':
        return mockGroups.filter(
          (group) =>
            group.name.toLowerCase().includes(query) ||
            group.description.toLowerCase().includes(query)
        );

      case 'posts':
        return mockPosts.filter(
          (post) =>
            post.caption.toLowerCase().includes(query) ||
            post.user.name.toLowerCase().includes(query)
        );

      default:
        return [];
    }
  }, [searchQuery, activeTab]);

  const results = filteredResults as any[];

  const renderUserItem = ({ item }: any) => (
    <TouchableOpacity style={styles.resultItem}>
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userBio}>{item.bio || '@' + item.username}</Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGroupItem = ({ item }: any) => (
    <TouchableOpacity style={styles.resultItem}>
      <Image source={{ uri: item.avatar }} style={styles.groupAvatar} />
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDesc}>{item.members} membres</Text>
      </View>
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>{item.isJoined ? '✓' : '+'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }: any) => (
    <TouchableOpacity style={styles.postItem}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <Text style={styles.postCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <View style={styles.postStats}>
          <Text style={styles.statText}>❤️ {item.likes}</Text>
          <Text style={styles.statText}>💬 {item.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const TabButton = ({ label, tab }: { label: string; tab: SearchTab }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor={theme.colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton label="Utilisateurs" tab="users" />
        <TabButton label="Groupes" tab="groups" />
        <TabButton label="Publications" tab="posts" />
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={activeTab === 'posts' ? renderPostItem : activeTab === 'users' ? renderUserItem : renderGroupItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Aucun résultat trouvé' : 'Tapez pour rechercher'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        numColumns={activeTab === 'posts' ? 2 : 1}
        columnWrapperStyle={activeTab === 'posts' ? styles.postColumnWrapper : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  clearIcon: {
    fontSize: 18,
    color: theme.colors.muted,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  followButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  groupDesc: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postItem: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.muted,
  },
  postOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: theme.spacing.sm,
  },
  postCaption: {
    fontSize: 11,
    color: '#fff',
    marginBottom: 8,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 10,
    color: '#fff',
  },
  postColumnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: 'center',
  },
});
