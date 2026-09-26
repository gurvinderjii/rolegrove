import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSession, hashPassword, isSameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { remoteDatabaseEnabled, remoteDb, remoteQuery } from "@/lib/remote-db";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  let body: { name?: string; email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please submit the form again." }, { status: 400 }); }
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  if (name.length < 2 || name.length > 70) return NextResponse.json({ error: "Enter a name between 2 and 70 characters." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8 || password.length > 128) return NextResponse.json({ error: "Use a password between 8 and 128 characters." }, { status: 400 });
  const id = randomUUID();
  try {
    if (remoteDatabaseEnabled) {
      const existing = await remoteDb(`users?select=id&email=eq.${remoteQuery(email)}&limit=1`);
      if (existing.length) return NextResponse.json({ error: "An account with that email already exists. Try logging in." }, { status: 409 });
      await remoteDb("users", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ id, name, email, password_hash: hashPassword(password) }) });
    } else {
      db.prepare("INSERT INTO users(id,name,email,password_hash) VALUES(?,?,?,?)").run(id, name, email, hashPassword(password));
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) return NextResponse.json({ error: "An account with that email already exists. Try logging in." }, { status: 409 });
    throw error;
  }
  await createSession(id);
  return NextResponse.json({ user: { id, name, email } }, { status: 201 });
}
