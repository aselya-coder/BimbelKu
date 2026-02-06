-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Subjects Table
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Education Levels Table
create table public.education_levels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text not null unique,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Cities Table
create table public.cities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Partner Locations Table
create table public.partner_locations (
  id uuid default uuid_generate_v4() primary key,
  city_id uuid references public.cities(id) on delete cascade not null,
  name text not null,
  address text not null,
  operating_hours text,
  maps_link text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Tutoring Packages Table
create table public.tutoring_packages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique,
  subject_id uuid references public.subjects(id) on delete restrict not null,
  level_id uuid references public.education_levels(id) on delete restrict not null,
  city_id uuid references public.cities(id) on delete restrict not null,
  location_id uuid references public.partner_locations(id) on delete set null,
  mode text not null check (mode in ('online', 'offline')),
  place text check (place in ('student_home', 'partner_cafe')),
  system text not null check (system in ('private', 'group')),
  price numeric not null,
  session_duration integer not null, -- in minutes
  total_sessions integer not null,
  group_quota integer,
  description text,
  features text[], -- Array of strings
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Schedules Table (Missed in previous version)
create table public.schedules (
  id uuid default uuid_generate_v4() primary key,
  package_id uuid references public.tutoring_packages(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  max_students integer,
  current_students integer default 0,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Testimonials Table
create table public.testimonials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text not null,
  content text not null,
  rating integer default 5,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Registrations Table
create table public.registrations (
  id uuid default uuid_generate_v4() primary key,
  package_id uuid references public.tutoring_packages(id) on delete restrict not null,
  student_name text not null,
  whatsapp_number text not null,
  email text,
  city text not null,
  preferred_schedule text,
  detailed_location text,
  status text default 'new' check (status in ('new', 'contacted', 'active', 'completed')),
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.subjects enable row level security;
alter table public.education_levels enable row level security;
alter table public.cities enable row level security;
alter table public.partner_locations enable row level security;
alter table public.tutoring_packages enable row level security;
alter table public.schedules enable row level security;
alter table public.testimonials enable row level security;
alter table public.registrations enable row level security;

-- Create Policies (Public Read Access)
create policy "Public can read active subjects" on public.subjects for select using (is_active = true);
create policy "Public can read education levels" on public.education_levels for select using (true);
create policy "Public can read active cities" on public.cities for select using (is_active = true);
create policy "Public can read active partner locations" on public.partner_locations for select using (is_active = true);
create policy "Public can read active packages" on public.tutoring_packages for select using (is_active = true);
create policy "Public can read active schedules" on public.schedules for select using (is_available = true);
create policy "Public can read active testimonials" on public.testimonials for select using (is_active = true);
create policy "Public can insert registrations" on public.registrations for insert with check (true);

-- Insert Initial Data (Optional but helpful)
insert into public.education_levels (name, code, sort_order) values
('SD', 'sd', 1),
('SMP', 'smp', 2),
('SMA', 'sma', 3),
('Umum', 'umum', 4);

insert into public.cities (name) values ('Jakarta'), ('Bandung'), ('Surabaya');
