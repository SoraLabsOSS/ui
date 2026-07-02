function isWindowScroller(scroller: Element | Window): boolean {
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

async function waitForScrollerReady(
  scroller: Element | Window,
  scrollReadyEvent?: string
): Promise<void> {
  await waitForNextFrame();

  if (!scrollReadyEvent || isWindowScroller(scroller)) {
    if (!isWindowScroller(scroller)) {
      await waitForNextFrame();
    }
    return;
  }

  await Promise.race([
    new Promise<void>((resolve) => {
      window.addEventListener(scrollReadyEvent, () => resolve(), {
        once: true,
      });
    }),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 300);
    }),
  ]);

  await waitForNextFrame();
}

function observeWindowResize(onResize: () => void): () => void {
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

export {
  isWindowScroller,
  observeWindowResize,
  waitForNextFrame,
  waitForScrollerReady,
};
