import { dash, sentinel } from "@better-auth/infra";
import { db } from "@workspace/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { lastLoginMethod, oneTap, openAPI } from "better-auth/plugins";
import {
  env,
  getBetterAuthSecret,
  isGithubAuthConfigured,
  isGoogleAuthConfigured,
  isRedisConfigured,
  isSentinelConfigured,
} from "@/env";
import { logAuthApiError } from "./log-auth-api-error";
import { redisSecondaryStorage } from "./redis-secondary-storage";

const authSecret = getBetterAuthSecret();

export const auth = betterAuth({
  appName: "Sora UI",
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  secret: authSecret ?? "build-time-auth-secret-placeholder",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
      // Settings → Link GitHub/Google while signed in. Sign-in still only
      // auto-links when emails match.
      allowDifferentEmails: true,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: (user) => {
          const name = typeof user.name === "string" ? user.name.trim() : "";
          const email = typeof user.email === "string" ? user.email : "";
          const fallbackName = email.split("@")[0] || "User";

          return Promise.resolve({
            data: {
              ...user,
              // OAuth-only app: IdP already proved the mailbox. Future Better
              // Auth minors always require `emailVerified` for implicit linking.
              emailVerified: true,
              name: name || fallbackName,
            },
          });
        },
      },
    },
    session: {
      create: {
        before: async (session, ctx) => {
          if (!ctx) {
            return;
          }

          const existing = await ctx.context.internalAdapter.findUserById(
            session.userId
          );
          if (existing && !existing.emailVerified) {
            await ctx.context.internalAdapter.updateUser(existing.id, {
              emailVerified: true,
            });
          }
        },
      },
    },
  },
  socialProviders: {
    ...(isGoogleAuthConfigured()
      ? {
          google: {
            clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
          },
        }
      : {}),
    ...(isGithubAuthConfigured()
      ? {
          github: {
            clientId: env.GITHUB_CLIENT_ID!,
            clientSecret: env.GITHUB_CLIENT_SECRET!,
          },
        }
      : {}),
  },
  ...(isRedisConfigured() ? { secondaryStorage: redisSecondaryStorage } : {}),
  session: {
    freshAge: 0, // Disable freshAge check so listSessions and sensitive actions do not 403 on older sessions
    storeSessionInDatabase: true, // Required when using oauth-provider with secondaryStorage
    cookieCache: {
      enabled: true,
      maxAge: 300, // Serve session reads from the encrypted cookie instead of hitting DB/Redis
      strategy: "jwe",
    },
  },
  verification: {
    storeInDatabase: true,
  },
  advanced: {
    database: {
      joins: true,
    },
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
    storage: isRedisConfigured() ? "secondary-storage" : "memory",
    enabled: true,
    customRules: {
      // Cookie cache covers repeated reads; no need to also hit Redis for rate-limiting.
      "/get-session": false,
    },
  },
  onAPIError: {
    errorURL: "/auth/error",
    onError: (error) => {
      logAuthApiError(error);
    },
  },
  plugins: [
    // Interactive API reference and raw OpenAPI schema expose exact
    // endpoint paths/payloads (including dash() admin routes) to anyone;
    // only serve them outside production.
    ...(env.NODE_ENV === "production" ? [] : [openAPI()]),
    dash(),
    ...(isGoogleAuthConfigured() ? [oneTap()] : []),
    lastLoginMethod(),
    ...(isSentinelConfigured()
      ? [
          sentinel({
            apiKey: env.BETTER_AUTH_API_KEY!,
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
              // Off: Better Auth links by exact email. Gmail dot-stripping
              // stored `truonggiangaxyl@gmail.com` and blocked Google linking.
              emailNormalization: { enabled: false },

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
        ]
      : []),
  ],
});
