/**
 * Mutation keys contributed by the delete-user plugin.
 */
export const deleteUserMutationKeys = {
  /** Key for `deleteUser`. */
  deleteUser: ["auth", "deleteUser"] as const,
} as const;
