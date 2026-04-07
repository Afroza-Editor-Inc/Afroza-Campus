import React from 'react';
import { View, FlatList } from 'react-native';
import Header from '../components/Header';
import StoryList from '../components/StoryList';
import PostCard from '../components/PostCard';
import { mockStories, mockPosts } from '../data/mock';

const MOCK_STORIES = mockStories;
const MOCK_POSTS = mockPosts;
const NUM_COLUMNS = 2;

export default function HomeScreen() {
  const HEADER_HEIGHT = 56;
  const STORY_HEIGHT = 100;
  const renderItem = ({ item }: any) => <PostCard {...item} />;

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={{ height: STORY_HEIGHT, marginTop: HEADER_HEIGHT }}>
        <StoryList stories={MOCK_STORIES} />
      </View>

      <FlatList
        data={MOCK_POSTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 8 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
}
