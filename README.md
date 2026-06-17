# Google Link Patch

Upload these files into your repo.

Adds:
- Google OAuth connect route
- Google callback route
- Gmail recruiting email fetcher
- Google Calendar event fetcher
- Sync endpoint `/api/sync/google`
- Settings page buttons

Also run:

supabase/google-integration.sql

Add Vercel env vars:
- NEXT_PUBLIC_APP_URL=https://darden-recruiting-os.vercel.app
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GMAIL_SYNC_SECRET

You also need Google Cloud OAuth setup.
