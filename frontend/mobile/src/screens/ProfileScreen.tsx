import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../theme';
import PostCard from '../components/PostCard';
import { mockPosts } from '../data/mock';

export default function ProfileScreen({ navigation }: any){
  const renderItem = ({ item }: any) => <PostCard {...item} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/avatar-placeholder.png')} style={styles.avatar} />
        <View style={{marginLeft:12}}>
          <Text style={styles.name}>Ahmed_StudentLeader</Text>
          <Text style={styles.bio}>Étudiant · Président du club tech · Likes: React</Text>
        </View>
        <TouchableOpacity style={styles.settings} onPress={() => navigation.navigate('Settings')}><Text>⚙️</Text></TouchableOpacity>
      </View>

      <FlatList
        data={mockPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {flex:1,backgroundColor:theme.colors.surface},
  header: {padding:16,flexDirection:'row',alignItems:'center',backgroundColor:theme.colors.background},
  avatar: {width:72,height:72,borderRadius:36,backgroundColor:'#eee'},
  name: {fontWeight:'700',fontSize:16,color:theme.colors.text},
  bio: {color:theme.colors.muted,marginTop:4},
  settings: {marginLeft:'auto'}
});
