export const CATALOG_PREVIEW_SCROLL_SELECTOR =
  "[data-radix-scroll-area-viewport]";

/** Mobile / stacked catalog pages scroll inside ComponentsShell `<main>`. */
export const CATALOG_PAGE_SCROLL_ROOT_SELECTOR = "[data-catalog-scroll-root]";

export const HOME_PAGE_SCROLL_SELECTOR = "#home-page";

export function resolveScrollRoot(container: HTMLElement): Element | Window {
  const previewScroller = container.closest(CATALOG_PREVIEW_SCROLL_SELECTOR);
  if (previewScroller) {
    return previewScroller;
  }

  const pageScroller = container.closest(CATALOG_PAGE_SCROLL_ROOT_SELECTOR);
  if (pageScroller instanceof HTMLElement) {
    return pageScroller;
  }

  const homeScroller = container.closest(HOME_PAGE_SCROLL_SELECTOR);
  if (homeScroller instanceof HTMLElement) {
    return homeScroller;
  }

  const globalHomeScroller = document.querySelector(HOME_PAGE_SCROLL_SELECTOR);
  if (
    globalHomeScroller instanceof HTMLElement &&
    globalHomeScroller.contains(container)
  ) {
    return globalHomeScroller;
  }

  return window;
}

export function getScrollerHeight(scroller: Element | Window): number {
  if (scroller === window) {
    return window.innerHeight;
  }

  return (scroller as HTMLElement).clientHeight;
}
