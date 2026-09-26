import "server-only";
import { db } from "./db";
import { remoteDatabaseEnabled, remoteDb, remoteQuery } from "./remote-db";

export const statuses = ["Applied", "Interview", "Offer", "Rejected", "Withdrawn"] as const;
export type ApplicationStatus = typeof statuses[number];
export type Application = {
  id: string; company: string; role: string; status: ApplicationStatus; applied_on: string;
  location: string; salary: string; job_url: string; notes: string;
  follow_up_date: string; follow_up_note: string; created_at: string; updated_at: string;
};

export async function getApplications(userId: string) {
  if (remoteDatabaseEnabled) return remoteDb<Application>(`applications?select=id,company,role,status,applied_on,location,salary,job_url,notes,follow_up_date,follow_up_note,created_at,updated_at&user_id=eq.${remoteQuery(userId)}&order=follow_up_date.asc,applied_on.desc`);
  return db.prepare(`SELECT id,company,role,status,applied_on,location,salary,job_url,notes,follow_up_date,follow_up_note,created_at,updated_at FROM applications WHERE user_id = ? ORDER BY CASE WHEN follow_up_date = '' THEN 1 ELSE 0 END, follow_up_date ASC, applied_on DESC`).all(userId) as Application[];
}

export async function getApplication(userId: string, id: string) {
  if (remoteDatabaseEnabled) return (await remoteDb<Application>(`applications?select=id,company,role,status,applied_on,location,salary,job_url,notes,follow_up_date,follow_up_note,created_at,updated_at&user_id=eq.${remoteQuery(userId)}&id=eq.${remoteQuery(id)}&limit=1`))[0];
  return db.prepare(`SELECT id,company,role,status,applied_on,location,salary,job_url,notes,follow_up_date,follow_up_note,created_at,updated_at FROM applications WHERE user_id=? AND id=?`).get(userId, id) as Application | undefined;
}
