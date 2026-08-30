# Current Project State

- **Platform:** Next.js 16.2.6 (App Router + Turbopack)
- **Database:** Cloudflare D1 (SQLite) with 4 R2 Storage Buckets
- **Authentication:** Better Auth (Running on Cloudflare Worker)
- **Key Modules:**
  - Coach Portal: Dashboard, Students, Details (Profile/Progress/Reports/Programs), Calendar, Messages, Settings
  - Student Portal: Onboarding Wizard, Dashboard, Progress Tracker, Programs, Calendar, Messages, Reports
  - Public Landing: Responsive hero, testimonials, pricing packages
- **Status:** Cloudflare migration is 100% complete. All large components modularized, duplicate feature trees eliminated, build clean.

**Son Güncelleme:** UI üzerinden (login-form.tsx) CORS 'Failed to fetch' hatası Hono Worker üzerinde `credentials: true` ve dinamik origin izinleriyle kalıcı olarak çözülmüştür.
