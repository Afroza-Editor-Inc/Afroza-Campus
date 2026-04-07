import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../theme';

export default function SettingsScreen(){
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>
      <View style={styles.row}><Text>Notifications</Text><Switch value={true} /></View>
      <View style={styles.row}><Text>Sécurité (2FA)</Text><Switch value={false} /></View>
      <TouchableOpacity style={styles.logout}><Text style={{color:'#fff'}}>Se déconnecter</Text></TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {flex:1,padding:16,backgroundColor:theme.colors.background},
  title: {fontSize:20,fontWeight:'700',marginBottom:16},
  row: {flexDirection:'row',justifyContent:'space-between',paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#eee'},
  logout: {marginTop:24,backgroundColor:theme.colors.primary,padding:12,alignItems:'center',borderRadius:8}
});