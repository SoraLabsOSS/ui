import { normalizeBookmarkUrl } from "@/lib/bookmarks/url";
import { source } from "@/lib/docs/source";
import { iconsSource } from "@/lib/icons/source";
import { motionSource } from "@/lib/motion/source";
import { componentSource } from "@/lib/registry/component-source";
import { uiSource } from "@/lib/ui/source";

export function getBookmarkableUrls(): Set<string> {
  const docsUrls = source
    .getPages()
    .filter((page) => page.slugs[0] !== "openapi")
    .map((page) => page.url);
  const motionUrls = motionSource.getPages().map((page) => page.url);
  const iconsUrls = iconsSource.getPages().map((page) => page.url);
  const componentUrls = componentSource.getPages().map((page) => page.url);
  const uiUrls = uiSource.getPages().map((page) => page.url);

  return new Set([
    ...docsUrls,
    ...motionUrls,
    ...iconsUrls,
    ...componentUrls,
    ...uiUrls,
  ]);
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

function resolveBookmarkUrlFromSet(
  url: string,
  urls: ReadonlySet<string>
): string | null {
  if (urls.has(url)) {
    return url;
  }

  const normalized = normalizeBookmarkUrl(url);
  if (urls.has(normalized)) {
    return normalized;
  }

  if (url.startsWith("/docs/") && url.split("/").length === 3) {
    const slug = url.slice("/docs/".length);
    for (const candidate of [`/motion/${slug}`, `/catalog/${slug}`]) {
      const canonicalCandidate = normalizeBookmarkUrl(candidate);
      if (urls.has(canonicalCandidate)) {
        return canonicalCandidate;
      }
    }
  }

  return null;
}

export function resolveBookmarkUrl(url: string): string | null {
  let urls = getCachedBookmarkUrls();
  let resolved = resolveBookmarkUrlFromSet(url, urls);

  if (!resolved) {
    urls = refreshBookmarkUrlCache();
    resolved = resolveBookmarkUrlFromSet(url, urls);
  }

  return resolved;
}
