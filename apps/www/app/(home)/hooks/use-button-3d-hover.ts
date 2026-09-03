"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { type RefObject, useEffect } from "react";

const WHITESPACE_REGEX = /\s+/;

export function useButton3DHover(containerRef?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    gsap.registerPlugin(CustomEase);
    try {
      CustomEase.create("sora-cubic", "0.625, 0.05, 0, 1");
    } catch {
      // CustomEase exists
    }

    const root = containerRef?.current || document;

    // Helper to completely kill animations and remove inline transform overrides
    const resetTargets = (animTargets: HTMLElement[]) => {
      gsap.killTweensOf(animTargets);
      for (const el of animTargets) {
        el.style.removeProperty("transform");
      }
      gsap.set(animTargets, { clearProps: "all" });
    };

    // 1. Calculate pivot depth --y based on text length (initRotateButtonsCalc)
    const calcButtonY = (t: HTMLElement) => {
      const labels = Array.from(
        t.querySelectorAll<HTMLElement>(".button-label")
      );
      if (labels.length === 0) {
        return;
      }

      const maxLen = Math.max(
        ...labels.map((l) => (l.textContent || "").trim().length || 0),
        0
      );
      let n = Math.round(100 + 30 * (12 + 6 * maxLen));

      const hasAttrVal = (el: HTMLElement, attr: string, val: string) =>
        (el.getAttribute(attr) || "")
          .toLowerCase()
          .split(WHITESPACE_REGEX)
          .includes(val);

      if (
        t.dataset.size === "full" ||
        (hasAttrVal(t, "data-responsive", "mobile") &&
          window.innerWidth <= 479) ||
        (hasAttrVal(t, "data-responsive", "landscape") &&
          window.innerWidth <= 767) ||
        (hasAttrVal(t, "data-responsive", "tablet") && window.innerWidth <= 991)
      ) {
        n *= 3;
      }
      n = Math.max(100, Math.min(n, 10_000));
      t.style.setProperty("--y", `${n}%`);
    };

    const rotateButtons = root.querySelectorAll<HTMLElement>(
      "[data-button-rotate]"
    );
    for (const btn of Array.from(rotateButtons)) {
      calcButtonY(btn);
    }

    // 2. Initial cleanup: ensure all buttons start with pristine CSS transforms
    const initialTargets = root.querySelectorAll<HTMLElement>(
      ".button-label, .button-icon"
    );
    if (initialTargets.length > 0) {
      resetTargets(Array.from(initialTargets));
    }

    // 3. Hover rotation with click & unmount reset
    const hoverElements = root.querySelectorAll<HTMLElement>(
      "[data-button-rotate-hover]"
    );
    const cleanups: (() => void)[] = [];

    for (const t of Array.from(hoverElements)) {
      const elementWithFlag = t as HTMLElement & {
        _rotBound?: boolean;
        _rotTl?: gsap.core.Tween | null;
      };

      if (elementWithFlag._rotBound) {
        continue;
      }
      elementWithFlag._rotBound = true;

      const e =
        t.closest<HTMLElement>("[data-button-rotate]") ||
        t.closest<HTMLElement>(".button") ||
        t.closest<HTMLElement>("button.tag") ||
        t.closest<HTMLElement>(".square-button") ||
        t;
      const a = t.closest<HTMLElement>("[data-hover]") || t;

      const targets = e.querySelectorAll<HTMLElement>(
        ".button-label, .button-icon"
      );
      const animTargets = targets.length > 0 ? Array.from(targets) : [t];

      let r = 0;
      const throttle = () => {
        const now = performance.now();
        if (now - r < 100) {
          return false;
        }
        r = now;
        return true;
      };

      const onEnter = () => {
        if (!throttle()) {
          return;
        }

        if (elementWithFlag._rotTl) {
          elementWithFlag._rotTl.kill();
          elementWithFlag._rotTl = null;
          resetTargets(animTargets);
        }

        const n =
          Number.parseFloat(getComputedStyle(e).getPropertyValue("--r")) || 20;
        const dur = e.dataset.size === "full" ? 0.75 : 0.5;

        elementWithFlag._rotTl = gsap.to(animTargets, {
          rotation: `+=${n}`,
          duration: dur,
          ease: "sora-cubic",
          stagger: 0.075,
          overwrite: "auto",
          onComplete: () => {
            resetTargets(animTargets);
            elementWithFlag._rotTl = null;
          },
        });
      };

      const onLeave = () => {
        throttle();
      };

      // Reset immediately when user clicks to navigate away
      const onClick = () => {
        if (elementWithFlag._rotTl) {
          elementWithFlag._rotTl.kill();
          elementWithFlag._rotTl = null;
        }
        resetTargets(animTargets);
      };

      a.addEventListener("pointerenter", onEnter);
      a.addEventListener("pointerleave", onLeave);
      a.addEventListener("click", onClick, { capture: true });

      cleanups.push(() => {
        a.removeEventListener("pointerenter", onEnter);
        a.removeEventListener("pointerleave", onLeave);
        a.removeEventListener("click", onClick, { capture: true });
        if (elementWithFlag._rotTl) {
          elementWithFlag._rotTl.kill();
          elementWithFlag._rotTl = null;
        }
        resetTargets(animTargets);
        elementWithFlag._rotBound = false;
      });
    }

    // 4. Handle browser back/forward cache (bfcache) navigation
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        const labels = root.querySelectorAll<HTMLElement>(
          ".button-label, .button-icon"
        );
        if (labels.length > 0) {
          resetTargets(Array.from(labels));
        }
      }
    };
    window.addEventListener("pageshow", onPageShow);
    cleanups.push(() => window.removeEventListener("pageshow", onPageShow));

    const onResize = () => {
      for (const btn of Array.from(rotateButtons)) {
        calcButtonY(btn);
      }
    };
    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    return () => {
      for (const fn of cleanups) {
        fn();
      }
    };
  }, [containerRef]);
}
