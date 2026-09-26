import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { statuses } from "@/lib/applications";
import { db } from "@/lib/db";
import { remoteDatabaseEnabled, remoteDb, remoteQuery } from "@/lib/remote-db";
export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  const rows = remoteDatabaseEnabled
    ? await remoteDb(`applications?select=id,company,role,status,applied_on,location,salary,job_url,notes,follow_up_date,follow_up_note,created_at,updated_at&user_id=eq.${remoteQuery(user.id)}&order=follow_up_date.asc,applied_on.desc`)
    : db.prepare(`SELECT id,company,role,status,applied_on,location,salary,job_url,notes,follow_up_date,follow_up_note,created_at,updated_at FROM applications WHERE user_id=? ORDER BY CASE WHEN follow_up_date='' THEN 1 ELSE 0 END,follow_up_date ASC,applied_on DESC`).all(user.id);
  return NextResponse.json({ applications: rows });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  let b: Record<string, unknown>;
  try { b = await request.json(); } catch { return NextResponse.json({ error: "Please submit the form again." }, { status: 400 }); }
  const company = typeof b.company === "string" ? b.company.trim() : "";
  const role = typeof b.role === "string" ? b.role.trim() : "";
  const status = typeof b.status === "string" ? b.status : "Applied";
  const appliedOn = typeof b.applied_on === "string" ? b.applied_on : "";
  if (!company || company.length > 100) return NextResponse.json({ error: "Company name is required (up to 100 characters)." }, { status: 400 });
  if (!role || role.length > 120) return NextResponse.json({ error: "Role title is required (up to 120 characters)." }, { status: 400 });
  if (!statuses.includes(status as typeof statuses[number])) return NextResponse.json({ error: "Choose a valid status." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(appliedOn)) return NextResponse.json({ error: "Choose a valid application date." }, { status: 400 });
  const text = (key: string, max: number) => typeof b[key] === "string" ? (b[key] as string).trim().slice(0, max) : "";
  const id = randomUUID();
  const location = text("location",120), salary = text("salary",80), jobUrl = text("job_url",500), notes = text("notes",5000), followUpDate = text("follow_up_date",10), followUpNote = text("follow_up_note",250);
  let row;
  if (remoteDatabaseEnabled) {
    [row] = await remoteDb("applications", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ id, user_id: user.id, company, role, status, applied_on: appliedOn, location, salary, job_url: jobUrl, notes, follow_up_date: followUpDate || null, follow_up_note: followUpNote }) });
  } else {
    db.prepare(`INSERT INTO applications(id,user_id,company,role,status,applied_on,location,salary,job_url,notes,follow_up_date,follow_up_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,user.id,company,role,status,appliedOn,location,salary,jobUrl,notes,followUpDate,followUpNote);
    row = db.prepare("SELECT * FROM applications WHERE id=? AND user_id=?").get(id,user.id);
  }
  return NextResponse.json({ application: row }, { status: 201 });
}
