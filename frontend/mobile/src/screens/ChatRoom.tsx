import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { joinRoom } from '../services/socket';

export default function ChatRoom({ route }: any){
  const { roomId } = route.params || { roomId: 'general' };
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  useEffect(()=>{
    const ch = joinRoom(roomId);
    setChannel(ch);
    ch.on('message:new', (payload: any) => {
      setMessages(prev => [...prev, payload]);
    });
    return () => ch.leave();
  },[roomId]);

  const send = () => {
    if (!channel) return;
    channel.push('message:new', { user_id: 'mobile-user', body: text, metadata: {} });
    setText('');
  }

  return (
    <View style={{flex:1}}>
      <FlatList data={messages} keyExtractor={(i,idx)=>idx.toString()} renderItem={({item})=> <Text>{item.user_id}: {item.body}</Text>} />
      <View style={{flexDirection:'row'}}>
        <TextInput value={text} onChangeText={setText} style={{flex:1}} />
        <Button title="Send" onPress={send} />
      </View>
    </View>
  )
}
