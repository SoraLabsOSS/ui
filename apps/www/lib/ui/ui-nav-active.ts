export const MENU_UI_ITEM_KEY = "menu-ui";

const UI_DOCS_PREFIX = "/ui";

/** Any leaf route inside the UI docs section (e.g. `/ui/base/button`, `/ui/radix/dialog`, `/ui/button`). */
export function isUiDocPath(pathname: string): boolean {
  return (
    pathname !== UI_DOCS_PREFIX &&
    pathname !== `${UI_DOCS_PREFIX}/` &&
    pathname.startsWith(`${UI_DOCS_PREFIX}/`)
  );
}

/**
 * Sidebar / account menu "UI" link.
 * Inside UI docs the leaf tree item owns the active state — not this Menu entry.
 */
export function isUiNavItemActive(
  pathname: string,
  uiUrl = UI_DOCS_PREFIX
): boolean {
  if (isUiDocPath(pathname)) {
    return false;
  }

  return pathname === uiUrl || pathname.startsWith(`${uiUrl}/`);
}
