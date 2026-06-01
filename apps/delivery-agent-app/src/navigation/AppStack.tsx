import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { signOutAgent } from '../services/authService';
import HeaderButton from '../components/HeaderButton';

import type { AgentAppStackParamList } from './types';

import DashboardHomeScreen from '../screens/DashboardHomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import DeliveredOrdersScreen from '../screens/DeliveredOrdersScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<AgentAppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: { fontWeight: '800' },
        headerRight: () => <HeaderButton title="Logout" onPress={() => void signOutAgent()} />,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardHomeScreen}
        options={{
          title: 'Dashboard',
        }}
      />

      <Stack.Screen
        name="ActiveDeliveries"
        component={OrdersScreen}
        options={{
          title: 'Active Deliveries',
        }}
      />

      <Stack.Screen
        name="History"
        component={DeliveredOrdersScreen}
        options={{
          title: 'History',
        }}
      />

      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Map',
        }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />

      {/* Legacy route names */}
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'Active Deliveries',
        }}
      />

      <Stack.Screen
        name="Delivered"
        component={DeliveredOrdersScreen}
        options={{
          title: 'History',
        }}
      />
    </Stack.Navigator>
  );
}
