import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import { getPageOrThrow, saveDraft } from "@/lib/website/data";
import { addBlock, duplicateBlock, moveBlock, removeBlock, reorderBlocks, updateBlock } from "@/lib/website/blocks";

export const dynamic = "force-dynamic";

/**
 * Autosave. Writes the DRAFT only — the published snapshot is never touched here
 * (spec §40: "never autosave directly to published version").
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    const { page, issues } = await saveDraft(id, body.content, {
      actorId: actor.id,
      source: "manual",
      silent: body.silent !== false,
    });
    return NextResponse.json({ page, issues });
  } catch (error) {
    return fail(error, "Could not save the draft.");
  }
}

/**
 * One block operation (spec §12.2 website.blocks.*). Server-side so the same
 * rules apply whether the change came from a click or from Steward.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    const current = await getPageOrThrow(id);

    let next = current.draft_content;
    let blockId: string | undefined;

    switch (String(body.op)) {
      case "add": {
        const result = addBlock(next, { type: body.type, props: body.props, position: body.position, afterBlockId: body.afterBlockId });
        next = result.content;
        blockId = result.block.id;
        break;
      }
      case "update":
        next = updateBlock(next, String(body.blockId), { props: body.props, hidden: body.hidden });
        blockId = String(body.blockId);
        break;
      case "move":
        next = moveBlock(next, String(body.blockId), { position: body.position, direction: body.direction });
        blockId = String(body.blockId);
        break;
      case "duplicate": {
        const result = duplicateBlock(next, String(body.blockId));
        next = result.content;
        blockId = result.block.id;
        break;
      }
      case "remove":
        next = removeBlock(next, String(body.blockId));
        break;
      case "reorder":
        next = reorderBlocks(next, Array.isArray(body.orderedIds) ? body.orderedIds.map(String) : []);
        break;
      default:
        throw new Error("Unknown section operation.");
    }

    const { page, issues } = await saveDraft(id, next, { actorId: actor.id, source: "manual", silent: true });
    return NextResponse.json({ page, issues, blockId });
  } catch (error) {
    return fail(error, "Could not update that section.");
  }
}
