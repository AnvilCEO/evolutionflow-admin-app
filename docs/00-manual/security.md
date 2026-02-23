# Security Manual

## Scope
- Security checks for frontend, API integration, and operational output.
- Mandatory for auth, uploads, personal data, admin pages, and external input handling.

## Start Rules
1. Load this chapter whenever request includes auth, user data, file upload, or admin logic.
2. Pair with domain chapter:
- UI changes: `docs/00-manual/frontend.md`
- API/auth changes: `docs/00-manual/backend.md`
- Data contract changes: `docs/00-manual/db.md`
3. Keep this file concise and use references for deeper details.

## Core Rules
1. Never commit secrets from `.env`, `.env.local`, tokens, or credentials.
2. Do not expose tokens, internal IDs, or stack traces in client-facing errors.
3. Validate all external input:
- Required fields, type checks, length/format checks, and safe defaults.
4. File upload hardening:
- Restrict accepted mime types and size.
- Do not trust client filename/content type blindly.
5. Auth/authorization:
- Check role gates for admin pages and privileged actions.
- Avoid client-side-only trust for authorization decisions.
6. Logging policy:
- No raw personal data in logs.
- Remove temporary debug logs before merge.
7. Error handling policy:
- Graceful user message + actionable internal trace path.

## End-of-Task Auto Questions
1. Did I leak any secret/token/PII in code, logs, or UI text?
2. Did I add input validation for all new external inputs?
3. Did I enforce role/permission checks on privileged flows?
4. Did I cover failure paths with safe error messages?
5. Did I run security-relevant checks (`lint/build/manual auth-flow verification`)?

## Detailed References
- `src/lib/api/client.ts`
- `src/contexts/AuthContext.tsx`
