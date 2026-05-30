export type DeliveryOrderStatus =
  | 'pending'
  | 'approved'
  | 'assigned'
  | 'out_for_delivery'
  | 'delivered'
  | string;

export type DeliveryOrder = {
  id: string;
  status: DeliveryOrderStatus;
  quantity_liters: number;
  total_price?: number;
  delivery_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  fuel_types?: {
    name?: string | null;
  } | null;
  profiles?: {
    email?: string | null;
  } | null;
};

