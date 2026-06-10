"use client";

import { useAuth } from "@better-auth-ui/react";
import { useSearchParams } from "next/navigation";

function isSafeRedirectPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

/**
 * Resolves post-auth redirect from `?redirectTo=` on the current page,
 * falling back to AuthProvider `redirectTo` (e.g. `/docs`).
 */
export function useAuthRedirectTo(): string {
  const { redirectTo: fallbackRedirectTo } = useAuth();
  const searchParams = useSearchParams();
  const redirectFromQuery = searchParams.get("redirectTo")?.trim();

  if (redirectFromQuery && isSafeRedirectPath(redirectFromQuery)) {
    return redirectFromQuery;
  }

  return fallbackRedirectTo;
}
