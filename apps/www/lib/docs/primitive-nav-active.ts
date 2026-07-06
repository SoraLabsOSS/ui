const PRIMITIVE_DOC_PATH = /^\/docs\/primitives\/[^/]+\/?$/;

/** Sidebar hover key for Menu → Primitives (href may equal first primitive doc). */
export const MENU_PRIMITIVES_ITEM_KEY = "menu-primitives";

/** Leaf primitive doc (e.g. `/docs/primitives/text-scramble`). */
export function isPrimitiveDocPath(pathname: string): boolean {
  return PRIMITIVE_DOC_PATH.test(pathname);
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

  return pathname === primitivesUrl || pathname.startsWith(`${primitivesUrl}/`);
}
