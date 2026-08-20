const UI_DOC_PATH = /^\/ui\/[^/]+\/?$/;

/** Leaf UI component doc (e.g. `/ui/dialog`). */
export function isUiDocPath(pathname: string): boolean {
  return UI_DOC_PATH.test(pathname);
}

/** Sidebar / account menu "UI" link. */
export function isUiNavItemActive(pathname: string, uiUrl: string): boolean {
  if (isUiDocPath(pathname)) {
    return false;
  }

  return pathname === uiUrl || pathname.startsWith(`${uiUrl}/`);
}
