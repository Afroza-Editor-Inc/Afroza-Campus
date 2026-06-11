import { NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MessagingStackParamList } from '../modules/messaging/navigation/MessagingNavigator';
import MessagesScreen from '../screens/MessagesScreen';
import FeedScreen from '../screens/FeedScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import CallsScreen from '../screens/CallsScreen';
import MagicBottomTab from './MagicBottomTab';

export type MainTabParamList = {
  Messages: NavigatorScreenParams<MessagingStackParamList> | undefined;
  Feed: undefined;
  Communities: undefined;
  Calls: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Messages"
      tabBar={(props) => <MagicBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Communities" component={CommunitiesScreen} />
      <Tab.Screen name="Calls" component={CallsScreen} />
    </Tab.Navigator>
  );
}
