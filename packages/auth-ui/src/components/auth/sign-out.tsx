"use client";

import { useAuth, useSignOut } from "@workspace/auth-ui/lib/auth-react";
import { Spinner } from "@workspace/ui/components/ui/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef } from "react";

export interface SignOutProps {
  className?: string;
}

/**
 * Signs the current user out on mount and renders a centered spinner while the operation completes.
 *
 * @param className - Optional additional class names appended to the root element
 * @returns The spinner shown during sign-out
 */
export function SignOut({ className }: SignOutProps) {
  const { authClient, basePaths, navigate, viewPaths } = useAuth();

  const { mutate: signOut } = useSignOut(authClient, {
    onError: () => {
      navigate({
        to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
        replace: true,
      });
    },
    onSuccess: () =>
      navigate({
        to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
        replace: true,
      }),
  });

  const hasSignedOut = useRef(false);

  useEffect(() => {
    if (hasSignedOut.current) {
      return;
    }
    hasSignedOut.current = true;

    signOut();
  }, [signOut]);

  return <Spinner className={cn("mx-auto my-auto", className)} />;
}
