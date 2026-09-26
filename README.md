# Rolegrove

**Your job search, in good order.** Rolegrove is a full-stack, responsive job application tracker. Create a private account, save opportunities, follow interview progress, set reminders, and export your data. It is designed as a portfolio-ready example of a complete authenticated product rather than a static dashboard mockup.

## Product tour

1. Start on the animated landing page and open a private workspace.
2. Register or use the local demo account below.
3. Add applications, update their status, and schedule the next follow-up.
4. Review search insights and export a portable CSV copy of your data.

### Local demo account

The current local Docker environment includes this account for reviewing the UI:

```text
Email:    demo@rolegrove.local
Password: Rolegrove123!
```

The account is local-only and should be replaced with a real account before any public deployment.

## Features

- Public product landing page with an interactive, animated workspace preview.
- Account registration and login with email/password, hashed passwords, and 30-day HTTP-only sessions.
- Private, user-scoped applications stored in SQLite. Each account can read and manage only its own records.
- Create, edit, update status, and delete application records.
- Track company, role, status, date applied, location, salary, job posting URL, notes, follow-up date, and follow-up details.
- Search across companies, roles, locations, and notes; filter by application status.
- Follow-up calendar, status insights, and CSV export.
- Profile and password settings, empty states, form validation, and responsive layouts.

## Run locally

Requires **Node.js 22.13 or newer** (for the built-in `node:sqlite` module) and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account to begin; new accounts start with an empty private workspace. SQLite creates `data/applywise.sqlite` automatically. This legacy filename is retained so existing local Rolegrove preview data survives the rebrand.

Useful commands:

```bash
pnpm typecheck
pnpm build
pnpm start
```

Set `DATABASE_PATH` to store the SQLite file in another location.

## Run with Docker

Docker Desktop is free for personal use and gives this project an isolated local runtime.

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Your SQLite data is stored in the named `rolegrove-data` Docker volume, so it remains after stopping the container.

```bash
docker compose down
```

## Technology

- Next.js 16 App Router and React 19
- TypeScript
- SQLite using Node.js `node:sqlite`
- Native `scrypt` password hashing and opaque, random session tokens
- Custom responsive CSS and reduced-motion support
- Optional Umami Cloud analytics with privacy-friendly pageview and product event tracking

The app uses SQLite when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are absent, and uses Supabase Postgres through its server-side REST API when both are configured. Keep the Supabase service key server-only.

## Analytics

Rolegrove supports optional Umami Cloud analytics. Umami's free Hobby plan can track page views and product events without adding an advertising profile. Create a website in Umami Cloud, copy its website ID, and set `NEXT_PUBLIC_UMAMI_WEBSITE_ID` before building the Docker image. Leave it empty to disable analytics.

Tracked product events include workspace creation, login, and landing-page calls to action. Do not send emails, passwords, application notes, or other private workspace data to analytics.

## Project layout

```text
app/                 Pages and HTTP route handlers
components/          Landing, auth, and dashboard UI
lib/                 SQLite data access and session helpers
data/                Local database (created on first request, git-ignored)
```

## Free deployment notes

The Docker image is ready for a free container host, but SQLite needs a persistent filesystem. Many free web-service tiers use ephemeral storage, which would eventually lose user data. For a real public deployment, use a free host that provides durable storage or move the data layer to a free managed database before deploying. Configure HTTPS, production secrets, email verification, password recovery, rate limiting, and backups before serving a public audience. The current local app does not send email.

For local production testing:

```bash
docker compose up --build -d
docker compose logs -f rolegrove
```

Stop it with `docker compose down`; the named `rolegrove-data` volume keeps the database between restarts.

## Name check

On September 25, 2026, a public search found no exact GitHub repository match for `Rolegrove`, the npm registry returned no package under that name, and the `.com` RDAP lookup reported no registration. This is a quick availability check, not a trademark search or a guarantee that every social handle is free.

## License

MIT. See [LICENSE](LICENSE).
