# High-Level Implementation Prompt — MJG Frontend Editor

Use the specification located at:

`docs/frontend-editor/frontend-editor.md`

Build and integrate the **MJG Frontend Editor** into the existing Michael J. Gauthier Next.js web application and dashboard.

The goal is to allow Mike Gauthier, as the company owner, to manage the public-facing MJG website directly from the dashboard using both a visual/manual editor and **Steward (Hermes AI)**. Steward must be able to safely create, edit, archive/delete, restore, preview, and publish frontend pages and page content through controlled server-side tools rather than unrestricted source-code access.

Follow the architecture, permissions, structured page/block model, Supabase schema direction, component registry, version history, change-set workflow, preview/publish workflow, audit logging, navigation management, SEO management, media management, protected routes, and Steward AI guardrails defined in `docs/frontend-editor/frontend-editor.md`.

Key implementation requirements:

- Keep the existing Next.js application architecture and design system intact.
- Use React, TypeScript, Tailwind CSS, and shadcn/ui patterns already used in the project.
- Use Supabase for persistent page/content/version/audit data where appropriate.
- Render editable marketing pages through a schema-backed component/block registry.
- Keep functional/system routes code-owned and protected.
- Add a Website / Frontend Editor area to the MJG dashboard.
- Give Mike an owner-friendly page manager, live responsive preview, section/block editor, SEO controls, navigation controls, media access, version history, and publish controls.
- Integrate Steward as a page-management agent that first reads the current state, proposes a validated change set, applies changes to a draft, and allows preview before publishing.
- Every Steward and manual change must be auditable and reversible.
- Default Steward to draft-first behavior; do not allow silent destructive production edits.
- Do not expose unrestricted SQL, shell commands, environment variables, secrets, or arbitrary file/repository writes to the owner-facing Steward workflow.
- Reuse the existing MJG authentication, roles, user-management patterns, UI conventions, and dashboard layout where possible.
- Preserve responsive behavior, accessibility, SEO, security, and performance.
- Use Next.js cache/path revalidation when publishing.
- Build the feature so additional approved frontend components can be registered later without redesigning the editor.

Treat `docs/frontend-editor/frontend-editor.md` as the source of truth for this feature. Review it completely before making architectural or implementation decisions. If the existing codebase differs from an example in the document, adapt the implementation to the current project while preserving the feature behavior and safety model described in the specification.
