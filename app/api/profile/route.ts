import { NextResponse } from "next/server";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { remoteDatabaseEnabled, remoteDb, remoteQuery } from "@/lib/remote-db";
export const runtime = "nodejs";
export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  let body: { name?: string; email?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please submit the form again." }, { status: 400 }); }
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  if (name.length < 2 || name.length > 70) return NextResponse.json({ error: "Enter a name between 2 and 70 characters." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  try {
    if (remoteDatabaseEnabled) await remoteDb(`users?id=eq.${remoteQuery(user.id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ name, email }) });
    else db.prepare("UPDATE users SET name=?, email=? WHERE id=?").run(name,email,user.id);
  }
  catch (error) { if (error instanceof Error && error.message.includes("UNIQUE")) return NextResponse.json({ error: "That email is already connected to another account." }, { status: 409 }); throw error; }
  return NextResponse.json({ user: { id: user.id, name, email } });
}
