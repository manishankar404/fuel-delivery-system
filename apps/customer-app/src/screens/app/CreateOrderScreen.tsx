import {
  View,
  Text,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import {
  useEffect,
  useState,
} from 'react';

import MapView, {
  Marker,
} from 'react-native-maps';

import * as Location
from 'expo-location';

import { Ionicons }
from '@expo/vector-icons';

import AppButton from '../../components/AppButton';

import {
  getFuelTypes,
  createOrder,
} from '../../services/orderService';

import { FuelType }
from '../../types/order';

import { useAuth }
from '../../context/AuthContext';

export default function CreateOrderScreen() {
  const { profile } = useAuth();

  const [fuelTypes, setFuelTypes] =
    useState<FuelType[]>([]);

  const [selectedFuel,
    setSelectedFuel] =
    useState<FuelType | null>(null);

  const [quantity,
    setQuantity] =
    useState('');

  const [address,
    setAddress] =
    useState('');

  const [loading,
    setLoading] =
    useState(false);

  const [showMap,
    setShowMap] =
    useState(false);

  const [location,
    setLocation] =
    useState({
      latitude: 11.6643,
      longitude: 78.1460,
    });

  useEffect(() => {
    loadFuelTypes();

    getCurrentLocation();
  }, []);

  const loadFuelTypes =
    async () => {
      try {
        const data =
          await getFuelTypes();

        setFuelTypes(data);

        if (data.length > 0) {
          setSelectedFuel(data[0]);
        }
      } catch (error) {
        console.log(error);
      }
    };

  const getCurrentLocation =
    async () => {
      try {
        const {
          status,
        } =
          await Location
            .requestForegroundPermissionsAsync();

        if (
          status !== 'granted'
        ) {
          Alert.alert(
            'Location permission denied'
          );

          return;
        }

        const currentLocation =
          await Location
            .getCurrentPositionAsync(
              {}
            );

        setLocation({
          latitude:
            currentLocation
              .coords
              .latitude,

          longitude:
            currentLocation
              .coords
              .longitude,
        });
        reverseGeocodeLocation(
          currentLocation
            .coords
            .latitude,

          currentLocation
            .coords
            .longitude
        );
      } catch (error) {
        console.log(error);
      }
    };

  const reverseGeocodeLocation =
  async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const result =
        await Location
          .reverseGeocodeAsync({
            latitude,
            longitude,
          });

      if (
        result.length > 0
      ) {
        const place =
          result[0];

        const formattedAddress =
          [
            place.name,
            place.street,
            place.city,
            place.region,
          ]
            .filter(Boolean)
            .join(', ');

        setAddress(
          formattedAddress
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateOrder =
    async () => {
      if (
        !selectedFuel ||
        !profile
      ) {
        return;
      }

      try {
        setLoading(true);

        const quantityValue =
          Number(quantity);

        const totalPrice =
          quantityValue *
          selectedFuel.price_per_liter;

        await createOrder({
          customer_id:
            profile.id,

          fuel_type_id:
            selectedFuel.id,

          quantity_liters:
            quantityValue,

          total_price:
            totalPrice,

          delivery_address:
            address,

          payment_method:
            'cash',

          latitude:
            location.latitude,

          longitude:
            location.longitude,
        });

        Alert.alert(
          'Success',
          'Order created successfully'
        );

        setQuantity('');
        setAddress('');
      } catch (error: any) {
        Alert.alert(
          'Order Failed',
          error.message
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create Fuel Order
      </Text>

      <Text style={styles.label}>
        Fuel Type
      </Text>

      {fuelTypes.map((fuel) => (
        <TouchableOpacity
          key={fuel.id}
          style={[
            styles.fuelCard,
            selectedFuel?.id ===
              fuel.id &&
              styles.selectedFuel,
          ]}
          onPress={() =>
            setSelectedFuel(fuel)
          }
        >
          <Text>
            {fuel.name} -
            ₹
            {
              fuel.price_per_liter
            }
          </Text>
        </TouchableOpacity>
      ))}

      <TextInput
        placeholder="Quantity (Liters)"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
        style={styles.input}
      />

      

      <TouchableOpacity
        style={styles.locationButton}
        onPress={() =>
          setShowMap(!showMap)
        }
      >
        <Ionicons
          name="location"
          size={20}
          color="white"
        />

        <Text
          style={
            styles.locationButtonText
          }
        >
          {showMap
            ? 'Hide Map'
            : 'Pick Delivery Location'}
        </Text>
      </TouchableOpacity>

      {showMap && (
        <>
          <MapView
            style={styles.map}
            region={{
              latitude:
                location.latitude,

              longitude:
                location.longitude,

              latitudeDelta:
                0.01,

              longitudeDelta:
                0.01,
            }}
            onPress={(event) => {
              const coordinate =
                event.nativeEvent.coordinate;

              setLocation(
                coordinate
              );

              reverseGeocodeLocation(
                coordinate.latitude,
                coordinate.longitude
              );
            }}
          >
            <Marker
              coordinate={
                location
              }
            />
          </MapView>

          <TouchableOpacity
            style={
              styles.currentLocationButton
            }
            onPress={
              getCurrentLocation
            }
          >
            <Ionicons
              name="locate"
              size={20}
              color="white"
            />

            <Text
              style={
                styles.locationButtonText
              }
            >
              Use Current Location
            </Text>
          </TouchableOpacity>

          <Text
            style={
              styles.coordinateText
            }
          >
            Latitude:
            {' '}
            {
              location.latitude
            }
          </Text>

          <Text
            style={
              styles.coordinateText
            }
          >
            Longitude:
            {' '}
            {
              location.longitude
            }
          </Text>
          <Text
            style={
              styles.coordinateText
            }
          >
            Address:
            {' '}
            {address}
          </Text>
        </>
      )}

      <AppButton
        title={
          loading
            ? 'Creating Order...'
            : 'Create Order'
        }
        onPress={
          handleCreateOrder
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  fuelCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },

  selectedFuel: {
    backgroundColor:
      '#d4f5d3',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },

  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
  },

  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },

  locationButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },

  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 10,
  },

  coordinateText: {
    marginBottom: 4,
  },
});