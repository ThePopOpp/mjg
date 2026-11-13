// Session ownership for eve's HTTP routes.
//
// THE GAP THIS CLOSES
// -------------------
// eve's default channel authenticates every request, then acts on whatever
// session id is in the path. It never asks whether that session is the caller's.
// Verified against eve 0.74.0 (dist/src/eve-channel/index.js): the message,
// stream, cancel, compact, clear and reset routes all go straight from
// `routeAuth` to `attachSession(id)`.
//
// So any signed-in member holding another member's session id could read that
// conversation, or send a message into it. The second is the worse one: tools
// act as the member captured at `session.started` (hooks/member.ts), so a
// message posted into someone else's session would read THEIR Blueprint.
// Session ids are long and random, which makes this hard to exploit, not safe.
//
// THE FIX
// -------
//   1. Session creation is wrapped. eve creates the session; before its id is
//      returned, the verified caller is recorded as owner (steward_session_owners,
//      via the app). If that cannot be recorded, the id is withheld and the
//      request fails — an ownerless session is unreachable by anyone, which is
//      the safe way to fail.
//   2. Every route with a session id in its path is wrapped. The caller must be
//      the recorded owner; otherwise 404, the same answer as a session that does
//      not exist, so probing reveals nothing. No record → no access.
//
// This lives in the eve container, not only behind the Next rewrite, so it holds
// even if the container is reached directly.

import type { Channel, HttpRouteDefinition, RouteDefinition } from "eve/channels";
import type { AuthFn } from "eve/channels/auth";
import { callApp } from "./app-tools.ts";

/** eve's response header carrying the session id (protocol/message.d.ts). */
const SESSION_ID_HEADER = "x-eve-session-id";

/** The create route (`EVE_SESSION_ROUTE_PATH`). */
const CREATE_PATH = "/eve/v1/session";

/** Path params that name a session the caller must own. */
const SESSION_PARAMS = ["sessionId", "parentSessionId"] as const;

/**
 * Owner never changes once recorded, so a positive answer can be remembered.
 * Negative answers are not cached: a session is claimed moments after creation
 * and must become reachable immediately.
 */
const owners = new Map<string, string>();
const OWNER_CACHE_MAX = 5_000;

function remember(sessionId: string, principalId: string) {
  if (owners.size >= OWNER_CACHE_MAX) {
    const oldest = owners.keys().next().value;
    if (oldest !== undefined) owners.delete(oldest);
  }
  owners.set(sessionId, principalId);
}

type RouteHandler = HttpRouteDefinition["handler"];

type Ownership = "owner" | "not-owner" | "unavailable";

export interface OwnershipStore {
  claim(principalId: string, sessionId: string): Promise<boolean>;
  owned(principalId: string, sessionId: string): Promise<boolean>;
}

/** The real store: the application, behind the agent secret. */
export const appOwnershipStore: OwnershipStore = {
  async claim(principalId, sessionId) {
    const result = await callApp<{ owned: boolean }>("session.claim", { sessionId }, principalId);
    return result.owned === true;
  },
  async owned(principalId, sessionId) {
    const result = await callApp<{ owned: boolean }>("session.owned", { sessionId }, principalId);
    return result.owned === true;
  },
};

async function ownership(store: OwnershipStore, principalId: string, sessionId: string): Promise<Ownership> {
  if (owners.get(sessionId) === principalId) return "owner";
  try {
    if (await store.owned(principalId, sessionId)) {
      remember(sessionId, principalId);
      return "owner";
    }
    return "not-owner";
  } catch (error) {
    console.error("[steward] session ownership check failed", error);
    return "unavailable";
  }
}

const json = (status: number, error: string) =>
  Response.json({ ok: false, error }, { status, headers: { "cache-control": "no-store" } });

const notFound = () => json(404, "Session not found.");
const unauthenticated = () => json(401, "Sign in to continue.");
const unavailable = () => json(503, "Steward cannot open that conversation right now.");

function sessionParam(params: Readonly<Record<string, string>>): string | null {
  for (const key of SESSION_PARAMS) {
    const value = params[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

function namesSession(path: string): boolean {
  return SESSION_PARAMS.some((key) => path.includes(`:${key}`));
}

/**
 * Wraps a channel's routes with the ownership guard. `authenticate` must be the
 * same verifier the channel itself uses, so "who is this" is answered once, the
 * same way, on both sides of the guard.
 */
export function withSessionOwnership<C extends Channel>(
  channel: C,
  authenticate: AuthFn<Request>,
  store: OwnershipStore = appOwnershipStore,
): C {
  const principalOf = async (request: Request): Promise<string | null> => {
    const result = await authenticate(request);
    return result && typeof result === "object" && "principalId" in result && typeof result.principalId === "string"
      ? result.principalId
      : null;
  };

  const guardCreate = (handler: RouteHandler): RouteHandler => async (request, args) => {
    const principalId = await principalOf(request);
    if (!principalId) return unauthenticated();

    const response = await handler(request, args);
    const sessionId = response.headers.get(SESSION_ID_HEADER);
    if (!response.ok || !sessionId) return response;

    let claimed = false;
    try {
      claimed = await store.claim(principalId, sessionId);
    } catch (error) {
      console.error("[steward] could not record session owner", error);
    }
    // Withhold the id. The session exists but nobody, including this caller,
    // can reach it — better than one that anybody holding the id could.
    if (!claimed) return unavailable();
    remember(sessionId, principalId);
    return response;
  };

  const guardSession = (handler: RouteHandler): RouteHandler => async (request, args) => {
    const sessionId = sessionParam(args.params);
    // No id: let eve answer its own 400.
    if (!sessionId) return handler(request, args);

    const principalId = await principalOf(request);
    if (!principalId) return unauthenticated();

    const verdict = await ownership(store, principalId, sessionId);
    if (verdict === "unavailable") return unavailable();
    if (verdict === "not-owner") return notFound();

    const response = await handler(request, args);

    // If eve ever answers a continuation with a different session id, that
    // session belongs to the same member. Record it rather than strand it.
    const continued = response.headers.get(SESSION_ID_HEADER);
    if (response.ok && continued && continued !== sessionId && owners.get(continued) !== principalId) {
      try {
        if (await store.claim(principalId, continued)) remember(continued, principalId);
      } catch (error) {
        console.error("[steward] could not record continued session owner", error);
      }
    }
    return response;
  };

  const routes = channel.routes.flatMap((route): RouteDefinition[] => {
    const isWebSocket = route.transport === "websocket";
    if (isWebSocket) {
      // eve 0.74 has none. If an upgrade adds a session-addressed socket, drop
      // it rather than serve it unguarded; a missing feature is visible, a hole
      // is not.
      if (namesSession(route.path)) {
        console.warn(`[steward] dropping unguarded websocket route ${route.path}`);
        return [];
      }
      return [route];
    }

    const http = route as HttpRouteDefinition;
    if (http.method === "POST" && http.path === CREATE_PATH) {
      return [{ ...http, handler: guardCreate(http.handler) }];
    }
    if (namesSession(http.path)) {
      return [{ ...http, handler: guardSession(http.handler) }];
    }
    return [http];
  });

  return { ...channel, routes } as C;
}

/** Test seam: forget remembered owners. */
export function resetOwnershipCache() {
  owners.clear();
}
