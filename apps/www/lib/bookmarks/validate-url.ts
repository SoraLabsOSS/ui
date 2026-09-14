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

const RE_COMPONENTS = /^\/components/;
const RE_DOCS_MOTION = /^\/docs\/motion/;
const RE_DOCS_PRIMITIVES = /^\/docs\/primitives/;
const RE_PRIMITIVES = /^\/primitives/;
const RE_DOCS_ICONS = /^\/docs\/icons/;

export function normalizeBookmarkUrl(url: string): string {
  if (url === "/components" || url.startsWith("/components/")) {
    return url.replace(RE_COMPONENTS, "/catalog");
  }
  if (url === "/docs/motion" || url.startsWith("/docs/motion/")) {
    return url.replace(RE_DOCS_MOTION, "/motion");
  }
  if (url === "/docs/primitives" || url.startsWith("/docs/primitives/")) {
    return url.replace(RE_DOCS_PRIMITIVES, "/motion");
  }
  if (url === "/primitives" || url.startsWith("/primitives/")) {
    return url.replace(RE_PRIMITIVES, "/motion");
  }
  if (url === "/docs/icons" || url.startsWith("/docs/icons/")) {
    return url.replace(RE_DOCS_ICONS, "/icons");
  }
  return url;
}

export function isValidBookmarkUrl(url: string): boolean {
  let urls = getCachedBookmarkUrls();

  if (!urls.has(url)) {
    urls = refreshBookmarkUrlCache();
  }

  if (urls.has(url)) {
    return true;
  }

  const normalized = normalizeBookmarkUrl(url);
  return urls.has(normalized);
}
