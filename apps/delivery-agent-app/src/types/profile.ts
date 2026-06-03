export interface Profile {
  id: string;

  full_name: string | null;

  email: string;

  phone_number: string | null;

  role: 'customer' | 'delivery_agent' | 'admin';

  is_active: boolean;

  created_at?: string;
}

export interface DeliveryAgentProfile extends Profile {
  vehicle_number?: string;

  is_available?: boolean;

  total_deliveries?: number;
}
