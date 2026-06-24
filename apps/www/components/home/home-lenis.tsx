"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type LenisRef, ReactLenis } from "lenis/react";
import { cancelFrame, frame, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

const HOME_PAGE_ID = "home-page";
const HOME_SCROLL_CLASS =
  "relative z-0 h-[calc(100dvh-var(--fd-banner-height))] overflow-x-hidden";

interface HomeLenisProps {
  children: ReactNode;
}

type ScrollMode = "pending" | "native" | "lenis";

function useScrollMode() {
  const prefersReducedMotion = useReducedMotion();
  const [scrollMode, setScrollMode] = useState<ScrollMode>("pending");

  useEffect(() => {
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");

    const update = () => {
      if (prefersReducedMotion || coarsePointerQuery.matches) {
        setScrollMode("native");
        return;
      }

      setScrollMode("lenis");
    };

    update();
    coarsePointerQuery.addEventListener("change", update);

    return () => {
      coarsePointerQuery.removeEventListener("change", update);
    };
  }, [prefersReducedMotion]);

  return scrollMode;
}

function HomeNativeScroll({ children }: HomeLenisProps) {
  return (
    <main className={`${HOME_SCROLL_CLASS} overflow-y-auto`} id={HOME_PAGE_ID}>
      {children}
    </main>
  );
}

/** Lenis + Motion share one RAF loop — see lenis/react README (Framer Motion integration). */
function HomeLenisScroller({ children }: HomeLenisProps) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(data: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(data.timestamp);
    }

    frame.update(update, true);

    return () => cancelFrame(update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let teardown: (() => void) | undefined;

    const setupScrollTrigger = () => {
      const lenis = lenisRef.current?.lenis;
      const scroller = document.getElementById(HOME_PAGE_ID);

      if (!(lenis && scroller)) {
        return false;
      }

      const onScroll = () => {
        ScrollTrigger.update();
      };

      lenis.on("scroll", onScroll);

      ScrollTrigger.scrollerProxy(scroller, {
        scrollTop(value?: number) {
          if (value !== undefined) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
      });

      ScrollTrigger.refresh();

      teardown = () => {
        lenis.off("scroll", onScroll);
        ScrollTrigger.scrollerProxy(scroller);
      };

      return true;
    };

    if (!setupScrollTrigger()) {
      const frameId = requestAnimationFrame(() => {
        if (!cancelled) {
          setupScrollTrigger();
        }
      });

      return () => {
        cancelled = true;
        cancelAnimationFrame(frameId);
        teardown?.();
      };
    }

    return () => {
      teardown?.();
    };
  }, []);

  return (
    <ReactLenis
      className={`${HOME_SCROLL_CLASS} overflow-hidden`}
      id={HOME_PAGE_ID}
      options={{
        autoRaf: false,
        lerp: 0.1,
        smoothWheel: true,
      }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
}

export function HomeLenis({ children }: HomeLenisProps) {
  const scrollMode = useScrollMode();

  if (scrollMode !== "lenis") {
    return <HomeNativeScroll>{children}</HomeNativeScroll>;
  }

  return <HomeLenisScroller>{children}</HomeLenisScroller>;
}
