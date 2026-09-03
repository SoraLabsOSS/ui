"use client";

import { useEffect } from "react";

/** Start exit animation when the footer is this close below the viewport edge. */
const FOOTER_LEAD_PX = 120;

function getSiteFooter(): HTMLElement | null {
  return document.querySelector("[data-blog-site-footer]");
}

function getTocElements(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  const ndToc = document.getElementById("nd-toc");
  if (ndToc) {
    elements.push(ndToc);
  }
  const customTocs = document.querySelectorAll<HTMLElement>("[data-blog-toc]");
  for (const el of customTocs) {
    elements.push(el);
  }
  return elements;
}

export function BlogTocFooterGuard() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-blog-footer]");

    if (!root) {
      return;
    }

    let raf = 0;

    const tick = () => {
      const siteFooter = getSiteFooter();
      if (!siteFooter) {
        return;
      }

      const footerTop = siteFooter.getBoundingClientRect().top;
      const shouldDismiss = footerTop <= window.innerHeight + FOOTER_LEAD_PX;

      if (shouldDismiss) {
        root.setAttribute("data-footer-in-view", "");
      } else {
        root.removeAttribute("data-footer-in-view");
      }

      const tocs = getTocElements();
      for (const toc of tocs) {
        if (shouldDismiss) {
          if (
            !(
              toc.hasAttribute("data-blog-toc-leaving") ||
              toc.hasAttribute("data-blog-toc-hidden")
            )
          ) {
            toc.setAttribute("data-blog-toc-leaving", "");
          }
        } else {
          toc.removeAttribute("data-blog-toc-hidden");
          toc.removeAttribute("data-blog-toc-leaving");
        }
      }
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "opacity") {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.hasAttribute("data-blog-toc-leaving")) {
        target.setAttribute("data-blog-toc-hidden", "");
        target.removeAttribute("data-blog-toc-leaving");
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    schedule();

    const siteFooter = getSiteFooter();
    let observer: IntersectionObserver | null = null;

    if (siteFooter) {
      observer = new IntersectionObserver(
        () => {
          schedule();
        },
        {
          rootMargin: `0px 0px ${FOOTER_LEAD_PX}px 0px`,
        }
      );
      observer.observe(siteFooter);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("transitionend", onTransitionEnd);

    const mutation = new MutationObserver(schedule);
    mutation.observe(root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("transitionend", onTransitionEnd);
      mutation.disconnect();
      root.removeAttribute("data-footer-in-view");
      for (const toc of getTocElements()) {
        toc.removeAttribute("data-blog-toc-hidden");
        toc.removeAttribute("data-blog-toc-leaving");
      }
    };
  }, []);

  return null;
}
