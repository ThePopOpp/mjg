// Shareable draft preview (spec §41). The token is a 32-byte random value stored
// server-side with an expiry, so the link is unguessable, expires on its own and
// can be revoked. It is never indexed.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DraftPreview } from "@/components/website/draft-preview";
import { getPage } from "@/lib/website/data";
import { resolvePreviewToken } from "@/lib/website/preview";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function SharedDraftPreview({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pageId = await resolvePreviewToken(token);
  if (!pageId) notFound();

  const page = await getPage(pageId);
  if (!page) notFound();

  return <DraftPreview page={page} />;
}
