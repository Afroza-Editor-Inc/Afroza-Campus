import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import StoryItem from './StoryItem';
import theme from '../theme';
import { Story } from '../data/mock';

type Props = {
  stories: Story[];
};

export default function StoryList({ stories }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.addStory} activeOpacity={0.8}>
          <View style={styles.addCircle}><Text style={styles.plus}>+</Text></View>
          <Text style={styles.name}>Votre Story</Text>
        </TouchableOpacity>
        {stories.map(s => (
          <StoryItem key={s.id} id={s.id} userName={s.user.name} uri={s.user.avatar} hasStory={!s.viewed} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  scroll: {
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  addStory: {
    width: 80,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  addCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: 28,
    color: theme.colors.primary,
  },
  name: {
    marginTop: 6,
    fontSize: theme.typography.fontSizeSm,
    color: theme.colors.text,
  },
});
