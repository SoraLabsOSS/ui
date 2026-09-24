"use client";

import { useAuth, useSession } from "@workspace/auth-ui/lib/auth-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/ui/avatar";
import { Skeleton } from "@workspace/ui/components/ui/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import type { User } from "better-auth";
import { User2 } from "lucide-react";
import type { ReactNode } from "react";
import { useClientMounted } from "../../../hooks/use-client-mounted";
import {
  resolveSessionUser,
  type SessionDisplayUser,
  shouldShowSessionSkeleton,
} from "../../../lib/resolve-session-user";

function emailToHue(email: string): number {
  let hash = 0;
  for (const char of email) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  return hash;
}

export interface UserAvatarProps {
  className?: string;
  fallback?: ReactNode;
  isPending?: boolean;
  /** @remarks `User` */
  user?: User & { username?: string | null; displayUsername?: string | null };
}

/**
 * Display a user's avatar using session information or an explicit user prop.
 *
 * Renders a circular avatar that shows the user's image when available, a fallback node if provided, or a hue-based background; while the session is loading (or when `isPending` is true) and no `user` prop is supplied, renders a skeleton placeholder. Before mount, a skeleton is always shown without a `user` prop so server and client markup match.
 *
 * @param className - Additional CSS classes applied to the avatar container
 * @param user - Optional user object to display instead of the session user
 * @param isPending - When true, treat the component as loading and show the skeleton if no `user` is provided
 * @param fallback - Optional node to render inside the avatar fallback area
 * @returns The avatar element to render (JSX)
 */
export function UserAvatar({
  className,
  user,
  isPending,
  fallback,
}: UserAvatarProps) {
  const mounted = useClientMounted();
  const { authClient } = useAuth();
  const { data: session, isPending: sessionPending } = useSession(authClient, {
    enabled: !(user || isPending),
  });

  if (
    shouldShowSessionSkeleton({
      user,
      mounted,
      sessionPending,
      isPending,
    })
  ) {
    return <Skeleton className={cn("size-8 rounded-full", className)} />;
  }

  const resolvedUser = resolveSessionUser<SessionDisplayUser>({
    user,
    sessionUser: session?.user,
    mounted,
    sessionPending,
    isPending,
  });

  const identity =
    resolvedUser?.email || resolvedUser?.name || resolvedUser?.username || "";
  const hue = emailToHue(identity);

  return (
    <Avatar
      className={cn(
        "size-8 rounded-full bg-muted text-foreground text-sm",
        className
      )}
    >
      <AvatarImage
        alt={
          resolvedUser?.displayUsername ||
          resolvedUser?.name ||
          resolvedUser?.email ||
          undefined
        }
        src={resolvedUser?.image ?? undefined}
      />

      <AvatarFallback
        className="text-muted-foreground!"
        delayMs={resolvedUser?.image ? 600 : undefined}
        style={
          identity
            ? {
                background: `linear-gradient(135deg, oklch(0.35 0.08 ${hue}), oklch(0.25 0.05 ${hue + 40}))`,
              }
            : undefined
        }
      >
        {fallback || (!identity && <User2 className="size-4" />)}
      </AvatarFallback>
    </Avatar>
  );
}
