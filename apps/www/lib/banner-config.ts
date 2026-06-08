export const BANNER_ID = "banner";
export const BANNER_HEIGHT = "3rem";

/** Dismiss class for `id="banner"` (Fumadocs base32 encoding). */
export const BANNER_DISMISS_CLASS = "nd-banner-mjqw43tfoi";

export function getBannerDismissClass(id: string) {
  if (id === BANNER_ID) {
    return BANNER_DISMISS_CLASS;
  }

  return `nd-banner-${id}`;
}
