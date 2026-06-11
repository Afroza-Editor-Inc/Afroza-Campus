import React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';
import { useFeedStore, type PostComment } from '../store/feedStore';
import { EmptyState } from '../components/feedback';

type CommentsParams = {
  PostComments: { postId: string; postAuthor?: string };
};

const TOKEN_REGEX = /([#@][\p{L}0-9_]+)/u;

function renderRich(content: string) {
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

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `${m}min`;
  if (h < 24) return `${h}h`;
  return `${d}j`;
}

export default function PostCommentsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<CommentsParams, 'PostComments'>>();
  const { postId, postAuthor } = route.params;

  const comments = useFeedStore((state) => state.comments[postId] ?? []);
  const addComment = useFeedStore((state) => state.addComment);
  const toggleCommentLike = useFeedStore((state) => state.toggleCommentLike);

  const [draft, setDraft] = React.useState('');

  const submit = () => {
    if (!draft.trim()) return;
    hapticFeedback.light();
    addComment(postId, draft);
    setDraft('');
  };

  const renderItem = ({ item }: { item: PostComment }) => (
    <View style={styles.commentRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.userName[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.commentBody}>
        <Text style={styles.commentText}>
          <Text style={styles.commentAuthor}>{item.userName} </Text>
          {renderRich(item.content)}
        </Text>
        <View style={styles.commentMeta}>
          <Text style={styles.metaText}>{timeAgo(item.timestamp)}</Text>
          {item.likes > 0 && <Text style={styles.metaText}>{item.likes} j'aime</Text>}
          <Text style={styles.metaText}>Répondre</Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Aimer le commentaire"
        hitSlop={theme.accessibility.hitSlop}
        onPress={() => {
          hapticFeedback.selection();
          toggleCommentLike(postId, item.id);
        }}
        style={styles.likeButton}
      >
        <Ionicons
          name={item.isLiked ? 'heart' : 'heart-outline'}
          size={18}
          color={item.isLiked ? theme.colors.danger : theme.colors.textMuted}
        />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.grabber} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Commentaires</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title="Aucun commentaire pour le moment"
              subtitle={`Soyez le premier à réagir${postAuthor ? ` à ${postAuthor}` : ''}.`}
            />
          }
        />

        <View style={styles.inputBar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ajouter un commentaire…"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Publier le commentaire"
            disabled={!draft.trim()}
            onPress={submit}
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
          >
            <Ionicons name="arrow-up" size={20} color={theme.colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingTop: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  list: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    flexGrow: 1,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  commentBody: {
    flex: 1,
  },
  commentText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 20,
  },
  commentAuthor: {
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  token: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  commentMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: 4,
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  likeButton: {
    paddingTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.text,
    ...theme.typography.body,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
