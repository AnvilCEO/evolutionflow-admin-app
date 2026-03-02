# Gap Detector Memory

## Project Structure
- Admin app: Next.js App Router, TypeScript
- Design docs: `docs/02-design/`
- Analysis output: `docs/03-qa/`
- Types: `src/types/`
- API functions: `src/lib/api/admin/`
- API routes: `src/app/api/admin/`
- UI pages: `src/app/admin/`

## Key Patterns
- Mock databases are duplicated across route files (studios has 3 copies)
- Presentation layer directly imports Infrastructure (no service/hook layer)
- Project follows Dynamic-level architecture (not strict Enterprise layering)
- COUNTRIES constant is imported directly from masterData in UI components
- Common components: AdminTable, StatusBadge, ActionMenu, LoadingSpinner

## Analysis: admin-studio-management (2026-03-02)
- Match Rate: 92% (PASSED, target 90%)
- Data Model: 97%, API: 95%, UI/UX: 88%, Architecture: 92%
- Key gaps: amenities checkbox UI, tab filter reset, status dropdown in edit form
- Report: `docs/03-qa/admin-studio-management.analysis.md`
