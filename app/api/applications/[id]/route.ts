import { NextResponse } from "next/server";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { statuses } from "@/lib/applications";
import { db } from "@/lib/db";
import { remoteDatabaseEnabled, remoteDb, remoteQuery } from "@/lib/remote-db";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  const { id } = await params;
  if (remoteDatabaseEnabled) {
    if (!(await remoteDb(`applications?select=id&id=eq.${remoteQuery(id)}&user_id=eq.${remoteQuery(user.id)}&limit=1`)).length) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  } else if (!db.prepare("SELECT id FROM applications WHERE id=? AND user_id=?").get(id,user.id)) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  let b: Record<string, unknown>;
  try { b = await request.json(); } catch { return NextResponse.json({ error: "Please submit the form again." }, { status: 400 }); }
  const company = typeof b.company === "string" ? b.company.trim() : "";
  const role = typeof b.role === "string" ? b.role.trim() : "";
  const status = typeof b.status === "string" ? b.status : "";
  const appliedOn = typeof b.applied_on === "string" ? b.applied_on : "";
  if (!company || company.length > 100) return NextResponse.json({ error: "Company name is required (up to 100 characters)." }, { status: 400 });
  if (!role || role.length > 120) return NextResponse.json({ error: "Role title is required (up to 120 characters)." }, { status: 400 });
  if (!statuses.includes(status as typeof statuses[number])) return NextResponse.json({ error: "Choose a valid status." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(appliedOn)) return NextResponse.json({ error: "Choose a valid application date." }, { status: 400 });
  const text = (key: string, max: number) => typeof b[key] === "string" ? (b[key] as string).trim().slice(0, max) : "";
  const location=text("location",120), salary=text("salary",80), jobUrl=text("job_url",500), notes=text("notes",5000), followUpDate=text("follow_up_date",10), followUpNote=text("follow_up_note",250);
  let application;
  if (remoteDatabaseEnabled) {
    [application] = await remoteDb(`applications?id=eq.${remoteQuery(id)}&user_id=eq.${remoteQuery(user.id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ company, role, status, applied_on: appliedOn, location, salary, job_url: jobUrl, notes, follow_up_date: followUpDate || null, follow_up_note: followUpNote, updated_at: new Date().toISOString() }) });
  } else {
    db.prepare(`UPDATE applications SET company=?,role=?,status=?,applied_on=?,location=?,salary=?,job_url=?,notes=?,follow_up_date=?,follow_up_note=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?`).run(company,role,status,appliedOn,location,salary,jobUrl,notes,followUpDate,followUpNote,id,user.id);
    application = db.prepare("SELECT * FROM applications WHERE id=? AND user_id=?").get(id,user.id);
  }
  return NextResponse.json({ application });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  const { id } = await params;
  if (remoteDatabaseEnabled) {
    const result = await remoteDb(`applications?id=eq.${remoteQuery(id)}&user_id=eq.${remoteQuery(user.id)}`, { method: "DELETE", headers: { Prefer: "return=representation" } });
    if (!result.length) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  } else {
    const result = db.prepare("DELETE FROM applications WHERE id=? AND user_id=?").run(id,user.id);
    if (!result.changes) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
