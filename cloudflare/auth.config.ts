import { betterAuth } from "better-auth";
export const auth = betterAuth({
  database: {
    dialect: "sqlite",
    type: "sqlite",
    provider: "sqlite",
    url: "dummy.sqlite"
  },
  emailAndPassword: { enabled: true }
});
