import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import BottomTabs from './src/navigation/BottomTabs';
import ChatRoom from './src/screens/ChatRoom';
import PostCreateModal from './src/screens/PostCreateModal';
import SettingsScreen from './src/screens/SettingsScreen';
import AppErrorBoundary from './src/components/AppErrorBoundary';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen name="ChatRoom" component={ChatRoom} />
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen name="PostCreate" component={PostCreateModal} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Group>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
