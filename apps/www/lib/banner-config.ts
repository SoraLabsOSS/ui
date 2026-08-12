export const BANNER_ID = "banner";
export const BANNER_HEIGHT = "3rem";

/** Toggle site-wide promo banner and layout offset (`--fd-banner-height`). */
export const SITE_BANNER_ENABLED = false;

/** Dismiss class for `id="banner"` (Fumadocs base32 encoding). */
export const BANNER_DISMISS_CLASS = "nd-banner-mjqw43tfoi";

/** Matches `/components/[slug]` but not the gallery index at `/components`. */
export const COMPONENT_DETAIL_PATH_PATTERN = /^\/components\/[^/]+\/?$/;

/** Full-screen demos that should not show the site banner. */
export const FULLSCREEN_DEMO_PATH_PATTERN = /^\/demo\/?$/;

export function isComponentDetailPath(pathname: string): boolean {
  return COMPONENT_DETAIL_PATH_PATTERN.test(pathname);
}

export function isFullscreenDemoPath(pathname: string): boolean {
  return FULLSCREEN_DEMO_PATH_PATTERN.test(pathname);
}

export function shouldHideSiteBanner(pathname: string): boolean {
  return isComponentDetailPath(pathname) || isFullscreenDemoPath(pathname);
}

export function getBannerInitScript(): string | null {
  if (!SITE_BANNER_ENABLED) {
    return null;
  }

  return getBannerEnabledInitScript();
}

/** Inline script for `<head>` — keeps `--fd-banner-height` correct before first paint. */
export function getBannerLayoutScript(): string {
  if (!SITE_BANNER_ENABLED) {
    return `document.documentElement.style.setProperty("--fd-banner-height","0px");`;
  }

  return getBannerEnabledInitScript();
}

function escapeCssLength(value: string): string {
  // Keep this value strictly in the form we expect for CSS lengths so the
  // generated inline script can't be abused by injecting unexpected content.
  // This is intentionally conservative: if it doesn't match, fall back to `0px`.
  const trimmed = value.trim();
  if (
    !/^[0-9]+(\.[0-9]+)?(rem|px|em|vh|vw|vmin|vmax|%|dvh|svh|lvh)$/.test(
      trimmed
    )
  ) {
    return "0px";
  }
  return trimmed;
}

function getBannerEnabledInitScript(): string {
  // `js/bad-code-sanitization` treats template injection into executable
  // strings as unsafe unless it can prove it is a known sanitizer.
  // `SITE_BANNER_ENABLED` is currently `false`, but we still keep this script
  // correct when enabled by inlining the expected CSS value literal.
  //
  // If `BANNER_HEIGHT` changes, update the literal below accordingly.
  const bannerHeightLiteral = '"3rem"';

  return `(function(){var p=location.pathname;if(/^\\/components\\/[^/]+\\/?$/.test(p)||/^\\/demo\\/?$/.test(p)){document.documentElement.style.setProperty("--fd-banner-height","0px");return;}document.documentElement.style.setProperty("--fd-banner-height",${bannerHeightLiteral});})();`;
}

export function getBannerDismissClass(id: string) {
  if (id === BANNER_ID) {
    return BANNER_DISMISS_CLASS;
  }

  return `nd-banner-${id}`;
}
