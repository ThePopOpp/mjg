import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import { createNavItem, deleteNavItem, listNavigation, reorderNavigation, updateNavItem } from "@/lib/website/site";
import { listPages } from "@/lib/website/data";
import type { NavigationGroup } from "@/lib/website/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireWebsiteActor(request);
    const group = new URL(request.url).searchParams.get("group") as NavigationGroup | null;
    const [items, pages] = await Promise.all([listNavigation(group ?? undefined), listPages({ includeDeleted: false })]);
    return NextResponse.json({
      items,
      // The "link to a page" picker only ever offers real, non-archived pages.
      pages: pages
        .filter((p) => p.status !== "archived")
        .map((p) => ({ id: p.id, title: p.title, slug: p.slug, status: p.status })),
    });
  } catch (error) {
    return fail(error, "Could not load the navigation.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    if (body.op === "reorder") {
      await reorderNavigation(body.group as NavigationGroup, body.items ?? [], { actorId: actor.id });
      return NextResponse.json({ items: await listNavigation(body.group) });
    }
    return NextResponse.json({ item: await createNavItem({ ...body, actorId: actor.id }) });
  } catch (error) {
    return fail(error, "Could not update the navigation.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    return NextResponse.json({ item: await updateNavItem(String(body.id), { ...body, actorId: actor.id }) });
  } catch (error) {
    return fail(error, "Could not update that navigation item.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    await deleteNavItem(String(body.id), { actorId: actor.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error, "Could not remove that navigation item.");
  }
}
