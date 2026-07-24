-- ==========================================
-- 1. COMPANY DRIVES TABLE
-- ==========================================
create table if not exists public.company_drives (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    company text not null,
    role text not null,
    drive_date text not null,
    link text not null,
    logo_url text,
    is_active boolean default true
);

-- RLS Policies for company_drives
alter table public.company_drives enable row level security;

create policy "Enable read access for all users" on public.company_drives
    for select using (is_active = true);

-- Note: Admin inserts/updates can be handled through Supabase dashboard
-- or by creating an authenticated admin policy like:
-- create policy "Enable insert for admins" on public.company_drives for insert with check (auth.role() = 'admin');


-- ==========================================
-- 2. CAREER VIDEOS TABLE
-- ==========================================
create table if not exists public.career_videos (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    category text not null,       -- e.g., 'Placement', 'Aptitude', 'Coding', 'GATE'
    title text not null,
    video_id text,                -- YouTube Video ID (if single video)
    playlist_id text,             -- YouTube Playlist ID (if playlist)
    thumbnail_id text,            -- Custom Thumbnail ID
    language text not null,       -- e.g., 'English', 'Tamil', 'Hindi/English'
    is_active boolean default true
);

-- RLS Policies for career_videos
alter table public.career_videos enable row level security;

create policy "Enable read access for all users" on public.career_videos
    for select using (is_active = true);


-- ==========================================
-- MOCK DATA INSERTS (Run these to test)
-- ==========================================

-- Insert mock company drives
insert into public.company_drives (company, role, drive_date, link, logo_url) values
('TCS (Ninja/Digital)', 'Software Engineer', '25 Aug 2026', 'https://www.tcs.com/careers', 'https://logo.clearbit.com/tcs.com'),
('Zoho Corporation', 'Member Technical Staff', '02 Sep 2026', 'https://careers.zohocorp.com', 'https://logo.clearbit.com/zohocorp.com'),
('Cognizant (GenC)', 'Programmer Analyst', '15 Sep 2026', 'https://careers.cognizant.com', 'https://logo.clearbit.com/cognizant.com'),
('Wipro (Elite)', 'Project Engineer', 'Coming Soon', 'https://careers.wipro.com', 'https://logo.clearbit.com/wipro.com');

-- Insert mock videos for 'Placement' category
insert into public.career_videos (category, title, playlist_id, thumbnail_id, language) values
('Placement', 'Quants Foundation', 'PLpyc33gOcbVA4qXMoQ5vmhefTruk5t9lt', 'qFmYn82PFjE', 'English'),
('Placement', 'Quants & Reasoning (Tamil)', 'PLjk6GSlXqiZWgt5K3LP1-T7Q9zAxR1-S3', 'zAKExlhKLcE', 'Tamil');

-- Insert mock video for 'Placement' category (Single Video)
insert into public.career_videos (category, title, video_id, language) values
('Placement', 'Python Crash Course', 'vxHUFFiT0OI', 'English');
