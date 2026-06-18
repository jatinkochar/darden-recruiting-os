# Multi-user SaaS Patch

This converts the app from "single Jatin user" to multi-user SaaS foundation.

Upload/replace these files, then run:

supabase/multi-user-migration.sql

## Important env vars

Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

## Supabase Auth setup

Supabase → Authentication → URL Configuration:
- Site URL: https://darden-recruiting-os.vercel.app
- Redirect URLs:
  - https://darden-recruiting-os.vercel.app/auth/callback

Supabase → Authentication → Providers:
- Enable Email
- Enable Google if you want app login with Google

## Google OAuth setup

Google Cloud OAuth Client redirect URI must include:
- https://darden-recruiting-os.vercel.app/api/auth/google/callback

Google app verification will be needed before public use with Gmail scopes.
