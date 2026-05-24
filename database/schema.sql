-- TRUSTLAYER — Schema Supabase complet
-- Copier-coller dans Supabase > SQL Editor > Run

create table if not exists public.otp_codes (
  phone text primary key,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  role text check (role in ('vendor','client','rider')),
  cin_url text,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  shop_name text not null,
  score integer default 50 check (score >= 0 and score <= 100),
  badge text default 'bronze' check (badge in ('bronze','silver','gold')),
  total_orders integer default 0,
  city text,
  category text,
  created_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  score integer default 50,
  orders_refused integer default 0,
  orders_completed integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id text primary key,
  vendor_id uuid references public.vendors(id),
  client_id uuid references public.clients(id),
  product_name text not null,
  product_desc text,
  amount numeric(10,3) not null,
  deposit numeric(10,3) not null,
  deposit_pct integer default 20,
  status text default 'pending' check (status in ('pending','confirmed','in_delivery','delivered','refused','disputed')),
  qr_code text,
  secret_code text,
  link_token text unique,
  payment_ref text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id text references public.orders(id),
  claimant_id uuid references public.users(id),
  type text check (type in ('non_conform','not_received','other')),
  description text,
  evidence_urls text[],
  status text default 'open' check (status in ('open','under_review','resolved','closed')),
  resolution text,
  created_at timestamptz default now()
);

create table if not exists public.reputation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  type text,
  score_delta integer,
  reason text,
  order_id text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_orders_vendor_id on public.orders(vendor_id);
create index if not exists idx_orders_link_token on public.orders(link_token);
create index if not exists idx_vendors_score on public.vendors(score desc);
create index if not exists idx_reputation_user_id on public.reputation_events(user_id);

-- Disable RLS for simplicity (enable later in production)
alter table public.otp_codes disable row level security;
alter table public.users disable row level security;
alter table public.vendors disable row level security;
alter table public.clients disable row level security;
alter table public.orders disable row level security;
alter table public.disputes disable row level security;
alter table public.reputation_events disable row level security;
