import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { register } from '../services/auth';

export default function SignupScreen(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const submit = async ()=>{
    try{
      const r: any = await register(email,password,displayName);
      Alert.alert('Registered', JSON.stringify(r));
      // TODO: redirect to login
    }catch(e){
      Alert.alert('Error', e.message);
    }
  }

  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:16}}>
      <Text>Inscription</Text>
      <TextInput placeholder="display name" value={displayName} onChangeText={setDisplayName} style={{width:'100%',borderWidth:1,marginTop:8,padding:8}} />
      <TextInput placeholder="email" value={email} onChangeText={setEmail} style={{width:'100%',borderWidth:1,marginTop:8,padding:8}} />
      <TextInput placeholder="password" value={password} onChangeText={setPassword} secureTextEntry style={{width:'100%',borderWidth:1,marginTop:8,padding:8}} />
      <Button title="S'inscrire" onPress={submit} />
    </View>
  )
}
