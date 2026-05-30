import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { signOutAgent } from '../services/authService';
import HeaderButton from '../components/HeaderButton';

import type { AgentAppStackParamList } from './types';

import DashboardHomeScreen from '../screens/DashboardHomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import DeliveredOrdersScreen from '../screens/DeliveredOrdersScreen';

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
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'Orders',
        }}
      />

      <Stack.Screen
        name="Delivered"
        component={DeliveredOrdersScreen}
        options={{
          title: 'Delivered',
        }}
      />
    </Stack.Navigator>
  );
}
