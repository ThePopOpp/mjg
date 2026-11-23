// Lead pipeline + prospecting helpers (lib/tools/leads.ts, lib/tools/prospect.ts).
import { test } from "node:test";
import assert from "node:assert/strict";

test("leads: dedupe key prefers email, else website domain + name", async () => {
  const { leadDedupeKey, websiteDomain } = await import("@/lib/tools/leads.ts");
  assert.equal(leadDedupeKey({ email: " Pastor@GraceChurch.org " }), "email:pastor@gracechurch.org");
  assert.equal(leadDedupeKey({ website: "https://www.gracechurch.org/staff", first_name: "Tim", last_name: "Hall" }), "site:gracechurch.org|tim hall");
  assert.equal(leadDedupeKey({ website: "gracechurch.org", organization: "Grace  Church" }), "site:gracechurch.org|grace church");
  assert.equal(leadDedupeKey({ first_name: "Tim" }), null, "a name alone isn't stable enough");
  assert.equal(websiteDomain("not a url at all"), null);
});

test("prospect: robots.txt rules", async () => {
  const { robotsAllows } = await import("@/lib/tools/prospect.ts");
  const robots = "User-agent: *\nDisallow: /admin\nDisallow: /*.pdf$\nAllow: /admin/public\n\nUser-agent: GPTBot\nDisallow: /";
  assert.equal(robotsAllows(robots, "/staff"), true);
  assert.equal(robotsAllows(robots, "/admin/settings"), false);
  assert.equal(robotsAllows(robots, "/admin/public/team"), true, "longest match wins");
  assert.equal(robotsAllows(robots, "/files/a.pdf"), false);
  assert.equal(robotsAllows("User-agent: MJGProspector\nDisallow: /\n\nUser-agent: *\nAllow: /", "/x"), false, "our own group applies");
  assert.equal(robotsAllows("", "/anything"), true);
});

test("prospect: page extraction finds text, emails and staff links", async () => {
  const { extractPage } = await import("@/lib/tools/prospect.ts");
  const html = `<html><head><title>Our Staff &amp; Elders</title><style>.x{}</style></head><body>
    <script>var a = "hidden@x.com";</script>
    <h1>Leadership</h1><p>Pastor Tim Hall &mdash; <a href="mailto:tim@gracechurch.org?subject=hi">Email</a></p>
    <p>Office: office@gracechurch.org</p><img src="logo@2x.png">
    <a href="/about/staff">Meet the team</a><a href="https://other.org/staff">Other</a><a href="/give">Give</a>
  </body></html>`;
  const page = extractPage(html, new URL("https://gracechurch.org/staff"));
  assert.equal(page.title, "Our Staff & Elders");
  assert.ok(page.text.includes("Pastor Tim Hall"));
  assert.ok(!page.text.includes("hidden@x.com"), "scripts are stripped");
  assert.deepEqual(page.emails.sort(), ["office@gracechurch.org", "tim@gracechurch.org"]);
  assert.deepEqual(page.links.map((l) => l.url), ["https://gracechurch.org/about/staff"], "same-site staff links only");
});

test("prospect: social platforms and private addresses are refused", async () => {
  const { PROSPECT_TOOLS } = await import("@/lib/tools/prospect.ts");
  const fetchPage = PROSPECT_TOOLS.find((t) => t.name === "prospect_fetch_page");
  process.env.PROSPECT_DAILY_CAP = "0"; // skip the DB-backed cap in tests
  const ctx = { actorId: "x", actorEmail: "x", role: "super_admin", via: "mcp" };
  await assert.rejects(fetchPage.run({ url: "https://www.linkedin.com/in/someone" }, ctx), /terms/);
  await assert.rejects(fetchPage.run({ url: "https://m.facebook.com/somechurch" }, ctx), /terms/);
  await assert.rejects(fetchPage.run({ url: "http://127.0.0.1/admin" }, ctx), /public/);
  await assert.rejects(fetchPage.run({ url: "http://169.254.169.254/latest/meta-data" }, ctx), /public/);
  await assert.rejects(fetchPage.run({ url: "http://localhost:3000" }, ctx), /standard web ports|public/);
  await assert.rejects(fetchPage.run({ url: "file:///etc/passwd" }, ctx), /http/);
});
