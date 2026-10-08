// Spike harness: a stand-in Supabase JWKS endpoint plus a minted member token.
//
// Lets the durability test drive Steward through its *real* auth path — the
// supabasePrincipal() AuthFn, ES256 verification, the role check — without
// needing a live Supabase login or a signing key we do not have.
//
// Writes the token to .eve-spike-token so a shell can pick it up.

import http from "node:http";
import { writeFileSync } from "node:fs";
import { SignJWT, exportJWK, generateKeyPair } from "jose";

const PORT = Number(process.env.JWKS_PORT ?? 55443);
const SUB = process.env.SPIKE_SUB ?? "11111111-2222-3333-4444-555555555555";

const { privateKey, publicKey } = await generateKeyPair("ES256");
const jwk = await exportJWK(publicKey);
Object.assign(jwk, { alg: "ES256", kid: "spike-key", use: "sig" });

const issuer = `http://127.0.0.1:${PORT}/auth/v1`;

const token = await new SignJWT({ role: "authenticated", email: "spike@example.com" })
  .setProtectedHeader({ alg: "ES256", kid: "spike-key" })
  .setSubject(SUB)
  .setAudience("authenticated")
  .setIssuer(issuer)
  .setIssuedAt()
  .setExpirationTime(Math.floor(Date.now() / 1000) + 24 * 3600)
  .sign(privateKey);

http
  .createServer((req, res) => {
    if (req.url === "/auth/v1/.well-known/jwks.json") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ keys: [jwk] }));
      return;
    }
    res.writeHead(404).end();
  })
  .listen(PORT, "127.0.0.1", () => {
    // Written only after the port is actually bound. Writing it earlier lets a
    // failed start (EADDRINUSE) clobber the token belonging to the instance
    // that is really serving, which then 401s for no visible reason.
    writeFileSync(new URL("../.eve-spike-token", import.meta.url), token, "utf8");
    console.log(`jwks harness on http://127.0.0.1:${PORT} (sub=${SUB})`);
  });
