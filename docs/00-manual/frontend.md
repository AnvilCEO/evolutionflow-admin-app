# Frontend Manual

## Scope
- Next.js App Router page and component development in this repository.
- Includes `src/app`, `src/components`, `src/assets`, `public`, `next.config.ts`.

## Start Rules
1. Parse user instruction with `docs/00-manual/INDEX.md`.
2. Load only this chapter first.
3. Load `docs/00-manual/security.md` together when auth, upload, or external input is included.
4. Check route-to-device mapping first in `docs/02-design/FIGMA_ROUTE_MAPPING_BY_DEVICE.md`.
5. Frontend tasks are Figma-first by default in this project.
6. If Figma information is missing or inconsistent, ask clarifying questions before implementation.
7. Load detailed references only when needed (Progressive Disclosure).

## Figma-Driven Workflow (Mandatory)
1. Receive Figma link and target node/frame (`node-id`) first.
2. Use Figma MCP to collect design context and screenshot for the exact node variant.
3. Download required assets (images, logos, icons, comments/notes) with MCP when needed.
4. Capture and store reference screenshot(s) for implementation baseline.
5. Implement UI in current project conventions (existing components/tokens/typography first).
6. Compare implementation against captured Figma reference, then request feedback.
7. Apply feedback iteratively until visual and behavior parity is accepted.

## Clarification Gate (Ask Before Coding)
1. Exact Figma URL and `node-id`/frame id.
2. Target device scope (PC/Tablet/Mobile) and priority breakpoint.
3. Scope of implementation (full page, section, or component only).
4. Expected behavior details (interaction, animation, hover, state changes).
5. Asset source priority and unresolved comments (if any).

## Core Rules
1. Package manager must be `yarn` only.
2. Keep TypeScript strict: no `any`, no unsafe casts without reason.
3. Route entry files use `page.tsx`; shared UI should follow existing component patterns.
4. Client-side only logic must use `"use client"` and guard browser APIs when SSR is possible.
5. Prefer existing shared utilities/constants (`@/constants`, `cn()`).
6. Keep UI accessible: semantic HTML, labels, and `aria-label` for interactive controls.
7. Remove debug output before finish (`console.log` prohibited in production code).
8. Prefer existing design system and typography in this project unless a new direction is explicitly requested.
9. Do not start UI implementation from guesswork when Figma source is ambiguous.
10. If Figma data and screenshot disagree, raise questions and confirm source of truth.

## End-of-Task Auto Questions
1. Did I add or modify error handling for all changed async flows?
2. Did I avoid exposing secrets, tokens, or sensitive values in UI/log output?
3. Did I remove debug logs and temporary placeholders?
4. Did I run required checks (`yarn lint`, `yarn build`) or clearly report why not?
5. Did I verify responsive behavior on mobile/tablet/desktop for changed routes?
6. Did I validate implementation against Figma screenshot and node context?
7. Did I reflect latest feedback and report what changed?
8. Did I ask clarifying questions for any ambiguous or conflicting design details?

## Detailed References
- `docs/02-design/FIGMA_ROUTE_MAPPING_BY_DEVICE.md`
