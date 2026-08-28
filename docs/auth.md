# Authentication & Authorization

Better Auth (email/password) backed by Cloudflare D1 + Role-Based Access Control (`coach` | `student`).

## Flow
1. **Login/Register Pages:** `koc-paneli/src/app/giris/page.tsx`, `koc-paneli/src/app/kayit/page.tsx`
2. **Auth Forms & Actions:** `koc-paneli/src/components/auth/` (uses `authClient.signIn`), `koc-paneli/src/lib/auth/register-actions.ts` (API fetch)
3. **Session & Middleware:**
   - `koc-paneli/src/proxy.ts`: Intercepts `/coach/*` and `/student/*`, verifies session via Worker (`/api/auth/get-session`) and redirects by role.
4. **Role Resolution:** Role is fetched from `profiles` table in D1. `koc-paneli/src/lib/auth.ts` (`resolveUserRole`, `getDashboardPath`).
5. **Server Route Guards:**
   - Coach: `koc-paneli/src/lib/coach/auth.ts` (`getAuthenticatedCoachId`)
   - Student: `koc-paneli/src/lib/student/auth.ts` (`getAuthenticatedStudentId`)

## Security Notes
- Worker Hono CORS yapısı credentials (cookie) kullanımına uygun olarak dinamik origin ve `credentials: true` ile ayarlanmıştır.
