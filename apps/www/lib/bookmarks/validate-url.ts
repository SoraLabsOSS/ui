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
let componentsIntegrated = false;

function cacheIncludesComponentUrls(urls: Set<string>): boolean {
  for (const cachedUrl of urls) {
    if (cachedUrl === "/components" || cachedUrl.startsWith("/components/")) {
      return true;
    }
  }

  return false;
}

function refreshComponentsIntegrated(urls: Set<string>): void {
  componentsIntegrated =
    componentSource.getPages().length > 0 && cacheIncludesComponentUrls(urls);
}

function isComponentBookmarkUrl(url: string): boolean {
  return url === "/components" || url.startsWith("/components/");
}

function countComponentUrlsInCache(urls: Set<string>): number {
  let count = 0;

  for (const cachedUrl of urls) {
    if (isComponentBookmarkUrl(cachedUrl)) {
      count++;
    }
  }

  return count;
}

function refreshBookmarkUrlCache(): Set<string> {
  validBookmarkUrls = getBookmarkableUrls();
  refreshComponentsIntegrated(validBookmarkUrls);
  return validBookmarkUrls;
}

function getCachedBookmarkUrls(): Set<string> {
  if (!validBookmarkUrls) {
    return refreshBookmarkUrlCache();
  }

  return validBookmarkUrls;
}

export function isValidBookmarkUrl(url: string): boolean {
  // Defer building the set until validation runs so componentSource is fully
  // initialized (eager module-level init can run before getPages() is populated).
  let urls = getCachedBookmarkUrls();

  if (isComponentBookmarkUrl(url) && !urls.has(url)) {
    const sourcePageCount = componentSource.getPages().length;
    const shouldRefresh =
      !componentsIntegrated ||
      sourcePageCount > countComponentUrlsInCache(urls);

    if (shouldRefresh) {
      urls = refreshBookmarkUrlCache();
      return urls.has(url);
    }
  }

  return urls.has(url);
}
