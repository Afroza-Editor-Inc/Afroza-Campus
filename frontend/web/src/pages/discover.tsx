// frontend/web/src/pages/discover.tsx

import React, { useState } from 'react';
import Header from '../components/Header';
import { mockUsers, mockPosts, mockGroups, mockChannels } from '../../shared/data/mock';

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = mockPosts.filter(post =>
    post.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{background:'#f7fafc',minHeight:'100vh'}}>
      <Header />
      <div style={{maxWidth:900,margin:'72px auto 0',padding:'0 16px'}}>
        <div style={{marginBottom:24}}>
          <input
            type="text"
            placeholder="Rechercher utilisateurs, publications, groupes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width:'100%',
              padding:12,
              borderRadius:8,
              border:'1px solid #ddd',
              fontSize:16,
              background:'#fff'
            }}
          />
        </div>

        {searchQuery && (
          <div>
            <h2 style={{marginBottom:16}}>Résultats pour "{searchQuery}"</h2>

            {filteredUsers.length > 0 && (
              <div style={{marginBottom:24}}>
                <h3 style={{marginBottom:12}}>Utilisateurs</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16}}>
                  {filteredUsers.map(user => (
                    <div key={user.id} style={{background:'#fff',padding:16,borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
                      <img src={user.avatar} style={{width:60,height:60,borderRadius:30,marginBottom:8}} alt={user.name} />
                      <div style={{fontWeight:700}}>{user.name}</div>
                      <div style={{color:'#666',fontSize:14}}>@{user.username}</div>
                      <div style={{color:'#666',fontSize:14,marginTop:4}}>{user.bio}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredPosts.length > 0 && (
              <div style={{marginBottom:24}}>
                <h3 style={{marginBottom:12}}>Publications</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
                  {filteredPosts.map(post => (
                    <article key={post.id} style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',overflow:'hidden'}}>
                      <img src={post.image} style={{width:'100%',height:200,objectFit:'cover'}} alt="Post" />
                      <div style={{padding:12}}>
                        <div style={{fontWeight:700}}>{post.user.name}</div>
                        <div style={{color:'#666',fontSize:14,marginTop:4}}>{post.caption}</div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!searchQuery && (
          <div>
            <h2 style={{marginBottom:16}}>Découvrez</h2>

            <div style={{marginBottom:24}}>
              <h3 style={{marginBottom:12}}>Groupes populaires</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:16}}>
                {mockGroups.slice(0,4).map(group => (
                  <div key={group.id} style={{background:'#fff',padding:16,borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
                    <img src={group.avatar} style={{width:60,height:60,borderRadius:8,marginBottom:8}} alt={group.name} />
                    <div style={{fontWeight:700}}>{group.name}</div>
                    <div style={{color:'#666',fontSize:14,marginTop:4}}>{group.description}</div>
                    <div style={{color:'#666',fontSize:14,marginTop:4}}>{group.members} membres</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{marginBottom:24}}>
              <h3 style={{marginBottom:12}}>Canaux à suivre</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:16}}>
                {mockChannels.slice(0,4).map(channel => (
                  <div key={channel.id} style={{background:'#fff',padding:16,borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
                    <img src={channel.avatar} style={{width:60,height:60,borderRadius:8,marginBottom:8}} alt={channel.name} />
                    <div style={{fontWeight:700}}>{channel.name}</div>
                    <div style={{color:'#666',fontSize:14,marginTop:4}}>{channel.description}</div>
                    <div style={{color:'#666',fontSize:14,marginTop:4}}>{channel.followers} abonnés</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}