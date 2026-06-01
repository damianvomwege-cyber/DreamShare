# DreamShare

DreamShare is a production-oriented social platform for sharing dreams, reacting to dream posts, commenting with nested replies, saving dreams, following users, searching content, viewing trends, and moderating the community through a private admin dashboard.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4 with full light/dark mode
- PostgreSQL, Prisma ORM 7, Prisma migrations
- NextAuth credentials provider with JWT sessions
- bcrypt password hashing
- Cloudinary signed uploads
- REST API route handlers and Server Actions
- Admin dashboard, RBAC, audit logs, rate limiting, login lockouts

## Local Setup

1. Install dependencies:

```bash
npm ci
```

2. Create env file:

```bash
cp .env.example .env
```

3. Set required secrets in `.env`:

```bash
NEXTAUTH_SECRET="generate-a-real-secret"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dreamshare?schema=public"
```

4. Start Postgres, then apply schema and seed. For a quick local Prisma Postgres instance:

```bash
npx prisma dev --name dreamshare --detach
npx prisma dev ls
```

Copy the TCP `postgres://...` URL into `DATABASE_URL`, then run:

```bash
npm run db:deploy
npm run db:seed
```

5. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## First Admin Setup

Admin routes are protected by `src/proxy.ts` and by server-side role checks on every admin page/action.

Create the first Owner in one of two ways:

- Set `DEFAULT_ADMIN_USERNAME`, `DEFAULT_ADMIN_EMAIL`, and `DEFAULT_ADMIN_PASSWORD` before running `npm run db:seed`.
- Or open `/admin/setup` on first launch and create the Owner interactively.

The requested default username is `DreamShare`. Put the provided first-install password in `DEFAULT_ADMIN_PASSWORD` locally only. The password is never stored in source code or returned by APIs; it is bcrypt-hashed before database storage.

After setup, `/admin/setup` automatically disables itself.

Regular user registration marks email as verified immediately for local/product simplicity. The token-backed `/verify-email` route remains available if email verification is re-enabled later.

## Main Routes

- `/` home feed and dream composer
- `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/explore`, `/trending`
- `/profile/[username]`
- `/dream/[id]`
- `/settings`, `/bookmarks`, `/notifications`
- `/admin`, `/admin/users`, `/admin/dreams`, `/admin/comments`, `/admin/logs`

## REST API

- `GET /api/dreams`
- `POST /api/dreams`
- `GET /api/dreams/[id]`
- `DELETE /api/dreams/[id]`
- `POST /api/dreams/[id]/reactions`
- `GET|POST /api/dreams/[id]/comments`
- `POST /api/dreams/[id]/bookmark`
- `GET /api/search?q=...`
- `POST /api/users/[username]/follow`
- `GET|PATCH /api/notifications`
- `POST /api/uploads/signature`
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/dreams`
- `GET /api/admin/comments`

## Security Notes

- Passwords are hashed with bcrypt.
- Sessions use NextAuth JWT cookies.
- Admin access uses RBAC: `USER`, `MODERATOR`, `ADMIN`, `OWNER`.
- Owner accounts cannot be deleted through admin actions.
- Admin login/logout and destructive moderation actions are recorded in `AdminLog`.
- Credentials login is rate-limited in memory and locked in the database after repeated failures.
- Admin routes are gated in `src/proxy.ts`, but authorization is also rechecked inside pages, actions, and APIs.
- User content is length-limited, sanitized as plain text, and checked against basic spam signals.
- Security headers are set in `next.config.ts`.

## Cloudinary

Set:

```bash
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

Authenticated clients can request signed upload parameters from `POST /api/uploads/signature`.

## Vercel

1. Create a Vercel project from this repo.
2. Add a PostgreSQL database and set `DATABASE_URL`.
3. Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and Cloudinary vars.
4. Deploy.
5. Run migrations from a trusted shell:

```bash
npm run db:deploy
npm run db:seed
```

## Railway

1. Create a Railway project with PostgreSQL.
2. Add all variables from `.env.example`.
3. Railway uses `railway.json`:

```bash
npx prisma migrate deploy && npm run start
```

4. Run `npm run db:seed` once to create categories and optional first Owner.

## Docker

```bash
docker compose up --build
```

The app container runs `prisma migrate deploy` before starting. Use `/admin/setup` for the first Owner unless you provide first-launch admin env vars.

## Quality Checks

```bash
npm run typecheck
npm run lint
npm run build
```

All three pass in this workspace.
