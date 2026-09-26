import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const databasePath = process.env.DATABASE_PATH || join(process.cwd(), "data", "applywise.sqlite");
const remoteDatabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
if (!remoteDatabaseConfigured) mkdirSync(dirname(databasePath), { recursive: true });

const globalForDb = globalThis as typeof globalThis & { rolegroveDb?: DatabaseSync };
export const db = (remoteDatabaseConfigured ? undefined : (globalForDb.rolegroveDb ?? new DatabaseSync(databasePath))) as DatabaseSync;
globalForDb.rolegroveDb = db;
if (!remoteDatabaseConfigured) db.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
if (!remoteDatabaseConfigured) db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company TEXT NOT NULL, role TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Applied'
      CHECK(status IN ('Applied','Interview','Offer','Rejected','Withdrawn')),
    applied_on TEXT NOT NULL, location TEXT NOT NULL DEFAULT '', salary TEXT NOT NULL DEFAULT '',
    job_url TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
    follow_up_date TEXT NOT NULL DEFAULT '', follow_up_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS applications_user_applied_idx ON applications(user_id, applied_on DESC);
  CREATE INDEX IF NOT EXISTS applications_user_follow_up_idx ON applications(user_id, follow_up_date);
`);
