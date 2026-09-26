import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { remoteDatabaseEnabled, remoteDb, remoteQuery } from "./remote-db";

export type User = { id: string; name: string; email: string };
const SESSION_COOKIE = "rolegrove_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${key}`;
}

export function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, expectedHex] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60;
  const sessionHash = createHash("sha256").update(token).digest("hex");
  if (remoteDatabaseEnabled) {
    await remoteDb("sessions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ id: randomUUID(), user_id: userId, session_hash: sessionHash, expires_at: expires }) });
  } else {
    db.prepare("INSERT INTO sessions (id,user_id,session_hash,expires_at) VALUES (?,?,?,?)").run(randomUUID(), userId, sessionHash, expires);
  }
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const hash = createHash("sha256").update(token).digest("hex");
    if (remoteDatabaseEnabled) await remoteDb(`sessions?session_hash=eq.${remoteQuery(hash)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    else db.prepare("DELETE FROM sessions WHERE session_hash = ?").run(hash);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const hash = createHash("sha256").update(token).digest("hex");
  const now = Math.floor(Date.now() / 1000);
  if (remoteDatabaseEnabled) {
    const sessions = await remoteDb<{ user_id: string; expires_at: number }>(`sessions?select=user_id,expires_at&session_hash=eq.${remoteQuery(hash)}&expires_at=gt.${now}&limit=1`);
    if (!sessions[0]) return null;
    const users = await remoteDb<User>(`users?select=id,name,email&id=eq.${remoteQuery(sessions[0].user_id)}&limit=1`);
    return users[0] ?? null;
  }
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  return (db.prepare(`SELECT users.id, users.name, users.email FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.session_hash = ? AND sessions.expires_at > ?`).get(hash, now) as User | undefined) ?? null;
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}
