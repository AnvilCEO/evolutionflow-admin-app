# Backend Integration Manual

## Scope
- Frontend-to-backend API integration work in this repository.
- Includes `src/lib/api/*`, auth context, request/response contracts, admin APIs.

## Start Rules
1. Parse instruction via `docs/00-manual/INDEX.md`.
2. Load this chapter for any API/auth/request work.
3. Load `docs/00-manual/security.md` when auth, file upload, or personally identifiable data is involved.
4. Keep this chapter as primary; read deeper docs only on demand.

## Core Rules
1. Keep API base path and endpoint path consistent (avoid duplicate prefixes like `/api/api/...`).
2. Handle payload type correctly:
- `FormData` requests must not be JSON-stringified.
- Set `Content-Type` carefully; let browser set multipart boundaries for `FormData`.
3. Centralize request logic in shared API client when possible.
4. Define explicit request/response types and keep them synced with backend contracts.
5. Fail predictably:
- Surface readable error messages.
- Handle non-OK responses with status-aware logic.
6. Auth token handling must follow existing context flow and sign-out invalidation behavior.
7. Do not hardcode environment values; use configured env variables only.

## End-of-Task Auto Questions
1. Did every changed endpoint match the backend contract and path convention?
2. Did I validate success and failure response handling for each changed API call?
3. Did I prevent token leakage in errors, logs, and UI?
4. Did I verify upload flows (`FormData`) actually send expected payload?

## Detailed References
- `src/lib/api/client.ts`
- `src/lib/api/admin.ts`
- `src/contexts/AuthContext.tsx`
