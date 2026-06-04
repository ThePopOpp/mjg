import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const authUser = supabase ? await supabase.auth.getUser() : null;
  let matchedProfile = null;
  let profileError = null;

  try {
    const admin = createSupabaseAdminClient();
    const email = authUser?.data.user?.email;
    if (email) {
      const result = await admin
        .from("profiles")
        .select("id,auth_user_id,email,role,status,full_name")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();
      matchedProfile = result.data;
      profileError = result.error?.message ?? null;
    }
  } catch (error) {
    profileError = error instanceof Error ? error.message : "Profile debug lookup failed.";
  }

  return NextResponse.json({
    env: {
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasAnonOrPublishableKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    },
    auth: {
      email: authUser?.data.user?.email ?? null,
      id: authUser?.data.user?.id ?? null,
      error: authUser?.error?.message ?? null,
    },
    currentProfile: profile,
    matchedProfile,
    profileError,
  });
}
