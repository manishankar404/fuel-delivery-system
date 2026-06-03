import { useCallback, useEffect, useState } from 'react';
import { getCustomers } from '../services/profileService';

type Customer = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getCustomers();
      setCustomers(data ?? []);
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
      <h1 style={{ marginTop: 0 }}>Customers</h1>
      <p style={{ color: '#6B7280', marginTop: 6 }}>
        Customer profiles and contact information.
      </p>

      {errorMessage ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b',
          }}
        >
          {errorMessage}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 16,
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          background: '#fff',
          padding: 14,
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Customer List</h3>
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

        {isLoading ? (
          <div style={{ padding: 12, color: '#6B7280' }}>Loading…</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: 12, color: '#6B7280' }}>No customers.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: 12, fontWeight: 900 }}>Full Name</th>
                <th style={{ textAlign: 'left', padding: 12, fontWeight: 900 }}>Email</th>
                <th style={{ textAlign: 'left', padding: 12, fontWeight: 900 }}>Phone</th>
                <th style={{ textAlign: 'left', padding: 12, fontWeight: 900 }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 12 }}>{customer.full_name}</td>
                  <td style={{ padding: 12 }}>{customer.email}</td>
                  <td style={{ padding: 12 }}>{customer.phone_number ?? '—'}</td>
                  <td style={{ padding: 12, fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>
                    {customer.id.substring(0, 8)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
