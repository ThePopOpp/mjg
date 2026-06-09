import { NextResponse } from "next/server";
import { saveBlogPost } from "@/lib/content/blog";
import { requireContentManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    const actor = await requireContentManager(request);
    const body = await request.json();
    const post = await saveBlogPost({
      id: body.id,
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      contentHtml: body.contentHtml,
      contentText: body.contentText,
      authorName: body.authorName,
      category: body.category,
      tags: body.tags,
      featuredImageUrl: body.featuredImageUrl,
      galleryUrls: body.galleryUrls,
      videoUrl: body.videoUrl,
      status: body.status,
      publishAt: body.publishAt,
      actorUserId: actor.id,
    });

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blog post save failed.";
    const status = message.includes("Authentication required") ? 401 : message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
