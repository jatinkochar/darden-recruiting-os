# Darden Recruiting OS — Sprint 1–3

Includes:

## Sprint 1: Persistent events CRUD
- Add/Edit/Delete events
- Supabase-ready persistence
- Fallback browser localStorage if Supabase env vars are missing
- Event notes, meeting links, registration links, passcodes

## Sprint 2: Calendar
- Agenda view
- Month view
- One-click Join links

## Sprint 3: Gmail sync scaffold
- Gmail parsing logic
- `/api/sync/gmail` route
- Supabase upsert flow
- OAuth token exchange still needs to be connected in the next iteration

## Setup

1. Upload this folder to GitHub branch `jatinkochar-v1`.
2. Vercel will redeploy preview.
3. Create Supabase project.
4. Run `supabase/schema.sql` in Supabase SQL editor.
5. Add Vercel environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GMAIL_SYNC_SECRET=
```

## Notes

This is not yet full Gmail OAuth. The parser and sync endpoint are ready, but the Gmail token exchange needs the next implementation step.
