"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useButton3DHover } from "../hooks/use-button-3d-hover";
import { useLenisSmoothScroll } from "../hooks/use-lenis-smooth-scroll";

export function HomeProviders({ children }: { children: ReactNode }) {
  const lenisRef = useLenisSmoothScroll();
  const pathname = usePathname();

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

  return <>{children}</>;
}
