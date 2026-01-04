import React, {useEffect} from 'react';
import { View, Text } from 'react-native';

export default function SplashScreen(){
  useEffect(()=>{
    // TODO: navigate to Auth or Home after checking auth state
  },[]);
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>Afroza — Splash (placeholder)</Text>
    </View>
  )
}
