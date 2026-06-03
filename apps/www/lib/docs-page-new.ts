import { isRecentlyReleased } from "@/lib/is-recently-released";

export function isPageNew(
  url: string | undefined,
  releaseDatesByUrl: Record<string, string>
): boolean {
  if (!url) {
    return false;
  }
  return isRecentlyReleased(releaseDatesByUrl[url]);
}
