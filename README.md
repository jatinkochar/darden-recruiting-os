# Compass Parser v2 Fix

Replace:

- lib/gmail/parser.ts
- lib/google/gmail.ts

Optional:

- supabase/cleanup-obvious-false-positive-events.sql

What this changes:
- Does NOT remove Date TBD events.
- Keeps valid recruiting events even when the exact date/time is missing.
- Blocks obvious personal/payment/security/order emails from becoming events.
- Uses a generic MBA recruiting scoring model instead of relying only on hardcoded companies.
- Extracts company dynamically when possible.
- Improves date/time extraction from common event email formats.
