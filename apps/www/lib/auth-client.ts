// import { sentinelClient } from "@better-auth/infra/client";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL, // ... your existing config
  plugins: [
    // ... other plugins
    // sentinelClient(),
  ],
});
