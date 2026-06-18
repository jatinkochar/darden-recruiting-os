# Supabase Login Token Fix

Replace/add:

- components/auth/LoginForm.tsx
- app/api/auth/session/route.ts

This fixes Supabase Auth redirects that return #access_token instead of ?code.
After login, the app captures the token, sets server cookies, and redirects to /.
