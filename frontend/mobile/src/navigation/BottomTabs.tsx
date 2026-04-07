import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, TouchableOpacity, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CreateScreen from '../screens/CreateScreen';
import PostCreateModal from '../screens/PostCreateModal';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs({ navigation }: any) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarButton: (props) => (
            <TabCreateButton onPress={() => navigation.navigate('PostCreate')} />
          ),
          tabBarStyle: { height: 64 },
        }}
      />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function TabCreateButton({ onPress }: any) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2B8AEB',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -20,
        shadowColor: '#2B8AEB',
        shadowOpacity: 0.3,
        shadowRadius: 6,
      }}>
        <Text style={{color:'#fff',fontSize:28}}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}