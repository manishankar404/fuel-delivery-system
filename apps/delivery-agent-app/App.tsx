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

import Navigation from './src/navigation';
import { DeliveryAgentProvider } from './src/context/DeliveryAgentContext';
import { useDeliveryAgentIdentity } from './src/hooks/useDeliveryAgentIdentity';
import { useAgentLocationUpdates } from './src/hooks/useAgentLocationUpdates';

function AuthenticatedApp() {
  const { deliveryAgentId, isLoading, errorMessage } =
    useDeliveryAgentIdentity();

  useAgentLocationUpdates(deliveryAgentId);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Loading…</Text>
      </View>
    );
  }

  if (!deliveryAgentId) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text>{errorMessage ?? 'Unable to load agent profile'}</Text>
      </View>
    );
  }

  return (
    <DeliveryAgentProvider deliveryAgentId={deliveryAgentId}>
      <Navigation />
    </DeliveryAgentProvider>
  );
}

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
    <AuthenticatedApp />
  ) : (
    <LoginScreen />
  );
}
