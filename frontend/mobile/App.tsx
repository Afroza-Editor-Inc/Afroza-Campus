import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SignInScreen from './src/screens/auth/SignInScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import OtpScreen from './src/screens/auth/OtpScreen';
import NewPasswordScreen from './src/screens/auth/NewPasswordScreen';
import ProfileSetupScreen from './src/screens/auth/ProfileSetupScreen';
import ProfileDetailsScreen from './src/screens/auth/ProfileDetailsScreen';
import FriendSuggestionsScreen from './src/screens/auth/FriendSuggestionsScreen';
import PermissionsScreen from './src/screens/auth/PermissionsScreen';
import BottomTabs from './src/navigation/BottomTabs';
import ChatRoom from './src/screens/ChatRoom';
import PostCreateModal from './src/screens/PostCreateModal';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ActiveCallScreen from './src/screens/ActiveCallScreen';
import ScheduleMeetingScreen from './src/screens/ScheduleMeetingScreen';
import CommunityDetailScreen from './src/screens/CommunityDetailScreen';
import CreateCommunityScreen from './src/screens/CreateCommunityScreen';
import StoryViewerScreen from './src/screens/StoryViewerScreen';
import ReelsScreen from './src/screens/ReelsScreen';
import PostCommentsScreen from './src/screens/PostCommentsScreen';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import theme from './src/theme';

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <SafeAreaProvider>
          <KeyboardProvider>
            <StatusBar style="dark" />
            <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="Otp" component={OtpScreen} />
              <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
              <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
              <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
              <Stack.Screen name="FriendSuggestions" component={FriendSuggestionsScreen} />
              <Stack.Screen name="Permissions" component={PermissionsScreen} />
              <Stack.Screen name="MainTabs" component={BottomTabs} />
              <Stack.Screen name="ChatRoom" component={ChatRoom} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
              <Stack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
                <Stack.Screen name="CreateCommunity" component={CreateCommunityScreen} />
              </Stack.Group>
              <Stack.Group
                screenOptions={{ presentation: 'fullScreenModal', animation: 'fade' }}
              >
                <Stack.Screen name="ActiveCall" component={ActiveCallScreen} />
                <Stack.Screen name="StoryViewer" component={StoryViewerScreen} />
                <Stack.Screen name="Reels" component={ReelsScreen} />
              </Stack.Group>
              <Stack.Group
                screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              >
                <Stack.Screen name="PostCreate" component={PostCreateModal} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="ScheduleMeeting" component={ScheduleMeetingScreen} />
                <Stack.Screen name="PostComments" component={PostCommentsScreen} />
              </Stack.Group>
            </Stack.Navigator>
            </NavigationContainer>
          </KeyboardProvider>
        </SafeAreaProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
