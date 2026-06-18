-- Account deletion support
-- This is mostly informational because the API route deletes data explicitly.
-- Ensure user_id columns exist and cascade deletes are configured where possible.

alter table public.events
  drop constraint if exists events_user_id_fkey,
  add constraint events_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.contacts
  drop constraint if exists contacts_user_id_fkey,
  add constraint contacts_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.applications
  drop constraint if exists applications_user_id_fkey,
  add constraint applications_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.tasks
  drop constraint if exists tasks_user_id_fkey,
  add constraint tasks_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.integrations
  drop constraint if exists integrations_user_id_fkey,
  add constraint integrations_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
