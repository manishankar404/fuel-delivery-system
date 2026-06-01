export type CustomerTabKey =
  | 'Home'
  | 'Orders'
  | 'Tracking'
  | 'Products'
  | 'Profile';

export const CUSTOMER_TABS: { key: CustomerTabKey; label: string }[] = [
  { key: 'Home', label: 'Home' },
  { key: 'Orders', label: 'Orders' },
  { key: 'Tracking', label: 'Tracking' },
  { key: 'Products', label: 'Products' },
  { key: 'Profile', label: 'Profile' },
];

