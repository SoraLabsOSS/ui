export const LEGACY_PATH_PREFIX_REDIRECTS = [
  ["/docs/components", "/catalog"],
  ["/docs/catalog", "/catalog"],
  ["/components", "/catalog"],
  ["/docs/icons", "/icons"],
  ["/docs/motion", "/motion"],
  ["/docs/primitives", "/motion"],
  ["/primitives", "/motion"],
] as const;

export const LEGACY_UI_SLUG_REDIRECTS: Record<string, string> = {
  button: "/ui/base/button",
  checkbox: "/ui/base/checkbox",
  dialog: "/ui/base/dialog",
};

export const LEGACY_PRIMITIVE_SLUG_RENAMES: Record<string, string> = {
  "scroll-text-reveal": "text-reveal-mask",
  "text-reveal": "text-effect",
  "text-reveal-blur": "text-effect",
};

export const MOTION_CATEGORY_PREFIXES = [
  "texts",
  "buttons",
  "effects",
  "disclosure",
] as const;

const MOTION_CATEGORY_PATTERN = new RegExp(
  `^/(?:docs/)?(?:motion/)?(?:${MOTION_CATEGORY_PREFIXES.join("|")})(?:/(.*))?$`
);

function replacePrefix(url: string, from: string, to: string): string | null {
  if (url === from) {
    return to;
  }

  if (url.startsWith(`${from}/`)) {
    return `${to}${url.slice(from.length)}`;
  }

  return null;
}

function renameMotionSlug(url: string): string {
  const prefix = "/motion/";
  if (!url.startsWith(prefix)) {
    return url;
  }

  const slug = url.slice(prefix.length);
  const renamed = LEGACY_PRIMITIVE_SLUG_RENAMES[slug];
  return renamed ? `${prefix}${renamed}` : url;
}

export function normalizeBookmarkUrl(url: string): string {
  const legacyUiUrl = url.startsWith("/ui/")
    ? LEGACY_UI_SLUG_REDIRECTS[url.slice("/ui/".length)]
    : undefined;
  if (legacyUiUrl) {
    return legacyUiUrl;
  }

  const motionCategory = url.match(MOTION_CATEGORY_PATTERN);
  if (motionCategory) {
    const slug = motionCategory[1];
    return slug ? renameMotionSlug(`/motion/${slug}`) : "/motion";
  }

  for (const [from, to] of LEGACY_PATH_PREFIX_REDIRECTS) {
    const normalized = replacePrefix(url, from, to);
    if (normalized) {
      return renameMotionSlug(normalized);
    }
  }

  const directMotionRename =
    LEGACY_PRIMITIVE_SLUG_RENAMES[url.slice("/docs/".length)];
  if (url.startsWith("/docs/") && directMotionRename) {
    return `/motion/${directMotionRename}`;
  }

  return renameMotionSlug(url);
}
