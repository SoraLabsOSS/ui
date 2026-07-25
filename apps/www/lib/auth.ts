import { dash, sentinel } from "@better-auth/infra";
import { db } from "@workspace/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { lastLoginMethod, oneTap, openAPI } from "better-auth/plugins";
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
    cookieCache: {
      enabled: true,
      maxAge: 60, // Serve session reads from the signed cookie instead of hitting Redis
    },
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
    customRules: {
      // Cookie cache covers repeated reads; no need to also hit Redis for rate-limiting.
      "/get-session": false,
    },
  },
  plugins: [
    // Interactive API reference and raw OpenAPI schema expose exact
    // endpoint paths/payloads (including dash() admin routes) to anyone;
    // only serve them outside production.
    ...(env.NODE_ENV === "production" ? [] : [openAPI()]),
    dash(),
    oneTap(),
    lastLoginMethod(),
    sentinel({
      apiKey: env.BETTER_AUTH_API_KEY,
      kvUrl: env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL,
      security: {
        // Safe to hard-block regardless of traffic — no legitimate case for
        // a leaked password or disposable signup email.
        compromisedPassword: {
          enabled: true,
          action: "block",
        },
        emailValidation: {
          enabled: true,
          strictness: "medium",
          action: "block",
        },
        emailNormalization: { enabled: true },

        // Everything below starts in "log" mode — this is a brand-new,
        // low-traffic site with no baseline yet. Flip to "challenge"/"block"
        // once Sentinel's dashboard shows these aren't firing on real users.
        credentialStuffing: {
          enabled: true,
          thresholds: { challenge: 3, block: 5 },
        },
        impossibleTravel: {
          enabled: true,
          action: "log",
        },
        velocity: {
          enabled: true,
          maxSignupsPerVisitor: 5,
          action: "log",
        },
        botBlocking: { action: "log" },
        suspiciousIpBlocking: { action: "log" },
      },
    }),
  ],
});
