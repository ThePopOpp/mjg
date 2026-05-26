# Supabase User Management Plan

This project is currently a static HTML/PHP app, so the first Supabase integration should use the browser client for authentication and anon-key reads/writes protected by Row Level Security. If the app later moves to Next.js, the same project URL/key can be reused with `@supabase/ssr`.

## Priorities

- User accounts and dashboard sessions
- User profiles and household/client metadata
- Form submissions and intake results
- User requests, notes, and internal status tracking
- User communications across email, SMS, voice, and dashboard messages

## Suggested Tables

- `profiles`: one row per auth user with name, email, phone, role, status, avatar, timezone, and preferences.
- `form_submissions`: raw and normalized results from public forms such as long-term planning.
- `user_requests`: dashboard-visible requests with type, priority, status, assigned staff, and due dates.
- `message_threads`: conversation containers for user/staff communication.
- `messages`: individual messages tied to a thread, sender, channel, body, and read state.
- `communication_events`: outbound/inbound call, SMS, email, and voice-agent event log.
- `documents`: user-visible document metadata, linked to Supabase Storage objects.

## Access Model

- Regular users can read and update their own profile.
- Regular users can create form submissions and requests for themselves.
- Regular users can read their own requests, threads, messages, and documents.
- Staff/admin users can read and manage assigned or all user records depending on role.
- Service-role operations should stay server-side only and never be exposed in dashboard HTML.

## Next Implementation Step

Create migrations for the tables above, enable RLS, and add a simple auth gate to dashboard pages that redirects unauthenticated visitors to a sign-in page.
