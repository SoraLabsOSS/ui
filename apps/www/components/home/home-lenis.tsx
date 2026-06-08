"use client";

import { type LenisRef, ReactLenis } from "lenis/react";
import { cancelFrame, frame, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import "lenis/dist/lenis.css";

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
    <main className={`${HOME_SCROLL_CLASS} overflow-y-auto`} id="home-page">
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

  return (
    <ReactLenis
      className={`${HOME_SCROLL_CLASS} overflow-hidden`}
      id="home-page"
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
