/**
 * Mutation keys contributed by the multi-session plugin.
 */
export const multiSessionMutationKeys = {
  /** Root key for every multi-session mutation. */
  all: ["auth", "multiSession"] as const,
  /** Key for `multiSession.revoke`. */
  revoke: ["auth", "multiSession", "revoke"] as const,
  /** Key for `multiSession.setActive`. */
  setActive: ["auth", "multiSession", "setActive"] as const,
} as const;
