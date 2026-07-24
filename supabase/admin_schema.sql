-- ==========================================
-- ADMIN TRACKING TABLES
-- ==========================================

-- 1. App Devices (To track total unique users)
create table if not exists public.app_devices (
    device_id text primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_active timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for app_devices
alter table public.app_devices enable row level security;

-- Allow anonymous inserts and updates (so the app can register devices)
create policy "Enable insert for anonymous users" on public.app_devices
    for insert with check (true);

create policy "Enable update for anonymous users" on public.app_devices
    for update using (true);

create policy "Enable read for anonymous users" on public.app_devices
    for select using (true);
