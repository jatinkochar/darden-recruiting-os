create table if not exists public.integrations (
  provider text primary key,
  access_token text,
  refresh_token text,
  scope text,
  expires_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.integrations enable row level security;

-- Server-only table. Browser should not read/write this table.
-- Service role key bypasses RLS from server routes.
