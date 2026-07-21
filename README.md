# Bekasi Stock Exchange (BSE) Core System

This repository (`bse-core`) is a monorepo containing the frontend application, backend microservices, and shared packages for the Bekasi Stock Exchange. It is built using **Bun workspaces**.

## 🏗 Architecture

### Frontend (`/app`)
A Single Page Application (SPA) built with:
- **React**
- **Vite**
- **TanStack Router** (File-based routing)
- **TanStack Query** (Data fetching and state management)

### Backend Services (`/server/services`)
High-performance backend microservices built with **Elysia** (on Bun) and **Eden** for end-to-end type safety:
- **`ms-bse-core-transaction`**: Microservice handling trading and transactions.
- **`ms-bse-core-user`**: Microservice handling user accounts and authentication.

### Shared Packages (`/server/packages`)
Internal libraries shared across the microservices:
- **`@bse/database`**: Shared database schema, connection logic, and queries.
- **`@bse/utils`**: Common utility functions.

## 🚀 Getting Started

### Prerequisites
You need to have **[Bun](https://bun.sh/)** installed on your machine.

### Installation
Clone the repository and install all dependencies from the root directory. Bun will automatically link the workspaces.

```bash
bun install
```

### Running the Project
Since this is a monorepo, you can run services individually from their respective directories:

```bash
# To run the user microservice
cd server/services/ms-bse-core-user
bun run dev

# To run the frontend app
cd app
bun run dev
```

*(Note: Root-level scripts can be added to `package.json` later to run everything concurrently if needed).*
