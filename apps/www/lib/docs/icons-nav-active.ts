/** Sidebar hover key for Menu → Icons. */
export const MENU_ICONS_ITEM_KEY = "menu-icons";

const ICONS_DOCS_PREFIX = "/docs/icons";

/** Any route inside the Icons docs section (index or leaf pages). */
export function isIconsDocPath(pathname: string): boolean {
  return (
    pathname === ICONS_DOCS_PREFIX ||
    pathname.startsWith(`${ICONS_DOCS_PREFIX}/`)
  );
}

/**
 * Sidebar / account menu "Icons" link.
 * Inside Icons docs the tree item owns active state — not this Menu entry.
 */
export function isIconsNavItemActive(
  pathname: string,
  iconsUrl = ICONS_DOCS_PREFIX
): boolean {
  if (isIconsDocPath(pathname)) {
    return false;
  }

  return pathname === iconsUrl || pathname.startsWith(`${iconsUrl}/`);
}
