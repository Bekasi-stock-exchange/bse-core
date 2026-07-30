import { Elysia, t } from "elysia";
import { UserModel } from "../../../models/UserModel";
import { ResponseHandler } from "@bse/utils";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/register", async ({ body, set }) => {
    try {
      const user = await UserModel.registerUser(body);
      set.status = 201;
      return ResponseHandler.success(user, 201);
    } catch (error: any) {
      set.status = 400;
      return ResponseHandler.error(400, error.message);
    }
  }, {
    body: t.Object({
      username: t.String({ minLength: 3 }),
      email: t.Optional(t.String({ format: 'email' })),
      name: t.String(),
      password: t.String({ minLength: 6 }),
      referralCode: t.String()
    })
  });
