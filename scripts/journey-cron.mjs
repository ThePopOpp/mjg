// Releases due 7-Day Journey emails. Run by a Coolify scheduled task inside the app
// container on whatever cadence the owner sets: `node scripts/journey-cron.mjs`.
//
// It POSTs the app's own /api/admin/email/journey/send-due endpoint over localhost,
// authenticating with the EXPERIENCE_CRON_SECRET env var (the same shared secret used by
// the experiences cron — set it once on the app). The endpoint sends any journey emails
// whose scheduled time has passed, so any schedule works.
const port = process.env.PORT || 3000;
const secret = process.env.EXPERIENCE_CRON_SECRET;

if (!secret) {
  console.error("[journey-cron] EXPERIENCE_CRON_SECRET is not set in the container env.");
  process.exit(1);
}

try {
  const res = await fetch(`http://127.0.0.1:${port}/api/admin/email/journey/send-due`, {
    method: "POST",
    headers: { "x-cron-secret": secret, "content-type": "application/json" },
    body: JSON.stringify({ limit: 50 }),
  });
  const text = await res.text();
  console.log(`[journey-cron] ${res.status} ${text}`);
  if (!res.ok) process.exit(1);
} catch (err) {
  console.error("[journey-cron] request failed:", err);
  process.exit(1);
}
