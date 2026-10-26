// Coolify for the MJG connector: the app's status, recent deployments, and
// starting a deployment. Server-side only — the token never reaches agents.
//
// Env: COOLIFY_API_URL (e.g. https://coolify.example.com, with or without
// /api/v1), COOLIFY_API_TOKEN (Coolify → Keys & Tokens → API tokens; needs
// read + deploy), COOLIFY_APP_UUID (the MJG app's uuid, from its Coolify URL).
// Endpoints per Coolify's v4 API (/api/v1/applications, /deploy, /deployments).

function config() {
  const raw = process.env.COOLIFY_API_URL?.trim();
  const token = process.env.COOLIFY_API_TOKEN?.trim();
  const appUuid = process.env.COOLIFY_APP_UUID?.trim();
  if (!raw || !token || !appUuid) throw new Error("Coolify isn't configured (COOLIFY_API_URL, COOLIFY_API_TOKEN, COOLIFY_APP_UUID). Add them in Coolify.");
  return { base: raw.replace(/\/+$/, "").replace(/\/api\/v1$/, ""), token, appUuid };
}

async function coolify<T>(path: string): Promise<{ status: number; body: T }> {
  const { base, token } = config();
  const res = await fetch(`${base}/api/v1${path}`, { headers: { authorization: `Bearer ${token}`, accept: "application/json" } });
  const body = (await res.json().catch(() => ({}))) as T;
  if (!res.ok && res.status !== 404) throw new Error(`Coolify ${res.status}: ${(body as { message?: string }).message ?? "request failed"}`);
  return { status: res.status, body };
}

export async function appStatus() {
  const { appUuid } = config();
  const { status, body } = await coolify<Record<string, any>>(`/applications/${appUuid}`);
  if (status === 404) throw new Error("Coolify doesn't know that COOLIFY_APP_UUID.");
  return {
    name: body.name,
    status: body.status,
    fqdn: body.fqdn,
    branch: body.git_branch,
    repository: body.git_repository,
    lastOnline: body.last_online_at ?? null,
  };
}

export async function recentDeployments(take = 5) {
  const { appUuid } = config();
  const { status, body } = await coolify<any>(`/deployments/applications/${appUuid}?skip=0&take=${take}`);
  if (status === 404) return null; // older Coolify without per-app history
  const list: Array<Record<string, any>> = Array.isArray(body) ? body : (body.deployments ?? []);
  return list.slice(0, take).map((d) => ({
    id: d.deployment_uuid ?? d.uuid ?? d.id,
    status: d.status,
    commit: d.commit ? String(d.commit).slice(0, 7) : null,
    commitMessage: d.commit_message ?? null,
    createdAt: d.created_at,
    finishedAt: d.finished_at ?? null,
  }));
}

export async function triggerDeploy(force = false) {
  const { appUuid } = config();
  const { status, body } = await coolify<Record<string, any>>(`/deploy?uuid=${encodeURIComponent(appUuid)}&force=${force ? "true" : "false"}`);
  if (status === 404) throw new Error("Coolify couldn't find the app to deploy.");
  return body;
}
