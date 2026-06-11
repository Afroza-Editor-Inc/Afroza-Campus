import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeedStore } from '../../store/feedStore';
import theme from '../../theme';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'text';
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  isLiked: boolean;
  isSaved: boolean;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { toggleLike, toggleSave } = useFeedStore();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.userAvatar ? '' : post.userName[0].toUpperCase()}
            </Text>
            {post.userAvatar && (
              <Image source={{ uri: post.userAvatar }} style={styles.avatarImage} />
            )}
          </View>
          <View>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>{formatTime(post.timestamp)}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {post.content && (
        <Text style={styles.content}>{post.content}</Text>
      )}

      {/* Media */}
      {post.mediaUrls.length > 0 && (
        <View style={styles.mediaContainer}>
          {post.mediaType === 'image' && (
            <Image source={{ uri: post.mediaUrls[0] }} style={styles.mediaImage} />
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(post.id)}
          >
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={post.isLiked ? theme.colors.danger : theme.colors.textMuted}
            />
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color={theme.colors.textMuted} />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color={theme.colors.textMuted} />
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => toggleSave(post.id)}
        >
          <Ionicons
            name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={post.isSaved ? theme.colors.primary : theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  content: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  mediaContainer: {
    marginBottom: theme.spacing.md,
  },
  mediaImage: {
    width: width - 2 * theme.spacing.md,
    height: 300,
    borderRadius: theme.radii.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  actionText: {
    marginLeft: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  saveButton: {
    padding: theme.spacing.xs,
  },
});