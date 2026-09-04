"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

export function useLenisSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    // Auto-pause Lenis when mobile menu drawer is open
    const menuObserver = new MutationObserver(() => {
      const isMenuOpen = Boolean(
        document.querySelector('[data-nav-status="active"]')
      );
      if (isMenuOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    menuObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-nav-status"],
      subtree: true,
    });

    return () => {
      menuObserver.disconnect();
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
