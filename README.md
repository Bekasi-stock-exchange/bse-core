# Bekasi Stock Exchange (BSE) Core System

This repository (`bse-core`) is a monorepo containing the frontend application, backend microservices, and shared packages for the Bekasi Stock Exchange. It is built using **Bun workspaces**.

## 🏗 Architecture

### Frontend (`/app`)
A web application built with **Next.js 16** (App Router):
- **React 19**
- **Tailwind CSS v4**
- **Zustand 5** (state management)
- **Eden Treaty** (type-safe API client to the Elysia backend)

### Backend Services (`/server/services`)
High-performance backend microservices built with **Elysia** (on Bun) and **Eden** for end-to-end type safety:
- **`ms-bse-core-user`** (`@bse/ms-user`): User accounts and authentication (register/login/refresh/logout).
- **`ms-bse-core-transaction`** (`@bse/ms-transaction`): Trading and transactions (scaffolded).

### Shared Packages (`/server/packages`)
Internal libraries shared across the microservices:
- **`@bse/database`**: Drizzle ORM schema, connection logic, and database scripts.
- **`@bse/utils`**: Shared middleware (`useApiKey`, `useAuth`), error/response handlers, logger, and encryption helpers.
- **`@bse/swagger`**: Conditional Swagger documentation plugin.

## 🚀 Getting Started

### Prerequisites
You need to have **[Bun](https://bun.sh/)** installed on your machine.

### Installation
Clone the repository and install all dependencies from the root directory. Bun will automatically link the workspaces.

```bash
bun install
```

### Running the Project
Run each workspace from the root using the convenience scripts, or `cd` into a workspace and run `bun run dev`:

```bash
# From the repo root
bun run dev:app            # frontend (Next.js dev)
bun run dev:user           # user microservice
bun run dev:transaction    # transaction microservice

# Build, lint, and typecheck across workspaces
bun run build
bun run lint
bun run typecheck
```
