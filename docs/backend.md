# Backend Guide

## Data Flow & Server Logic
- **Operational Data (D1):** `*.server.ts` and `*-actions.ts` files use `@/lib/cloudflare/d1` to query and mutate SQLite data on Cloudflare D1 via the Worker API. Chat/Realtime is handled via D1 polling.
- **Storage (R2):** File uploads and downloads (programs, avatars, progress-photos, monthly-reports) use `@/lib/cloudflare/storage` (`cfStorage`) via Cloudflare Worker R2 endpoints.
- **Authentication:** Better Auth + Cloudflare D1 handles session management, cookies, and password auth. API is served directly from the Hono Worker (`/api/auth/*`).
- **Server Actions:** Form submissions and data mutations reside in `*-actions.ts` files with `'use server'`.
- **API Routes:** Located in `koc-paneli/src/app/api/` for public endpoints and cron jobs.

## Locations
- Cloudflare D1 client: `koc-paneli/src/lib/cloudflare/d1.ts`
- Cloudflare R2 storage: `koc-paneli/src/lib/cloudflare/storage.ts`
- Better Auth client: `koc-paneli/src/lib/auth-client.ts`
- Coach backend queries: `koc-paneli/src/lib/coach/*.server.ts`
- Coach server actions: `koc-paneli/src/lib/coach/*-actions.ts`
- Student backend queries: `koc-paneli/src/lib/student/*.server.ts`
- Student server actions: `koc-paneli/src/lib/student/*-actions.ts`
- Email service: `koc-paneli/src/lib/email/send.ts`, `templates.ts`
- Cron routes: `koc-paneli/src/app/api/cron/`
