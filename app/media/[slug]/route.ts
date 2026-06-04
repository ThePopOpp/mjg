import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const supabase = createSupabaseAdminClient();
  const { data: asset, error } = await supabase.from("media_assets").select("*").eq("slug", slug).neq("status", "deleted").maybeSingle();
  if (error || !asset) notFound();

  return new Response(renderAsset(asset), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function renderAsset(asset: any) {
  const media =
    asset.asset_type === "audio"
      ? `<audio controls src="${escapeHtml(asset.file_url || asset.embed_url || "")}" style="width:100%;"></audio>`
      : asset.asset_type === "video"
        ? asset.embed_url
          ? `<iframe src="${escapeHtml(asset.embed_url)}" title="${escapeHtml(asset.title)}" style="width:100%;aspect-ratio:16/9;border:0;" allowfullscreen></iframe>`
          : `<video controls src="${escapeHtml(asset.file_url || "")}" style="width:100%;max-height:75vh;"></video>`
        : `<img src="${escapeHtml(asset.file_url || asset.embed_url || "")}" alt="${escapeHtml(asset.title)}" style="max-width:100%;height:auto;border-radius:8px;" />`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(asset.title)} | Media</title>
  <style>
    body { margin:0; background:#10110f; color:#f8f6f1; font-family:Inter, system-ui, sans-serif; }
    main { min-height:100vh; display:grid; place-items:center; padding:24px; }
    section { width:min(920px,100%); }
    h1 { font-family:Georgia,serif; font-size:clamp(28px,5vw,54px); margin:0 0 16px; }
    p { color:#b6bcb6; line-height:1.6; }
  </style>
</head>
<body>
  <main>
    <section>
      <h1>${escapeHtml(asset.title)}</h1>
      ${media}
      ${asset.description ? `<p>${escapeHtml(asset.description)}</p>` : ""}
    </section>
  </main>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
