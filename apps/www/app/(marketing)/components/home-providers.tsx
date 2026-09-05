"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import {
  isMarketingPath,
  type TransitionMode,
  usePageTransition,
} from "@/components/page-transition/page-transition-provider";
import { useButton3DHover } from "@/hooks/use-button-3d-hover";
import { useLenisSmoothScroll } from "@/hooks/use-lenis-smooth-scroll";

function shouldSkipMouseEvent(e: MouseEvent): boolean {
  return (
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey
  );
}

function isExternalOrHashHref(href: string): boolean {
  return (
    href.startsWith("#") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export function HomeProviders({ children }: { children: ReactNode }) {
  const lenisRef = useLenisSmoothScroll();
  const pathname = usePathname();
  const { transitionTo } = usePageTransition();

  // Scroll to top on route navigation via Lenis
  useEffect(() => {
    if (!pathname) {
      return;
    }
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenisRef]);

  // Bind 3D button hover effects across all pages in this layout
  useButton3DHover();

  // Intercept navigation links between marketing routes for fast commercial transition
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (shouldSkipMouseEvent(e)) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor || anchor.dataset.transitionPrevent !== undefined) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || isExternalOrHashHref(href)) {
        return;
      }

      if (
        isMarketingPath(pathname) &&
        href.startsWith("/") &&
        href !== pathname
      ) {
        e.preventDefault();
        const mode: TransitionMode = href === "/docs" ? "docs" : "commercial";
        transitionTo(href, mode);
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, {
        capture: true,
      });
    };
  }, [pathname, transitionTo]);

  return <>{children}</>;
}
