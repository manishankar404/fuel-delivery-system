import { StyleSheet, Text, View } from 'react-native';

import BottomTabBar from '../navigation/BottomTabBar';

export default function MapScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>Coming soon.</Text>
      </View>
      <BottomTabBar active="Map" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
});

