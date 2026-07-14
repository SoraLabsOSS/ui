"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type LenisRef, ReactLenis } from "lenis/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import "lenis/dist/lenis.css";
import { dispatchDemoScrollReady } from "@/lib/demo/demo-scroll-ready";
import { DEMO_PAGE_ID } from "./demo-page-id";

const MOBILE_BREAKPOINT = 1000;

/** Lenis scroll easing — matches Deadlock Studios client-layout. */
const LENIS_EASING = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t));

const LENIS_SHARED = {
  easing: LENIS_EASING,
  direction: "vertical" as const,
  gestureDirection: "vertical" as const,
  smooth: true,
  infinite: false,
  wheelMultiplier: 1,
  orientation: "vertical" as const,
  smoothWheel: true,
  syncTouch: true,
  autoRaf: false,
};

const LENIS_MOBILE = {
  ...LENIS_SHARED,
  duration: 0.8,
  smoothTouch: true,
  touchMultiplier: 1.5,
  lerp: 0.09,
};

const LENIS_DESKTOP = {
  ...LENIS_SHARED,
  duration: 1.2,
  smoothTouch: false,
  touchMultiplier: 2,
  lerp: 0.1,
};

interface DemoLenisRootProps {
  children: ReactNode;
}

/**
 * Deadlock Studios pattern: ReactLenis `root` + gsap.ticker (no scrollerProxy).
 * ScrollTrigger pins against window scroll while Lenis smooths the document.
 */
export function DemoLenisRoot({ children }: DemoLenisRootProps) {
  const lenisRef = useRef<LenisRef>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    let scrollCleanup: (() => void) | undefined;

    const connectLenis = () => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) {
        return;
      }

      const onScroll = () => {
        ScrollTrigger.update();
      };

      lenis.on("scroll", onScroll);
      scrollCleanup = () => {
        lenis.off("scroll", onScroll);
      };
      ScrollTrigger.refresh();
      dispatchDemoScrollReady();
    };

    connectLenis();
    const retryId = window.setTimeout(connectLenis, 0);

    return () => {
      window.clearTimeout(retryId);
      gsap.ticker.remove(update);
      scrollCleanup?.();
    };
  }, []);

  const lenisOptions = isMobile ? LENIS_MOBILE : LENIS_DESKTOP;

  return (
    <ReactLenis options={lenisOptions} ref={lenisRef} root>
      <main className="relative z-0 overflow-x-clip" id={DEMO_PAGE_ID}>
        {children}
      </main>
    </ReactLenis>
  );
}
