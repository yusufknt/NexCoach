# Architecture

Next.js 16 (Turbopack, App Router) + Cloudflare Workers (D1, R2) + Better Auth fitcoach platform.

## Directory Structure
- `koc-paneli/src/app/`: Next.js App Router pages and API routes
  - `(public)/`: Landing, marketing, packages
  - `(coach)/`: Coach portal (`/coach/*`)
  - `(student)/`: Student portal (`/student/*`)
  - `auth/`: Login, register
  - `api/`: REST API endpoints and cron jobs
- `koc-paneli/src/components/`: Role and domain-scoped React components
  - `coach/`: Coach portal views & student detail tabs
  - `student/`: Student portal views
  - `public/`: Marketing / landing page components
  - `layout/`: Sidebars and public header
  - `ui/`: Core design primitives
- `koc-paneli/src/lib/`: Backend queries, mutations, actions, utilities
  - `coach/`: Coach server queries, client helpers, actions
  - `student/`: Student server queries, client helpers, actions
  - `cloudflare/`: `d1.ts` (DB Client), `storage.ts` (R2 Client)
  - `auth-client.ts`: Better Auth client instance
  - `email/`: Resend email integration and templates
  - `utils/`: Common formatting and cn utility
- `koc-paneli/src/proxy.ts`: Next.js 16 Proxy Middleware for route protection and role-based redirect

## Cloudflare Infrastructure (Production)
- `cloudflare/`: Cloudflare Workers + D1 + R2 altyapısı
  - `src/index.ts`: Hono-based Worker entry point (API, Storage, DB, Auth)
  - `src/routes/`: health, storage, migration, auth, db API routes
  - `src/auth.ts`: Better Auth Worker config
  - `d1/migrations/`: SQLite-compatible D1 schema ve Better Auth tabloları
  - `wrangler.toml`: Worker, D1, R2 configuration
