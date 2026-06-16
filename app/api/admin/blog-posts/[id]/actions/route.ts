import { NextResponse } from "next/server";
import { convertPostToEmailTemplate, updateBlogPostStatus, type BlogPostStatus } from "@/lib/content/blog";
import { requireContentManager } from "@/lib/user-management/auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const actor = await requireContentManager(request, body.actionToken);
    const action = String(body.action ?? "");

    if (action === "convert_to_email") {
      const template = await convertPostToEmailTemplate({ id, actorUserId: actor.id });
      return NextResponse.json({ ok: true, template });
    }

    if (["draft", "scheduled", "published", "hidden", "archived", "deleted"].includes(action)) {
      const post = await updateBlogPostStatus({ id, status: action as BlogPostStatus, actorUserId: actor.id });
      return NextResponse.json({ ok: true, post });
    }

    return NextResponse.json({ error: "Unknown blog post action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blog post action failed.";
    const status = message.includes("Authentication required") ? 401 : message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
