import { NavigationContainer } from '@react-navigation/native';

import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function Navigation() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}