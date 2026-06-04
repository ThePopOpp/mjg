import { renderStaticPage } from "@/lib/public-site/static-pages";

export function GET() {
  return renderStaticPage("created-for-more.html");
}
