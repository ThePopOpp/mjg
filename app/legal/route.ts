import { renderLegalIndexRoute } from "@/lib/public-site/legal";

// /legal — index of the published legal documents, plus the contact addresses
// the policies commit us to answering. Linked from the site footer.
export const dynamic = "force-dynamic";

export function GET() {
  return renderLegalIndexRoute();
}
