-- =========================================================================
-- BARBER SHOP DATABASE SCHEMA FOR SUPABASE ("КОРНИ")
-- =========================================================================

-- 1. Services table (Услуги и цены)
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Masters table (Мастера)
create table if not exists public.masters (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  bio text,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Appointments table (Записи клиентов)
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_name text not null,
  client_phone text not null,
  master_name text,
  service_title text,
  date date not null,
  start_time time not null,
  status text not null default 'Подтверждена'
);

-- Enable RLS
alter table public.services enable row level security;
alter table public.masters enable row level security;
alter table public.appointments enable row level security;

-- Public read policies
create policy "Services viewable by everyone" on public.services for select using (true);
create policy "Services manageable by authenticated users" on public.services for all using (auth.role() = 'authenticated');

create policy "Masters viewable by everyone" on public.masters for select using (true);
create policy "Masters manageable by authenticated users" on public.masters for all using (auth.role() = 'authenticated');

create policy "Appointments viewable by authenticated users" on public.appointments for select using (auth.role() = 'authenticated');
create policy "Appointments insertable by everyone" on public.appointments for insert with check (true);
create policy "Appointments manageable by authenticated users" on public.appointments for update using (auth.role() = 'authenticated');
create policy "Appointments deletable by authenticated users" on public.appointments for delete using (auth.role() = 'authenticated');

