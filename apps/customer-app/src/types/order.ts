export interface FuelType {
  id: string;

  name: string;

  price_per_liter: number;
}

export interface CreateOrderPayload {
  customer_id: string;

  fuel_type_id: string;

  quantity_liters: number;

  total_price: number;

  delivery_address: string;

  payment_method: string;
}
export interface Order {
  id: string;

  quantity_liters: number;

  total_price: number;

  delivery_address: string;

  status: string;

  created_at: string;

  fuel_types: {
    name: string;
  };
}