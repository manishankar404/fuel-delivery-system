import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useCallback, useEffect, useMemo, useState } from 'react';

import EmptyState from '../../components/EmptyState';
import { getMyWallet, listMyWalletTransactions, type WalletTransaction } from '../../services/walletService';

type State = {
  balance: number;
  updatedAt: string | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  isRefreshing: boolean;
};

export default function WalletScreen() {
  const [state, setState] = useState<State>({
    balance: 0,
    updatedAt: null,
    transactions: [],
    isLoading: true,
    isRefreshing: false,
  });

  const load = useCallback(async () => {
    setState((p) => ({ ...p, isLoading: true }));
    try {
      const wallet = await getMyWallet();
      const transactions = await listMyWalletTransactions(50);
      setState((p) => ({
        ...p,
        balance: wallet.balance,
        updatedAt: wallet.updated_at,
        transactions,
      }));
    } finally {
      setState((p) => ({ ...p, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    try {
      setState((p) => ({ ...p, isRefreshing: true }));
      await load();
    } finally {
      setState((p) => ({ ...p, isRefreshing: false }));
    }
  }, [load]);

  const header = useMemo(() => {
    return (
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.subtitle}>Platform credits earned from delivered fuel orders.</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current balance</Text>
          <Text style={styles.balanceValue}>₹{state.balance.toFixed(2)}</Text>
          <Text style={styles.balanceHint}>
            Updated: {state.updatedAt ? new Date(state.updatedAt).toLocaleString() : '—'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Transactions</Text>
      </View>
    );
  }, [state.balance, state.updatedAt]);

  return (
    <View style={styles.container}>
      <FlatList
        data={state.transactions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={state.isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={state.transactions.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          state.isLoading ? (
            <EmptyState title="Loading wallet…" description="Syncing your credits." />
          ) : (
            <EmptyState title="No transactions yet" description="Credits appear after delivery completion." />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.txCard}>
            <View style={styles.txTop}>
              <Text style={styles.txType}>{item.transaction_type.replaceAll('_', ' ')}</Text>
              <Text style={styles.txAmount}>
                {item.amount >= 0 ? '+' : ''}
                ₹{item.amount.toFixed(2)}
              </Text>
            </View>
            <Text style={styles.txMeta}>
              {item.description ?? '—'} • {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  balanceCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6B7280',
  },
  balanceValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  balanceHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    marginTop: 6,
  },
  txCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 10,
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  txType: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: '#16A34A',
  },
  txMeta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

