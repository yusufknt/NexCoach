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
- Worker storage authorization/signing: `cloudflare/src/routes/storage.ts`, `cloudflare/src/security.ts`
- Better Auth client: `koc-paneli/src/lib/auth-client.ts`
- Coach backend queries: `koc-paneli/src/lib/coach/*.server.ts`
- Coach server actions: `koc-paneli/src/lib/coach/*-actions.ts`
- Student backend queries: `koc-paneli/src/lib/student/*.server.ts`
- Student server actions: `koc-paneli/src/lib/student/*-actions.ts`
- Admin queries and authorization: `koc-paneli/src/lib/admin/admin.server.ts`, `koc-paneli/src/lib/admin/auth.ts`
- Admin mutations and coach invitations: `koc-paneli/src/lib/admin/admin-actions.ts`, `koc-paneli/src/lib/admin/coach-invite.server.ts`
- Email service: `koc-paneli/src/lib/email/send.ts`, `templates.ts`
- Cron routes: `koc-paneli/src/app/api/cron/`

## Production Security
- `programs`, `progress-photos` ve `monthly-reports` bucket nesneleri çıplak Worker URL'siyle okunamaz; en fazla 1 saatlik HMAC imzalı URL gerekir.
- R2 upload/delete/list/sign işlemleri `X-API-Secret` olmadan fail-closed davranır. `API_SECRET` ve bağımsız `URL_SIGNING_SECRET` yalnızca runtime secret olmalıdır.
- Genel D1 köprüsü istek boyutu, şema, parametre sayısı ve SQL işlem tipi açısından Hono/Zod ile doğrulanır. Kullanıcı mutasyonlarında ayrıca Server Action kimlik/yetki ve domain doğrulaması zorunludur.
- Koç ayarları, mesajlar, takvim ve öğrenci hızlı ilerleme mutasyonları kimlik doğrulamalı Server Action üzerinden çalışır.
- Admin coach invitation/access mutations use an admin-only Server Action guard and are recorded in `admin_audit_logs`.
- Coach invitation email delivery uses Resend; when unavailable, the admin UI returns the one-time link for manual sharing.
