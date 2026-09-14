/** Sidebar hover key for Menu → Primitives (href may equal first primitive doc). */
export const MENU_PRIMITIVES_ITEM_KEY = "menu-primitives";

const MOTION_PREFIX = "/motion";
const MOTION_DOCS_PREFIX = "/docs/motion";
const PRIMITIVES_DOCS_PREFIX = "/docs/primitives";
const PRIMITIVES_PREFIX = "/primitives";

/** Leaf motion / primitive doc (e.g. `/motion/text-scramble` or nested paths). */
export function isPrimitiveDocPath(pathname: string): boolean {
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
