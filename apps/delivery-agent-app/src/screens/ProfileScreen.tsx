import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

import BottomTabBar from '../navigation/BottomTabBar';
import ProfileForm from '../components/ProfileForm';
import VehicleForm from '../components/VehicleForm';
import AppButton from '../components/AppButton';
import { useDeliveryAgentProfile } from '../context/DeliveryAgentContext';
import { signOutAgent } from '../services/authService';

export default function ProfileScreen() {
  const { profile, updateProfile, updateDeliveryAgent } = useDeliveryAgentProfile();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(false);

  const handleProfileUpdate = async (updates: any) => {
    await updateProfile(updates);
    setEditingProfile(false);
  };

  const handleVehicleUpdate = async (updates: { vehicle_number: string; is_available: boolean }) => {
    await updateDeliveryAgent(updates);
    setEditingVehicle(false);
  };

  if (!profile) {
    return (
      <View style={styles.root}>
        <View style={styles.container}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Loading...</Text>
        </View>
        <BottomTabBar active="Profile" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Profile</Text>

        {editingProfile ? (
          <ProfileForm
            profile={profile}
            onSubmit={handleProfileUpdate}
            onCancel={() => setEditingProfile(false)}
          />
        ) : (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{profile.full_name || '—'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profile.email}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{profile.phone_number || '—'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>{profile.is_active ? 'Active' : 'Inactive'}</Text>
            </View>

            <AppButton title="Edit Profile" onPress={() => setEditingProfile(true)} />
          </View>
        )}

        {editingVehicle ? (
          <VehicleForm
            vehicleNumber={profile.vehicle_number}
            isAvailable={profile.is_available}
            onSubmit={handleVehicleUpdate}
            onCancel={() => setEditingVehicle(false)}
          />
        ) : (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Vehicle Number</Text>
              <Text style={styles.value}>{profile.vehicle_number || '—'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Availability</Text>
              <Text style={[styles.value, profile.is_available ? styles.available : styles.unavailable]}>
                {profile.is_available ? 'Available' : 'Unavailable'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Total Deliveries</Text>
              <Text style={styles.value}>{profile.total_deliveries || 0}</Text>
            </View>

            <AppButton title="Update Vehicle" onPress={() => setEditingVehicle(true)} />
          </View>
        )}

        <View style={{ height: 12 }} />
        <AppButton title="Logout" onPress={signOutAgent} />
      </ScrollView>

      <BottomTabBar active="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  available: {
    color: '#059669',
  },
  unavailable: {
    color: '#DC2626',
  },
});