import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, isSameOrigin, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { remoteDatabaseEnabled, remoteDb, remoteQuery } from "@/lib/remote-db";
export const runtime = "nodejs";
export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  let body: { currentPassword?: string; newPassword?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please submit the form again." }, { status: 400 }); }
  const row = remoteDatabaseEnabled
    ? (await remoteDb<{ password_hash: string }>(`users?select=password_hash&id=eq.${remoteQuery(user.id)}&limit=1`))[0]
    : db.prepare("SELECT password_hash FROM users WHERE id=?").get(user.id) as { password_hash: string } | undefined;
  if (!row || !verifyPassword(body.currentPassword ?? "", row.password_hash)) return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
  const next = body.newPassword ?? "";
  if (next.length < 8 || next.length > 128) return NextResponse.json({ error: "Use a password between 8 and 128 characters." }, { status: 400 });
  if (remoteDatabaseEnabled) await remoteDb(`users?id=eq.${remoteQuery(user.id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ password_hash: hashPassword(next) }) });
  else db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(hashPassword(next),user.id);
  return NextResponse.json({ success: true });
}
