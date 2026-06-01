import { supabase } from '../lib/supabase';

export type CustomerWallet = {
  customer_id: string;
  balance: number;
  updated_at: string;
};

type CustomerWalletRow = {
  customer_id: string;
  balance: number | string;
  updated_at: string;
};

export type WalletTransaction = {
  id: string;
  customer_id: string;
  transaction_type: string;
  amount: number;
  source_order_id: string | null;
  description: string | null;
  created_at: string;
};

type WalletTransactionRow = {
  id: string;
  customer_id: string;
  transaction_type: string;
  amount: number | string;
  source_order_id: string | null;
  description: string | null;
  created_at: string;
};

function mapWallet(row: CustomerWalletRow): CustomerWallet {
  return {
    customer_id: row.customer_id,
    balance: Number(row.balance),
    updated_at: row.updated_at,
  };
}

function mapTx(row: WalletTransactionRow): WalletTransaction {
  return {
    id: row.id,
    customer_id: row.customer_id,
    transaction_type: row.transaction_type,
    amount: Number(row.amount),
    source_order_id: row.source_order_id,
    description: row.description,
    created_at: row.created_at,
  };
}

export async function getMyWallet(): Promise<CustomerWallet> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('customer_wallets')
    .select('customer_id, balance, updated_at')
    .eq('customer_id', userData.user.id)
    .single<CustomerWalletRow>();

  if (error) throw error;
  return mapWallet(data);
}

export async function listMyWalletTransactions(limit = 50): Promise<WalletTransaction[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('wallet_transactions')
    .select(
      `
        id,
        customer_id,
        transaction_type,
        amount,
        source_order_id,
        description,
        created_at
      `
    )
    .eq('customer_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<WalletTransactionRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapTx);
}

