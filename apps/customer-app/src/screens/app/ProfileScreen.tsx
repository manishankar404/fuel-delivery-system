import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';

import AppButton from '../../components/AppButton';
import ProfileForm from '../../components/ProfileForm';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/authService';
import BottomTabBar from '../../navigation/BottomTabBar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import type { Profile } from '../../types/profile';

export default function ProfileScreen() {
  const { profile, updateProfile } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = useCallback(
    async (updates: Partial<Profile>) => {
      await updateProfile(updates);
      setIsEditing(false);
    },
    [updateProfile]
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '—';
    }
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

        {isEditing ? (
          <ProfileForm
            profile={profile}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <View style={styles.profileCard}>
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
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{profile.role}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Member Since</Text>
              <Text style={styles.value}>{formatDate(profile.created_at)}</Text>
            </View>

            <View style={{ height: 12 }} />
            <AppButton title="Edit Profile" onPress={() => setIsEditing(true)} />
          </View>
        )}

        <View style={{ height: 12 }} />
        <AppButton title="Wallet" onPress={() => navigation.navigate('Wallet')} />

        <View style={{ height: 12 }} />
        <AppButton title="Logout" onPress={signOut} />
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
  profileCard: {
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
});
