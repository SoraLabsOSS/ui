/** Sidebar hover key for Menu → Icons. */
export const MENU_ICONS_ITEM_KEY = "menu-icons";

const ICONS_DOCS_PREFIX = "/docs/icons";
const ICONS_PREFIX = "/icons";

/** Any leaf route inside the Icons docs section (e.g. `/icons/get-started`). */
export function isIconsDocPath(pathname: string): boolean {
  return (
    (pathname !== ICONS_PREFIX &&
      pathname !== `${ICONS_PREFIX}/` &&
      pathname.startsWith(`${ICONS_PREFIX}/`)) ||
    (pathname !== ICONS_DOCS_PREFIX &&
      pathname !== `${ICONS_DOCS_PREFIX}/` &&
      pathname.startsWith(`${ICONS_DOCS_PREFIX}/`))
  );
}

/**
 * Sidebar / account menu "Icons" link.
 * Inside leaf Icons docs the tree item owns active state — not this Menu entry.
 */
export function isIconsNavItemActive(
  pathname: string,
  iconsUrl = "/icons"
): boolean {
  if (isIconsDocPath(pathname)) {
    return false;
  }

  return (
    pathname === iconsUrl ||
    pathname.startsWith(`${iconsUrl}/`) ||
    pathname === ICONS_DOCS_PREFIX ||
    pathname.startsWith(`${ICONS_DOCS_PREFIX}/`)
  );
}
