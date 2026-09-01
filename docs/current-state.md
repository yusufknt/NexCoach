# Current Project State

- **Platform:** Next.js 16.2.6 (App Router + Turbopack)
- **Database:** Cloudflare D1 (SQLite) with 4 R2 Storage Buckets
- **Authentication:** Better Auth (Running on Cloudflare Worker)
- **Key Modules:**
  - Coach Portal: Dashboard, Students, Details (Profile/Progress/Reports/Programs), Calendar, Messages, Settings
  - Student Portal: Onboarding Wizard, Dashboard, Progress Tracker, Programs, Calendar, Messages, Reports
  - Admin Portal: Platform metrics, coach invitations, coach/student relationship visibility, manual access periods and suspension
  - Public Landing: Responsive hero, testimonials, pricing packages
- **Access Lifecycle:** Admins invite coaches with single-use links; coach and student portal access is enforced from D1 membership dates/status without deleting historical data.
- **Status:** Cloudflare migration is 100% complete. Admin migration `0004` is ready for remote application; application type-check, targeted lint and production webpack build pass.

**Deployment Requirement:** Apply remote D1 migrations and bootstrap the first admin before deploying the admin-enabled frontend.
