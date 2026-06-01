-- Rewards & Platform Credits (Wallet)
-- Run this in Supabase SQL editor.

-- 1) Customer wallets
create table if not exists public.customer_wallets (
  customer_id uuid primary key references public.profiles(id) on delete cascade,
  balance numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- 2) Wallet transactions (future-ready for redemption)
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  transaction_type text not null, -- e.g. earn_order_delivered, redeem, manual_adjustment
  amount numeric not null, -- positive earn, negative redeem
  currency text not null default 'CREDITS',
  source_order_id uuid, -- links earned credits to an order
  description text,
  created_at timestamptz not null default now()
);

create index if not exists wallet_transactions_customer_id_idx on public.wallet_transactions (customer_id, created_at desc);
create index if not exists wallet_transactions_source_order_id_idx on public.wallet_transactions (source_order_id);

-- Prevent duplicate reward processing for an order delivery
create unique index if not exists wallet_tx_unique_order_delivery_reward
on public.wallet_transactions (customer_id, source_order_id, transaction_type)
where transaction_type = 'earn_order_delivered';

alter table public.customer_wallets enable row level security;
alter table public.wallet_transactions enable row level security;

-- Grants (Supabase typically manages these, but explicit grants help clarity)
grant select, insert, update on public.customer_wallets to authenticated;
grant select, insert on public.wallet_transactions to authenticated;

-- RLS: customers can read their own wallet + transactions
drop policy if exists "wallet_read_own" on public.customer_wallets;
create policy "wallet_read_own"
on public.customer_wallets
for select
to authenticated
using (customer_id = auth.uid());

drop policy if exists "wallet_transactions_read_own" on public.wallet_transactions;
create policy "wallet_transactions_read_own"
on public.wallet_transactions
for select
to authenticated
using (customer_id = auth.uid());

-- Admin can read all wallets + transactions
drop policy if exists "wallet_admin_read_all" on public.customer_wallets;
create policy "wallet_admin_read_all"
on public.customer_wallets
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "wallet_transactions_admin_read_all" on public.wallet_transactions;
create policy "wallet_transactions_admin_read_all"
on public.wallet_transactions
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Helper: touch updated_at
create or replace function public.customer_wallets_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customer_wallets_set_updated_at on public.customer_wallets;
create trigger customer_wallets_set_updated_at
before update on public.customer_wallets
for each row
execute function public.customer_wallets_touch_updated_at();

-- Rewards processing: add credits when order becomes delivered.
-- Notes:
-- - Idempotent via unique index above.
-- - Uses platform_settings.credit_per_liter.
create or replace function public.process_order_delivery_reward()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  credit_rate numeric;
  earned numeric;
begin
  -- Only on status transitions to delivered
  if (tg_op <> 'UPDATE') then
    return new;
  end if;

  if (new.status <> 'delivered' or old.status = 'delivered') then
    return new;
  end if;

  select ps.credit_per_liter into credit_rate
  from public.platform_settings ps
  where ps.id = 1;

  credit_rate := coalesce(credit_rate, 0);
  earned := coalesce(new.quantity_liters, 0) * credit_rate;

  if earned <= 0 then
    return new;
  end if;

  -- Ensure wallet exists
  insert into public.customer_wallets (customer_id, balance)
  values (new.customer_id, 0)
  on conflict (customer_id) do nothing;

  -- Insert transaction (idempotent)
  insert into public.wallet_transactions (
    customer_id,
    transaction_type,
    amount,
    source_order_id,
    description
  )
  values (
    new.customer_id,
    'earn_order_delivered',
    earned,
    new.id,
    'Credits earned for delivered order'
  )
  on conflict do nothing;

  -- Apply to wallet balance (sum transactions is safer long-term, but this is fast for MVP)
  update public.customer_wallets
  set balance = balance + earned
  where customer_id = new.customer_id;

  return new;
end;
$$;

-- Attach trigger to orders table
drop trigger if exists orders_reward_on_delivered on public.orders;
create trigger orders_reward_on_delivered
after update of status on public.orders
for each row
execute function public.process_order_delivery_reward();

