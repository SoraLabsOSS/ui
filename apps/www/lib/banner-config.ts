export const BANNER_ID = "banner";
export const BANNER_HEIGHT = "3rem";

/** Dismiss class for `id="banner"` (Fumadocs base32 encoding). */
export const BANNER_DISMISS_CLASS = "nd-banner-mjqw43tfoi";

/** Matches `/components/[slug]` but not the gallery index at `/components`. */
export const COMPONENT_DETAIL_PATH_PATTERN = /^\/components\/[^/]+\/?$/;

export function isComponentDetailPath(pathname: string): boolean {
  return COMPONENT_DETAIL_PATH_PATTERN.test(pathname);
}

export function getBannerInitScript(): string {
  return `(function(){var p=location.pathname;if(/^\\/components\\/[^/]+\\/?$/.test(p)){document.documentElement.style.setProperty("--fd-banner-height","0px");return;}var k=${JSON.stringify(BANNER_DISMISS_CLASS)};if(localStorage.getItem(k)==="true"){document.documentElement.classList.add(k);}else{document.documentElement.style.setProperty("--fd-banner-height",${JSON.stringify(BANNER_HEIGHT)});}})();`;
}

export function getBannerDismissClass(id: string) {
  if (id === BANNER_ID) {
    return BANNER_DISMISS_CLASS;
  }

  return `nd-banner-${id}`;
}
