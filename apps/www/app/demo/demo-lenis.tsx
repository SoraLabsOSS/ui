"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { type ReactNode, useLayoutEffect, useState } from "react";
import { dispatchDemoScrollReady } from "@/lib/demo/demo-scroll-ready";
import { DEMO_PAGE_ID } from "./demo-page-id";

gsap.registerPlugin(ScrollTrigger);

/** Deferred: only devices that end up in "lenis" scroll mode need this bundle. */
const DemoLenisRoot = dynamic(
  () => import("./demo-lenis-root").then((mod) => mod.DemoLenisRoot),
  { ssr: false }
);

interface DemoLenisProps {
  children: ReactNode;
}

type ScrollMode = "pending" | "native" | "lenis";

function useScrollMode() {
  const prefersReducedMotion = useReducedMotion();
  const [scrollMode, setScrollMode] = useState<ScrollMode>("pending");

  useLayoutEffect(() => {
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

function DemoNativeScroll({ children }: DemoLenisProps) {
  useLayoutEffect(() => {
    dispatchDemoScrollReady();
    ScrollTrigger.refresh();
  }, []);

  return (
    <main className="relative z-0 min-h-dvh overflow-x-clip" id={DEMO_PAGE_ID}>
      {children}
    </main>
  );
}

export function DemoLenis({ children }: DemoLenisProps) {
  const scrollMode = useScrollMode();

  if (scrollMode !== "lenis") {
    return <DemoNativeScroll>{children}</DemoNativeScroll>;
  }

  return <DemoLenisRoot>{children}</DemoLenisRoot>;
}
