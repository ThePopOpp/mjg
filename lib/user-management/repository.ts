import crypto from "node:crypto";
import { sendTemplateForEvent } from "@/lib/email/templates";
import { ROLES, type AppRole, isAppRole } from "@/lib/rbac/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { USER_STATUSES, type UserStatus } from "@/lib/user-management/constants";

export async function getUserManagementData() {
  try {
    const supabase = createSupabaseAdminClient();
    const [profiles, invitations, activity, preferences, links, submissions, notifications] = await Promise.all([
      supabase
        .from("profiles")
        .select("*, participants:related_participant_id(id,first_name,last_name,email,phone,wave,participant_type)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("user_invitations").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("user_activity_logs").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("user_preferences").select("*").order("updated_at", { ascending: false }).limit(100),
      supabase
        .from("participant_user_links")
        .select("*, participants(id,first_name,last_name,email), user:profiles!participant_user_links_user_id_fkey(id,full_name,email)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("form_submissions").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100),
    ]);

    return {
      profiles: profiles.data ?? [],
      invitations: invitations.data ?? [],
      activity: activity.data ?? [],
      preferences: preferences.data ?? [],
      links: links.data ?? [],
      submissions: submissions.data ?? [],
      notifications: notifications.data ?? [],
      error:
        profiles.error?.message ??
        invitations.error?.message ??
        activity.error?.message ??
        preferences.error?.message ??
        links.error?.message ??
        submissions.error?.message ??
        notifications.error?.message ??
        null,
    };
  } catch (error) {
    return {
      profiles: [],
      invitations: [],
      activity: [],
      preferences: [],
      links: [],
      submissions: [],
      notifications: [],
      error: error instanceof Error ? error.message : "Unable to load user management data.",
    };
  }
}

export async function createUserInvitation(input: {
  email?: string;
  phone?: string;
  role: AppRole;
  inviteMethod: "email" | "sms" | "manual";
  invitedBy?: string;
  siteUrl?: string;
}) {
  if (!input.email && !input.phone) {
    throw new Error("Email or phone is required.");
  }
  if (!isAppRole(input.role)) {
    throw new Error("Invalid role.");
  }

  const supabase = createSupabaseAdminClient();
  const inviteToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const { data: invitation, error } = await supabase
    .from("user_invitations")
    .insert({
      email: input.email?.trim().toLowerCase() ?? null,
      phone: input.phone?.trim() ?? null,
      role: input.role,
      invited_by: input.invitedBy ?? null,
      invite_method: input.inviteMethod,
      invite_status: "pending",
      invite_token: inviteToken,
      sent_at: null,
      expires_at: expiresAt.toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;

  if (input.email && input.inviteMethod === "email") {
    const inviteUrl = `${input.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? ""}/accept-invite?token=${inviteToken}`;
    try {
      const emailResult = await sendTemplateForEvent({
        eventKey: "user_invitation",
        actorUserId: input.invitedBy,
        recipient: {
          email: input.email,
          phone: input.phone,
          role: input.role,
          status: "invited",
          merge_data: { invite_url: inviteUrl },
        },
        fallback: {
          subject: "You have been invited to the MJG Dashboard",
          html: `<p>You have been invited to the MJG Dashboard.</p><p><a href="{{invite_url}}">Accept your invitation</a></p>`,
          text: `You have been invited to the MJG Dashboard. Accept your invitation: {{invite_url}}`,
        },
      });

      await supabase
        .from("user_invitations")
        .update({
          invite_status: emailResult.skipped ? "pending" : "sent",
          sent_at: emailResult.skipped ? null : new Date().toISOString(),
          metadata: {
            ...(invitation.metadata ?? {}),
            inviteUrl,
            emailSkipped: emailResult.skipped,
            emailReason: emailResult.reason ?? null,
            providerMessageId: emailResult.messageId ?? null,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "SMTP send failed.";
      await supabase
        .from("user_invitations")
        .update({
          invite_status: "failed",
          metadata: { ...(invitation.metadata ?? {}), inviteUrl, emailError: message },
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);
      throw new Error(`Invitation was saved, but email failed: ${message}`);
    }
  } else {
    const inviteUrl = `${input.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? ""}/accept-invite?token=${inviteToken}`;
    await supabase
      .from("user_invitations")
      .update({
        metadata: { ...(invitation.metadata ?? {}), inviteUrl },
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);
  }

  await logUserActivity({
    actorUserId: input.invitedBy,
    action: "user_invited",
    entityType: "user_invitations",
    entityId: invitation.id,
    metadata: { email: input.email, phone: input.phone, role: input.role, inviteMethod: input.inviteMethod },
  });

  await supabase.from("notifications").insert({
    type: input.inviteMethod === "sms" ? "user_invited_by_sms" : "user_invited_by_email",
    title: "User invited",
    message: `A ${input.role} invitation was created for ${input.email ?? input.phone}.`,
    destination: "dashboard",
    status: "queued",
    actor_user_id: input.invitedBy ?? null,
    metadata: { invitationId: invitation.id },
  });

  return invitation;
}

export async function acceptUserInvitation(input: {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
}) {
  if (!input.token) throw new Error("Invitation token is required.");
  if (!input.password || input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: invitation, error: invitationError } = await supabase
    .from("user_invitations")
    .select("*")
    .eq("invite_token", input.token)
    .maybeSingle();

  if (invitationError) throw invitationError;
  if (!invitation) throw new Error("Invitation not found.");
  if (invitation.invite_status === "accepted") throw new Error("Invitation has already been accepted.");
  if (invitation.invite_status === "revoked") throw new Error("Invitation has been revoked.");
  if (invitation.expires_at && new Date(invitation.expires_at).getTime() < Date.now()) {
    await supabase
      .from("user_invitations")
      .update({ invite_status: "expired", updated_at: new Date().toISOString() })
      .eq("id", invitation.id);
    throw new Error("Invitation has expired.");
  }
  if (!invitation.email) throw new Error("Email invitations are required for account setup.");
  if (!isAppRole(invitation.role)) throw new Error("Invitation role is invalid.");

  const email = invitation.email.trim().toLowerCase();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    phone: input.phone || invitation.phone || undefined,
    user_metadata: {
      first_name: input.firstName,
      last_name: input.lastName,
      invited_by: invitation.invited_by,
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Supabase Auth user could not be created.");

  const profile = await upsertProfile({
    authUserId: authData.user.id,
    firstName: input.firstName,
    lastName: input.lastName,
    email,
    phone: input.phone || invitation.phone || undefined,
    role: invitation.role,
    status: "active",
    invitedBy: invitation.invited_by ?? undefined,
    actorUserId: invitation.invited_by ?? undefined,
  });

  await supabase
    .from("user_invitations")
    .update({
      invite_status: "accepted",
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: { ...(invitation.metadata ?? {}), acceptedProfileId: profile.id },
    })
    .eq("id", invitation.id);

  await logUserActivity({
    userId: profile.id,
    actorUserId: invitation.invited_by ?? undefined,
    action: "invite_accepted",
    entityType: "user_invitations",
    entityId: invitation.id,
    metadata: { email, role: invitation.role },
  });

  await supabase.from("notifications").insert({
    type: "invite_accepted",
    title: "Invitation accepted",
    message: `${profile.full_name || email} accepted an MJG Dashboard invitation.`,
    destination: "dashboard",
    status: "queued",
    user_id: profile.id,
    actor_user_id: invitation.invited_by ?? null,
    metadata: { invitationId: invitation.id },
  });

  return { email, profile };
}

export async function getUserManagementProfile(id: string) {
  const supabase = createSupabaseAdminClient();
  const [profile, activity, links, submissions] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, participants:related_participant_id(id,first_name,last_name,email,phone,wave,participant_type)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("user_activity_logs")
      .select("*")
      .or(`user_id.eq.${id},actor_user_id.eq.${id}`)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("participant_user_links")
      .select("*, participants(id,first_name,last_name,email,phone,wave,participant_type)")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("form_submissions").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
  ]);

  return {
    profile: profile.data,
    activity: activity.data ?? [],
    links: links.data ?? [],
    submissions: submissions.data ?? [],
    error: profile.error?.message ?? activity.error?.message ?? links.error?.message ?? submissions.error?.message ?? null,
  };
}

export async function upsertProfile(input: {
  id?: string;
  authUserId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: AppRole;
  status: UserStatus;
  avatarUrl?: string;
  invitedBy?: string;
  relatedParticipantId?: string;
  notes?: string;
  actorUserId?: string;
  statusChangeReason?: string;
}) {
  if (!isAppRole(input.role)) throw new Error("Invalid role.");
  if (!USER_STATUSES.includes(input.status)) throw new Error("Invalid status.");

  const supabase = createSupabaseAdminClient();
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = input.id
    ? await supabase.from("profiles").select("id,role,status").eq("id", input.id).maybeSingle()
    : await supabase.from("profiles").select("id,role,status").eq("email", normalizedEmail).maybeSingle();

  const previous = existing.data;
  const profileId = input.id ?? input.authUserId;
  if (!profileId && !previous?.id) {
    throw new Error("A Supabase Auth user id is required to create a profile.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: previous?.id ?? profileId,
        auth_user_id: input.authUserId ?? previous?.id ?? profileId,
        first_name: input.firstName,
        last_name: input.lastName,
        full_name: fullName,
        email: normalizedEmail,
        phone: input.phone || null,
        role: input.role,
        status: input.status,
        avatar_url: input.avatarUrl || null,
        invited_by: input.invitedBy || null,
        related_participant_id: input.relatedParticipantId || null,
        notes: input.notes || null,
        status_changed_by: previous?.status !== input.status ? input.actorUserId ?? null : null,
        status_changed_at: previous?.status !== input.status ? new Date().toISOString() : null,
        status_change_reason: previous?.status !== input.status ? input.statusChangeReason ?? null : null,
        role_changed_by: previous?.role !== input.role ? input.actorUserId ?? null : null,
        role_changed_at: previous?.role !== input.role ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (error) throw error;

  if (previous?.role !== input.role) {
    await supabase.from("role_assignment_history").insert({
      user_id: profile.id,
      previous_role: previous?.role ?? null,
      new_role: input.role,
      changed_by: input.actorUserId ?? null,
    });
  }

  await logUserActivity({
    userId: profile.id,
    actorUserId: input.actorUserId,
    action: previous ? "user_edited" : "user_created",
    entityType: "profiles",
    entityId: profile.id,
    metadata: { role: input.role, status: input.status },
  });

  return profile;
}

export async function logUserActivity(input: {
  userId?: string;
  actorUserId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("user_activity_logs").insert({
    user_id: input.userId ?? null,
    actor_user_id: input.actorUserId ?? null,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
}
