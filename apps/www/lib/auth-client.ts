import { sentinelClient } from "@better-auth/infra/client";
import {
  lastLoginMethodClient,
  oneTapClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  env,
  isGoogleOneTapConfigured,
  isSentinelClientConfigured,
} from "@/env";

/** Mutated before `oneTap()` so GIS uses the active light/dark scheme. */
export const oneTapGisOptions = {
  color_scheme: "default" as "default" | "light" | "dark",
};

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    ...(isSentinelClientConfigured()
      ? [
          sentinelClient({
            identifyUrl: env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL,
            autoSolveChallenge: true,
          }),
        ]
      : []),
    ...(isGoogleOneTapConfigured()
      ? [
          oneTapClient({
            clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            cancelOnTapOutside: false,
            additionalOptions: oneTapGisOptions,
          }),
        ]
      : []),
    lastLoginMethodClient(),
  ],
});
