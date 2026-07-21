# @bse/database

This package is the centralized, reusable database layer for the Bekasi Stock Exchange (BSE) Core monorepo. It leverages **PostgreSQL** and **Drizzle ORM** to provide a type-safe interface for managing data across all internal microservices and frontend applications.

## 📦 Features

- **Centralized Schema Definitions**: All database schemas (Users, Transactions, etc.) live here and are exported for use across the monorepo.
- **Type-Safe Queries**: Fully typed queries thanks to Drizzle ORM and TypeScript.
- **Custom PostgreSQL Schemas**: Utilizes Drizzle's `pgSchema` to organize tables neatly into database-level schemas (e.g., `users`, `transactions`).
- **Automated Tooling**: Bundled with utility scripts for fast local prototyping, resetting, and migration generation.

## 🚀 Getting Started

### 1. Environment Setup
Copy the example environment file and configure it with your local PostgreSQL connection (like Laragon):

```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set correctly in the `.env` file.

### 2. Installation
Dependencies are managed via the monorepo root. Ensure you have run the install command at the root:
```bash
bun install
```

### 3. Database Initialization
If your database doesn't exist yet, you can create it automatically using our custom script (it will parse the database name from your `DATABASE_URL`):
```bash
bun run db:create
```

Once created, push your schema structures into the database natively:
```bash
bun run db:push
```

## 📜 Available Scripts

We have bundled several npm scripts in `package.json` to make database management easy:

| Command | Description |
|---|---|
| `bun run db:create` | Creates the physical database instance on your Postgres server. |
| `bun run db:generate` | Inspects schema files and generates a new SQL migration file in the `drizzle/` folder. |
| `bun run db:push` | Pushes the schema changes directly to the database without generating a migration file (best for rapid local prototyping). |
| `bun run db:migrate` | Applies the generated SQL migrations to the database. |
| `bun run db:studio` | Opens a local Drizzle Studio GUI in your browser to view and edit your database tables interactively. |
| `bun run db:reset` | **DANGER**: Drops the entire database, recreates it from scratch, and pushes the latest schemas. Perfect for local dev environments when you want a clean slate. |

## 💻 Usage in other packages

You can import the configured database instance (`db`) and all schema definitions directly from `@bse/database` into any other workspace package!

```typescript
// Example usage in an Elysia backend service
import { db, users } from "@bse/database";

const allUsers = await db.select().from(users);
```
