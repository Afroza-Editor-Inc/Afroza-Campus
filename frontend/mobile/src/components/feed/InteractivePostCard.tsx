import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Platform,
  Dimensions,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';
import FloatingAnchorMenu, {
  type FloatingMenuSection,
} from '../overlays/FloatingAnchorMenu';

const { width } = Dimensions.get('window');

const TOKEN_REGEX = /([#@][\p{L}0-9_]+)/u;

function renderRichContent(content: string) {
  return content.split(TOKEN_REGEX).map((chunk, index) => {
    if (chunk.startsWith('#') || chunk.startsWith('@')) {
      return (
        <Text key={`${chunk}-${index}`} style={styles.token}>
          {chunk}
        </Text>
      );
    }
    return chunk;
  });
}

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

interface InteractivePostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onHide?: (postId: string) => void;
}

export function InteractivePostCard({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onHide,
}: InteractivePostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [menuVisible, setMenuVisible] = useState(false);
  const scaleAnim = useSharedValue(1);

  React.useEffect(() => {
    setIsLiked(post.isLiked);
    setIsSaved(post.isSaved);
  }, [post.id, post.isLiked, post.isSaved]);

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

  const handleLike = () => {
    hapticFeedback.medium();
    setIsLiked(!isLiked);
    onLike?.(post.id);

    // Scale animation
    scaleAnim.value = withSpring(0.8, { damping: 8 });
    setTimeout(() => {
      scaleAnim.value = withSpring(1, { damping: 8 });
    }, 100);
  };

  const handleComment = () => {
    hapticFeedback.light();
    onComment?.(post.id);
  };

  const handleSave = () => {
    hapticFeedback.light();
    setIsSaved(!isSaved);
    onSave?.(post.id);
  };

  const handleShare = () => {
    hapticFeedback.light();
    onShare?.(post.id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const postLink = `https://afroza.campus/p/${post.id}`;

  const menuSections: FloatingMenuSection[] = [
    {
      items: [
        {
          label: isSaved ? 'Retirer des enregistrements' : 'Enregistrer',
          icon: isSaved ? 'bookmark' : 'bookmark-outline',
          onPress: handleSave,
        },
        {
          label: 'Partager',
          icon: 'paper-plane-outline',
          onPress: () => {
            Share.share({ message: `${post.userName} sur Afroza Campus : ${postLink}` }).catch(
              () => undefined
            );
          },
        },
        {
          label: 'Télécharger',
          icon: 'download-outline',
          onPress: () => hapticFeedback.light(),
        },
        {
          label: 'Copier le lien',
          icon: 'link-outline',
          onPress: () => {
            Clipboard.setStringAsync(postLink).catch(() => undefined);
          },
        },
        {
          label: 'Republier',
          icon: 'repeat-outline',
          onPress: () => hapticFeedback.medium(),
        },
      ],
    },
    {
      items: [
        {
          label: 'Masquer',
          icon: 'eye-off-outline',
          onPress: () => {
            hapticFeedback.light();
            onHide?.(post.id);
          },
        },
        {
          label: 'Ne plus suivre',
          icon: 'person-remove-outline',
          onPress: () => hapticFeedback.light(),
        },
        {
          label: 'Signaler',
          icon: 'flag-outline',
          onPress: () => hapticFeedback.error(),
          destructive: true,
        },
      ],
    },
  ];

  const hasMedia = post.mediaUrls.length > 0 && post.mediaType === 'image';

  return (
    <Animated.View
      entering={FadeInUp.delay(100).duration(400)}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {post.userAvatar ? (
              <Image source={{ uri: post.userAvatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{post.userName[0].toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>{formatTime(post.timestamp)}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Options de la publication"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => {
            hapticFeedback.selection();
            setMenuVisible(true);
          }}
          style={({ pressed }) => [styles.moreButton, pressed && { opacity: 0.6 }]}
          android_ripple={{ color: theme.colors.text, radius: 16 }}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Text-only content shown above (no media) */}
      {!hasMedia && post.content ? (
        <Text style={styles.textOnly}>{renderRichContent(post.content)}</Text>
      ) : null}

      {/* Media (full-bleed) */}
      {hasMedia ? (
        <Pressable onPress={handleLike} accessibilityLabel="Publication" accessibilityRole="image">
          <Image source={{ uri: post.mediaUrls[0] }} style={styles.mediaImage} />
        </Pressable>
      ) : null}

      {/* Actions row (icons only, Instagram-style) */}
      <View style={styles.actionsBar}>
        <View style={styles.actionsLeft}>
          <Animated.View style={animatedStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="J'aime"
              hitSlop={theme.accessibility.hitSlop}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
              onPress={handleLike}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={26}
                color={isLiked ? theme.colors.danger : theme.colors.text}
              />
            </Pressable>
          </Animated.View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Commenter"
            hitSlop={theme.accessibility.hitSlop}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
            onPress={handleComment}
          >
            <Ionicons name="chatbubble-outline" size={25} color={theme.colors.text} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Partager"
            hitSlop={theme.accessibility.hitSlop}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
            onPress={handleShare}
          >
            <Ionicons name="paper-plane-outline" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enregistrer"
          hitSlop={theme.accessibility.hitSlop}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
          onPress={handleSave}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={25}
            color={isSaved ? theme.colors.primary : theme.colors.text}
          />
        </Pressable>
      </View>

      {/* Likes count */}
      {post.likes > 0 ? (
        <Text style={styles.likes}>{post.likes.toLocaleString('fr-FR')} j'aime</Text>
      ) : null}

      {/* Caption (username + content) for media posts */}
      {hasMedia && post.content ? (
        <Text style={styles.caption}>
          <Text style={styles.captionName}>{post.userName} </Text>
          {renderRichContent(post.content)}
        </Text>
      ) : null}

      {/* Comments link */}
      {post.comments > 0 ? (
        <Pressable hitSlop={theme.accessibility.hitSlop} onPress={handleComment}>
          <Text style={styles.commentsLink}>
            Voir les {post.comments} commentaires
          </Text>
        </Pressable>
      ) : null}

      <Text style={styles.footerTime}>{formatTime(post.timestamp)}</Text>

      <FloatingAnchorMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        title={post.userName}
        subtitle="Publication"
        sections={menuSections}
        anchor="top-right"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    overflow: 'hidden',
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
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  moreButton: {
    padding: theme.spacing.xs,
  },
  token: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  textOnly: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 23,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  mediaImage: {
    width: '100%',
    height: width * 0.92,
    backgroundColor: theme.colors.surfaceMuted,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
  iconPressed: {
    opacity: 0.55,
    transform: [{ scale: 0.92 }],
  },
  likes: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 2,
  },
  caption: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 4,
  },
  captionName: {
    fontWeight: '700',
  },
  commentsLink: {
    fontSize: 14,
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 6,
  },
  footerTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 6,
    paddingBottom: theme.spacing.md,
  },
});
