-- Rolegrove production schema for Supabase Postgres.
-- Run this in Supabase SQL Editor before configuring the Vercel deployment.

create table if not exists public.users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  session_hash text not null unique,
  expires_at bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on public.sessions(user_id);

create table if not exists public.applications (
  id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  company text not null,
  role text not null,
  status text not null default 'Applied' check (status in ('Applied','Interview','Offer','Rejected','Withdrawn')),
  applied_on date not null,
  location text not null default '',
  salary text not null default '',
  job_url text not null default '',
  notes text not null default '',
  follow_up_date date,
  follow_up_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_applied_idx on public.applications(user_id, applied_on desc);
create index if not exists applications_user_follow_up_idx on public.applications(user_id, follow_up_date);

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.applications enable row level security;

-- The app uses a server-side Supabase service key and enforces user ownership
-- in its API routes. No public client should receive that key.
