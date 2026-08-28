# Frontend Guide

## UI System
- **Styling:** Tailwind CSS with modern Linear + Stripe + Apple premium SaaS theme (Light gray canvas `#F8F9FB`, crisp white cards `#FFFFFF`, cobalt blue accent `#0066FF`, slate typography `#0F172A`).
- **Icons:** `lucide-react`.
- **Charts:** `recharts`.
- **State/Fetching:** SWR for client fetching, React Server Components (RSC) for initial page loads, Server Actions for mutations.

## Component Layout
- Coach components: `koc-paneli/src/components/coach/`
  - Student details: `koc-paneli/src/components/coach/student/`
  - Reports: `koc-paneli/src/components/coach/student/reports/`
  - Profile: `koc-paneli/src/components/coach/student/profile/`
  - Programs: `koc-paneli/src/components/coach/student/programs/`
- Student components: `koc-paneli/src/components/student/`
  - Onboarding: `koc-paneli/src/components/student/onboarding/`
  - Progress: `koc-paneli/src/components/student/progress/`
- UI Base Primitives: `koc-paneli/src/components/ui/`
- Navigation/Sidebar: `koc-paneli/src/components/layout/`
