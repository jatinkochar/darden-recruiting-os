-- Multi-user SaaS migration for Darden Recruiting OS
-- Run in Supabase SQL Editor.

create extension if not exists "uuid-ossp";

-- 1. Add user_id to all app data tables.
alter table public.events add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.contacts add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.applications add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.tasks add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2. Rebuild integrations as user-scoped.
alter table public.integrations add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- If old primary key is provider only, drop it and add user/provider uniqueness.
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema='public'
    and table_name='integrations'
    and constraint_name='integrations_pkey'
  ) then
    alter table public.integrations drop constraint integrations_pkey;
  end if;
exception when others then null;
end $$;

alter table public.integrations
add column if not exists id uuid default uuid_generate_v4();

create unique index if not exists integrations_user_provider_unique
on public.integrations(user_id, provider);

-- 3. Enable RLS.
alter table public.events enable row level security;
alter table public.contacts enable row level security;
alter table public.applications enable row level security;
alter table public.tasks enable row level security;
alter table public.integrations enable row level security;

-- 4. Drop older broad dev policies if they exist.
drop policy if exists "dev read events" on public.events;
drop policy if exists "dev write events" on public.events;
drop policy if exists "dev read contacts" on public.contacts;
drop policy if exists "dev write contacts" on public.contacts;
drop policy if exists "dev read applications" on public.applications;
drop policy if exists "dev write applications" on public.applications;
drop policy if exists "dev read tasks" on public.tasks;
drop policy if exists "dev write tasks" on public.tasks;

-- 5. User-owned policies.
drop policy if exists "users read own events" on public.events;
create policy "users read own events" on public.events for select using (auth.uid() = user_id);

drop policy if exists "users insert own events" on public.events;
create policy "users insert own events" on public.events for insert with check (auth.uid() = user_id);

drop policy if exists "users update own events" on public.events;
create policy "users update own events" on public.events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own events" on public.events;
create policy "users delete own events" on public.events for delete using (auth.uid() = user_id);

drop policy if exists "users read own contacts" on public.contacts;
create policy "users read own contacts" on public.contacts for select using (auth.uid() = user_id);
drop policy if exists "users write own contacts" on public.contacts;
create policy "users write own contacts" on public.contacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users read own applications" on public.applications;
create policy "users read own applications" on public.applications for select using (auth.uid() = user_id);
drop policy if exists "users write own applications" on public.applications;
create policy "users write own applications" on public.applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users read own tasks" on public.tasks;
create policy "users read own tasks" on public.tasks for select using (auth.uid() = user_id);
drop policy if exists "users write own tasks" on public.tasks;
create policy "users write own tasks" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Browser should not access integrations. Server service role bypasses RLS.
drop policy if exists "users read own integrations" on public.integrations;
drop policy if exists "users write own integrations" on public.integrations;
