-- =====================================================================
-- VELOURA JEWELLERY — Supabase schema
-- Run once in Supabase > SQL Editor. Safe to re-run (idempotent).
-- Only the public "anon" key is ever used by the website. The
-- service_role key must never be placed in frontend code.
-- =====================================================================

-- ---------- Administrators ------------------------------------------
-- Only users listed here may write anything. Add yourself AFTER creating
-- your user in Authentication > Users (see README, step "First admin").
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

drop policy if exists "admins can read own admin row" on public.admin_users;
create policy "admins can read own admin row"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());
-- No insert/update/delete policies: admins are added from the SQL editor only.

-- ---------- Shared updated_at trigger --------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Products --------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,                       -- id of the React product this row was copied from (migration)
  name text not null check (char_length(name) between 1 and 160),
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  category text not null,                      -- category slug
  image_url text,                              -- main image
  additional_images text[] not null default '{}',
  keywords text[] not null default '{}',
  specs jsonb not null default '[]'::jsonb,        -- [{ "label": "...", "value": "..." }]
  variations jsonb not null default '[]'::jsonb,   -- [{ "label": "Ring size", "options": ["5","6"] }]
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_on_sale boolean not null default false,
  is_available boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_featured_idx on public.products (is_featured) where is_featured;
create index if not exists products_published_idx on public.products (is_published, is_available);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

-- Public visitors: read published products. (Sold-out items stay visible and
-- are shown as "Sold out" so they match how the React catalogue behaves.
-- To hide unavailable items entirely, add "and is_available" below.)
drop policy if exists "public can read published products" on public.products;
create policy "public can read published products"
  on public.products for select
  to anon, authenticated
  using (is_published);

drop policy if exists "admins can read all products" on public.products;
create policy "admins can read all products"
  on public.products for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can insert products" on public.products;
create policy "admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admins can update products" on public.products;
create policy "admins can update products"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can delete products" on public.products;
create policy "admins can delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- ---------- Categories (additional to the five built into the app) ----
create table if not exists public.categories (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text not null default '',
  image_url text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

drop policy if exists "public can read categories" on public.categories;
create policy "public can read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "admins can write categories" on public.categories;
create policy "admins can write categories"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- Store settings (single row) --------------------------------
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text,
  logo_url text,
  whatsapp_number text,
  email text,
  phone text,
  address text,
  instagram text,
  facebook text,
  tiktok text,
  currency text,
  announcement text,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

alter table public.store_settings enable row level security;

drop policy if exists "public can read settings" on public.store_settings;
create policy "public can read settings"
  on public.store_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "admins can write settings" on public.store_settings;
create policy "admins can write settings"
  on public.store_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- Storage: product images -----------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can view product images" on storage.objects;
create policy "public can view product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "admins can upload product images" on storage.objects;
create policy "admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admins can update product images" on storage.objects;
create policy "admins can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admins can delete product images" on storage.objects;
create policy "admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
