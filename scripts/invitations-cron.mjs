// Sends invitation emails that were scheduled for a future time and are now due. Run by a
// Coolify scheduled task inside the app container: `node scripts/invitations-cron.mjs`.
// Authenticates with the shared EXPERIENCE_CRON_SECRET (set once on the app).
const port = process.env.PORT || 3000;
const secret = process.env.EXPERIENCE_CRON_SECRET;

if (!secret) {
  console.error("[invitations-cron] EXPERIENCE_CRON_SECRET is not set in the container env.");
  process.exit(1);
}

try {
  const res = await fetch(`http://127.0.0.1:${port}/api/admin/invitations/send-due`, {
    method: "POST",
    headers: { "x-cron-secret": secret, "content-type": "application/json" },
    body: JSON.stringify({ limit: 100 }),
  });
  const text = await res.text();
  console.log(`[invitations-cron] ${res.status} ${text}`);
  if (!res.ok) process.exit(1);
} catch (err) {
  console.error("[invitations-cron] request failed:", err);
  process.exit(1);
}
