// GitHub for the MJG connector: file issues (optionally handed to the Claude
// Code GitHub Action, .github/workflows/claude.yml, which opens a pull request)
// and read pull requests. Server-side only — the token never reaches agents.
//
// Env: GITHUB_TOKEN (fine-grained: Issues read/write, Pull requests read,
// Contents read on the repo), GITHUB_REPO (default ThePopOpp/mjg).

const API = "https://api.github.com";

function config() {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) throw new Error("GitHub isn't configured (GITHUB_TOKEN). Add it in Coolify.");
  return { token, repo: process.env.GITHUB_REPO?.trim() || "ThePopOpp/mjg" };
}

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token, repo } = config();
  const res = await fetch(`${API}/repos/${repo}${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "mjg-connector",
      ...(init.body ? { "content-type": "application/json" } : {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${(body as { message?: string }).message ?? "request failed"}`);
  return body as T;
}

export async function createIssue(input: { title: string; body: string; labels?: string[] }) {
  const issue = await gh<{ number: number; html_url: string; state: string }>("/issues", {
    method: "POST",
    body: JSON.stringify({ title: input.title, body: input.body, labels: input.labels ?? [] }),
  });
  return { number: issue.number, url: issue.html_url, state: issue.state };
}

export async function listOpenPullRequests(limit = 20) {
  const prs = await gh<Array<Record<string, any>>>(`/pulls?state=open&per_page=${Math.min(limit, 100)}`);
  return prs.map((p) => ({
    number: p.number,
    title: p.title,
    url: p.html_url,
    author: p.user?.login,
    branch: p.head?.ref,
    draft: p.draft,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));
}

export async function latestCommit(branch = "main") {
  const c = await gh<Record<string, any>>(`/commits/${encodeURIComponent(branch)}`);
  return { sha: String(c.sha).slice(0, 7), message: String(c.commit?.message ?? "").split("\n")[0], author: c.commit?.author?.name, date: c.commit?.author?.date, url: c.html_url };
}
