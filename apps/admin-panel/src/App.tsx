import {
  useEffect,
  useState,
} from 'react';

import type { Session } from '@supabase/supabase-js';

import { supabase } from './lib/supabase';

import LoginPage from './pages/LoginPage';

import DashboardPage from './pages/DashboardPage';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AdminLayout from './layout/AdminLayout';
import SettingsPage from './pages/SettingsPage';
import ProductsPage from './pages/ProductsPage';
import WalletsPage from './pages/WalletsPage';
import MyProfilePage from './pages/MyProfilePage';
import CustomersPage from './pages/CustomersPage';
import DeliveryAgentsPage from './pages/DeliveryAgentsPage';
import AdminUsersPage from './pages/AdminUsersPage';

export default function App() {
  const [session, setSession] =
    useState<Session | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);

        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<DashboardPage />} />
          <Route path="/wallets" element={<WalletsPage />} />
          <Route
            path="/products"
            element={<ProductsPage />}
          />
          <Route
            path="/delivery-agents"
            element={
              <DeliveryAgentsPage />
            }
          />
          <Route
            path="/customers"
            element={
              <CustomersPage />
            }
          />
          <Route
            path="/admin-users"
            element={
              <AdminUsersPage />
            }
          />
          <Route
            path="/my-profile"
            element={
              <MyProfilePage />
            }
          />
          <Route
            path="/settings"
            element={<SettingsPage />}
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
