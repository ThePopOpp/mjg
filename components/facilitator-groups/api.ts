// JSON fetch for the group APIs: sends the dashboard action token, throws the API's message.
export async function groupApi<T = any>(url: string, method: string, body: Record<string, unknown> | undefined, actionToken: string | null): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...(actionToken ? { "x-mjg-action-token": actionToken } : {}) },
    body: body ? JSON.stringify({ ...body, actionToken }) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data as T;
}
