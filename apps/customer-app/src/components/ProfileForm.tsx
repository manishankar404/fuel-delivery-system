import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ActivityIndicator } from 'react-native';

import AppButton from './AppButton';
import type { Profile } from '../types/profile';

interface ProfileFormProps {
  profile: Profile;
  onSubmit: (updates: Partial<Profile>) => Promise<void>;
  onCancel: () => void;
}

export default function ProfileForm({
  profile,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await onSubmit({
        full_name: fullName,
        phone_number: phone,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter your full name"
        editable={!isLoading}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        editable={!isLoading}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, styles.inputDisabled]}
        value={profile.email}
        editable={false}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.buttonGroup}>
        <AppButton
          title={isLoading ? 'Saving...' : 'Save'}
          onPress={handleSubmit}
          disabled={isLoading}
        />
        <View style={{ width: 8 }} />
        <AppButton
          title="Cancel"
          onPress={onCancel}
          disabled={isLoading}
        />
      </View>

      {isLoading && <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  error: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  loader: {
    marginTop: 12,
  },
});
