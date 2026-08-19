import { HOME_SCROLL_READY_EVENT } from "@/lib/home/home-scroll-ready";

export const DEMO_SCROLL_READY_EVENT = "sora:demo-scroll-ready";

export function isWindowScroller(scroller: Element | Window): boolean {
  return (
    scroller === window ||
    scroller === document.documentElement ||
    scroller === document.body
  );
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

function getScrollerReadyEvent(scroller: Element | Window): string | null {
  if (!(scroller instanceof HTMLElement)) {
    return null;
  }

  if (scroller.id === "demo-page") {
    return DEMO_SCROLL_READY_EVENT;
  }

  if (scroller.id === "home-page") {
    return HOME_SCROLL_READY_EVENT;
  }

  return null;
}

/** Wait for Lenis scrollerProxy (demo/home) or layout before pinning. */
export async function waitForScrollerReady(
  scroller: Element | Window
): Promise<void> {
  if (isWindowScroller(scroller)) {
    await waitForNextFrame();
    return;
  }

  const readyEvent = getScrollerReadyEvent(scroller);

  if (!readyEvent) {
    await waitForNextFrame();
    return;
  }

  await Promise.all([
    waitForNextFrame(),
    new Promise<void>((resolve) => {
      window.addEventListener(readyEvent, () => resolve(), { once: true });
      window.setTimeout(resolve, 300);
    }),
  ]);

  await waitForNextFrame();
}

export function observeWindowResize(onResize: () => void): () => void {
  let frameId = 0;

  const handleResize = () => {
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(onResize);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", handleResize);
  };
}
