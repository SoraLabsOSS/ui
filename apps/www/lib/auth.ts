import { dash } from "@better-auth/infra";
import { db } from "@workspace/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { oneTap, openAPI } from "better-auth/plugins";
import { env } from "@/env";
import { redisSecondaryStorage } from "./redis-secondary-storage";

export const auth = betterAuth({
  appName: "Sora UI",
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
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  secondaryStorage: redisSecondaryStorage,
  session: {
    storeSessionInDatabase: true, // Required when using oauth-provider with secondaryStorage
  },
  verification: {
    storeInDatabase: true,
  },
  advanced: {
    ipAddress: {
      // For Cloudflare
      // ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],

      // For Vercel
      ipAddressHeaders: ["x-vercel-forwarded-for", "x-forwarded-for"],

      // For AWS/Generic
      // ipAddressHeaders: ["x-forwarded-for"],
    },
  },
  rateLimit: {
    storage: "secondary-storage",
    enabled: true,
  },
  plugins: [
    // Interactive API reference and raw OpenAPI schema expose exact
    // endpoint paths/payloads (including dash() admin routes) to anyone;
    // only serve them outside production.
    ...(env.NODE_ENV === "production" ? [] : [openAPI()]),
    dash(),
    oneTap(),
  ],
});
