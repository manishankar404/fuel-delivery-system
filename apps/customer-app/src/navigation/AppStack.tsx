import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/app/HomeScreen';

import CreateOrderScreen from '../screens/app/CreateOrderScreen';

import OrderHistoryScreen from '../screens/app/OrderHistoryScreen';

const Stack =
  createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
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
    </Stack.Navigator>
  );
}