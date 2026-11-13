"use client";

import { useEffect } from "react";

/** Start exit animation when the footer is this close below the viewport edge. */
const FOOTER_LEAD_PX = 120;

function getSiteFooter(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-blog-site-footer]");
}

function getTocElements(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  const ndToc = document.querySelector<HTMLElement>("#nd-toc");
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
        root.dataset.footerInView = "";
      } else {
        delete root.dataset.footerInView;
      }

      const tocs = getTocElements();
      for (const toc of tocs) {
        if (shouldDismiss) {
          if (
            !(
              Object.hasOwn(toc.dataset, "blogTocLeaving") ||
              Object.hasOwn(toc.dataset, "blogTocHidden")
            )
          ) {
            toc.dataset.blogTocLeaving = "";
          }
        } else {
          delete toc.dataset.blogTocHidden;
          delete toc.dataset.blogTocLeaving;
        }
      }
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "opacity") {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.dataset.blogTocLeaving !== undefined) {
        target.dataset.blogTocHidden = "";
        delete target.dataset.blogTocLeaving;
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
      delete root.dataset.footerInView;
      for (const toc of getTocElements()) {
        delete toc.dataset.blogTocHidden;
        delete toc.dataset.blogTocLeaving;
      }
    };
  }, []);

  return null;
}
