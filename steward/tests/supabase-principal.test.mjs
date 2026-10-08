// Exercises steward/agent/lib/supabase-principal.ts end to end.
//
// Stands up a local JWKS endpoint signed with a keypair we control, points the
// module's env at it, then mints tokens and asserts which ones are accepted.
// This proves the role boundary and the cookie parsing without needing a real
// Supabase login.

import http from "node:http";
import { SignJWT, exportJWK, generateKeyPair } from "jose";

const { privateKey, publicKey } = await generateKeyPair("ES256");
const publicJwk = await exportJWK(publicKey);
publicJwk.alg = "ES256";
publicJwk.use = "sig";
publicJwk.kid = "test-key-1";

// HS256 key, to prove an algorithm-confusion token is rejected.
const hsSecret = new TextEncoder().encode("a".repeat(64));

const server = http.createServer((req, res) => {
  if (req.url === "/auth/v1/.well-known/jwks.json") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ keys: [publicJwk] }));
    return;
  }
  res.writeHead(404).end();
});

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;
process.env.NEXT_PUBLIC_SUPABASE_URL = base;
const ISSUER = `${base}/auth/v1`;

// Imported after the env is set, since config() reads it on first use.
const { supabasePrincipal, verifySupabaseAccessToken } = await import(
  new URL("../agent/lib/supabase-principal.ts", import.meta.url).href
);

const auth = supabasePrincipal();
const SUB = "11111111-2222-3333-4444-555555555555";

async function mint({
  role = "authenticated",
  sub = SUB,
  aud = "authenticated",
  iss = ISSUER,
  expSeconds = 3600,
  email = "member@example.com",
  alg = "ES256",
} = {}) {
  let jwt = new SignJWT({ role, email })
    .setProtectedHeader({ alg, kid: alg === "ES256" ? "test-key-1" : undefined });
  // `null` means "omit the claim entirely"; a default parameter would silently
  // put the real subject back and make the negative test vacuous.
  if (sub !== null) jwt = jwt.setSubject(sub);
  jwt = jwt
    .setAudience(aud)
    .setIssuer(iss)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expSeconds);
  return jwt.sign(alg === "ES256" ? privateKey : hsSecret);
}

function cookieRequest(cookie) {
  return new Request(`${base}/eve/v1/session`, { headers: { cookie } });
}
function bearerRequest(token) {
  return new Request(`${base}/eve/v1/session`, {
    headers: { authorization: `Bearer ${token}` },
  });
}

/** Encodes a session the way @supabase/ssr does: "base64-" + base64url(JSON). */
function sessionCookieValue(accessToken) {
  const json = JSON.stringify({ access_token: accessToken, token_type: "bearer" });
  return "base64-" + Buffer.from(json, "utf8").toString("base64url");
}

const COOKIE_NAME = "sb-127-auth-token"; // derived from the 127.0.0.1 test host

let pass = 0;
let fail = 0;
function check(name, ok, detail = "") {
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? ` -- ${detail}` : ""}`);
  }
}

console.log("\n-- token verification --");
check(
  "valid authenticated token is accepted",
  (await verifySupabaseAccessToken(await mint(), undefined, ISSUER))?.sub === SUB,
);
check(
  "role=anon is REJECTED",
  (await verifySupabaseAccessToken(await mint({ role: "anon" }), undefined, ISSUER)) === null,
);
check(
  "role=service_role is REJECTED",
  (await verifySupabaseAccessToken(await mint({ role: "service_role" }), undefined, ISSUER)) ===
    null,
);
check(
  "expired token is rejected",
  (await verifySupabaseAccessToken(await mint({ expSeconds: -120 }), undefined, ISSUER)) === null,
);
check(
  "wrong issuer is rejected",
  (await verifySupabaseAccessToken(
    await mint({ iss: "https://evil.example.com/auth/v1" }),
    undefined,
    ISSUER,
  )) === null,
);
check(
  "wrong audience is rejected",
  (await verifySupabaseAccessToken(await mint({ aud: "other" }), undefined, ISSUER)) === null,
);
check(
  "HS256 (algorithm confusion) is rejected",
  (await verifySupabaseAccessToken(await mint({ alg: "HS256" }), undefined, ISSUER)) === null,
);
check(
  "token with no sub is rejected",
  (await verifySupabaseAccessToken(await mint({ sub: null }), undefined, ISSUER)) === null,
);

console.log("\n-- AuthFn: request plumbing --");
check("no credential at all -> null (walk 401s)", (await auth(new Request(`${base}/x`))) === null);
check("garbage cookie -> null", (await auth(cookieRequest("nonsense=1; other=2"))) === null);

const good = await mint();
const viaBearer = await auth(bearerRequest(good));
check("Bearer header authenticates", viaBearer?.principalId === SUB, JSON.stringify(viaBearer));
check("principalType is 'user'", viaBearer?.principalType === "user");
check("authenticator is 'supabase'", viaBearer?.authenticator === "supabase");
check("email surfaced as an attribute", viaBearer?.attributes?.email === "member@example.com");

const viaCookie = await auth(cookieRequest(`${COOKIE_NAME}=${sessionCookieValue(good)}`));
check("single base64- session cookie authenticates", viaCookie?.principalId === SUB);

// Chunked cookie, deliberately out of order and crossing the 2 -> 10 boundary
// where lexical sorting would corrupt the payload.
const full = sessionCookieValue(good);
const size = Math.ceil(full.length / 11);
const parts = [];
for (let i = 0; i * size < full.length; i++) parts.push(full.slice(i * size, (i + 1) * size));
check("test fixture produced >10 chunks", parts.length > 10, `got ${parts.length}`);
const shuffled = parts
  .map((value, index) => `${COOKIE_NAME}.${index}=${value}`)
  .sort(() => Math.random() - 0.5)
  .join("; ");
const viaChunked = await auth(cookieRequest(shuffled));
check(
  "chunked, out-of-order cookie reassembles correctly",
  viaChunked?.principalId === SUB,
  JSON.stringify(viaChunked),
);

const anonCookie = await auth(
  cookieRequest(`${COOKIE_NAME}=${sessionCookieValue(await mint({ role: "anon" }))}`),
);
check("anon token in a valid cookie is still REJECTED", anonCookie === null);

server.close();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
