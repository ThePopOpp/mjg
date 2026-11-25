import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { allowed } from "@/lib/dashboard/overview/catalog";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";

// Records for the dashboard search (Ctrl/⌘ K). Features are matched in the browser
// from the nav; this returns people and records, each group only for roles that
// can open the page it links to.
export const dynamic = "force-dynamic";

type Hit = { id: string; group: string; title: string; subtitle?: string; href: string };

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "active") return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  // PostgREST filter syntax uses , ( ) : so keep the term to plain characters.
  const q = (new URL(request.url).searchParams.get("q") ?? "").replace(/[^\p{L}\p{N}@.\-' ]/gu, " ").trim().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const like = `%${q}%`;
  const db = createSupabaseAdminClient();
  const role = profile.role;
  const jobs: Promise<Hit[]>[] = [];
  const name = (f?: string | null, l?: string | null) => [f, l].filter(Boolean).join(" ").trim();

  if (allowed(role, "manager")) {
    jobs.push(
      (async (): Promise<Hit[]> => {
        const { data } = await db.from("participants").select("id, first_name, last_name, email").or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`).limit(6);
        return (data ?? []).map((p) => ({ id: `p-${p.id}`, group: "Participants", title: name(p.first_name, p.last_name) || p.email, subtitle: p.email, href: `/dashboard/participants/${p.id}` }));
      })(),
      (async (): Promise<Hit[]> => {
        const { data } = await db
          .from("contacts")
          .select("id, first_name, last_name, email, company, type")
          .is("deleted_at", null)
          .or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},company.ilike.${like}`)
          .limit(6);
        return (data ?? []).map((c) => ({
          id: `c-${c.id}`,
          group: c.type === "lead" ? "Leads" : "Contacts",
          title: name(c.first_name, c.last_name) || c.company || c.email,
          subtitle: [c.company, c.email].filter(Boolean).join(" · "),
          href: c.type === "lead" ? "/dashboard/contacts/leads" : "/dashboard/contacts",
        }));
      })(),
    );
  }
  if (can(role, PERMISSIONS.MANAGE_USERS)) {
    jobs.push(
      (async (): Promise<Hit[]> => {
        const { data } = await db.from("profiles").select("id, first_name, last_name, email, role").or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`).limit(6);
        return (data ?? []).map((u) => ({ id: `u-${u.id}`, group: "Users", title: name(u.first_name, u.last_name) || u.email, subtitle: `${u.email} · ${u.role}`, href: "/dashboard/user-management" }));
      })(),
    );
  }
  if (allowed(role, "staff")) {
    jobs.push(
      (async (): Promise<Hit[]> => {
        const { data } = await db
          .from("bookings")
          .select("id, invitee_name, invitee_email, reference, start_at")
          .is("deleted_at", null)
          .or(`invitee_name.ilike.${like},invitee_email.ilike.${like},reference.ilike.${like}`)
          .order("start_at", { ascending: false })
          .limit(5);
        return (data ?? []).map((b) => ({
          id: `b-${b.id}`,
          group: "Bookings",
          title: b.invitee_name,
          subtitle: `${new Date(b.start_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} · ${b.reference ?? ""}`,
          href: "/dashboard/bookings",
        }));
      })(),
    );
  }
  if (can(role, PERMISSIONS.REVIEW_CONTENT)) {
    jobs.push(
      (async (): Promise<Hit[]> => {
        const { data } = await db.from("blog_posts").select("id, title, status").is("deleted_at", null).ilike("title", like).limit(5);
        return (data ?? []).map((b) => ({ id: `bp-${b.id}`, group: "Blog Posts", title: b.title, subtitle: b.status, href: `/dashboard/blog-posts/${b.id}` }));
      })(),
    );
  }
  if (can(role, PERMISSIONS.MANAGE_WORKSPACE)) {
    jobs.push(
      (async (): Promise<Hit[]> => {
        const { data } = await db.from("workspace_documents").select("id, title").is("deleted_at", null).ilike("title", like).limit(5);
        return (data ?? []).map((d) => ({ id: `w-${d.id}`, group: "Workspace", title: d.title || "Untitled", href: `/dashboard/workspace/${d.id}` }));
      })(),
    );
  }

  const settled = await Promise.allSettled(jobs);
  const results = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  return NextResponse.json({ results });
}
