import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertProfile } from "@/lib/user-management/repository";
import { ROLES, type AppRole } from "@/lib/rbac/roles";

/**
 * Roles a member of the public may claim for themselves at registration.
 *
 * SECURITY: this allowlist is the whole boundary. The signup endpoint is unauthenticated, so
 * the role must never be taken from the request body without passing through here — otherwise
 * anyone could POST `role: "super_admin"`. Only ever add self-service roles to this list.
 */
export const SELF_SERVE_ROLES = [ROLES.PARTICIPANT, ROLES.FACILITATOR] as const;
export type SelfServeRole = (typeof SELF_SERVE_ROLES)[number];

export function isSelfServeRole(role: unknown): role is SelfServeRole {
  return typeof role === "string" && (SELF_SERVE_ROLES as readonly string[]).includes(role);
}

export type SelfRegisterInput = {
  role: unknown;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  // Facilitator-only context, stored on the profile for the admin follow-up.
  groupName?: string;
  churchOrOrg?: string;
};

export type SelfRegisterResult = {
  email: string;
  role: AppRole;
  /** True when the account still needs a Super Admin to grant challenge access. */
  needsChallengeAccess: boolean;
};

export async function registerSelfServeAccount(input: SelfRegisterInput): Promise<SelfRegisterResult> {
  if (!isSelfServeRole(input.role)) {
    throw new Error("Choose either Participant or Facilitator to continue.");
  }
  const role: SelfServeRole = input.role;

  const email = (input.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email address.");

  const firstName = (input.firstName ?? "").trim();
  const lastName = (input.lastName ?? "").trim();
  if (!firstName) throw new Error("First name is required.");
  if (!lastName) throw new Error("Last name is required.");
  if (!input.password || input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const supabase = createSupabaseAdminClient();

  // Don't let signup be used to probe which emails already have accounts, and don't let it
  // silently clobber an existing profile's role — an existing admin must not be able to
  // demote/escalate themselves by re-registering.
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    throw new Error("An account already exists for that email. Try signing in instead.");
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    phone: input.phone || undefined,
    user_metadata: { first_name: firstName, last_name: lastName, signup_source: "public_registration" },
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error("Account could not be created. Please try again.");

  // Facilitator context goes into profiles.notes so an admin has something to act on when
  // deciding whether to grant challenge access.
  const facilitatorContext =
    role === ROLES.FACILITATOR
      ? [
          (input.groupName ?? "").trim() ? `Group: ${(input.groupName ?? "").trim()}` : "",
          (input.churchOrOrg ?? "").trim() ? `Church/Org: ${(input.churchOrOrg ?? "").trim()}` : "",
          "Self-registered as Facilitator via the public site.",
        ]
          .filter(Boolean)
          .join(" · ")
      : undefined;

  try {
    await upsertProfile({
      authUserId: authData.user.id,
      firstName,
      lastName,
      email,
      phone: input.phone || undefined,
      role,
      status: "active",
      notes: facilitatorContext,
    });
  } catch (error) {
    // Never leave an orphaned auth user behind if the profile write fails — otherwise the
    // email is taken but unusable and the person can't retry.
    await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});
    throw error;
  }

  return {
    email,
    role,
    // Facilitators can sign in immediately, but launching a challenge still requires a Super
    // Admin to grant facilitator_challenge_access (see lib/facilitator/experiences.ts).
    needsChallengeAccess: role === ROLES.FACILITATOR,
  };
}
