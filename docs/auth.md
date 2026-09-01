# Authentication & Authorization

Better Auth (email/password) backed by Cloudflare D1 + Role-Based Access Control (`admin` | `coach` | `student`). Admin membership is stored in the separate `admins` table; coach/student roles remain in `profiles`.

## Flow
1. **Login/Register Pages:** `koc-paneli/src/app/(public)/giris/page.tsx`, `koc-paneli/src/app/(public)/kayit/page.tsx`, `koc-paneli/src/app/(public)/koc-kayit/page.tsx`
2. **Auth Forms & Actions:** `koc-paneli/src/components/auth/` (uses `authClient.signIn`), `koc-paneli/src/lib/auth/register-actions.ts` (API fetch)
3. **Session & Middleware:**
   - `koc-paneli/src/proxy.ts`: Intercepts `/admin/*`, `/coach/*` and `/student/*`, verifies the Worker session (`/api/auth/get-session`), resolves role and enforces membership access.
4. **Role Resolution:** `admins` membership takes precedence; otherwise role is fetched from `profiles`. `koc-paneli/src/lib/auth.ts` maps roles to dashboards.
5. **Server Route Guards:**
   - Admin: `koc-paneli/src/lib/admin/auth.ts` (`getAuthenticatedAdminId`)
   - Coach: `koc-paneli/src/lib/coach/auth.ts` (`getAuthenticatedCoachId`)
   - Student: `koc-paneli/src/lib/student/auth.ts` (`getAuthenticatedStudentId`)

## Admin & Coach Onboarding
- Admin routes live under `/admin/*`; dashboard, coach list/detail and access management are server-authorized.
- Coaches register only through a 48-hour, single-use `/koc-kayit?token=...` invitation created by an admin.
- Raw coach invitation tokens are never persisted; D1 stores their SHA-256 hashes.
- `coach_access` gates coach access by status/start/end date. Student access also requires an active `coach_students` relationship and an active coach account.
- The initial admin is provisioned after migrations with `npm run bootstrap-admin` and runtime `ADMIN_PASSWORD`; passwords are not stored in source.

### Production Bootstrap Order
1. Apply `0004_admin_and_coach_access.sql` to the remote D1 database with `cloudflare` package script `d1:migrate:remote`.
2. From `koc-paneli`, run `npm run bootstrap-admin` once with `CLOUDFLARE_WORKER_URL`, `CLOUDFLARE_API_SECRET`, `ADMIN_EMAIL` and an `ADMIN_PASSWORD` of at least 8 characters.
3. Deploy the Next.js application. Re-running bootstrap is idempotent for an existing admin user.

### Revocation
- Suspending or expiring a coach through the admin panel removes that coach's Better Auth sessions.
- Date-based coach and student access is checked on every protected request; a remaining cookie does not grant portal or Server Action access after membership expiry.
- Expiry does not delete profiles, relationships or historical coaching data.

## Security Notes
- Worker Hono CORS yapısı credentials (cookie) kullanımına uygun olarak dinamik origin ve `credentials: true` ile ayarlanmıştır.
- Better Auth giriş/kayıt uçları `cloudflare/src/index.ts` içindeki Cloudflare Rate Limiting binding'i ve `cloudflare/src/auth.ts` içindeki endpoint kurallarıyla korunur.
- İstemci IP'si yalnızca Cloudflare'ın `cf-connecting-ip` başlığından alınır; giriş 5/dakika, kayıt 3/dakika uygulama limiti kullanır.
- `API_SECRET` kaynak kodda tutulmaz; Worker ve Next.js runtime secret olarak aynı döndürülmüş değeri kullanır.
- Şifre oluşturma/değiştirme minimum uzunluğu 8 karakterdir.
