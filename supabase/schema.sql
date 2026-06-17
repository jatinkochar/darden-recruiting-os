create extension if not exists "uuid-ossp";

create table if not exists public.events (
  id text primary key,
  title text not null,
  company text not null,
  type text default '',
  date date,
  start_time time,
  end_time time,
  timezone text default '',
  status text default 'Register',
  priority text default 'Medium',
  location text default '',
  meeting_link text default '',
  registration_link text default '',
  passcode text default '',
  source text default '',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.contacts (
  id text primary key,
  name text not null,
  company text default '',
  office text default '',
  role text default '',
  email text default '',
  linkedin text default '',
  last_touch date,
  next_follow_up date,
  status text default 'New',
  notes text default '',
  created_at timestamptz default now()
);

create table if not exists public.applications (
  id text primary key,
  company text not null,
  role text default '',
  status text default 'Research',
  deadline date,
  priority text default 'Medium',
  link text default '',
  notes text default '',
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id text primary key,
  title text not null,
  company text default '',
  due_date date,
  status text default 'Backlog',
  priority text default 'Medium',
  notes text default '',
  created_at timestamptz default now()
);

alter table public.events enable row level security;
alter table public.contacts enable row level security;
alter table public.applications enable row level security;
alter table public.tasks enable row level security;

-- Temporary development policies. Tighten once auth is added.
create policy "dev read events" on public.events for select using (true);
create policy "dev write events" on public.events for all using (true) with check (true);
create policy "dev read contacts" on public.contacts for select using (true);
create policy "dev write contacts" on public.contacts for all using (true) with check (true);
create policy "dev read applications" on public.applications for select using (true);
create policy "dev write applications" on public.applications for all using (true) with check (true);
create policy "dev read tasks" on public.tasks for select using (true);
create policy "dev write tasks" on public.tasks for all using (true) with check (true);
