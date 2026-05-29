import {
  View,
  Text,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';

import { useEffect, useState } from 'react';

import AppButton from '../../components/AppButton';

import {
  getFuelTypes,
  createOrder,
} from '../../services/orderService';

import { FuelType } from '../../types/order';

import { useAuth } from '../../context/AuthContext';

export default function CreateOrderScreen() {
  const { profile } = useAuth();

  const [fuelTypes, setFuelTypes] =
    useState<FuelType[]>([]);

  const [selectedFuel,
    setSelectedFuel] =
    useState<FuelType | null>(null);

  const [quantity,
    setQuantity] = useState('');

  const [address,
    setAddress] = useState('');

  const [loading,
    setLoading] = useState(false);

  useEffect(() => {
    loadFuelTypes();
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
          customer_id: profile.id,

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
        <Text
          key={fuel.id}
          style={{
            marginBottom: 8,
            fontWeight:
              selectedFuel?.id ===
              fuel.id
                ? 'bold'
                : 'normal',
          }}
          onPress={() =>
            setSelectedFuel(fuel)
          }
        >
          {fuel.name} -
          ₹{fuel.price_per_liter}
        </Text>
      ))}

      <TextInput
        placeholder="Quantity (Liters)"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
        style={styles.input}
      />

      <TextInput
        placeholder="Delivery Address"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <AppButton
        title={
          loading
            ? 'Creating Order...'
            : 'Create Order'
        }
        onPress={handleCreateOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
});