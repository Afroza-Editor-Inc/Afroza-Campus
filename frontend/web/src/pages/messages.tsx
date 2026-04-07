// frontend/web/src/pages/messages.tsx

import React, { useState } from 'react';
import Header from '../components/Header';
import { mockConversations, mockMessages } from '../../shared/data/mock';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const selectedConv = mockConversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Simuler l'envoi
      console.log('Message envoyé:', messageText);
      setMessageText('');
    }
  };

  return (
    <div style={{background:'#f7fafc',minHeight:'100vh'}}>
      <Header />
      <div style={{maxWidth:1200,margin:'72px auto 0',padding:'0 16px'}}>
        <div style={{display:'flex',gap:24,height:'calc(100vh - 100px)'}}>
          {/* Liste des conversations */}
          <div style={{flex:1,background:'#fff',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',overflow:'hidden'}}>
            <div style={{padding:16,borderBottom:'1px solid #eee'}}>
              <h2 style={{margin:0}}>Messages</h2>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {mockConversations.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  style={{
                    padding:16,
                    borderBottom:'1px solid #eee',
                    cursor:'pointer',
                    background: selectedConversation === conversation.id ? '#f0f8ff' : '#fff'
                  }}
                >
                  <div style={{display:'flex',alignItems:'center'}}>
                    <img src={conversation.user.avatar} style={{width:50,height:50,borderRadius:25,marginRight:12}} alt={conversation.user.name} />
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700}}>{conversation.user.name}</div>
                      <div style={{color:'#666',fontSize:14,marginTop:2}}>{conversation.lastMessage.text}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{color:'#666',fontSize:12}}>{conversation.lastMessage.timestamp}</div>
                      {conversation.unreadCount > 0 && (
                        <div style={{background:'#2B8AEB',color:'#fff',borderRadius:10,padding:'2px 6px',fontSize:12,marginTop:4}}>
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div style={{flex:2,background:'#fff',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',display:'flex',flexDirection:'column'}}>
            {selectedConv ? (
              <>
                <div style={{padding:16,borderBottom:'1px solid #eee'}}>
                  <div style={{display:'flex',alignItems:'center'}}>
                    <img src={selectedConv.user.avatar} style={{width:40,height:40,borderRadius:20,marginRight:12}} alt={selectedConv.user.name} />
                    <div style={{fontWeight:700}}>{selectedConv.user.name}</div>
                  </div>
                </div>

                <div style={{flex:1,padding:16,overflowY:'auto'}}>
                  {mockMessages.map(message => (
                    <div
                      key={message.id}
                      style={{
                        marginBottom:12,
                        display:'flex',
                        justifyContent: message.isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          background: message.isMe ? '#2B8AEB' : '#f0f0f0',
                          color: message.isMe ? '#fff' : '#000',
                          padding:12,
                          borderRadius:18,
                          maxWidth:'70%'
                        }}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{padding:16,borderTop:'1px solid #eee'}}>
                  <div style={{display:'flex',gap:12}}>
                    <input
                      type="text"
                      placeholder="Tapez votre message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      style={{
                        flex:1,
                        padding:12,
                        border:'1px solid #ddd',
                        borderRadius:24,
                        fontSize:16
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      style={{
                        background:'#2B8AEB',
                        color:'#fff',
                        border:'none',
                        borderRadius:24,
                        padding:'12px 24px',
                        cursor:'pointer'
                      }}
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#666'}}>
                Sélectionnez une conversation pour commencer à discuter
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}