# Database Manual

## Scope
- Data model and persistence-impacting work related to this frontend project.
- Includes schema assumptions, query fields, filters, sorting, pagination, and migration coordination with backend repo.

## Start Rules
1. Parse instruction from `docs/00-manual/INDEX.md`.
2. Load this chapter when schema, query params, or response fields are changed.
3. Load `docs/00-manual/backend.md` with this chapter for API contract changes.
4. Load only necessary detailed references to keep context small.

## Core Rules
1. Treat schema changes as contract changes:
- Update frontend types and API mappers together.
- Record field-level assumptions explicitly.
2. Keep naming consistent across DB/API/frontend (snake_case to camelCase mapping must be explicit).
3. Ensure pagination/filter/sort parameters are deterministic and documented.
4. Nullability must be explicit:
- `null` vs `undefined` handling must be consistent in mapper code.
5. Time/date fields must include timezone assumptions.
6. Migration impacts must be reversible and communicated before deployment.
7. Avoid hidden coupling:
- Do not rely on undocumented enum values or magic strings.

## End-of-Task Auto Questions
1. Did I update all affected types/mappers when a field or enum changed?
2. Did I verify null/empty-state behavior for new or changed fields?
3. Did I confirm sort/filter/page params match backend expectations?
4. Did I clarify timezone/date format assumptions?

## Detailed References
- `src/lib/api/admin.ts`
