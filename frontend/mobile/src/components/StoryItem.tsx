import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import theme from '../theme';

type Props = {
  id: string;
  userName: string;
  uri?: string;
  hasStory?: boolean;
};

export default function StoryItem({ userName, uri, hasStory = true }: Props) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8}>
      <View style={[styles.ring, hasStory ? styles.active : null]}>
        <Avatar uri={uri} size={58} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{userName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
  },
  ring: {
    borderRadius: 40,
    padding: 2,
  },
  active: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  name: {
    marginTop: 6,
    fontSize: theme.typography.fontSizeSm,
    color: theme.colors.text,
  },
});