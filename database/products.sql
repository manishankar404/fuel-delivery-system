-- Product Catalog
-- Run this in Supabase SQL editor.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  service_description text,
  price numeric not null default 0,
  category text not null default 'general',
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_category_idx on public.products (category);

alter table public.products enable row level security;

-- Public read active products
drop policy if exists "products_read_active" on public.products;
create policy "products_read_active"
on public.products
for select
to public
using (is_active = true);

-- Admin read all (including inactive)
drop policy if exists "products_read_admin_all" on public.products;
create policy "products_read_admin_all"
on public.products
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

-- Admin insert/update
drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin"
on public.products
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

