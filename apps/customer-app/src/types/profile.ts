export interface Profile {
  id: string;

  full_name: string | null;

  email: string;

  phone_number: string | null;

  role: 'customer' | 'delivery_agent' | 'admin';

  is_active: boolean;
}