import 'react-native-gesture-handler';

import {
  useEffect,
  useState,
} from 'react';

import {
  Text,
  View,
} from 'react-native';

import type { Session }
from '@supabase/supabase-js';

import { supabase } from './src/lib/supabase';

import LoginScreen from './src/screens/LoginScreen';

import DashboardScreen from './src/screens/DashboardScreen';

export default function App() {
  const [session, setSession] =
    useState<Session | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);

        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>
          Loading...
        </Text>
      </View>
    );
  }

  return session ? (
    <DashboardScreen />
  ) : (
    <LoginScreen />
  );
}