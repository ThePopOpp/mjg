import { renderLegalRoute } from "@/lib/public-site/legal";

// Public AI & Trust Notice. The package marks this one "PUBLIC PAGE DRAFT" and
// proposes /ai-trust. No file fallback: 404 until it is published.
export const dynamic = "force-dynamic";

export function GET() {
  return renderLegalRoute({
    slug: "ai-trust",
    title: "AI & Trust Notice",
    eyebrow: "Trust",
  });
}
