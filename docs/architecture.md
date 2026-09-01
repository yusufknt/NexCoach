# Architecture

Next.js 16 (Turbopack, App Router) + Cloudflare Workers (D1, R2) + Better Auth fitcoach platform.

## Directory Structure
- `koc-paneli/src/app/`: Next.js App Router pages and API routes
  - `(public)/`: Landing, marketing, packages
  - `(coach)/`: Coach portal (`/coach/*`)
  - `(student)/`: Student portal (`/student/*`)
  - `(admin)/`: Admin portal (`/admin/*`)
  - `(public)/giris`, `(public)/kayit`, `(public)/koc-kayit`: Login and invitation-based registration
  - `api/`: REST API endpoints and cron jobs
- `koc-paneli/src/components/`: Role and domain-scoped React components
  - `coach/`: Coach portal views & student detail tabs
  - `student/`: Student portal views
  - `admin/`: Admin navigation, coach invitation and access management views
  - `public/`: Marketing / landing page components
  - `layout/`: Sidebars and public header
  - `ui/`: Core design primitives
- `koc-paneli/src/lib/`: Backend queries, mutations, actions, utilities
  - `coach/`: Coach server queries, client helpers, actions
  - `student/`: Student server queries, client helpers, actions
  - `admin/`: Admin authorization, coach queries, invitations and access actions
  - `cloudflare/`: `d1.ts` (DB Client), `storage.ts` (R2 Client)
  - `auth-client.ts`: Better Auth client instance
  - `email/`: Resend email integration and templates
  - `utils/`: Common formatting and cn utility
- `koc-paneli/src/proxy.ts`: Next.js 16 Proxy Middleware for route protection and role-based redirect

## Access Model
- Admin identity is an authenticated Better Auth user listed in `admins`; coach/student roles remain in `profiles`.
- Admin creates a time-limited coach invitation. Acceptance creates the coach profile and its `coach_access` period.
- Coach access requires an active `coach_access` row within its start/end dates.
- Student access requires both an active `coach_students` relationship and an active account for the related coach.
- Expired users retain their data but are routed to `/coach/uyelik` or `/student/uyelik` instead of protected portal content.

## Cloudflare Infrastructure (Production)
- `cloudflare/`: Cloudflare Workers + D1 + R2 altyapısı
  - `src/index.ts`: Hono-based Worker entry point (API, Storage, DB, Auth)
  - `src/routes/`: health, storage, migration, auth, db API routes
  - `src/auth.ts`: Better Auth Worker config
  - `d1/migrations/`: SQLite-compatible D1 schema ve Better Auth tabloları
  - `wrangler.toml`: Worker, D1, R2 configuration
