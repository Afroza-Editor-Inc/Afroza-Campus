import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MessagesScreen(){
  const nav = useNavigation<any>();
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>Messages (placeholder)</Text>
      <Button title="Open Chat Room" onPress={()=>nav.navigate('ChatRoom',{roomId:'general'})} />
    </View>
  )
}
