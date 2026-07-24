-- ==========================================
-- ANNOUNCEMENTS TABLE
-- ==========================================

create table if not exists public.announcements (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    "desc" text,
    details text,
    link text,
    date text,
    type text default 'announcements',
    venue text default 'Sairam Hub',
    is_active boolean default true
);

-- RLS Policies for announcements
alter table public.announcements enable row level security;

-- Allow everyone to read active announcements
create policy "Enable read access for all users" on public.announcements
    for select using (is_active = true);

-- Allow anonymous inserts (for the admin panel since we haven't locked it down with strict Auth yet)
-- Note: In production, you should restrict this to authenticated admins only.
create policy "Enable insert for anonymous users" on public.announcements
    for insert with check (true);

create policy "Enable update for anonymous users" on public.announcements
    for update using (true);

create policy "Enable delete for anonymous users" on public.announcements
    for delete using (true);
