import { Hono } from "hono";
import { getAuth } from "../auth";
import type { Env } from "../types/env";

export const authRoutes = new Hono<{ Bindings: Env }>();

authRoutes.all("/*", (c) => {
  const auth = getAuth(c.env);
  return auth.handler(c.req.raw);
});
