/** Sidebar hover key for Menu → Icons. */
export const MENU_ICONS_ITEM_KEY = "menu-icons";

const ICONS_DOCS_PREFIX = "/docs/icons";
const ICONS_PREFIX = "/icons";

/** Any leaf route inside the Icons docs section (e.g. `/icons/get-started`). */
function isIconsDocPath(pathname: string): boolean {
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

/** Sidebar hover key for Menu → Primitives (href may equal first primitive doc). */
export const MENU_PRIMITIVES_ITEM_KEY = "menu-primitives";

const MOTION_PREFIX = "/motion";
const MOTION_DOCS_PREFIX = "/docs/motion";
const PRIMITIVES_DOCS_PREFIX = "/docs/primitives";
const PRIMITIVES_PREFIX = "/primitives";

/** Leaf motion / primitive doc (e.g. `/motion/text-scramble` or nested paths). */
function isPrimitiveDocPath(pathname: string): boolean {
  return (
    (pathname !== MOTION_PREFIX &&
      pathname !== `${MOTION_PREFIX}/` &&
      pathname.startsWith(`${MOTION_PREFIX}/`)) ||
    (pathname !== MOTION_DOCS_PREFIX &&
      pathname !== `${MOTION_DOCS_PREFIX}/` &&
      pathname.startsWith(`${MOTION_DOCS_PREFIX}/`)) ||
    (pathname !== PRIMITIVES_DOCS_PREFIX &&
      pathname !== `${PRIMITIVES_DOCS_PREFIX}/` &&
      pathname.startsWith(`${PRIMITIVES_DOCS_PREFIX}/`)) ||
    (pathname !== PRIMITIVES_PREFIX &&
      pathname !== `${PRIMITIVES_PREFIX}/` &&
      pathname.startsWith(`${PRIMITIVES_PREFIX}/`))
  );
}

/**
 * Sidebar / account menu "Primitives" link.
 * Leaf pages activate the tree item below — not this entry (avoids duplicate
 * active state when `primitivesUrl` is the first doc in meta.json).
 */
export function isPrimitivesNavItemActive(
  pathname: string,
  primitivesUrl: string
): boolean {
  if (isPrimitiveDocPath(pathname)) {
    return false;
  }

  return (
    pathname === primitivesUrl ||
    pathname.startsWith(`${primitivesUrl}/`) ||
    pathname === MOTION_PREFIX ||
    pathname.startsWith(`${MOTION_PREFIX}/`) ||
    pathname === MOTION_DOCS_PREFIX ||
    pathname.startsWith(`${MOTION_DOCS_PREFIX}/`)
  );
}
