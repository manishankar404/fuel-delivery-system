import { useCallback, useEffect, useState } from 'react';
import { listCustomers, getCustomerStats } from '../services/profileService';

interface Customer {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  created_at?: string;
  customer_wallets?: Array<{ balance: number }>;
}

interface CustomerStats {
  [customerId: string]: {
    total_orders: number;
    delivered_orders: number;
    wallet_balance: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await listCustomers();
      setCustomers(data);

      const statsData: CustomerStats = {};
      for (const customer of data) {
        try {
          const customerStats = await getCustomerStats(customer.id);
          statsData[customer.id] = customerStats;
        } catch (err) {
          console.log(`Failed to load stats for ${customer.id}:`, err);
        }
      }
      setStats(statsData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return (
    <div style={{ padding: 28, maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ marginTop: 0 }}>Customers</h1>
          <p style={{ color: '#6B7280', marginTop: 6 }}>
            Manage customer accounts, view wallet balances, and monitor order history.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #d1d5db',
            background: '#fff',
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          Refresh
        </button>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b',
            marginBottom: 16,
          }}
        >
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: 12, color: '#6B7280' }}>Loading customers…</div>
      ) : customers.length === 0 ? (
        <div style={{ padding: 12, color: '#6B7280' }}>No customers.</div>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', overflow: 'hidden' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 800, color: '#6B7280' }}>Name</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 800, color: '#6B7280' }}>Email</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 800, color: '#6B7280' }}>Phone</th>
                <th style={{ padding: 12, textAlign: 'right', fontWeight: 800, color: '#6B7280' }}>Wallet Balance</th>
                <th style={{ padding: 12, textAlign: 'right', fontWeight: 800, color: '#6B7280' }}>Total Orders</th>
                <th style={{ padding: 12, textAlign: 'right', fontWeight: 800, color: '#6B7280' }}>Delivered</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const customerStats = stats[customer.id] || { total_orders: 0, delivered_orders: 0, wallet_balance: 0 };
                return (
                  <tr key={customer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 12, fontWeight: 600, color: '#111827' }}>
                      {customer.full_name || '—'}
                    </td>
                    <td style={{ padding: 12, color: '#111827', fontSize: 13, wordBreak: 'break-all' }}>
                      {customer.email}
                    </td>
                    <td style={{ padding: 12, color: '#111827' }}>
                      {customer.phone_number || '—'}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                      ₹{customerStats.wallet_balance.toFixed(2)}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', color: '#111827' }}>
                      {customerStats.total_orders}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', color: '#111827' }}>
                      {customerStats.delivered_orders}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
