alter table public.integrations
add column if not exists last_sync_at timestamptz,
add column if not exists last_sync_status text,
add column if not exists last_sync_error text,
add column if not exists last_sync_gmail_messages int,
add column if not exists last_sync_gmail_events int,
add column if not exists last_sync_calendar_events int,
add column if not exists last_sync_imported int;
