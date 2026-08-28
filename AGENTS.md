# Agent Guidelines for NexCoach

## 15 Core Rules for Minimum Token & High Accuracy

1. **Do NOT scan the entire repository.**
2. **First classify the task.**
3. **Read ONLY the relevant MD file(s) from `docs/`.**
4. **Use exact paths from docs to navigate directly to code.**
5. **Narrow down targets using search / import / reference lookup before opening files.**
6. **Open ONLY the necessary code files.**
7. **Do NOT read unrelated files.**
8. **Do NOT perform unrelated refactoring.**
9. **Make the smallest safe change.**
10. **Create new abstractions / files ONLY when strictly necessary.**
11. **Reuse existing helpers / components instead of recreating them.**
12. **Run only relevant tests / builds.**
13. **Update the corresponding doc in `docs/` briefly if architecture or feature paths change.**
14. **Do NOT read all docs files on every task.**
15. **Do NOT bloat `docs/current-state.md` with task logs.**

---

## Task Routing Table

| Task Type | Read Document | Target Code Paths |
|---|---|---|
| **Feature Placement / Path Lookup** | `docs/features.md` | Maps any feature to exact route, component & lib files |
| **Architecture / App Structure** | `docs/architecture.md` | `koc-paneli/src/app/`, `koc-paneli/src/lib/` |
| **UI / Styling / Visual Component** | `docs/frontend.md` | `koc-paneli/src/components/`, `src/app/globals.css` |
| **Data Fetching / Server Action / API** | `docs/backend.md` | `koc-paneli/src/lib/`, `koc-paneli/src/app/api/` |
| **Database / Schema / Migration** | `docs/database.md` | `cloudflare/d1/migrations/`, `src/types/database.ts` |
| **Auth / Permissions / Routing Guard** | `docs/auth.md` | `koc-paneli/src/proxy.ts`, `src/lib/auth.ts`, `src/lib/auth-client.ts` |
| **Coding Style / File Naming** | `docs/conventions.md` | Follow naming & single-responsibility standards |
| **Project Status** | `docs/current-state.md` | High-level status overview |
