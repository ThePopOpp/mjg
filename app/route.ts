import { getPublishedAudioForTarget } from "@/lib/content/media";
import { getStaticPageHtml } from "@/lib/public-site/static-pages";

export async function GET() {
  const html = getStaticPageHtml("index.html");
  const [audio] = await getPublishedAudioForTarget("frontend_home", 1);

  return new Response(audio ? injectHomepageAudio(html, audio) : html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function injectHomepageAudio(html: string, audio: any) {
  if (!audio.file_url) return html;
  const title = escapeHtml(audio.title || "The Stewardship Blueprint");
  const source = escapeHtml(audio.file_url);
  return html
    .replace(/(<audio class="ap-audio" id="mjg-audio-hero" preload="metadata">\s*<source src=")[^"]+("[^>]*>)/, `$1${source}$2`)
    .replace(/(<audio class="ap-audio" id="mjg-audio-modal" preload="metadata">\s*<source src=")[^"]+("[^>]*>)/, `$1${source}$2`)
    .replace(/(<p class="ap-meta-title">)[^<]+(<\/p>)/g, `$1${title}$2`);
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
