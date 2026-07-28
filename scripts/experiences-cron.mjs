// Releases due Experience emails. Run by Coolify's scheduled task inside the app
// container: `node scripts/experiences-cron.mjs`.
//
// It POSTs the app's own /api/admin/experiences/send-due endpoint over localhost,
// authenticating with the EXPERIENCE_CRON_SECRET env var (must match the value set
// on the app). The endpoint sends any experience emails whose scheduled_at has passed.
const port = process.env.PORT || 3000;
const secret = process.env.EXPERIENCE_CRON_SECRET;

if (!secret) {
  console.error("[experiences-cron] EXPERIENCE_CRON_SECRET is not set in the container env.");
  process.exit(1);
}

try {
  const res = await fetch(`http://127.0.0.1:${port}/api/admin/experiences/send-due`, {
    method: "POST",
    headers: { "x-cron-secret": secret, "content-type": "application/json" },
    body: JSON.stringify({ limit: 100 }),
  });
  const text = await res.text();
  console.log(`[experiences-cron] ${res.status} ${text}`);
  if (!res.ok) process.exit(1);
} catch (err) {
  console.error("[experiences-cron] request failed:", err);
  process.exit(1);
}
