import crypto from "crypto";
import type { DashboardProfile } from "@/lib/auth/server";

type AdminActionPayload = {
  email: string;
  exp: number;
  profileId: string;
  role: string;
};

export function createAdminActionToken(profile: DashboardProfile) {
  const payload: AdminActionPayload = {
    email: profile.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    profileId: profile.id,
    role: profile.role,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminActionToken(token: string | null) {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  const expectedSignature = sign(encodedPayload);
  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AdminActionPayload;
    if (!payload.profileId || !payload.email || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function getSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!secret) throw new Error("Missing server signing secret.");
  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}
