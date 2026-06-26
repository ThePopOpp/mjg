import { NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { publishDuePosts, publishPost } from "@/lib/social-media/data";

function errStatus(m: string) {
  return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : /connected/i.test(m) ? 409 : 500;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await requireUserManager(request, body.actionToken);
    if (body.dueOnly) {
      const result = await publishDuePosts(Number(body.limit) || 25);
      return NextResponse.json({ ok: true, ...result });
    }
    if (!body.id) throw new Error("A post id is required.");
    const post = await publishPost(body.id);
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Publish failed.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
