import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/app/HomeScreen';

import CreateOrderScreen from '../screens/app/CreateOrderScreen';

import OrderHistoryScreen from '../screens/app/OrderHistoryScreen';

import LiveTrackingScreen from '../screens/app/LiveTrackingScreen';

import TrackingHubScreen from '../screens/app/TrackingHubScreen';
import ProductsScreen from '../screens/app/ProductsScreen';
import ProfileScreen from '../screens/app/ProfileScreen';

import type { AppStackParamList } from './types';

const Stack =
  createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />

      <Stack.Screen
        name="Orders"
        component={OrderHistoryScreen}
        options={{ title: 'Orders' }}
      />

      <Stack.Screen
        name="Tracking"
        component={TrackingHubScreen}
        options={{ title: 'Tracking' }}
      />

      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: 'Products' }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />

      <Stack.Screen
        name="CreateOrder"
        component={
          CreateOrderScreen
        }
      />

      <Stack.Screen
        name="OrderHistory"
        component={
          OrderHistoryScreen
        }
      />

      <Stack.Screen
        name="LiveTracking"
        component={
          LiveTrackingScreen
        }
      />
    </Stack.Navigator>
  );
}
