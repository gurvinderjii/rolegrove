import "server-only";

const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const remoteDatabaseEnabled = Boolean(baseUrl && serviceKey);

function assertRemote() {
  if (!baseUrl || !serviceKey) throw new Error("Supabase environment variables are missing.");
}

export async function remoteDb<T = Record<string, unknown>>(path: string, options: RequestInit = {}): Promise<T[]> {
  assertRemote();
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey!,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase request failed (${response.status}).`);
  if (response.status === 204) return [];
  return response.json() as Promise<T[]>;
}

export function remoteQuery(value: string) {
  return encodeURIComponent(value);
}
