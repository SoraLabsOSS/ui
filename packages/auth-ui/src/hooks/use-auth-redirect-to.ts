"use client";

import { useAuth } from "@workspace/auth-ui/lib/auth-react";
import { useSearchParams } from "next/navigation";
import { resolveAuthRedirectTo } from "../lib/auth/redirect-to";

/**
 * Resolves post-auth redirect from `?redirectTo=` on the current page,
 * falling back to AuthProvider `redirectTo` (e.g. `/docs`).
 */
export function useAuthRedirectTo(): string {
  const { redirectTo: fallbackRedirectTo } = useAuth();
  const searchParams = useSearchParams();

  return resolveAuthRedirectTo(
    searchParams.get("redirectTo"),
    fallbackRedirectTo
  );
}
