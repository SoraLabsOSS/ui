import { authQueryKeys } from "../../auth-query-keys";

/** Query key factory for multi-session queries, scoped per user. */
export const multiSessionQueryKeys = {
  all: (userId: string | undefined) =>
    [...authQueryKeys.user(userId), "multiSession"] as const,

  lists: (userId: string | undefined) =>
    [...multiSessionQueryKeys.all(userId), "list"] as const,

  list: <TQuery = undefined>(userId: string | undefined, query?: TQuery) =>
    [...multiSessionQueryKeys.lists(userId), query ?? null] as const,
} as const;
