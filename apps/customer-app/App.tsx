import 'react-native-gesture-handler';

import { AuthProvider } from './src/context/AuthContext';

import Navigation from './src/navigation';

import { LocationProvider } from './src/context/LocationContext';

export default function App() {
  return (
    <LocationProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </LocationProvider>
  );
}