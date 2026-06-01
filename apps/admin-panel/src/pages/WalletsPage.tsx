import { useCallback, useEffect, useState } from 'react';

import { listCustomerWallets, listWalletTransactionsForCustomer, type WalletTransaction, type CustomerWallet } from '../services/walletService';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<CustomerWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await listCustomerWallets();
      setWallets(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load wallets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const loadTransactions = useCallback(async (customerId: string) => {
    try {
      const tx = await listWalletTransactionsForCustomer(customerId, 50);
      setTransactions(tx);
    } catch {
      setTransactions([]);
    }
  }, []);

  return (
    <div style={{ padding: 28, maxWidth: 1200 }}>
      <h1 style={{ marginTop: 0 }}>Wallets</h1>
      <p style={{ color: '#6B7280', marginTop: 6 }}>
        Customer credit balances and recent transactions.
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
          display: 'grid',
          gridTemplateColumns: '380px minmax(0, 1fr)',
          gap: 14,
          marginTop: 16,
        }}
      >
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <h3 style={{ margin: 0 }}>Customers</h3>
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
          ) : wallets.length === 0 ? (
            <div style={{ padding: 12, color: '#6B7280' }}>No wallets.</div>
          ) : (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wallets.map((w) => (
                <button
                  key={w.customer_id}
                  type="button"
                  onClick={() => {
                    setSelectedCustomerId(w.customer_id);
                    void loadTransactions(w.customer_id);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    background: selectedCustomerId === w.customer_id ? '#111827' : '#fff',
                    color: selectedCustomerId === w.customer_id ? '#fff' : '#111827',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Customer</div>
                  <div style={{ fontSize: 12, wordBreak: 'break-all' }}>{w.customer_id}</div>
                  <div style={{ marginTop: 6, fontSize: 14 }}>Balance: ₹{w.balance.toFixed(2)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Recent transactions</h3>
          {!selectedCustomerId ? (
            <div style={{ padding: 12, color: '#6B7280' }}>Select a customer.</div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: 12, color: '#6B7280' }}>No transactions.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 14,
                    padding: 12,
                    background: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontWeight: 900 }}>{tx.transaction_type}</div>
                    <div style={{ fontWeight: 900, color: tx.amount >= 0 ? '#166534' : '#991b1b' }}>
                      {tx.amount >= 0 ? '+' : ''}₹{tx.amount.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: '#6B7280' }}>
                    {tx.description ?? '—'} • {new Date(tx.created_at).toLocaleString()}
                  </div>
                  {tx.source_order_id ? (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#6B7280' }}>
                      Order: {tx.source_order_id}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

