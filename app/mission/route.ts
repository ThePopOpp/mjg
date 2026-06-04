import { renderGeneratedPage } from "@/lib/public-site/static-pages";

export function GET() {
  return renderGeneratedPage({
    eyebrow: "Mission",
    title: "Created for God-given purpose.",
    body: "Encouraging and inspiring people to use their God-given resources, time, talents, and treasure, for the people and causes God has placed on their hearts.",
    ctaLabel: "Join the Journey",
    ctaHref: "/#join",
  });
}
