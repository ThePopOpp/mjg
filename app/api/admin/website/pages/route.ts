import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import { createPage, listPages } from "@/lib/website/data";
import type { WebsitePageStatus, WebsitePageType } from "@/lib/website/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireWebsiteActor(request);
    const url = new URL(request.url);
    const pages = await listPages({
      status: (url.searchParams.get("status") as WebsitePageStatus | "all") ?? undefined,
      pageType: (url.searchParams.get("pageType") as WebsitePageType | "all") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      includeDeleted: url.searchParams.get("includeDeleted") === "1",
    });
    return NextResponse.json({ pages });
  } catch (error) {
    return fail(error, "Could not load the website pages.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    const page = await createPage({
      title: body.title,
      slug: body.slug,
      page_type: body.page_type,
      template: body.template,
      seo_title: body.seo_title,
      seo_description: body.seo_description,
      navigation_visibility: body.navigation_visibility,
      navigation_label: body.navigation_label,
      actorId: actor.id,
    });
    return NextResponse.json({ page });
  } catch (error) {
    return fail(error, "Could not create the page.");
  }
}
