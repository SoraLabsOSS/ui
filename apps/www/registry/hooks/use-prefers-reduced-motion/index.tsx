"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// useLayoutEffect is a no-op (with a console warning) during SSR — fall back
// to useEffect there since there's no window/matchMedia to read anyway.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Tracks the OS-level Reduced Motion setting, live. Unlike a one-time
 * `matchMedia(...).matches` check, this updates if the user toggles the
 * setting while the page is open (no reload needed).
 *
 * Defaults to `true`, not `false`. A consumer that mounts a GSAP
 * ScrollTrigger off this value reads it during its *first* render's effects
 * no matter which effect phase either hook uses — React doesn't re-render
 * mid-flush just because this hook's own effect called setState. Defaulting
 * to `false` meant every mount briefly created a real, pinned ScrollTrigger
 * before correcting a render later; anyone scrolling in that window saw the
 * full animation despite reduced motion being on. Defaulting to `true`
 * flips which side gets the one-frame guess: a non-reduced-motion user
 * waits one imperceptible frame for the animation to start, instead of a
 * reduced-motion user getting a live trigger they were never supposed to.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useIsomorphicLayoutEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => {
      setPrefersReducedMotion(media.matches);
    };
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  return prefersReducedMotion;
}
