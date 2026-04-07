import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import theme from '../theme';

type Props = {
  likes?: number;
  liked?: boolean;
  saved?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
};

export default function ActionBar({ likes = 0, liked = false, saved = false, onLike, onComment, onShare, onSave }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity onPress={onLike} style={styles.action} accessibilityLabel="like-button">
          <Text style={{fontSize: 18}}>{liked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onComment} style={styles.action} accessibilityLabel="comment-button"><Text>💬</Text></TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={styles.action} accessibilityLabel="share-button"><Text>✈️</Text></TouchableOpacity>
      </View>
      <View style={{flexDirection:'row',alignItems:'center'}}>
        <Text style={styles.likesCount}>{likes}</Text>
        <TouchableOpacity onPress={onSave} style={styles.action} accessibilityLabel="save-button">
          <Text>{saved ? '🔖' : '📖'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    marginRight: theme.spacing.md,
  },
  likesCount: {
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
});