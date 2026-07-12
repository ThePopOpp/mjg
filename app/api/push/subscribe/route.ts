import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireActiveProfile } from "@/lib/user-management/auth";

// Save (POST) or remove (DELETE) a web-push subscription for the current user.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const me = await requireActiveProfile(request, body.actionToken);
    const sub = body.subscription;
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
    }
    const supabase = createSupabaseAdminClient();
    await supabase.from("push_subscriptions").upsert(
      {
        user_id: me.id,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to subscribe.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication required") ? 401 : 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    const url = new URL(request.url);
    const endpoint = url.searchParams.get("endpoint");
    const supabase = createSupabaseAdminClient();
    let query = supabase.from("push_subscriptions").delete().eq("user_id", me.id);
    if (endpoint) query = query.eq("endpoint", endpoint);
    await query;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to unsubscribe.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication required") ? 401 : 400 });
  }
}
