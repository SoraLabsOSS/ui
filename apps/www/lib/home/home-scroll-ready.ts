export const HOME_SCROLL_READY_EVENT = "sora:home-scroll-ready";

export function dispatchHomeScrollReady() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(HOME_SCROLL_READY_EVENT));
}
