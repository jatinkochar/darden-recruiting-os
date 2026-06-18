# User Events API Fix

Replace/add:
- app/api/events/route.ts
- components/events/EventsClient.tsx
- components/dashboard/DashboardClient.tsx

Why:
After multi-user login, the server has the session cookie but browser Supabase client may not have localStorage session.
Events page was falling back to local seed data.

Fix:
Events and Dashboard now load user-scoped events through server API route `/api/events`.
