export type AgentTabKey =
  | 'Dashboard'
  | 'ActiveDeliveries'
  | 'History'
  | 'Map'
  | 'Profile';

export const AGENT_TABS: { key: AgentTabKey; label: string }[] = [
  { key: 'Dashboard', label: 'Dashboard' },
  { key: 'ActiveDeliveries', label: 'Active' },
  { key: 'History', label: 'History' },
  { key: 'Map', label: 'Map' },
  { key: 'Profile', label: 'Profile' },
];

