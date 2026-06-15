"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@workspace/auth-ui/components/auth/auth-provider";
import { GoogleOneTapPendingProvider } from "@workspace/auth-ui/context/google-one-tap-pending";
import { deleteUserPlugin } from "@workspace/auth-ui/lib/auth/delete-user-plugin";
import { Toaster } from "@workspace/ui/components/ui/sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        avatar={{ enabled: false }}
        baseURL={env.NEXT_PUBLIC_BETTER_AUTH_URL}
        emailAndPassword={{
          enabled: false,
          forgotPassword: false,
        }}
        Link={Link}
        navigate={({ to, replace }) =>
          replace ? router.replace(to) : router.push(to)
        }
        plugins={[deleteUserPlugin()]}
        redirectTo="/docs"
        socialProviders={["google", "github"]}
      >
        <GoogleOneTapPendingProvider>
          {children}

          <Toaster />
        </GoogleOneTapPendingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
