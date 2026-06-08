export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  list: (userId: string) => [...bookmarkKeys.all, "list", userId] as const,
};
