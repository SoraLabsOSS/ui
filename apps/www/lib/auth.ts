import { db } from "@workspace/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { env } from "@/env";
import { redisSecondaryStorage } from "./redis-secondary-storage";

export const auth = betterAuth({
  experimental: { joins: true },
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  socialProviders: {
    google: {
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  secondaryStorage: redisSecondaryStorage,
  session: {
    storeSessionInDatabase: true, // Required when using oauth-provider with secondaryStorage
  },
  verification: {
    storeInDatabase: true,
  },
});
