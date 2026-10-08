// Overrides eve's default HTTP channel for Steward.
//
// Authoring this file at `agent/channels/eve.ts` replaces eve's built-in default,
// which is:
//
//   eveChannel({ auth: [vercelOidc(), localDev(), placeholderAuth()] })
//
// On a Coolify container none of those three authenticate anything —
// `vercelOidc()` finds no Vercel token, `localDev()` requires EVE_DEV=1, and
// `placeholderAuth()` only throws when VERCEL_ENV === "production", which is
// unset here, so it returns null. The walk exhausts and eve 401s. That default is
// fail-closed, but only incidentally, and it would start authenticating if this
// ever ran on Vercel. Steward needs its boundary stated outright.
//
// The walk below has exactly one entry. There is no `none()` and no
// `localDev()`:
//
//   - `none()` would make Steward reachable anonymously. Member conversations
//     are private per-member content; there is no anonymous mode.
//   - `localDev()` authenticates one shared synthetic principal under `eve dev`.
//     That is convenient and actively harmful here: with every local session
//     sharing a principalId, cross-member isolation bugs cannot surface in
//     development. Local testing uses a real token instead.

import { eveChannel } from "eve/channels/eve";
import { supabasePrincipal } from "../lib/supabase-principal.ts";

export default eveChannel({
  auth: [supabasePrincipal()],
});
