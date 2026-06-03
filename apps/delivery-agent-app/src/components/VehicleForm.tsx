import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Switch, ActivityIndicator } from 'react-native';

import AppButton from './AppButton';

interface VehicleFormProps {
  vehicleNumber: string | undefined;
  isAvailable: boolean | undefined;
  onSubmit: (updates: { vehicle_number: string; is_available: boolean }) => Promise<void>;
  onCancel: () => void;
}

export default function VehicleForm({
  vehicleNumber,
  isAvailable,
  onSubmit,
  onCancel,
}: VehicleFormProps) {
  const [vehicle, setVehicle] = useState(vehicleNumber || '');
  const [available, setAvailable] = useState(isAvailable ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!vehicle.trim()) {
        setError('Vehicle number is required');
        return;
      }

      await onSubmit({
        vehicle_number: vehicle,
        is_available: available,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Vehicle Number</Text>
      <TextInput
        style={styles.input}
        value={vehicle}
        onChangeText={setVehicle}
        placeholder="Enter vehicle number"
        editable={!isLoading}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Available for Deliveries</Text>
        <Switch
          value={available}
          onValueChange={setAvailable}
          disabled={isLoading}
        />
      </View>

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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
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
