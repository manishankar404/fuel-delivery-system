import { NavLink, Outlet } from 'react-router-dom';

import { supabase } from '../lib/supabase';

import './AdminLayout.css';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/orders', label: 'Orders' },
  { to: '/products', label: 'Products' },
  { to: '/delivery-agents', label: 'Delivery Agents' },
  { to: '/wallets', label: 'Wallets' },
  { to: '/settings', label: 'Platform Settings' },
];

export default function AdminLayout() {
  return (
    <div className="admShell">
      <aside className="admSidebar">
        <div className="admBrand">Fuel Ops</div>
        <nav className="admNav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'admNavLink admNavLinkActive' : 'admNavLink')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="admLogout"
          type="button"
          onClick={() => void supabase.auth.signOut()}
        >
          Logout
        </button>
      </aside>

      <main className="admMain">
        <Outlet />
      </main>
    </div>
  );
}
