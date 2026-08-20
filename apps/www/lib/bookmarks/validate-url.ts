import { source } from "@/lib/docs/source";
import { componentSource } from "@/lib/registry/component-source";
import { uiSource } from "@/lib/ui/source";

export function getBookmarkableUrls(): Set<string> {
  const docsUrls = source
    .getPages()
    .filter((page) => page.slugs[0] !== "openapi")
    .map((page) => page.url);
  const componentUrls = componentSource.getPages().map((page) => page.url);
  const uiUrls = uiSource.getPages().map((page) => page.url);

  return new Set([...docsUrls, ...componentUrls, ...uiUrls]);
}

let validBookmarkUrls: Set<string> | undefined;

function refreshBookmarkUrlCache(): Set<string> {
  validBookmarkUrls = getBookmarkableUrls();
  return validBookmarkUrls;
}

function getCachedBookmarkUrls(): Set<string> {
  if (!validBookmarkUrls) {
    return refreshBookmarkUrlCache();
  }

  return validBookmarkUrls;
}

export function isValidBookmarkUrl(url: string): boolean {
  let urls = getCachedBookmarkUrls();

  if (!urls.has(url)) {
    urls = refreshBookmarkUrlCache();
  }

  return urls.has(url);
}
