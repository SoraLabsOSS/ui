import { source } from "@/lib/docs/source";

const validBookmarkUrls = new Set(
  source
    .getPages()
    .filter((page) => page.slugs[0] !== "openapi")
    .map((page) => page.url)
);

export function isValidBookmarkUrl(url: string): boolean {
  return validBookmarkUrls.has(url);
}
