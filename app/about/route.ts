import { renderStaticPage } from "@/lib/public-site/static-pages";

export function GET() {
  return renderStaticPage("about-us.html");
}
