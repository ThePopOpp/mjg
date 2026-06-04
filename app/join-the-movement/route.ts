import { renderStaticPage } from "@/lib/public-site/static-pages";

export function GET() {
  return renderStaticPage("join-the-movement.html");
}
