export const DEMO_SCROLL_READY_EVENT = "sora:demo-scroll-ready";

export function dispatchDemoScrollReady() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(DEMO_SCROLL_READY_EVENT));
}
