# Feature Map

| Feature | App Route | UI Components | Backend (Queries & Actions) |
|---|---|---|---|
| **Coach Dashboard** | `app/(coach)/coach/dashboard` | `components/coach/` (`dashboard-stats.tsx`, `upcoming-appointments.tsx`, `top-students.tsx`, `activity-feed.tsx`, `quick-actions.tsx`) | `lib/coach/dashboard.server.ts` |
| **Coach Students List** | `app/(coach)/coach/ogrenciler` | `components/coach/students-client.tsx`, `student-list.tsx`, `students/invite-student-modal.tsx` | `lib/coach/students.server.ts`, `lib/coach/invite.server.ts`, `lib/coach/invite-actions.ts` |
| **Coach Student Detail** | `app/(coach)/coach/ogrenciler/[id]` | `components/coach/student/` (`student-detail-tabs.tsx`, `profile-tab.tsx`, `profile/`, `progress-tab.tsx`, `progress-chart.tsx`, `reports-tab.tsx`, `reports/`, `programs/`) | `lib/coach/` (`students.server.ts`, `progress.server.ts`, `onboarding.server.ts`, `programs.server.ts`, `report-actions.ts`, `program-actions.ts`) |
| **Coach Calendar** | `app/(coach)/coach/takvim` | `components/coach/calendar/` (`calendar-layout.tsx`, `calendar-view.tsx`, `calendar-sidebar.tsx`, `event-modal.tsx`) | `lib/coach/calendar.server.ts`, `lib/coach/calendar.client.ts` |
| **Coach Messages** | `app/(coach)/coach/mesajlar` | `components/coach/messages/` (`message-layout.tsx`, `chat-area.tsx`, `student-list.tsx`) | `lib/coach/messages.server.ts`, `lib/coach/messages.client.ts` |
| **Coach Settings** | `app/(coach)/coach/ayarlar` | `components/coach/settings/` (`settings-layout.tsx`, `profile-tab.tsx`, `website-tab.tsx`, `notifications-tab.tsx`) | `lib/coach/settings.server.ts`, `lib/coach/settings.client.ts` |
| **Student Dashboard** | `app/(student)/student/dashboard` | `components/student/dashboard-client.tsx` | `lib/student/dashboard.server.ts` |
| **Student Onboarding** | `app/(student)/student/onboarding` | `components/student/onboarding-client.tsx`, `components/student/onboarding/` | `lib/student/onboarding.server.ts`, `lib/student/onboarding-actions.ts` |
| **Student Progress** | `app/(student)/student/ilerleme` | `components/student/progress-client.tsx`, `components/student/progress/` | `lib/student/progress.server.ts`, `lib/student/progress.client.ts`, `lib/student/progress-actions.ts` |
| **Student Programs** | `app/(student)/student/programlar` | `components/student/programs-client.tsx` | `lib/student/programs.server.ts` |
| **Student Calendar** | `app/(student)/student/takvim` | `components/student/calendar-client.tsx` | `lib/student/calendar.server.ts` |
| **Student Messages** | `app/(student)/student/mesajlar` | `components/student/messages-client.tsx` | `lib/student/messages.server.ts`, `lib/student/messages.client.ts` |
| **Student Profile** | `app/(student)/student/profil` | `components/coach/student/profile-tab.tsx` (reused with isEditable) | `lib/coach/onboarding.server.ts` |
| **Student Reports** | `app/(student)/student/raporlar` | `components/student/reports-client.tsx` | `lib/coach/report-actions.ts` |
| **Public Landing** | `app/(public)/page.tsx` | `components/public/` (`hero-section.tsx`, `about-section.tsx`, `packages-section.tsx`, `testimonials-section.tsx`, `footer-section.tsx`) | `lib/public/landing.ts`, `app/api/public/packages/route.ts` |
| **Auth** | `app/giris`, `app/kayit` | `components/auth/` (`login-form.tsx`, `register-form.tsx`) | `lib/auth/register-actions.ts`, `lib/auth-client.ts`, `src/proxy.ts` |
| **Admin Dashboard** | `app/(admin)/admin/dashboard` | `components/admin/admin-sidebar.tsx` | `lib/admin/admin.server.ts`, `lib/admin/auth.ts` |
| **Admin Coach Management** | `app/(admin)/admin/koclar`, `app/(admin)/admin/koclar/[id]` | `components/admin/coach-invite-form.tsx`, `status-badge.tsx` | `lib/admin/admin.server.ts`, `lib/admin/admin-actions.ts` |
| **Coach Invitation Registration** | `app/(public)/koc-kayit` | `components/auth/coach-register-form.tsx` | `lib/admin/coach-invite.server.ts`, `lib/auth/coach-register-actions.ts` |
| **Membership Expiry Screens** | `app/(coach)/coach/uyelik`, `app/(student)/student/uyelik` | Route-local status views | `src/proxy.ts`, `lib/coach/auth.ts`, `lib/student/auth.ts` |
