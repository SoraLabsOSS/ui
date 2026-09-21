import { z } from "zod";

export function isBookmarkablePath(url: string): boolean {
  return (
    url === "/docs" ||
    url.startsWith("/docs/") ||
    url === "/catalog" ||
    url.startsWith("/catalog/") ||
    url === "/components" ||
    url.startsWith("/components/") ||
    url === "/ui" ||
    url.startsWith("/ui/") ||
    url === "/motion" ||
    url.startsWith("/motion/") ||
    url === "/icons" ||
    url.startsWith("/icons/") ||
    url === "/primitives" ||
    url.startsWith("/primitives/")
  );
}

export const bookmarkUrlSchema = z.object({
  url: z.string().min(1).max(512).refine(isBookmarkablePath, {
    message: "Must be a valid docs, motion, icons, catalog, or UI path",
  }),
});

export type BookmarkUrlInput = z.infer<typeof bookmarkUrlSchema>;
