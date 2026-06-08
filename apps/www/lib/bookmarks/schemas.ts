import { z } from "zod";

export function isDocsBookmarkPath(url: string): boolean {
  return url === "/docs" || url.startsWith("/docs/");
}

export const bookmarkUrlSchema = z.object({
  url: z.string().min(1).max(512).refine(isDocsBookmarkPath, {
    message: "Must be a docs path",
  }),
});

export type BookmarkUrlInput = z.infer<typeof bookmarkUrlSchema>;
