# Database Schema & Migrations

Cloudflare D1 (SQLite) serves as the primary operational database. Supabase PostgreSQL data and legacy RLS policies are preserved strictly for rollback purposes and are not active in runtime.

## Schema Location (Active)
`cloudflare/d1/migrations/`
- `0001_initial_schema.sql`: Core tables migrated from PostgreSQL (profiles, coach_students, messages, calendar, programs, etc.)
- `0002_better_auth.sql`: Better Auth standard tables (user, session, account, verification)
- `0003_add_issuer.sql`: Better Auth account table extensions

## TypeScript Types
`koc-paneli/src/types/database.ts` and `koc-paneli/src/types/index.ts`
