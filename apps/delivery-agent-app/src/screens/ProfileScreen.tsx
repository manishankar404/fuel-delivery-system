import { StyleSheet, Text, View } from 'react-native';

import BottomTabBar from '../navigation/BottomTabBar';
import { useDeliveryAgentId } from '../context/DeliveryAgentContext';

export default function ProfileScreen() {
  const deliveryAgentId = useDeliveryAgentId();

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Delivery Agent ID</Text>
        <Text style={styles.value}>{deliveryAgentId ?? '—'}</Text>
        <Text style={styles.hint}>Use the header Logout button to sign out.</Text>
      </View>
      <BottomTabBar active="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 12, fontWeight: '800', color: '#6B7280' },
  value: { marginTop: 6, fontSize: 14, fontWeight: '800', color: '#111827' },
  hint: { marginTop: 12, fontSize: 12, fontWeight: '600', color: '#6B7280' },
});

