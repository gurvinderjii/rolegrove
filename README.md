# Rolegrove

**Your job search, in good order.** Rolegrove is a full-stack, responsive job application tracker. Create a private account, save opportunities, follow interview progress, schedule follow-ups, and export your data as CSV.

## Features

- Animated landing page with an interactive workspace preview
- Email/password registration and login (scrypt-hashed passwords, hashed opaque session tokens, 30-day HTTP-only cookies)
- Private, per-user applications: every query is scoped to the signed-in user
- Create, edit, delete, and change the status of applications (Applied, Interview, Offer, Rejected, Withdrawn)
- Track company, role, date applied, location, salary, job URL, notes, and follow-up date and note
- Search and status filters, follow-up calendar, insights, and CSV export
- Profile and password settings, form validation, responsive layout, reduced-motion support

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) and React 19
- TypeScript
- Storage: SQLite (`node:sqlite`) for local development, or Supabase Postgres for hosted deployments
- Custom responsive CSS
- Optional [Umami](https://umami.is) analytics (privacy-friendly, off by default)

## Getting started

Requires **Node.js 22.13+** and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000> and create an account. With no configuration, data is stored in `data/rolegrove.sqlite`, which is created automatically and git-ignored.

```bash
pnpm typecheck   # type-check
pnpm build       # production build
pnpm start       # run the production build
```

### Docker

```bash
docker compose up --build
```

The app runs at <http://localhost:3000>, and SQLite data persists in the `rolegrove-data` volume.

## Configuration

Copy `.env.example` to `.env.local` and set only what you need.

| Variable | Purpose |
| --- | --- |
| `DATABASE_PATH` | Location of the SQLite file (default `data/rolegrove.sqlite`) |
| `SUPABASE_URL` | Supabase project URL. Enables Postgres storage when set with the key below |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key. **Server-only. Never commit it or expose it to the browser** |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami website ID. Leave empty to disable analytics |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | Umami script URL (default `https://cloud.umami.is/script.js`) |

## Deploying to Vercel with Supabase

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
2. Import the repository into Vercel.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables.
4. Deploy.

Serverless hosts have ephemeral filesystems, so use Supabase there rather than SQLite.

## Security notes

- Passwords are hashed with scrypt; session tokens are random and only their SHA-256 hash is stored.
- State-changing API routes verify the request origin.
- The Supabase service key is used only in server-side code. Row Level Security is enabled on all tables with no public policies.
- Before serving a wider audience, add rate limiting, email verification, password recovery, and backups. None of these are included yet.

To report a vulnerability, please open a private security advisory on GitHub instead of a public issue.

## Project layout

```text
app/          Pages and API route handlers
components/   Landing, auth, and dashboard UI
lib/          Database access, auth, and session helpers
supabase/     Postgres schema for hosted deployments
```

## License

MIT. See [LICENSE](LICENSE).
