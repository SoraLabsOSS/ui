"use client";

import { useEffect } from "react";

/** Start exit animation when the footer is this close below the viewport edge. */
const FOOTER_LEAD_PX = 120;

function getSiteFooter(): HTMLElement | null {
  return document.querySelector("[data-blog-site-footer]");
}

function updateBlogTocDismiss(toc: HTMLElement): void {
  const siteFooter = getSiteFooter();

  if (!siteFooter) {
    return;
  }

  const footerTop = siteFooter.getBoundingClientRect().top;
  const shouldDismiss = footerTop <= window.innerHeight + FOOTER_LEAD_PX;

  if (shouldDismiss) {
    if (
      !(
        toc.hasAttribute("data-blog-toc-leaving") ||
        toc.hasAttribute("data-blog-toc-hidden")
      )
    ) {
      toc.setAttribute("data-blog-toc-leaving", "");
    }
    return;
  }

  toc.removeAttribute("data-blog-toc-hidden");
  toc.removeAttribute("data-blog-toc-leaving");
}

export function BlogTocFooterGuard() {
  useEffect(() => {
    const root = document.querySelector("[data-blog-footer]");

    if (!root) {
      return;
    }

    let raf = 0;
    let toc: HTMLElement | null = null;

    const onTocTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== toc || event.propertyName !== "opacity") {
        return;
      }

      if (!toc?.hasAttribute("data-blog-toc-leaving")) {
        return;
      }

      toc.setAttribute("data-blog-toc-hidden", "");
      toc.removeAttribute("data-blog-toc-leaving");
    };

    const bindToc = (nextToc: HTMLElement | null) => {
      if (toc === nextToc) {
        return;
      }

      toc?.removeEventListener("transitionend", onTocTransitionEnd);
      toc = nextToc;

      if (toc) {
        toc.addEventListener("transitionend", onTocTransitionEnd);
      }
    };

    const tick = () => {
      bindToc(document.getElementById("nd-toc"));

      if (!toc) {
        return;
      }

      updateBlogTocDismiss(toc);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    const mutation = new MutationObserver(schedule);
    mutation.observe(root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mutation.disconnect();
      toc?.removeEventListener("transitionend", onTocTransitionEnd);
      toc?.removeAttribute("data-blog-toc-hidden");
      toc?.removeAttribute("data-blog-toc-leaving");
    };
  }, []);

  return null;
}
