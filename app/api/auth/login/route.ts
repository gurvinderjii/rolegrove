import { NextResponse } from "next/server";
import { createSession, isSameOrigin, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { remoteDatabaseEnabled, remoteDb, remoteQuery } from "@/lib/remote-db";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please submit the form again." }, { status: 400 }); }
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const user = remoteDatabaseEnabled
    ? (await remoteDb<{ id: string; name: string; email: string; password_hash: string }>(`users?select=id,name,email,password_hash&email=eq.${remoteQuery(email)}&limit=1`))[0]
    : db.prepare("SELECT id,name,email,password_hash FROM users WHERE email=?").get(email) as { id: string; name: string; email: string; password_hash: string } | undefined;
  if (!user || !verifyPassword(password, user.password_hash)) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}
