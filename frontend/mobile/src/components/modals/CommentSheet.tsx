import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../theme';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface CommentSheetProps {
  postId: string;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (text: string) => void;
}

export function CommentSheet({ postId, comments, onClose, onAddComment }: CommentSheetProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    // Simulation d'envoi
    setTimeout(() => {
      onAddComment(commentText);
      setCommentText('');
      setIsSubmitting(false);
    }, 500);
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentAvatar}>
        <Text style={styles.avatarText}>{item.userName[0].toUpperCase()}</Text>
      </View>

      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{item.userName}</Text>
          <Text style={styles.commentTime}>{formatTime(item.timestamp)}</Text>
        </View>

        <Text style={styles.commentText}>{item.text}</Text>

        <View style={styles.commentActions}>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionText}>J'aime</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionText}>Répondre</Text>
          </Pressable>
          {item.likes > 0 && (
            <Text style={styles.likeCount}>{item.likes} J'aime</Text>
          )}
        </View>
      </View>

      <Pressable style={styles.likeButton}>
        <Ionicons
          name={item.isLiked ? 'heart' : 'heart-outline'}
          size={16}
          color={item.isLiked ? theme.colors.danger : theme.colors.textMuted}
        />
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Commentaires ({comments.length})</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* Commentaires */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ajoute un commentaire..."
              placeholderTextColor={theme.colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
              editable={!isSubmitting}
            />
            <Pressable
              onPress={handleSubmit}
              disabled={!commentText.trim() || isSubmitting}
              style={styles.sendButton}
            >
              <Ionicons
                name="send"
                size={18}
                color={
                  commentText.trim() && !isSubmitting
                    ? theme.colors.primary
                    : theme.colors.textMuted
                }
              />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  commentsList: {
    padding: theme.spacing.md,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  commentTime: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  commentText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  actionButton: {
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  likeCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  likeButton: {
    padding: theme.spacing.xs,
  },
  inputContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
});
