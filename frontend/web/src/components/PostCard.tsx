import React, { useState } from 'react';
import { Post } from '../../shared/data/mock';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(c => newLiked ? c + 1 : c - 1);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  return (
    <article style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',overflow:'hidden'}}>
      <div style={{padding:12,display:'flex',alignItems:'center'}}>
        <img src={post.user.avatar} style={{width:40,height:40,borderRadius:20}} alt={post.user.name} />
        <div style={{marginLeft:8}}>
          <div style={{fontWeight:700}}>{post.user.name}</div>
          <div style={{fontSize:12,color:'#666'}}>{post.timestamp}</div>
        </div>
        <div style={{marginLeft:'auto'}}>⋯</div>
      </div>
      <img src={post.image} style={{width:'100%',display:'block'}} alt="Post" />
      <div style={{padding:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <button onClick={handleLike} style={{background:'none',border:'none',fontSize:18,cursor:'pointer'}}>
              {liked ? '❤️' : '🤍'}
            </button>
            <button style={{background:'none',border:'none',fontSize:18,marginLeft:8,cursor:'pointer'}}>💬</button>
            <button style={{background:'none',border:'none',fontSize:18,marginLeft:8,cursor:'pointer'}}>✈️</button>
          </div>
          <button onClick={handleSave} style={{background:'none',border:'none',fontSize:18,cursor:'pointer'}}>
            {saved ? '🔖' : '📖'}
          </button>
        </div>
        <div style={{marginTop:6,fontWeight:700}}>{likesCount} J'aime</div>
        <div style={{color:'#666'}}>{post.caption}</div>
        <div style={{color:'#666',fontSize:14,marginTop:4}}>Voir les {post.comments} commentaires</div>
      </div>
    </article>
  );
}