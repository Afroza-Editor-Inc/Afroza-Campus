import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { login } from '../services/auth';

export default function LoginScreen(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async ()=>{
    try{
      const r: any = await login(email,password);
      if (r.token) {
        Alert.alert('Logged in', 'Token: ' + r.token);
        // TODO: store token & navigate
      } else {
        Alert.alert('Error', JSON.stringify(r));
      }
    }catch(e){
      Alert.alert('Error', e.message);
    }
  }

  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:16}}>
      <Text>Connexion</Text>
      <TextInput placeholder="email" value={email} onChangeText={setEmail} style={{width:'100%',borderWidth:1,marginTop:8,padding:8}} />
      <TextInput placeholder="password" value={password} onChangeText={setPassword} secureTextEntry style={{width:'100%',borderWidth:1,marginTop:8,padding:8}} />
      <Button title="Se connecter" onPress={submit} />
    </View>
  )
}
