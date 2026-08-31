import { betterAuth } from "better-auth";
import type { Env } from "./types/env";

export const getAuth = (env: Env) => {
  const configuredOrigins = env.CORS_ORIGIN
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  const configuredHosts = configuredOrigins.flatMap((origin) => {
    try {
      return [new URL(origin).host]
    } catch {
      return []
    }
  })

  return betterAuth({
    database: env.DB,
    secret: env.API_SECRET,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 30,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
      },
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
    baseURL: {
      allowedHosts: [
        'nexcoach-api.yusufk6509.workers.dev',
        'nexcoach.pages.dev',
        '*.vercel.app',
        'localhost:*',
        ...configuredHosts,
      ],
      protocol: env.ENVIRONMENT === 'production' ? 'https' : 'auto',
      fallback: env.ENVIRONMENT === 'production'
        ? 'https://nexcoach-api.yusufk6509.workers.dev/api/auth'
        : 'http://localhost:8787/api/auth',
    },
    trustedOrigins: [
      'http://localhost:3000',
      'https://nexcoach.pages.dev',
      'https://*.vercel.app',
      ...configuredOrigins,
    ],
  });
};
