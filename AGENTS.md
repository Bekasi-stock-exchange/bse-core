# AGENTS.md

Project guidance for AI agents working in the `bse-core` monorepo.

## Project

`bse-core` is the monorepo for the **Bekasi Stock Exchange (BSE) Core System** — a trading platform with a Next.js frontend (`app/`) and Elysia/Bun backend microservices under `server/`. Managed with **Bun workspaces**.

## Layout

```
bse-core/
├── app/                          # Next.js 16 frontend (App Router, React 19, Tailwind v4, Zustand, Eden Treaty)
├── server/
│   ├── packages/                 # Shared internal packages
│   │   ├── database/             # @bse/database  (Drizzle ORM + pg, schema, db scripts)
│   │   ├── utils/                # @bse/utils     (useApiKey, useAuth, errorHandler, responseHandler, logger, encryption)
│   │   └── swagger/              # @bse/swagger   (conditional Swagger docs plugin)
│   └── services/                 # Elysia microservices
│       ├── ms-bse-core-user/             # @bse/ms-user        (auth: register/login/refresh/logout)
│       └── ms-bse-core-transaction/      # @bse/ms-transaction (scaffolded, no src yet)
├── package.json                  # workspace manifest only (no root scripts)
└── tsconfig.json                 # base TS config (ESNext, strict, Bundler resolution)
```

## Commands

All commands run from the relevant workspace directory (not the root). The root `package.json` defines workspaces only — there are no root-level scripts.

### Install (from root)
```bash
bun install
```

### Frontend — `app/`
```bash
bun run dev      # next dev
bun run build    # next build
bun run start    # next start
bun run lint     # eslint (only this workspace has linting configured)
```

### Backend service — `server/services/ms-bse-core-user/` (same scripts in `ms-bse-core-transaction`)
```bash
bun run dev      # bun run --watch src/index.ts  (PORT from .env, default 3001 for ms-user)
bun run build    # bun build src/index.ts --outdir dist
bun run start    # bun run src/index.ts
```

### Database — `server/packages/database/`
```bash
bun run db:create    # create physical DB
bun run db:push      # push schema + seed        (most common after schema changes)
bun run db:generate  # generate SQL migration
bun run db:migrate   # apply migrations
bun run db:studio    # Drizzle Studio GUI
bun run db:reset     # DANGER: drop+recreate+push+seed (interactive CONFIRM prompt)
```

### Typecheck (no dedicated script — run manually)
```bash
tsc --noEmit -p app/tsconfig.json
tsc --build server/services/ms-bse-core-user/tsconfig.json
```

## Testing

There is **no test setup** in this project — no framework, no test files, no `test` script. If introducing tests, prefer Bun's built-in `bun test` for backend packages and a React-compatible runner for `app/`.

## Tech Stack

- **Runtime/Package manager:** Bun (workspaces)
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, Zustand 5, Eden Treaty (type-safe API client to Elysia backend)
- **Backend:** Elysia + Bun, PostgreSQL via `pg` + Drizzle ORM 0.45, `jose` (JWT), `@elysiajs/{jwt,cors,swagger,eden}`, pino logging (daily rotation)
- **Language:** TypeScript strict everywhere

## Conventions

- **Elysia service-plugin pattern:** each route is a self-contained `new Elysia()` exporting a named const (e.g. `registerService`), composed via `.use()` and grouped under prefixes (`/api/v1`, `/auth`). Use `.as("scoped")` or `.as("global")`.
- **Layered backend:** `modules/.../services/*.service.ts` (HTTP/route + `t.Object` body schema) → `models/*.ts` (DB access via `@bse/database`, static methods on a class like `UserModel.registerUser`).
- **Standardized responses** via `ResponseHandler.success/error` (`{statusCode, statusMessage, success, data?, error?, errors?}`).
- **Centralized error handling** in `errorHandler.ts`: `VALIDATION`→422, `PARSE`→400, `NOT_FOUND`→404, else 500.
- **Middleware:** `useApiKey` (global, enforces `x-api-key` header), `useAuth` (scoped, verifies `Authorization: Bearer` via `jose`).
- **JSDoc `@file`/`@description` block comments** at the top of every backend source file describing flow, responses, and security notes.
- **Logging** via `pino` with structured object payloads.
- **Frontend:** `"use client"` on interactive pages; Next.js route groups `(pages)` and `(auth)`; path aliases `@/`, `@lib/`, `@components/`, `@store/` → `./src/*` subfolders; Tailwind utilities with custom `@theme` (dark palette, `glass`, `glow-primary`, `glow-accent`).
- **Env config** via `process.env.*` (Bun loads `.env` natively — no dotenv lib). `.env` files are gitignored.

## Security conventions

- Passwords hashed with Argon2id (`Bun.password.hash/verify`).
- Refresh tokens stored only as SHA-256 hashes; raw token sent in httpOnly cookie.
- JWT access tokens 5-minute expiry; refresh-token rotation with reuse detection.
- AES-256-GCM for encryption (`@bse/utils` `encrypt`/`decrypt`), SHA-256 for token hashing.
- Never log or expose secrets. `.env` files must not be committed (they are gitignored; verify before staging).

## Notes / caveats

- **`app/AGENTS.md`** warns that Next.js 16 has breaking changes; consult `node_modules/next/dist/docs/` before writing Next.js code.
- **`ms-bse-core-transaction`** is an empty scaffold (package.json + tsconfig only, no `src/`); its `dev`/`build`/`typecheck` scripts will fail until `src/index.ts` is created.
- **Linting:** `app/` uses `eslint-config-next`; server packages share `server/eslint.config.mjs` (flat config, ESLint 9 + `typescript-eslint`). The app currently has pre-existing lint errors (see `bun run --cwd app lint`); server packages lint cleanly (warnings only).
- **Typecheck:** run `bun run typecheck` from the root. The `app` typecheck includes `.next/types/**` generated by `next dev`/`next build`; a stale `.next` cache can produce false `validator.ts` errors — delete `app/.next` or run a build to regenerate.
- A `@ts-expect-error` previously in `app/src/lib/api.ts` (Elysia type-hash mismatch) was resolved by aligning TypeScript to `^5` across all workspaces; the `fetcher` is now cast to `typeof fetch`.
