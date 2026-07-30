import { Elysia } from "elysia";
import { authRoutes } from "./auth";

export const v1Routes = new Elysia({ prefix: "/api/v1" })
  .use(authRoutes);
