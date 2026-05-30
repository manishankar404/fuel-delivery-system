import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useEffect, useMemo, useState } from 'react';

import MapView, { Marker } from 'react-native-maps';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';

import AppButton from '../../components/AppButton';
import type { AppStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { createOrder, getFuelTypes } from '../../services/orderService';
import type { FuelType } from '../../types/order';

const DEFAULT_LOCATION = {
  latitude: 11.6643,
  longitude: 78.146,
};

export default function CreateOrderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { profile } = useAuth();

  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  const quantityValue = useMemo(() => Number(quantity), [quantity]);
  const totalPrice = useMemo(() => {
    if (!selectedFuel || !Number.isFinite(quantityValue) || quantityValue <= 0) {
      return null;
    }
    return quantityValue * selectedFuel.price_per_liter;
  }, [quantityValue, selectedFuel]);

  useEffect(() => {
    void loadFuelTypes();
    void getCurrentLocation();
  }, []);

  const loadFuelTypes = async () => {
    try {
      const data = await getFuelTypes();
      setFuelTypes(data);
      if (data.length > 0) {
        setSelectedFuel(data[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const reverseGeocodeLocation = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length === 0) return;

      const place = result[0];
      const formattedAddress = [place.name, place.street, place.city, place.region]
        .filter(Boolean)
        .join(', ');

      setAddress(formattedAddress);
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const next = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setLocation(next);
      void reverseGeocodeLocation(next.latitude, next.longitude);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedFuel || !profile) return;
    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity in liters.');
      return;
    }

    try {
      setLoading(true);

      const createdOrder = await createOrder({
        customer_id: profile.id,
        fuel_type_id: selectedFuel.id,
        quantity_liters: quantityValue,
        total_price: quantityValue * selectedFuel.price_per_liter,
        delivery_address: address,
        payment_method: 'cash',
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setQuantity('');
      setShowMap(false);

      navigation.navigate('OrderHistory', {
        initialTab: 'active',
        highlightOrderId: createdOrder.id,
      });
    } catch (error: unknown) {
      Alert.alert('Order Failed', error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Fuel Order</Text>

      <Text style={styles.label}>Fuel Type</Text>

      {fuelTypes.map((fuel) => (
        <TouchableOpacity
          key={fuel.id}
          style={[
            styles.fuelCard,
            selectedFuel?.id === fuel.id && styles.selectedFuel,
          ]}
          onPress={() => setSelectedFuel(fuel)}
        >
          <Text style={styles.fuelText}>
            {fuel.name} • ₹{fuel.price_per_liter}/L
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        placeholder="Liters"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
        style={styles.input}
      />

      {totalPrice !== null ? (
        <Text style={styles.priceHint}>Estimated total: ₹{totalPrice}</Text>
      ) : null}

      <TouchableOpacity style={styles.locationButton} onPress={() => setShowMap(!showMap)}>
        <Ionicons name="location" size={20} color="white" />
        <Text style={styles.locationButtonText}>
          {showMap ? 'Hide Map' : 'Pick Delivery Location'}
        </Text>
      </TouchableOpacity>

      {showMap ? (
        <>
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={(event) => {
              const coordinate = event.nativeEvent.coordinate;
              setLocation(coordinate);
              void reverseGeocodeLocation(coordinate.latitude, coordinate.longitude);
            }}
          >
            <Marker coordinate={location} />
          </MapView>

          <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation}>
            <Ionicons name="locate" size={20} color="white" />
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          </TouchableOpacity>

          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Delivery address</Text>
            <Text style={styles.addressValue}>{address || '—'}</Text>
          </View>
        </>
      ) : null}

      <AppButton title={loading ? 'Creating Order…' : 'Place Order'} onPress={handleCreateOrder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },

  label: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
    color: '#111827',
  },

  fuelCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },

  selectedFuel: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },

  fuelText: {
    fontWeight: '700',
    color: '#111827',
  },

  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },

  priceHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '600',
  },

  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },

  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
  },

  locationButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '800',
  },

  map: {
    width: '100%',
    height: 280,
    borderRadius: 14,
    marginBottom: 10,
  },

  addressBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },

  addressLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '800',
    marginBottom: 4,
  },

  addressValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
});

