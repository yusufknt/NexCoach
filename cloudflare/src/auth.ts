import { betterAuth } from "better-auth";
import type { Env } from "./types/env";

export const getAuth = (env: Env) => {
  return betterAuth({
    database: env.DB,
    secret: env.API_SECRET,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    // We get origin from env or assume production worker url
    baseURL: env.ENVIRONMENT === "production" 
      ? "https://nexcoach-api.yusufk6509.workers.dev/api/auth" 
      : "http://localhost:8787/api/auth",
    trustedOrigins: ["http://localhost:3000", env.CORS_ORIGIN, "https://nexcoach.pages.dev"],
  });
};
