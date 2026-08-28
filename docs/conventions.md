# Code Conventions

- **Naming:**
  - Files & folders: kebab-case (e.g. `reports-tab.tsx`, `progress-chart-views.tsx`)
  - Server query modules: `*.server.ts`
  - Client helper modules: `*.client.ts`
  - Server actions: `*-actions.ts`
- **Imports:** Always use `@/` alias mapped to `koc-paneli/src/`
- **Single Responsibility:** Keep UI components under ~250 lines; extract complex form sections, SVG/PDF templates, and sub-views to dedicated subdirectories (`components/{domain}/{feature}/`).
- **Data Mutations:** Mutate data via Server Actions (`'use server'`) or Supabase client in client hooks.
- **Type Safety:** Shared database types in `@/types/database`, domain models in `lib/{role}/types.ts`.
