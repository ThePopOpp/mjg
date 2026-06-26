import { NextRequest, NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { createPost, listPosts } from "@/lib/social-media/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function GET(request: NextRequest) {
  try {
    await requireUserManager(request);
    const status = request.nextUrl.searchParams.get("status") || undefined;
    return NextResponse.json({ posts: await listPosts({ status }) });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load posts.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireUserManager(request, body.actionToken);
    if (!body.platform) throw new Error("A platform is required.");
    const post = await createPost({
      template_id: body.template_id ?? null, account_id: body.account_id ?? null, platform: body.platform,
      body_text: body.body_text ?? "", media_urls: body.media_urls ?? [], hashtags: body.hashtags ?? [],
      link_url: body.link_url ?? null, scheduled_at: body.scheduled_at ?? null, status: body.status,
      merge_data: body.merge_data ?? {}, actorUserId: actor.id,
    });
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to create post.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
