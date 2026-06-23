import { z } from "zod";

export function isBookmarkablePath(url: string): boolean {
  return (
    url === "/docs" ||
    url.startsWith("/docs/") ||
    url === "/components" ||
    url.startsWith("/components/")
  );
}

export const bookmarkUrlSchema = z.object({
  url: z.string().min(1).max(512).refine(isBookmarkablePath, {
    message: "Must be a docs or components path",
  }),
});

export type BookmarkUrlInput = z.infer<typeof bookmarkUrlSchema>;
