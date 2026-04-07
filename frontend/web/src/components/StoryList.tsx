import React from 'react';
import { Story } from '../../shared/data/mock';

interface Props {
  stories: Story[];
}

export default function StoryList({ stories }: Props){
  return (
    <div style={{display:'flex',gap:12,overflowX:'auto',padding:'12px 16px',alignItems:'center'}}>
      <div style={{width:72,textAlign:'center'}}>
        <div style={{width:58,height:58,borderRadius:29,background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{fontSize:24,color:'#2B8AEB'}}>+</div>
        </div>
        <div style={{fontSize:12,marginTop:6}}>Votre Story</div>
      </div>
      {stories.map((s) => (
        <div key={s.id} style={{width:72,textAlign:'center'}}>
          <img src={s.user.avatar} style={{width:58,height:58,borderRadius:29,objectFit:'cover'}} alt={s.user.name} />
          <div style={{fontSize:12,marginTop:6}}>{s.user.name}</div>
        </div>
      ))}
    </div>
  );
}