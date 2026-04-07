import React from 'react';
import Header from '../components/Header';
import StoryList from '../components/StoryList';
import PostCard from '../components/PostCard';
import { mockStories, mockPosts } from '../../shared/data/mock';

export default function Home(){
  return (
    <div style={{background:'#f7fafc',minHeight:'100vh'}}>
      <Header />
      <div style={{maxWidth:900,margin:'72px auto 0',padding:'0 16px'}}>
        <StoryList stories={mockStories} />
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,marginTop:16}}>
          {mockPosts.map(p => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </div>
  );
}