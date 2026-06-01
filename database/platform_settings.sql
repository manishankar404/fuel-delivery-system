-- Platform Settings (single-row config table)
-- Run this in Supabase SQL editor.

create table if not exists public.platform_settings (
  id integer primary key default 1,
  delivery_charge numeric not null default 0,
  min_liters numeric not null default 1,
  max_liters numeric not null default 500,
  discount_enabled boolean not null default false,
  discount_type text not null default 'percentage' check (discount_type in ('percentage', 'flat')),
  discount_value numeric not null default 0,
  credit_per_liter numeric not null default 0,
  updated_at timestamptz not null default now(),
  constraint platform_settings_singleton check (id = 1)
);

-- Ensure row exists
insert into public.platform_settings (id)
values (1)
on conflict (id) do nothing;

-- RLS: safe public read; admin-only update.
alter table public.platform_settings enable row level security;

drop policy if exists "platform_settings_read_all" on public.platform_settings;
create policy "platform_settings_read_all"
on public.platform_settings
for select
to public
using (true);

drop policy if exists "platform_settings_update_admin" on public.platform_settings;
create policy "platform_settings_update_admin"
on public.platform_settings
for update
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

create or replace function public.platform_settings_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists platform_settings_set_updated_at on public.platform_settings;
create trigger platform_settings_set_updated_at
before update on public.platform_settings
for each row
execute function public.platform_settings_touch_updated_at();

