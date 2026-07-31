/** User fields used when resolving avatar / profile display. */
export interface SessionDisplayUser {
  displayUsername?: string | null;
  email?: string | null;
  image?: string | null;
  name?: string | null;
  username?: string | null;
}

/**
 * Resolve the user to display without reading session data during SSR
 * or before the client has mounted and finished loading the session.
 */
export function resolveSessionUser<T extends SessionDisplayUser>({
  user,
  sessionUser,
  mounted,
  sessionPending,
  isPending = false,
}: {
  user?: T;
  sessionUser?: T;
  mounted: boolean;
  sessionPending: boolean;
  isPending?: boolean;
}): T | undefined {
  if (user) {
    return user;
  }

  if (!mounted || sessionPending || isPending) {
    return;
  }

  return sessionUser;
}

/**
 * Whether to show a skeleton while session data is unavailable.
 * Includes `!mounted` so server and the client's first render stay aligned.
 */
export function shouldShowSessionSkeleton({
  user,
  mounted,
  sessionPending,
  isPending = false,
}: {
  user?: SessionDisplayUser;
  mounted: boolean;
  sessionPending: boolean;
  isPending?: boolean;
}): boolean {
  if (user) {
    return false;
  }

  return isPending || sessionPending || !mounted;
}
